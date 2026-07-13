import { readFileSync } from "fs";
import path from "path";
import { query } from "../../lib/db";

const FILE_PATH = path.join(process.cwd(), "preguntas_controvertidas.md");
const CAMPOS =
  "id, año, numero, especialidad, pregunta, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e, correcta";

function limpiar(texto) {
  return texto.replace(/\s+/g, " ").trim();
}

function parseIdPairs(cabecera) {
  return [...cabecera.matchAll(/id (\d+)\s*\(([^)]*)\)/g)].map((m) => {
    const parentesis = m[2];
    let anio = null;
    let numero = null;
    const mAnioNumero = parentesis.match(/^(\d{4})-(\d+)$/);
    if (mAnioNumero) {
      anio = Number(mAnioNumero[1]);
      numero = Number(mAnioNumero[2]);
    } else {
      const mAlt = parentesis.match(/(\d{4}).*?(\d+)\s*$/);
      if (mAlt) {
        anio = Number(mAlt[1]);
        numero = Number(mAlt[2]);
      }
    }
    return { anio, numero };
  });
}

function parseArchivoMd() {
  const raw = readFileSync(FILE_PATH, "utf-8");
  const chunks = raw.split(/\n(?=## id )/).slice(1);

  const entradas = [];
  for (let chunk of chunks) {
    // recorta notas de cierre de lote (verificación 2022/2024, nota general,
    // separador "---" del siguiente lote) que no forman parte de la entrada
    chunk = chunk.split(/\n\*\*Verificación (?:2022\/2024|adicional 2022\/2024)/)[0];
    chunk = chunk.split(/\n\*\*Nota general/)[0];
    chunk = chunk.split(/\n---\n/)[0];

    const lineas = chunk.split("\n");
    const cabecera = lineas[0];
    const resto = lineas.slice(1).join("\n").trim();

    const idPairs = parseIdPairs(cabecera).filter((p) => p.anio && p.numero);
    if (idPairs.length === 0) continue;

    let oficial = null;
    let objecion = null;
    const mCuerpo = resto.match(
      /\*\*(?:Oficial|Correcta oficial):\*\*\s*([\s\S]*?)\*\*Objeción:\*\*\s*([\s\S]*)/
    );
    if (mCuerpo) {
      oficial = limpiar(mCuerpo[1]);
      objecion = limpiar(mCuerpo[2]);
    } else {
      // formato especial de la primera entrada histórica del archivo
      const mOpcionCorrecta = resto.match(/^- ([A-E]): (.+?) ← \*\*correcta[^*]*\*\*/m);
      const mPorQue = resto.match(
        /\*\*Por qué no escribo explicaci[oó]n:\*\*\s*([\s\S]*?)\*\*Estado:\*\*/
      );
      if (mOpcionCorrecta) oficial = limpiar(`${mOpcionCorrecta[1]}) ${mOpcionCorrecta[2]}`);
      if (mPorQue) objecion = limpiar(mPorQue[1]);
    }

    if (!objecion) continue;

    // cada (año, numero) del encabezado se trata como una fila independiente
    // (en la práctica casi todos los encabezados listan un único id)
    for (const { anio, numero } of idPairs) {
      entradas.push({ anio, numero, objecion });
    }
  }
  return entradas;
}

export async function getControversias() {
  const entradasMd = parseArchivoMd();

  const anios = entradasMd.map((e) => e.anio);
  const numeros = entradasMd.map((e) => e.numero);
  const { rows: rowsMd } = await query(
    `SELECT ${CAMPOS} FROM preguntas
     WHERE (año, numero) IN (SELECT * FROM UNNEST($1::int[], $2::int[]))`,
    [anios, numeros]
  );
  const datosPorClave = new Map(rowsMd.map((r) => [`${r.año}-${r.numero}`, r]));

  const vistos = new Set();
  const desdeMd = [];
  for (const e of entradasMd) {
    const clave = `${e.anio}-${e.numero}`;
    if (vistos.has(clave)) continue; // evita duplicados si el .md repite un id
    const datos = datosPorClave.get(clave);
    if (!datos) continue; // id del .md que ya no resuelve a una pregunta real
    vistos.add(clave);
    desdeMd.push({ ...datos, objecion: e.objecion });
  }

  const { rows: rowsBd } = await query(
    `SELECT ${CAMPOS} FROM preguntas WHERE explicacion_calidad = 'controversia'`
  );
  const soloBd = rowsBd
    .filter((r) => !vistos.has(`${r.año}-${r.numero}`))
    .map((r) => ({ ...r, objecion: null }));

  return [...desdeMd, ...soloBd].sort((a, b) => a.año - b.año || a.numero - b.numero);
}
