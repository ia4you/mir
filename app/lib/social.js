// Open Graph y Twitter con los mismos valores por defecto (sitio, idioma e imagen) que la portada.
const IMAGEN = "https://mir.turel.es/images/og-image.jpg";

export function metaSocial({ title, description, url }) {
  return {
    openGraph: {
      title,
      description,
      url,
      siteName: "MIR Turel",
      type: "website",
      locale: "es_ES",
      images: [{ url: IMAGEN, width: 1200, height: 630, alt: "MIR Turel — preparación MIR con preguntas 100% oficiales" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [IMAGEN] },
  };
}
