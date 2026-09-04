import { query } from "../../lib/db";
import { slugify } from "./especialidades";

// La tabla `temas` (creada por ingesta/generar_sql_temas.mjs a partir de
// ingesta/intros_temas_generadas.json, ya cargada en mir-db) es ahora la
// única fuente de verdad de qué temas son publicables, su slug y su intro:
// ya no hay una constante embebida ni un GROUP BY sobre `preguntas` en cada
// request — slug, especialidad e intro vienen precalculados de la tabla, y
// num_preguntas también (se recalcula solo al regenerar esa tabla, no en
// cada petición).
export async function getTemasConConteo() {
  const { rows } = await query(
    `SELECT slug, tema, especialidad, intro, num_preguntas
     FROM temas
     ORDER BY num_preguntas DESC`
  );
  return rows.map((r) => ({
    nombre: r.tema,
    slug: r.slug,
    especialidad: r.especialidad,
    especialidadSlug: slugify(r.especialidad),
    total: r.num_preguntas,
    intro: r.intro,
  }));
}

// A diferencia de getTemasConConteo, esta sí hace una segunda query a
// `preguntas` (por año min/max) — es una página de detalle, una consulta
// extra por request es asumible, y `temas` no guarda el año de cada
// pregunta (solo el conteo agregado num_preguntas).
export async function getTemaPorSlug(slug) {
  const { rows } = await query(
    `SELECT slug, tema, especialidad, intro, num_preguntas
     FROM temas
     WHERE slug = $1`,
    [slug]
  );
  if (rows.length === 0) return null;
  const r = rows[0];

  const { rows: anioRows } = await query(
    `SELECT MIN(año)::int AS anio_min, MAX(año)::int AS anio_max
     FROM preguntas
     WHERE tema = $1`,
    [r.tema]
  );
  const { anio_min: anioMin, anio_max: anioMax } = anioRows[0];

  return {
    nombre: r.tema,
    slug: r.slug,
    especialidad: r.especialidad,
    especialidadSlug: slugify(r.especialidad),
    total: r.num_preguntas,
    intro: r.intro,
    anioMin,
    anioMax,
  };
}

// Igual que getPreguntasMuestra de especialidades.js (misma exclusión de
// preguntas que referencian una imagen/figura/radiografía en el enunciado,
// porque no hay forma de mostrar la imagen en esta muestra pública), pero
// aquí no hay un límite fijo: el volumen de un tema puede ser tan bajo como
// 4 preguntas, y mostrar 3 de 4 sería casi todo el banco gratis. El límite
// se calcula fuera de esta función (ver calcularLimiteMuestraTema) a partir
// del total real del tema y se pasa ya resuelto. Sigue consultando
// `preguntas` directamente (no `temas`): la tabla `temas` no guarda el
// texto de las preguntas, solo el resumen agregado por tema.
export async function getPreguntasMuestraTema(nombreTema, limite) {
  const { rows } = await query(
    `SELECT id, pregunta, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e
     FROM preguntas
     WHERE tema = $1
       AND pregunta !~* '\\y(imagen|imágen|figura|radiografía)\\y'
     ORDER BY id
     LIMIT $2`,
    [nombreTema, limite]
  );
  return rows;
}

// Nunca más de 3 (igual que la muestra de especialidades), pero para temas
// de bajo volumen se recorta a la mitad del total para no filtrar casi todo
// el tema gratis. Con el mínimo publicable (4 preguntas) da 2, así que la
// muestra nunca queda vacía solo por este cálculo (sí podría quedar corta
// si además se filtran preguntas con imagen, ver getPreguntasMuestraTema).
export function calcularLimiteMuestraTema(total) {
  return Math.min(3, Math.floor(total * 0.5));
}
