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
};

export default nextConfig;
