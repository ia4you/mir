export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/inicio",
        "/configuracion",
        "/test",
        "/resultados",
        "/estadisticas",
        "/perfil",
        "/api",
      ],
    },
    sitemap: "https://mir.turel.es/sitemap.xml",
  };
}
