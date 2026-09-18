import { getEspecialidadesConConteo, getTodasLasPreguntasParaSitemap } from "./lib/especialidades";
import { getTemasConConteo } from "./lib/temas";
import { query } from "@/lib/db";

const BASE_URL = "https://mir.turel.es";

// El build de Dokploy no tiene acceso a mir-db; se genera en cada request
// en vez de prerenderizarse en build time.
export const dynamic = "force-dynamic";

async function getPostsBlogParaSitemap() {
  const { rows } = await query(
    `SELECT slug, created_at FROM blog_posts WHERE publicado = true ORDER BY created_at DESC`
  );
  return rows;
}

export default async function sitemap() {
  const [especialidades, preguntas, temas, postsBlog] = await Promise.all([
    getEspecialidadesConConteo(),
    getTodasLasPreguntasParaSitemap(),
    getTemasConConteo(),
    getPostsBlogParaSitemap(),
  ]);

  const estaticas = [
    { url: `${BASE_URL}/`, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE_URL}/demo`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE_URL}/controversias`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE_URL}/temas`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/blog`, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE_URL}/aviso-legal`, priority: 0.2, changeFrequency: "yearly" },
    { url: `${BASE_URL}/privacidad`, priority: 0.2, changeFrequency: "yearly" },
  ];

  const blogUrls = postsBlog.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    priority: 0.6,
    changeFrequency: "monthly",
    lastModified: p.created_at,
  }));

  const especialidadesUrls = especialidades.map((e) => ({
    url: `${BASE_URL}/especialidades/${e.slug}`,
    priority: 0.7,
    changeFrequency: "monthly",
  }));

  const temasUrls = temas.map((t) => ({
    url: `${BASE_URL}/temas/${t.slug}`,
    priority: 0.6,
    changeFrequency: "monthly",
  }));

  const preguntasUrls = preguntas.map((p) => ({
    url: `${BASE_URL}/preguntas/${p.especialidadSlug}/${p.id}`,
    priority: 0.7,
    changeFrequency: "yearly",
  }));

  return [...estaticas, ...blogUrls, ...especialidadesUrls, ...temasUrls, ...preguntasUrls].map(
    (entry) => ({
      ...entry,
      lastModified: entry.lastModified || new Date(),
    })
  );
}
