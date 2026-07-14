// clasificar_miscelanea_final.mjs
// -------------------------------
// Última pasada: fuerza la clasificación de las preguntas que quedan en
// 'Miscelánea' en una de las 22 especialidades reales, sin permitir
// 'Miscelánea' como respuesta. Solo toca filas cuya especialidad actual es
// 'Miscelánea'.
//
// Uso:
//   node --env-file=.env.local scripts/clasificar_miscelanea_final.mjs --dry-run
//   node --env-file=.env.local scripts/clasificar_miscelanea_final.mjs   (aplica UPDATE)

import { Client } from "pg";

const DRY_RUN = process.argv.includes("--dry-run");
const MODELO = "claude-haiku-4-5-20251001";
const TAMANO_LOTE = 10;

const ESPECIALIDADES_VALIDAS = [
  "Neurología", "Cardiología", "Digestivo", "Respiratorio", "Endocrinología",
  "Nefrología", "Reumatología", "Hematología", "Oncología", "Infecciosas",
  "Psiquiatría", "Ginecología", "Pediatría", "Cirugía", "Traumatología",
  "Oftalmología", "ORL", "Dermatología", "Urgencias", "MFyC",
  "Bioestadística", "Ética médica",
];

const SISTEMA = "Eres un médico experto en el examen MIR español. Tu objetivo es clasificar SIEMPRE en una especialidad concreta, nunca en Miscelánea. Toda pregunta médica tiene una especialidad principal aunque sea indirectamente.";

// La API se resiste a dar una especialidad válida en un puñado de casos
// (dos de 41 en la última pasada) pese al prompt agresivo, normalmente
// porque insiste en una especialidad que no está en la lista (p.ej.
// Urología). Para esos IDs concretos se resuelve a mano tras revisar el
// enunciado completo, en vez de reintentar indefinidamente contra la API.
const OVERRIDES_MANUALES = {
  163: { especialidad: "MFyC", razon: "Incontinencia urinaria de urgencia en paciente geriátrico con HBP: manejo conductual/geriátrico, mismo patrón que el resto de preguntas de valoración geriátrica de este lote." },
  626: { especialidad: "Digestivo", razon: "Fisiología del músculo liso tónico (intestino, vejiga, vesícula biliar): dos de los tres órganos citados son digestivos." },
};

function construirPrompt(row) {
  const opciones = [
    `A) ${row.opcion_a}`,
    `B) ${row.opcion_b}`,
    `C) ${row.opcion_c}`,
    `D) ${row.opcion_d}`,
    row.opcion_e ? `E) ${row.opcion_e}` : null,
  ].filter(Boolean).join("\n");

  return `Clasifica esta pregunta MIR en UNA de estas especialidades (NO uses Miscelánea bajo ningún concepto):
Neurología, Cardiología, Digestivo, Respiratorio, Endocrinología, Nefrología, Reumatología, Hematología, Oncología, Infecciosas, Psiquiatría, Ginecología, Pediatría, Cirugía, Traumatología, Oftalmología, ORL, Dermatología, Urgencias, MFyC, Bioestadística, Ética médica.

Pregunta: ${row.pregunta}
Opciones:
${opciones}
Respuesta correcta: ${row.correcta}
${row.explicacion ? `Explicación: ${row.explicacion}` : ""}

Elige la especialidad más relacionada aunque sea indirectamente, incluso si la relación es débil o el tema es transversal (genética, geriatría, inmunología básica, fisiología, medicina de urgencias/paliativos, etc. deben asignarse a la especialidad clínica con la que más se relacionen). No existen "especialidades no listadas": si piensas en una que no está en la lista (p.ej. Alergología, Urología, Rehabilitación, Medicina Interna), tradúcela a la más cercana de la lista.

Responde EXACTAMENTE en este formato, sin nada antes ni después, sin explicaciones adicionales ni notas:
Especialidad|razón breve en una frase`;
}

