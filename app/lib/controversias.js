import { readFileSync } from "fs";
import path from "path";
import { query } from "../../lib/db";

const FILE_PATH = path.join(process.cwd(), "preguntas_controvertidas.md");

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
    return { id: Number(m[1]), anio, numero };
  });
}

function parseArchivo() {
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

    const idPairs = parseIdPairs(cabecera);
    if (idPairs.length === 0) continue;

    const mTitulo = cabecera.match(/—\s*(.*)$/);
    const titulo = mTitulo
      ? mTitulo[1].trim()
      : `Pregunta ${idPairs[0].anio}-${idPairs[0].numero}`;

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

    if (!oficial || !objecion) continue;

    entradas.push({ ids: idPairs, titulo, oficial, objecion });
  }
  return entradas;
}

export async function getControversias() {
  const entradas = parseArchivo();
  const todosLosIds = entradas.flatMap((e) => e.ids.map((x) => x.id));

  const { rows } = await query(
    `SELECT id, especialidad, pregunta FROM preguntas WHERE id = ANY($1::int[])`,
    [todosLosIds]
  );
  const porId = new Map(rows.map((r) => [r.id, r]));

  return entradas
    .map((e) => ({
      ...e,
      ids: e.ids.map((x) => ({ ...x, ...porId.get(x.id) })),
    }))
    .filter((e) => e.ids.every((x) => x.pregunta))
    .sort((a, b) => {
      const A = a.ids[0];
      const B = b.ids[0];
      return A.anio - B.anio || A.numero - B.numero;
    });
}
