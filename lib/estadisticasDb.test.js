// Contra una BD de prueba (nunca la de producción): se salta si no hay
// TEST_DATABASE_URL. Crea un usuario temporal y lo borra al terminar.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";

const URL = process.env.TEST_DATABASE_URL;
const USUARIO = 9101;
const PREGUNTA_IA = 999901;
const PREGUNTA_ANULADA = 999902;
let q, est, notas, preguntas;

before(async () => {
  if (!URL) return;
  process.env.DATABASE_URL = URL;
  ({ query: q } = await import("./db.js"));
  est = await import("./estadisticasDb.js");
  notas = await import("./notasDb.js");
  // Tres preguntas oficiales de una misma especialidad y tema.
  const { rows } = await q(
    `SELECT id, especialidad, tema, correcta FROM preguntas
     WHERE origen = 'oficial' AND anulada = false AND (especialidad, tema) =
       (SELECT especialidad, tema FROM preguntas WHERE origen = 'oficial' AND anulada = false AND tema IS NOT NULL
        GROUP BY 1, 2 HAVING COUNT(*) >= 3 ORDER BY 1, 2 LIMIT 1)
     ORDER BY id LIMIT 3`
  );
  preguntas = rows;
  await q(`INSERT INTO usuarios (id, nombre, email, password_hash, plan) VALUES ($1, 'Test', 'test-vista@example.com', 'x', 'premium')`, [USUARIO]);
  // Simulacro: 1.ª acertada, 2.ª en blanco vista, 3.ª en blanco sin abrir.
  const { rows: [s] } = await q(
    `INSERT INTO sesiones (fecha, modo, total_preguntas, aciertos, duracion_segundos, user_id)
     VALUES (now() - interval '1 day', 'simulacro', 3, 1, 600, $1) RETURNING id`,
    [USUARIO]
  );
  await q(
    `INSERT INTO respuestas_sesion (sesion_id, pregunta_id, respuesta_dada, correcta, user_id, vista)
     VALUES ($1, $2, $3, true, $5, true), ($1, $4, NULL, false, $5, true), ($1, $6, NULL, false, $5, false)`,
    [s.id, rows[0].id, rows[0].correcta.trim(), rows[1].id, USUARIO, rows[2].id]
  );
  // Una pregunta IA de la misma especialidad y tema, fallada: no debe contar
  // en ninguna estadística ni en /errores.
  await q(
    `INSERT INTO preguntas (id, año, numero, pregunta, opcion_a, opcion_b, opcion_c, opcion_d, correcta, origen, especialidad, tema)
     VALUES ($1, 2026, 999, 'Prueba IA', 'a', 'b', 'c', 'd', 'A', 'ia_generada', $2, $3)`,
    [PREGUNTA_IA, rows[0].especialidad, rows[0].tema]
  );
  // Una oficial anulada de la misma especialidad (sin tema), acertada: no
  // debe contar en el acierto por especialidad.
  await q(
    `INSERT INTO preguntas (id, año, numero, pregunta, opcion_a, opcion_b, opcion_c, opcion_d, correcta, origen, especialidad, tema, anulada)
     VALUES ($1, 2026, 998, 'Prueba anulada', 'a', 'b', 'c', 'd', 'A', 'oficial', $2, $3, true)`,
    [PREGUNTA_ANULADA, rows[0].especialidad, rows[0].tema]
  );
  // Después, en práctica, la 3.ª acertada, la IA fallada y la anulada fallada (con tema: no debe contar
  // ni por tema ni en /errores).
  const { rows: [pr] } = await q(
    `INSERT INTO sesiones (fecha, modo, total_preguntas, aciertos, duracion_segundos, user_id)
     VALUES (now(), 'practica', 1, 1, 60, $1) RETURNING id`,
    [USUARIO]
  );
  await q(
    `INSERT INTO respuestas_sesion (sesion_id, pregunta_id, respuesta_dada, correcta, user_id)
     VALUES ($1, $2, $3, true, $4), ($1, $5, 'B', false, $4), ($1, $6, 'B', false, $4)`,
    [pr.id, rows[2].id, rows[2].correcta.trim(), USUARIO, PREGUNTA_IA, PREGUNTA_ANULADA]
  );
});

after(async () => {
  if (!URL) return;
  await q(`DELETE FROM respuestas_sesion WHERE user_id = $1`, [USUARIO]);
  await q(`DELETE FROM sesiones WHERE user_id = $1`, [USUARIO]);
  await q(`DELETE FROM usuarios WHERE id = $1`, [USUARIO]);
  await q(`DELETE FROM preguntas WHERE id = ANY($1::int[])`, [[PREGUNTA_IA, PREGUNTA_ANULADA]]);
  (await import("./db.js")).pool.end();
});

test("por especialidad: ni la no vista del simulacro, ni la IA, ni la anulada cuentan", { skip: !URL }, async () => {
  const fila = (await est.getAciertosPorEspecialidad(USUARIO)).find((r) => r.especialidad === preguntas[0].especialidad);
  // acertada + blanco visto (simulacro) + acertada (práctica); la no vista, la IA y la anulada, fuera
  assert.equal(fila.total, 3);
  assert.equal(fila.aciertos, 2);
  const { rows: [b] } = await q(
    `SELECT COUNT(*)::int AS n FROM preguntas WHERE especialidad = $1 AND origen = 'oficial' AND anulada = false`,
    [preguntas[0].especialidad]
  );
  assert.equal(fila.preguntas, b.n, "preguntas del banco, sin la anulada ni la IA");
});

test("por tema: ni la no vista, ni la IA, ni la anulada cuentan", { skip: !URL }, async () => {
  const fila = (await est.getAciertosPorTema(USUARIO)).find((r) => r.tema === preguntas[0].tema);
  assert.equal(fila.total, 3);
  assert.equal(fila.aciertos, 2);
});

test("nota estimada: la no vista no gasta la «primera respuesta»", { skip: !URL }, async () => {
  const primeras = await notas.getPrimerasRespuestas(USUARIO);
  // Solo la práctica (el simulacro se descarta), y la 3.ª cuenta como primera.
  assert.equal(primeras.length, 1);
  assert.equal(primeras[0].correcta, true);
});

test("la nota del simulacro sigue contando las 3 (blancos incluidos)", { skip: !URL }, async () => {
  const [s] = await notas.getSimulacros(USUARIO, { limite: 1 });
  assert.deepEqual([s.aciertos, s.errores, s.en_blanco], [1, 0, 2]);
});

test("/errores: solo el blanco visto; ni la no vista, ni la IA, ni la anulada", { skip: !URL }, async () => {
  const ids = (await est.getPreguntasFalladas(USUARIO)).map((r) => r.id);
  assert.deepEqual(ids, [preguntas[1].id]);
});
