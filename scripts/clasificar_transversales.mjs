// clasificar_transversales.mjs
// -------------------------------
// Segunda pasada de clasificación, SOLO sobre las preguntas que quedaron en
// "Sin clasificar" tras clasificar_especialidades.mjs. A diferencia de la
// primera pasada (vocabulario clínico de contenido), aquí se buscan
// marcadores de CONTEXTO/ENTORNO de la pregunta para las 3 especialidades
// transversales que no tienen vocabulario clínico exclusivo: Urgencias,
// Cirugía y MFyC.
//
// Uso:
//   node --env-file=.env.local scripts/clasificar_transversales.mjs
//   node --env-file=.env.local scripts/clasificar_transversales.mjs --dry-run

import { Client } from "pg";

const DRY_RUN = process.argv.includes("--dry-run");
const LISTAR = process.argv.includes("--list");

const ESPECIALIDADES = {
  "Urgencias": [
    "acude a urgencias", "acude al servicio de urgencias", "es traido a urgencias",
    "es traida a urgencias", "consulta en urgencias", "ingresa por urgencias",
    "servicio de urgencias", "actitud inmediata", "actitud a seguir de forma inmediata",
    "manejo inicial", "medida inicial", "primera medida", "actuacion inmediata",
    "medidas inmediatas", "en las proximas horas", "de forma urgente",
    "inestabilidad hemodinamica", "shock", "parada cardiorrespiratoria",
    "parada cardiaca", "estado de shock", "atencion urgente", "sala de urgencias",
    "codigo ictus", "codigo infarto", "actitud mas adecuada de forma inmediata",
    "cual es la actitud inicial", "traslado urgente",
  ],
  "Cirugía": [
    "indicacion quirurgica", "tratamiento quirurgico de eleccion", "se interviene",
    "se decide intervenir", "abordaje laparoscopico", "abordaje abierto",
    "via de abordaje", "postoperatorio", "posoperatorio", "cirugia electiva",
    "cirugia urgente", "cirugia programada", "intervencion quirurgica",
    "colecistectomia", "apendicectomia", "reseccion quirurgica", "tecnica quirurgica",
    "quirofano", "conversion a cirugia abierta", "profilaxis antibiotica quirurgica",
    "complicacion postquirurgica", "herida quirurgica",
  ],
  "MFyC": [
    "consulta de atencion primaria", "acude a su centro de salud", "revision rutinaria",
    "medico de familia", "medico de cabecera", "seguimiento en atencion primaria",
    "medicina familiar y comunitaria", "chequeo rutinario", "control rutinario",
    "revision periodica", "consulta programada", "acude a revision",
    "control ambulatorio", "consulta de su medico de familia", "revision de salud",
    "examen periodico de salud", "consulta ambulatoria de control",
  ],
};

const RANGO_DIACRITICOS = new RegExp(
  "[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]",
  "g"
);

function normalizar(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(RANGO_DIACRITICOS, "");
}

function clasificar(textoNormalizado) {
  let mejorScore = 0;
  let mejores = [];
  for (const [especialidad, terminos] of Object.entries(ESPECIALIDADES)) {
    let score = 0;
    for (const termino of terminos) {
      if (textoNormalizado.includes(termino)) score++;
    }
    if (score > mejorScore) {
      mejorScore = score;
      mejores = [especialidad];
    } else if (score === mejorScore && score > 0) {
      mejores.push(especialidad);
    }
  }
  if (mejorScore === 0 || mejores.length > 1) return null; // se queda como estaba
  return mejores[0];
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows } = await client.query(
    `SELECT id, pregunta, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e
     FROM preguntas WHERE especialidad = 'Sin clasificar'`
  );

  const ids = [];
  const asignadas = [];
  const movidas = { "Urgencias": 0, "Cirugía": 0, "MFyC": 0 };
  const detalle = { "Urgencias": [], "Cirugía": [], "MFyC": [] };

  for (const row of rows) {
    const textoCompleto = [
      row.pregunta, row.opcion_a, row.opcion_b, row.opcion_c, row.opcion_d, row.opcion_e,
    ].filter(Boolean).join(" ");
    const especialidad = clasificar(normalizar(textoCompleto));
    if (especialidad) {
      ids.push(row.id);
      asignadas.push(especialidad);
      movidas[especialidad]++;
      detalle[especialidad].push({ id: row.id, snippet: row.pregunta.slice(0, 120) });
    }
  }

  console.log(`Preguntas "Sin clasificar" evaluadas: ${rows.length}`);
  console.log(`Reclasificadas: ${ids.length}`);
  console.log("  Urgencias:", movidas["Urgencias"]);
  console.log("  Cirugía:  ", movidas["Cirugía"]);
  console.log("  MFyC:     ", movidas["MFyC"]);

  if (LISTAR) {
    for (const esp of Object.keys(detalle)) {
      console.log(`\n--- ${esp} ---`);
      for (const item of detalle[esp]) {
        console.log(`  #${item.id}: ${item.snippet}`);
      }
    }
  }

  if (DRY_RUN) {
    console.log("\n--dry-run: no se ha escrito nada en la base de datos.");
    await client.end();
    return;
  }

  if (ids.length > 0) {
    await client.query(
      `UPDATE preguntas AS p
       SET especialidad = c.especialidad
       FROM (SELECT * FROM UNNEST($1::int[], $2::text[]) AS t(id, especialidad)) AS c
       WHERE p.id = c.id AND p.especialidad = 'Sin clasificar'`,
      [ids, asignadas]
    );
    console.log("\nUPDATE aplicado.");
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
