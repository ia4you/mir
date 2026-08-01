import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { esRutaTrackeada, esBot } from "@/lib/visitas";

const EMAIL_ADMIN = "jose@turel.es";

const RUTAS_PROTEGIDAS = [
  "/inicio",
  "/configuracion",
  "/test",
  "/resultados",
  "/estadisticas",
  "/perfil",
  "/admin",
];

function esRutaProtegida(pathname) {
  return RUTAS_PROTEGIDAS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

async function hashearIp(ip) {
  const datos = new TextEncoder().encode(ip);
  const buffer = await crypto.subtle.digest("SHA-256", datos);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function obtenerIp(req) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || req.ip || "0.0.0.0";
}

// El driver `pg` necesita Node.js y el middleware corre en el runtime edge,
// así que el registro no toca la BD directamente: delega en /api/track-visit
// (ruta Node normal) mediante un fetch interno protegido con TRACK_SECRET.
async function registrarVisita(req) {
  const ipHash = await hashearIp(obtenerIp(req));
  await fetch(new URL("/api/track-visit", req.url), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-track-secret": process.env.TRACK_SECRET || "",
    },
    body: JSON.stringify({ pagina: req.nextUrl.pathname, ipHash }),
  }).catch(() => {});
}

// Protege las pantallas de la app; la landing pública (/), /login, /registro,
// /premium, /controversias, /contacto, /especialidades/* y /api/* quedan
// fuera (la API comprueba la sesión ella misma en cada route). /admin/*
// además exige que el usuario autenticado sea EMAIL_ADMIN — si está
// autenticado pero no es él, se le redirige a /inicio en vez de a /login.
const conAuth = withAuth(
  function middleware(req) {
    if (
      req.nextUrl.pathname.startsWith("/admin") &&
      req.nextauth.token?.email !== EMAIL_ADMIN
    ) {
      return NextResponse.redirect(new URL("/inicio", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export default async function middleware(req, event) {
  if (esRutaTrackeada(req.nextUrl.pathname) && !esBot(req.headers.get("user-agent"))) {
    // waitUntil deja que el fetch de tracking termine en segundo plano sin
    // retrasar la respuesta al usuario ni bloquear la petición si falla.
    event.waitUntil(registrarVisita(req));
  }

  if (esRutaProtegida(req.nextUrl.pathname)) {
    return conAuth(req, event);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/especialidades/:path*",
    "/controversias",
    "/demo",
    "/preguntas/:path*",
    "/inicio/:path*",
    "/configuracion/:path*",
    "/test/:path*",
    "/resultados/:path*",
    "/estadisticas/:path*",
    "/perfil/:path*",
    "/admin/:path*",
  ],
};
