export { default } from "next-auth/middleware";

// Protege las pantallas de la app; la landing pública (/), /login, /registro,
// /premium, /controversias, /especialidades/* y /api/* quedan fuera (la API
// comprueba la sesión ella misma en cada route).
export const config = {
  matcher: [
    "/inicio/:path*",
    "/configuracion/:path*",
    "/test/:path*",
    "/resultados/:path*",
    "/estadisticas/:path*",
    "/perfil/:path*",
  ],
};
