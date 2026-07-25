// detectar_palabras_partidas.mjs
// -------------------------------
// TERCERA pasada de limpieza de texto (tras "un stray consonante" en
// fix_fragmentos_consonante.mjs y la segunda limpieza de flu jo -> flujo).
// Busca en pregunta/opcion_a-d/explicacion pares "palabra1 palabra2"
// separados por un espacio que sobra — un artefacto del pipeline de
// extracción del PDF — y que, unidas, podrían formar una palabra real.
//
// PASO 1 de 2 (este script): consulta la BD y vuelca TODOS los pares
// "palabra palabra" encontrados, con frecuencia y un ejemplo de contexto,
// a un JSON. No filtra por diccionario aquí porque el contenedor Docker
// desde el que se consulta la BD no tiene hunspell — ver validar_con_diccionario.sh.
//
// Uso:
//   node --env-file=.env.local scripts/detectar_palabras_partidas.mjs

import { Client } from "pg";
import { writeFile } from "fs/promises";

const COLUMNAS = ["pregunta", "opcion_a", "opcion_b", "opcion_c", "opcion_d", "explicacion"];
const SALIDA = "scripts/_candidatos_brutos.json";

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const unionSql = COLUMNAS.map(
    (col) => `
    SELECT id, '${col}' AS columna,
           (regexp_matches(${col}, '[[:alpha:]]+ [[:alpha:]]+', 'g'))[1] AS par
    FROM preguntas
    WHERE ${col} ~ '[[:alpha:]]+ [[:alpha:]]+'
  `
  ).join(" UNION ALL ");

  const { rows } = await client.query(`
    SELECT par, COUNT(*)::int AS total
    FROM (${unionSql}) t
    GROUP BY par
    ORDER BY total DESC
  `);
  console.log(`Pares únicos encontrados: ${rows.length}`);

  const candidatos = [];
  for (const { par, total } of rows) {
    const [w1, w2] = par.split(" ");
    const { rows: ejemplos } = await client.query(
      `SELECT id, pregunta FROM preguntas WHERE
         pregunta ~ ('\\y' || $1 || '\\y')
         OR opcion_a ~ ('\\y' || $1 || '\\y')
         OR opcion_b ~ ('\\y' || $1 || '\\y')
         OR opcion_c ~ ('\\y' || $1 || '\\y')
         OR opcion_d ~ ('\\y' || $1 || '\\y')
         OR explicacion ~ ('\\y' || $1 || '\\y')
       LIMIT 1`,
      [par]
    );
    candidatos.push({ par, w1, w2, junto: w1 + w2, total, ejemploId: ejemplos[0]?.id ?? null });
  }

  await writeFile(SALIDA, JSON.stringify(candidatos, null, 2));
  console.log(`Guardado: ${SALIDA}`);

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
