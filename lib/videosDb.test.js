// Regla de pregunta_video (vídeo tras fallar con video_exclusiones) contra una
// BD de prueba (nunca la de producción): se salta si no hay TEST_DATABASE_URL.
// Todo va en una transacción que se deshace al final.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";

const URL = process.env.TEST_DATABASE_URL;
let c, pool, p, alt, otro;

before(async () => {
  if (!URL) return;
  process.env.DATABASE_URL = URL;
  ({ pool } = await import("./db.js"));
  c = await pool.connect();
  await c.query("BEGIN");
  // Una pregunta con vídeo de tema y sin exclusión, y dos vídeos activos de otros temas.
  ({ rows: [p] } = await c.query(
    `SELECT pregunta_id, video_id FROM pregunta_video WHERE video_id IS NOT NULL AND NOT excluida ORDER BY pregunta_id LIMIT 1`
  ));
  ({ rows: [alt, otro] } = await c.query(
    `SELECT v.id, vt.especialidad, vt.tema FROM videos v JOIN video_temas vt ON vt.video_id = v.id AND vt.principal
     WHERE v.estado = 'activo' AND v.disponibilidad = 'disponible' AND v.id <> $1 ORDER BY v.id LIMIT 2`,
    [p.video_id]
  ));
  await c.query(`DELETE FROM video_exclusiones WHERE pregunta_id = $1`, [p.pregunta_id]);
});

after(async () => {
  if (!c) return;
  await c.query("ROLLBACK");
  c.release();
  await pool.end();
});

const opciones = { skip: !URL && "sin TEST_DATABASE_URL" };
const ver = async () =>
  (await c.query(`SELECT video_id, especialidad, tema, excluida FROM pregunta_video WHERE pregunta_id = $1`, [p.pregunta_id])).rows[0];
const excluir = (excluido, alternativo) =>
  c.query(
    `INSERT INTO video_exclusiones (pregunta_id, video_excluido_id, video_alternativo_id, motivo) VALUES ($1, $2, $3, 'test')
     ON CONFLICT (pregunta_id) DO UPDATE SET video_excluido_id = $2, video_alternativo_id = $3`,
    [p.pregunta_id, excluido, alternativo]
  );

test("pregunta_video: exclusión con alternativo, sin alternativo, alternativo oculto y tema que cambió", opciones, async () => {
  assert.equal((await ver()).video_id, p.video_id, "sin exclusión: el vídeo del tema");

  await excluir(p.video_id, alt.id);
  const conAlt = await ver();
  assert.equal(conAlt.video_id, alt.id, "con alternativo: el alternativo");
  assert.deepEqual([conAlt.especialidad, conAlt.tema], [alt.especialidad, alt.tema], "tarjeta del alternativo");

  await c.query(`UPDATE videos SET estado = 'oculto' WHERE id = $1`, [alt.id]);
  assert.equal((await ver()).video_id, null, "alternativo oculto: sin vídeo, no vuelve al del tema");
  await c.query(`UPDATE videos SET estado = 'activo' WHERE id = $1`, [alt.id]);

  await excluir(p.video_id, null);
  assert.equal((await ver()).video_id, null, "sin alternativo: sin vídeo");

  await excluir(otro.id, null);
  const cambiado = await ver();
  assert.equal(cambiado.video_id, p.video_id, "el tema ya no muestra el excluido: la exclusión no se aplica");
  assert.equal(cambiado.excluida, false);
});
