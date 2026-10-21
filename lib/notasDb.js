import { query } from "./db.js";
import { ANIOS_FUERA_SIMULACRO } from "./simulacro.js";

// Peso medio histórico (% de cada especialidad en cada convocatoria oficial
// disponible, con 0% los años sin preguntas). Es el CTE de generarSimulacro()
// en app/api/preguntas/route.js, copiado tal cual (esa ruta no se toca).
export async function getPesosEspecialidad() {
  const { rows } = await query(`
    WITH anios AS (SELECT DISTINCT año FROM preguntas WHERE origen = 'oficial' AND anulada = false AND año <> ALL($1::int[])),
         especialidades AS (SELECT DISTINCT especialidad FROM preguntas WHERE origen = 'oficial' AND anulada = false),
         combinaciones AS (
           SELECT a.año, e.especialidad FROM anios a CROSS JOIN especialidades e
         ),
         conteos AS (
           SELECT c.año, c.especialidad, COALESCE(p.cnt, 0) AS num_preguntas
           FROM combinaciones c
           LEFT JOIN (
             SELECT año, especialidad, COUNT(*) AS cnt FROM preguntas
             WHERE origen = 'oficial' AND anulada = false AND año <> ALL($1::int[])
             GROUP BY año, especialidad
           ) p ON p.año = c.año AND p.especialidad = c.especialidad
         ),
         totales_año AS (SELECT año, SUM(num_preguntas) AS total FROM conteos GROUP BY año),
         pcts AS (
           SELECT c.año, c.especialidad, c.num_preguntas * 100.0 / t.total AS pct
           FROM conteos c JOIN totales_año t ON t.año = c.año
         )
    SELECT especialidad, AVG(pct) AS pct_medio
    FROM pcts
    GROUP BY especialidad
  `, [ANIOS_FUERA_SIMULACRO]);
  return Object.fromEntries(rows.map((r) => [r.especialidad, parseFloat(r.pct_medio)]));
}

// Primera respuesta de cada pregunta por usuario, calculada sobre TODAS las
// sesiones (así una pregunta vista antes en un simulacro no cuenta como
// primera); después se descartan las de simulacro y las de preguntas anuladas.
// Las no vistas de un simulacro (vista = false) no cuentan como vistas, y las
// preguntas IA no cuentan nunca.
// Incluye sesiones abandonadas.
export async function getPrimerasRespuestas(userId) {
  const { rows } = await query(
    `WITH r AS (
       SELECT rs.id, rs.respuesta_dada, rs.correcta, s.fecha, s.modo, p.especialidad, p.anulada, p.origen,
              ROW_NUMBER() OVER (PARTITION BY rs.user_id, rs.pregunta_id ORDER BY s.fecha, rs.id) AS rn
       FROM respuestas_sesion rs
       JOIN sesiones s ON s.id = rs.sesion_id
       JOIN preguntas p ON p.id = rs.pregunta_id
       WHERE rs.user_id = $1 AND rs.vista
     )
     SELECT id, respuesta_dada, correcta, fecha, especialidad
     FROM r
     WHERE rn = 1 AND modo <> 'simulacro' AND anulada = false AND origen = 'oficial'`,
    [userId]
  );
  return rows;
}

// Simulacros terminados del usuario, del más reciente al más antiguo, con
// aciertos, errores y blancos contados desde respuestas_sesion (anuladas
// excluidas; un blanco no es error). Con `hastaSesion`, solo ese simulacro y
// los anteriores. Lo usan /estadisticas y /resultados, para que las dos
// pantallas den siempre la misma nota.
export async function getSimulacros(userId, { limite, hastaSesion = null }) {
  const { rows } = await query(
    `SELECT s.id, s.fecha, s.total_preguntas,
            COUNT(rs.id) FILTER (WHERE rs.correcta)::int AS aciertos,
            COUNT(rs.id) FILTER (WHERE NOT rs.correcta AND rs.respuesta_dada IS NOT NULL)::int AS errores,
            COUNT(rs.id) FILTER (WHERE rs.respuesta_dada IS NULL)::int AS en_blanco
     FROM sesiones s
     LEFT JOIN respuestas_sesion rs ON rs.sesion_id = s.id
       AND rs.pregunta_id NOT IN (SELECT id FROM preguntas WHERE anulada = true)
     WHERE s.user_id = $1 AND s.modo = 'simulacro' AND s.duracion_segundos IS NOT NULL
       AND ($3::int IS NULL OR s.fecha <= (SELECT fecha FROM sesiones WHERE id = $3))
     GROUP BY s.id, s.fecha, s.total_preguntas
     ORDER BY s.fecha DESC, s.id DESC
     LIMIT $2`,
    [userId, limite, hastaSesion]
  );
  return rows;
}

// Dos últimos simulacros terminados (nota y comparación en /estadisticas).
export function getUltimosSimulacros(userId) {
  return getSimulacros(userId, { limite: 2 });
}
