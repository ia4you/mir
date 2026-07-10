// fix_fragmentos_consonante.mjs
// -------------------------------
// PROBLEMA 1 de calidad de texto: una consonante suelta (nunca es una
// palabra real en español) quedó separada por un espacio del resto de su
// palabra, por un artefacto de extracción del PDF (p.ej. "c arnicera" en
// vez de "carnicera").
//
// La lista de abajo se construyó revisando MANUALMENTE, con contexto
// completo, cada uno de los 145 fragmentos únicos encontrados en la tabla
// (243 apariciones en total). Se excluyeron a propósito los casos donde:
//   - la letra es en realidad una abreviatura legítima ("h" = horas,
//     "g" = gramos, como en "48 h de evolución" o "500 mg/d con...").
//   - la letra pertenece a la palabra ANTERIOR, no a la siguiente
//     (p.ej. "e n consulta" = "en consulta", no "n consulta"; "combina r
//     gemfibrozilo" = "combinar gemfibrozilo", no "r gemfibrozilo").
// Esos casos (~90 fragmentos) se dejan intactos para una revisión aparte.
//
// Uso:
//   node --env-file=.env.local scripts/fix_fragmentos_consonante.mjs --dry-run
//   node --env-file=.env.local scripts/fix_fragmentos_consonante.mjs

import { Client } from "pg";

const DRY_RUN = process.argv.includes("--dry-run");

const PARES = {
  b: ["ilateral", "enigno", "edaquilina", "ase", "asada"],
  c: [
    "on", "onsulta", "omo", "odo", "entro", "entral", "aso", "arnicera",
    "ardiaco", "ara", "ambios", "alvo", "alle", "uerpo", "uando",
    "orticoides", "orrecta", "ontacta", "onstar", "onsidera",
    "onjuntivitis", "onducta", "oncentraciones", "omunitaria", "omprimido",
    "ontrol", "ondiciones", "ompleta",
  ],
  d: [
    "el", "en", "olor", "istal", "ismenorrea", "ihidropirimidina",
    "erivado", "ejar", "ebe", "omiciliaria", "eterioro", "esarrollar",
    "elirium",
  ],
  f: ["actor", "lexor"],
  g: ["rave", "allo"],
  h: [
    "ormona", "oras", "iponatremia", "ipertrigliceridemia", "emianopsia",
    "aloperidol", "an", "asta", "ace",
  ],
  j: ["unto"],
  l: [
    "os", "as", "reordenamiento", "ocales", "icuados", "egal", "entor",
    "eiomioma",
  ],
  m: ["oderados", "oderada", "ecanismo", "atutina", "asa", "arido", "aniobras"],
  n: ["eprilisina", "ivolumab", "egativo", "ecesario"],
  p: [
    "or", "acientes", "ara", "ulsos", "uede", "rotesis", "roporcionales",
    "rolongarse", "rimarias", "orque", "irfenidona", "ermanece",
  ],
  q: ["ue"],
  r: ["otura", "eposo", "efiere", "eacciones", "adiaciones"],
  s: [
    "us", "uplementarse", "uperficial", "ufre", "ospecha", "oplo", "on",
    "olitario", "olicita", "obrepeso", "ecundaria", "alivares", "eis",
    "upraclavicular", "angre",
  ],
  t: [
    "rata", "ratarse", "ratamiento", "rapecio", "racto", "endones",
    "emperatura", "umor", "iempos",
  ],
  v: ["irus"],
};

const COLUMNAS = ["pregunta", "opcion_a", "opcion_b", "opcion_c", "opcion_d", "opcion_e"];

function construirPares() {
  const pares = [];
  for (const [letra, palabras] of Object.entries(PARES)) {
    for (const resto of palabras) {
      pares.push({ patron: `\\y${letra}\\y ${resto}\\y`, reemplazo: `${letra}${resto}` });
    }
  }
  return pares;
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const pares = construirPares();
  console.log(`Pares en la lista blanca: ${pares.length}`);

  // Filas distintas que se van a tocar (para no contar dos veces una fila
  // con más de un fragmento corregido).
  const condiciones = COLUMNAS.flatMap((col) => pares.map((p) => `${col} ~ '${p.patron}'`));
  const { rows: filasRows } = await client.query(
    `SELECT COUNT(*)::int AS total FROM preguntas WHERE ${condiciones.join(" OR ")}`
  );
  console.log(`Filas distintas que se van a corregir: ${filasRows[0].total}`);

  if (DRY_RUN) {
    console.log("--dry-run: no se ha escrito nada.");
    await client.end();
    return;
  }

  let totalUpdates = 0;
  for (const columna of COLUMNAS) {
    for (const { patron, reemplazo } of pares) {
      const res = await client.query(
        `UPDATE preguntas SET ${columna} = regexp_replace(${columna}, $1, $2, 'g') WHERE ${columna} ~ $1`,
        [patron, reemplazo]
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
