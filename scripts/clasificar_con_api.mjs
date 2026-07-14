// clasificar_con_api.mjs
// -------------------------------
// Reclasifica las preguntas en 'Miscelánea' llamando a la API de Anthropic
// (claude-haiku-4-5) pregunta por pregunta, en vez de un diccionario de
// términos. Solo toca filas cuya especialidad actual es 'Miscelánea'.
//
// Uso:
//   node --env-file=.env.local scripts/clasificar_con_api.mjs --dry-run
//   node --env-file=.env.local scripts/clasificar_con_api.mjs   (aplica UPDATE)

import { Client } from "pg";

const DRY_RUN = process.argv.includes("--dry-run");
const MODELO = "claude-haiku-4-5-20251001";
const TAMANO_LOTE = 10;

const ESPECIALIDADES_VALIDAS = [
  "Neurología", "Cardiología", "Digestivo", "Respiratorio", "Endocrinología",
  "Nefrología", "Reumatología", "Hematología", "Oncología", "Infecciosas",
  "Psiquiatría", "Ginecología", "Pediatría", "Cirugía", "Traumatología",
  "Oftalmología", "ORL", "Dermatología", "Urgencias", "MFyC",
  "Bioestadística", "Ética médica", "Miscelánea",
];

const SISTEMA = "Eres un médico experto en el examen MIR español. Responde SOLO con el nombre exacto de la especialidad, sin explicación.";

function construirPrompt(row) {
  const opciones = [
    `A) ${row.opcion_a}`,
    `B) ${row.opcion_b}`,
    `C) ${row.opcion_c}`,
    `D) ${row.opcion_d}`,
    row.opcion_e ? `E) ${row.opcion_e}` : null,
  ].filter(Boolean).join("\n");

  return `Clasifica esta pregunta MIR en UNA de estas especialidades:
Neurología, Cardiología, Digestivo, Respiratorio, Endocrinología, Nefrología, Reumatología, Hematología, Oncología, Infecciosas, Psiquiatría, Ginecología, Pediatría, Cirugía, Traumatología, Oftalmología, ORL, Dermatología, Urgencias, MFyC, Bioestadística, Ética médica, Miscelánea.

Pregunta: ${row.pregunta}
Opciones:
${opciones}
Respuesta correcta: ${row.correcta}

Responde SOLO con el nombre exacto de la especialidad. Si no puedes clasificarla con confianza, responde exactamente: Miscelánea`;
}

async function clasificarPregunta(row, apiKey) {
  const body = {
    model: MODELO,
    max_tokens: 20,
    system: SISTEMA,
    messages: [{ role: "user", content: construirPrompt(row) }],
  };

  let intentos = 0;
  while (intentos < 3) {
    intentos++;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        if (res.status === 429 || res.status >= 500) {
          await new Promise((r) => setTimeout(r, 1000 * intentos));
          continue;
        }
        const texto = await res.text();
        console.error(`  #${row.id} error HTTP ${res.status}: ${texto.slice(0, 200)}`);
        return { id: row.id, especialidad: "Miscelánea", crudo: `HTTP ${res.status}` };
      }
      const data = await res.json();
      const crudo = (data.content?.[0]?.text || "").trim();
      const especialidad = ESPECIALIDADES_VALIDAS.includes(crudo) ? crudo : "Miscelánea";
      return { id: row.id, especialidad, crudo };
    } catch (err) {
      if (intentos >= 3) {
        console.error(`  #${row.id} fallo tras ${intentos} intentos: ${err.message}`);
        return { id: row.id, especialidad: "Miscelánea", crudo: `ERROR: ${err.message}` };
      }
      await new Promise((r) => setTimeout(r, 1000 * intentos));
    }
  }
  return { id: row.id, especialidad: "Miscelánea", crudo: "sin respuesta" };
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("Falta ANTHROPIC_API_KEY en el entorno.");
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows } = await client.query(
    `SELECT id, pregunta, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e, correcta
     FROM preguntas WHERE especialidad = 'Miscelánea' ORDER BY id`
  );

  console.log(`Preguntas en Miscelánea a clasificar: ${rows.length}\n`);

  const resultados = [];
  for (let i = 0; i < rows.length; i += TAMANO_LOTE) {
    const lote = rows.slice(i, i + TAMANO_LOTE);
    const respuestas = await Promise.all(lote.map((row) => clasificarPregunta(row, apiKey)));
    resultados.push(...respuestas);
    process.stdout.write(`\rProcesadas ${Math.min(i + TAMANO_LOTE, rows.length)}/${rows.length}`);
  }
  console.log("\n");

  const distribucion = {};
  const reclasificadas = resultados.filter((r) => r.especialidad !== "Miscelánea");
  for (const r of resultados) {
    distribucion[r.especialidad] = (distribucion[r.especialidad] || 0) + 1;
  }

  console.log("Distribución resultante:");
  for (const [esp, n] of Object.entries(distribucion).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${esp}: ${n}`);
  }
  console.log(`\nReclasificadas: ${reclasificadas.length}`);
  console.log(`Quedan en Miscelánea: ${distribucion["Miscelánea"] || 0}`);

  console.log(`\n--- 10 ejemplos de reclasificación ---`);
  const porId = new Map(rows.map((r) => [r.id, r]));
  for (const r of reclasificadas.slice(0, 10)) {
    const row = porId.get(r.id);
    console.log(`  #${r.id} → ${r.especialidad}: ${row.pregunta.slice(0, 130)}`);
  }

  if (DRY_RUN) {
    console.log("\n--dry-run: no se ha escrito nada en la base de datos.");
    await client.end();
    return;
  }

  if (reclasificadas.length > 0) {
    const ids = reclasificadas.map((r) => r.id);
    const especialidades = reclasificadas.map((r) => r.especialidad);
    await client.query(
      `UPDATE preguntas AS p
       SET especialidad = c.especialidad
       FROM (SELECT * FROM UNNEST($1::int[], $2::text[]) AS t(id, especialidad)) AS c
       WHERE p.id = c.id AND p.especialidad = 'Miscelánea'`,
      [ids, especialidades]
    );
    console.log("\nUPDATE aplicado.");
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
