// fix_palabras_partidas.mjs
// -------------------------------
// TERCERA pasada de limpieza de texto: palabras partidas en dos por un
// espacio residual del pipeline de extracción del PDF (ej. "lo s" ->
// "los"), distinta del problema de "consonante suelta" de la primera
// pasada (fix_fragmentos_consonante.mjs).
//
// La lista de abajo (21 pares) se construyó con detectar_palabras_partidas.mjs
// + validar_candidatos.mjs (validación contra diccionario real con
// hunspell-es) y revisión MANUAL del contexto real de cada candidato en la
// BD. Se excluyeron a propósito 9 falsos positivos donde el "espacio de
// más" es en realidad la letra de una opción de respuesta seguida de un
// verbo ("la B es correcta") o una abreviatura de unidad legítima seguida
// de una palabra ("100 g en ayunas", "K g" no es más que un caso especial:
// aquí SÍ es partición real, verificado por contexto — ver informe).
//
// Uso:
//   node --env-file=.env.local scripts/fix_palabras_partidas.mjs --dry-run
//   node --env-file=.env.local scripts/fix_palabras_partidas.mjs

import { Client } from "pg";

const DRY_RUN = process.argv.includes("--dry-run");

const PARES = [
  { patron: "e n", reemplazo: "en" },
  { patron: "lo s", reemplazo: "los" },
  { patron: "E n", reemplazo: "En" },
  { patron: "E l", reemplazo: "El" },
  { patron: "e s", reemplazo: "es" },
  { patron: "inh ibidor", reemplazo: "inhibidor" },
  { patron: "i nhibidor", reemplazo: "inhibidor" },
  { patron: "K g", reemplazo: "Kg" },
  { patron: "la s", reemplazo: "las" },
  { patron: "esta s", reemplazo: "estas" },
  { patron: "ha n", reemplazo: "han" },
  { patron: "inicia r", reemplazo: "iniciar" },
  { patron: "mese s", reemplazo: "meses" },
  { patron: "n o", reemplazo: "no" },
  { patron: "nueva s", reemplazo: "nuevas" },
  { patron: "puede n", reemplazo: "pueden" },
  { patron: "sí ndrome", reemplazo: "síndrome" },
  { patron: "su s", reemplazo: "sus" },
  { patron: "tobillo s", reemplazo: "tobillos" },
  { patron: "to s", reemplazo: "tos" },
  { patron: "u n", reemplazo: "un" },
];

const COLUMNAS = ["pregunta", "opcion_a", "opcion_b", "opcion_c", "opcion_d", "explicacion"];

function construirPares() {
  return PARES.map(({ patron, reemplazo }) => ({
    regex: `\\y${patron}\\y`,
    reemplazo,
  }));
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const pares = construirPares();
  console.log(`Pares en la lista blanca: ${pares.length}`);

  const condiciones = COLUMNAS.flatMap((col) => pares.map((p) => `${col} ~ '${p.regex}'`));
  const { rows: filasRows } = await client.query(
    `SELECT COUNT(*)::int AS total FROM preguntas WHERE ${condiciones.join(" OR ")}`
  );
  console.log(`Filas distintas que se van a corregir: ${filasRows[0].total}`);

  console.log(`\nDesglose por patrón (filas distintas que contienen cada uno, en cualquiera de las columnas):`);
  for (const { patron, reemplazo } of PARES) {
    const regex = `\\y${patron}\\y`;
    const condicionesPatron = COLUMNAS.map((col) => `${col} ~ '${regex}'`).join(" OR ");
    const { rows } = await client.query(
      `SELECT COUNT(*)::int AS total FROM preguntas WHERE ${condicionesPatron}`
    );
    console.log(`  "${patron}" -> "${reemplazo}": ${rows[0].total} filas`);
  }

  if (DRY_RUN) {
    console.log("\n--dry-run: no se ha escrito nada.");
    await client.end();
    return;
  }

  let totalUpdates = 0;
  for (const columna of COLUMNAS) {
    for (const { regex, reemplazo } of pares) {
      const res = await client.query(
        `UPDATE preguntas SET ${columna} = regexp_replace(${columna}, $1, $2, 'g') WHERE ${columna} ~ $1`,
        [regex, reemplazo]
      );
      totalUpdates += res.rowCount;
    }
  }
  console.log(`UPDATEs aplicados (suma por columna x patrón, puede haber filas con más de un fragmento): ${totalUpdates}`);

  const { rows: verifRows } = await client.query(
    `SELECT COUNT(*)::int AS total FROM preguntas WHERE ${condiciones.join(" OR ")}`
  );
  console.log(`Filas que siguen coincidiendo con la lista blanca tras el fix (debería ser 0): ${verifRows[0].total}`);

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
