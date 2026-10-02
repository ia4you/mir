import { cache } from "react";
import { query } from "../../lib/db";
import { slugify } from "./especialidades";

// Anuladas/de reserva que NUNCA se cargaron en la BD (documentado en
// fuentes_banco_preguntas.md); la BD no puede listarlas, así que se anotan aquí.
const NO_CARGADAS = { 2022: [189], 2026: [208] };

export const slugConvocatoria = (anio) => `mir-${anio}`;

// Una fila por convocatoria con preguntas oficiales cargadas (año 0 = banco IA,
// fuera por origen). `publicas` excluye anuladas, igual que el resto de páginas
// indexables; las anuladas se listan aparte con su número de pregunta.
export const getConvocatorias = cache(async function getConvocatorias() {
  const { rows } = await query(
    `SELECT año::int AS anio,
            COUNT(*) FILTER (WHERE NOT anulada)::int AS publicas,
            COALESCE(ARRAY_AGG(numero ORDER BY numero) FILTER (WHERE anulada), '{}') AS anuladas
     FROM preguntas
     WHERE origen = 'oficial'
     GROUP BY año
     ORDER BY año DESC`
  );
  return rows;
});

export async function getConvocatoria(slug) {
  const m = /^mir-(\d{4})$/.exec(slug);
  if (!m) return null;
  const conv = (await getConvocatorias()).find((c) => c.anio === Number(m[1]));
  if (!conv) return null;
  const { rows } = await query(
    `SELECT especialidad, COUNT(*)::int AS total
     FROM preguntas
     WHERE origen = 'oficial' AND anulada = false AND año = $1
     GROUP BY especialidad ORDER BY total DESC, especialidad`,
    [conv.anio]
  );
  const excluidas = [...conv.anuladas, ...(NO_CARGADAS[conv.anio] || [])].sort((a, b) => a - b);
  return {
    ...conv,
    excluidas,
    especialidades: rows.map((r) => ({ nombre: r.especialidad, slug: slugify(r.especialidad), total: r.total })),
  };
}
