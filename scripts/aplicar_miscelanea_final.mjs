// aplicar_miscelanea_final.mjs
// -------------------------------
// Aplica el UPDATE final sobre las 34 clasificaciones de alta confianza
// aprobadas por el usuario (de las 41 que quedaban en Miscelánea tras la
// pasada anterior), dejando fuera los 7 casos forzados/dudosos señalados
// explícitamente: 163, 222, 225, 474, 570, 626, 943.
//
// El mapeo está congelado (no se vuelve a llamar a la API) para que lo
// aplicado sea exactamente lo que se mostró y aprobó en el dry-run.
//
// Uso: node --env-file=.env.local scripts/aplicar_miscelanea_final.mjs

import { Client } from "pg";

const CLASIFICACIONES = {
  24: "Pediatría",
  32: "Neurología",
  35: "Endocrinología",
  37: "Oncología",
  39: "Digestivo",
  40: "ORL",
  78: "Pediatría",
  153: "Nefrología",
  162: "MFyC",
  166: "MFyC",
  183: "MFyC",
  213: "Cardiología",
  214: "Nefrología",
  216: "Pediatría",
  224: "Pediatría",
  243: "Dermatología",
  333: "MFyC",
  336: "MFyC",
  423: "Pediatría",
  440: "Urgencias",
  544: "MFyC",
  547: "Endocrinología",
  625: "Neurología",
  632: "Pediatría",
  633: "Hematología",
  730: "Urgencias",
  772: "Urgencias",
  774: "Urgencias",
  800: "Digestivo",
  865: "Endocrinología",
  867: "Neurología",
  868: "Oncología",
  902: "Pediatría",
  924: "MFyC",
};

// Dejados deliberadamente en Miscelánea (clasificación forzada/dudosa):
// 163 (HBP/incontinencia -> sería Urología), 222 (inmunoterapia veneno ->
// sería Alergología), 225 (biología molecular pura), 474 (el modelo dudó
// entre dos especialidades), 570 (dudó entre Urgencias/MFyC), 626
// (fisiología de músculo liso sin dueño clínico claro), 943 (ayudas a la
// marcha -> sería Rehabilitación).

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const ids = Object.keys(CLASIFICACIONES).map(Number);
  const especialidades = ids.map((id) => CLASIFICACIONES[id]);

  const { rowCount } = await client.query(
    `UPDATE preguntas AS p
     SET especialidad = c.especialidad
     FROM (SELECT * FROM UNNEST($1::int[], $2::text[]) AS t(id, especialidad)) AS c
     WHERE p.id = c.id AND p.especialidad = 'Miscelánea'`,
    [ids, especialidades]
  );

  console.log(`UPDATE aplicado sobre ${rowCount} filas (de ${ids.length} IDs propuestos).`);

  const { rows } = await client.query(
    `SELECT especialidad, COUNT(*) FROM preguntas GROUP BY especialidad ORDER BY COUNT(*) DESC`
  );
  console.log("\nDistribución final:");
  for (const r of rows) {
    console.log(`  ${r.especialidad}: ${r.count}`);
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
