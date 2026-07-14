import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const EMAIL_ADMIN = "jose@turel.es";

// Protege las pantallas de la app; la landing pública (/), /login, /registro,
// /premium, /controversias, /contacto, /especialidades/* y /api/* quedan
// fuera (la API comprueba la sesión ella misma en cada route). /admin/*
// además exige que el usuario autenticado sea EMAIL_ADMIN — si está
// autenticado pero no es él, se le redirige a /inicio en vez de a /login.
export default withAuth(
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

export const config = {
  matcher: [
    "/inicio/:path*",
    "/configuracion/:path*",
    "/test/:path*",
    "/resultados/:path*",
    "/estadisticas/:path*",
    "/perfil/:path*",
    "/admin/:path*",
  ],
};
