import { query } from "./db";
import { siguienteEstado } from "./repaso";
import { HOY_CANARIAS } from "./racha";

// Actualiza el repaso espaciado de una pregunta tras responderla (en /test o
// al entregar un simulacro). Solo banco oficial y no anuladas; quien llama lo
// comprueba y lo envuelve en try/catch, para que nunca impida guardar.
export async function actualizarRepaso(userId, preguntaId, correcta) {
  const { rows } = await query(
    `SELECT to_char(${HOY_CANARIAS}, 'YYYY-MM-DD') AS hoy,
            r.nivel, to_char(r.proxima, 'YYYY-MM-DD') AS proxima, r.user_id IS NOT NULL AS existe
     FROM (SELECT 1) x
     LEFT JOIN repaso_espaciado r ON r.user_id = $1 AND r.pregunta_id = $2`,
    [userId, preguntaId]
  );
  const { hoy, nivel, proxima, existe } = rows[0];
  const nuevo = siguienteEstado(existe ? { nivel, proxima } : null, correcta, hoy);
  if (!nuevo) return;

  if (nuevo.dominada) {
    await query(
      `UPDATE repaso_espaciado
       SET nivel = NULL, proxima = NULL, dominada_en = now(), ultimo_repaso = now()
       WHERE user_id = $1 AND pregunta_id = $2`,
      [userId, preguntaId]
    );
    return;
  }
  await query(
    `INSERT INTO repaso_espaciado (user_id, pregunta_id, nivel, proxima, ultimo_repaso)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (user_id, pregunta_id) DO UPDATE
       SET nivel = EXCLUDED.nivel, proxima = EXCLUDED.proxima, dominada_en = NULL,
           ultimo_repaso = now(),
           veces_fallada = repaso_espaciado.veces_fallada + $5`,
    [userId, preguntaId, nuevo.nivel, nuevo.proxima, correcta ? 0 : 1]
  );
}
