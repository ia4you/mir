/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Miniaturas de los vídeos: las pide nuestro servidor a i.ytimg.com, así
  // el navegador no contacta con Google antes de pulsar play. Caché de 7
  // días, dentro de los 30 que permiten las políticas de la API de YouTube.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" }],
    minimumCacheTTL: 604800,
  },
  // La convocatoria que se llamó «2016» pasó a ser 2017 (el año es el del examen). Es la única URL
  // vieja que se redirige: mir-2017 y mir-2018 siguen existiendo, solo cambian de contenido.
  async redirects() {
    return [{ source: "/convocatorias/mir-2016", destination: "/convocatorias/mir-2017", permanent: true }];
  },
};

export default nextConfig;
