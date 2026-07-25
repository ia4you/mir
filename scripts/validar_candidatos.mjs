// validar_candidatos.mjs
// -------------------------------
// PASO 2 de 2: lee scripts/_candidatos_brutos.json (generado por
// detectar_palabras_partidas.mjs) y filtra usando el diccionario real de
// hunspell (es_ES): un candidato "palabra1 palabra2" es una PALABRA
// PARTIDA de verdad solo si la unión ("palabra1palabra2") SÍ es una
// palabra válida, y al menos uno de los dos trozos NO lo es por separado
// (si los dos trozos ya son palabras válidas por sí solas, como "presión"
// y "arterial", son dos palabras reales seguidas, no una partida).
//
// Se ejecuta en el HOST (no en Docker) porque aquí está instalado
// hunspell-es; el contenedor node:22-slim usado para consultar la BD no
// lo tiene.
//
// Uso:
//   node scripts/validar_candidatos.mjs

import { readFile, writeFile } from "fs/promises";
import { spawn } from "child_process";

const ENTRADA = "scripts/_candidatos_brutos.json";
const SALIDA = "scripts/_candidatos_validados.json";
const TOP_N = 30;

function consultarHunspell(palabras) {
  return new Promise((resolve, reject) => {
    const proc = spawn("hunspell", ["-d", "es_ES", "-l"]);
    let salida = "";
    proc.stdout.on("data", (d) => (salida += d));
    proc.stderr.on("data", () => {});
    proc.on("error", reject);
    proc.on("close", () => resolve(salida));
    proc.stdin.write(palabras.join("\n") + "\n");
    proc.stdin.end();
  });
}

async function main() {
  const candidatos = JSON.parse(await readFile(ENTRADA, "utf-8"));
  console.log(`Candidatos leídos: ${candidatos.length}`);

  const palabrasUnicas = new Set();
  for (const c of candidatos) {
    palabrasUnicas.add(c.w1);
    palabrasUnicas.add(c.w2);
    palabrasUnicas.add(c.junto);
  }
  console.log(`Palabras únicas a validar contra el diccionario: ${palabrasUnicas.size}`);

  const listaPalabras = [...palabrasUnicas];
  const salidaHunspell = await consultarHunspell(listaPalabras);
  const invalidas = new Set(salidaHunspell.split("\n").map((s) => s.trim()).filter(Boolean));
  console.log(`De esas, no reconocidas por el diccionario: ${invalidas.size}`);

  const esValida = (palabra) => !invalidas.has(palabra);

  const buenos = candidatos.filter((c) => {
    const juntoValido = esValida(c.junto);
    const algunTrozoInvalido = !esValida(c.w1) || !esValida(c.w2);
    return juntoValido && algunTrozoInvalido;
  });

  buenos.sort((a, b) => b.total - a.total);
  const top = buenos.slice(0, TOP_N);

  console.log(`\nCandidatos que parecen palabras partidas de verdad: ${buenos.length}`);
  console.log(`Top ${top.length} por frecuencia:\n`);
  for (const c of top) {
    console.log(`"${c.par}" -> "${c.junto}"  (${c.total}x)  [id ejemplo: ${c.ejemploId}]`);
  }

  await writeFile(SALIDA, JSON.stringify(top, null, 2));
  console.log(`\nGuardado: ${SALIDA}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
