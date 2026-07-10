export { default } from "next-auth/middleware";

// Protege las pantallas de la app; /login, /registro, /premium y /api/*
// quedan fuera (la API comprueba la sesión ella misma en cada route).
export const config = {
  matcher: [
    "/",
    "/configuracion/:path*",
    "/test/:path*",
    "/resultados/:path*",
    "/estadisticas/:path*",
    "/perfil/:path*",
  ],
};
