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
//
// La URL es un loopback fijo a 127.0.0.1, NO new URL("/api/track-visit", req.url):
// detrás de Traefik, req.url refleja el dominio público con X-Forwarded-Proto
// "https", así que reconstruirla a partir de req.url hace que el propio
// contenedor se autollame por HTTPS a su dominio público — ese fetch desde el
// sandbox del Edge Runtime falla en silencio (se traga el .catch de abajo) y
// nunca llega a insertar la visita, aunque el mismo endpoint funcione bien
// probado a mano. Con loopback directo al proceso Node no hay vuelta al
// exterior ni TLS de por medio.
async function registrarVisita(req) {
  const ipHash = await hashearIp(obtenerIp(req));
  await fetch("http://127.0.0.1:3000/api/track-visit", {
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