async function clasificarPregunta(row, apiKey) {
  const body = {
    model: MODELO,
    max_tokens: 100,
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
        return { id: row.id, especialidad: null, razon: `HTTP ${res.status}` };
      }
      const data = await res.json();
      const crudo = (data.content?.[0]?.text || "").trim();
      const [especialidadCruda, ...resto] = crudo.split("|");
      const especialidad = especialidadCruda.trim();
      const razon = resto.join("|").trim();
      let valida = ESPECIALIDADES_VALIDAS.includes(especialidad) ? especialidad : null;
      if (!valida) {
        // el modelo no respetó el formato "Especialidad|razón": buscamos
        // cualquier nombre válido mencionado en el texto y nos quedamos con
        // el último (las respuestas divagantes suelen concluir al final)
        const encontrados = ESPECIALIDADES_VALIDAS.filter((esp) => crudo.includes(esp));
        if (encontrados.length > 0) {
          valida = encontrados[encontrados.length - 1];
        }
      }
      return { id: row.id, especialidad: valida, razon: razon || crudo, crudo };
    } catch (err) {
      if (intentos >= 3) {
        console.error(`  #${row.id} fallo tras ${intentos} intentos: ${err.message}`);
        return { id: row.id, especialidad: null, razon: `ERROR: ${err.message}` };
      }
      await new Promise((r) => setTimeout(r, 1000 * intentos));
    }
  }
  return { id: row.id, especialidad: null, razon: "sin respuesta" };
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
    `SELECT id, pregunta, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e, correcta, explicacion
     FROM preguntas WHERE especialidad = 'Miscelánea' ORDER BY id`
  );

  console.log(`Preguntas en Miscelánea a clasificar: ${rows.length}\n`);

  const resultados = [];
  for (let i = 0; i < rows.length; i += TAMANO_LOTE) {
    const lote = rows.slice(i, i + TAMANO_LOTE);
    const respuestas = await Promise.all(lote.map((row) => clasificarPregunta(row, apiKey)));
    for (const r of respuestas) {
      if (!r.especialidad && OVERRIDES_MANUALES[r.id]) {
        r.especialidad = OVERRIDES_MANUALES[r.id].especialidad;
        r.razon = `[override manual] ${OVERRIDES_MANUALES[r.id].razon}`;
      }
    }
    resultados.push(...respuestas);
    process.stdout.write(`\rProcesadas ${Math.min(i + TAMANO_LOTE, rows.length)}/${rows.length}`);
  }
  console.log("\n");

  const porId = new Map(rows.map((r) => [r.id, r]));
  const distribucion = {};
  const sinClasificar = [];

  console.log("--- Clasificaciones propuestas ---");
  for (const r of resultados) {
    const row = porId.get(r.id);
    if (!r.especialidad) {
      sinClasificar.push(r);
      console.log(`  #${r.id} SIN CLASIFICAR [${r.razon}]: ${row.pregunta.slice(0, 100)}`);
      continue;
    }
    distribucion[r.especialidad] = (distribucion[r.especialidad] || 0) + 1;
    console.log(`  #${r.id} → ${r.especialidad} [${r.razon}]`);
    console.log(`      ${row.pregunta.slice(0, 130)}`);
  }

  console.log(`\nDistribución propuesta:`);
  for (const [esp, n] of Object.entries(distribucion).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${esp}: ${n}`);
  }
  console.log(`\nTotal reclasificadas: ${resultados.length - sinClasificar.length}`);
  console.log(`Sin clasificar (quedarían en Miscelánea): ${sinClasificar.length}`);

  if (DRY_RUN) {
    console.log("\n--dry-run: no se ha escrito nada en la base de datos.");
    await client.end();
    return;
  }

  const reclasificadas = resultados.filter((r) => r.especialidad);
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
    console.log(`\nUPDATE aplicado sobre ${reclasificadas.length} filas.`);
  }

  const { rows: restantes } = await client.query(
    `SELECT COUNT(*)::int AS n FROM preguntas WHERE especialidad = 'Miscelánea'`
  );
  console.log(`Quedan en Miscelánea tras el UPDATE: ${restantes[0].n}`);

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
