import { getEspecialidadesConConteo } from "./lib/especialidades";

const BASE_URL = "https://mir.turel.es";

// El build de Dokploy no tiene acceso a mir-db; se genera en cada request
// en vez de prerenderizarse en build time.
export const dynamic = "force-dynamic";

export default async function sitemap() {
  const especialidades = await getEspecialidadesConConteo();

  const estaticas = [
    { url: `${BASE_URL}/`, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE_URL}/demo`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE_URL}/controversias`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE_URL}/aviso-legal`, priority: 0.2, changeFrequency: "yearly" },
    { url: `${BASE_URL}/login`, priority: 0.3, changeFrequency: "monthly" },
    { url: `${BASE_URL}/registro`, priority: 0.3, changeFrequency: "monthly" },
  ];

  const especialidadesUrls = especialidades.map((e) => ({
    url: `${BASE_URL}/especialidades/${e.slug}`,
    priority: 0.7,
    changeFrequency: "monthly",
  }));

  return [...estaticas, ...especialidadesUrls].map((entry) => ({
    ...entry,
    lastModified: new Date(),
  }));
}
