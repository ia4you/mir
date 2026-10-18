import { query } from "./db.js";
import { HOY_CANARIAS } from "./racha.js";

// Aciertos de /estadisticas por especialidad y por tema, y preguntas falladas
// de /errores. Solo banco oficial (las preguntas IA nunca cuentan, aunque
// lleven una especialidad real), y sin las preguntas de un simulacro que nunca
// se abrieron (vista = false): no se intentaron. Esas sí cuentan en la nota
// del simulacro (lib/notasDb.js).

// Todas las especialidades del banco oficial (también las no empezadas), sin
// las respuestas a preguntas anuladas (como la nota, lib/notasDb.js), con la
// media de acierto de la mitad más antigua y la más reciente de las
// respuestas de cada una (por fecha de sesión), para la tendencia.
export async function getAciertosPorEspecialidad(userId) {
  const { rows } = await query(
    `WITH respuestas_ordenadas AS (
       SELECT p.especialidad,
              rs.correcta,
              ROW_NUMBER() OVER (PARTITION BY p.especialidad ORDER BY s.fecha ASC, rs.id ASC) AS orden,
              COUNT(*) OVER (PARTITION BY p.especialidad) AS total_respuestas
       FROM respuestas_sesion rs
       JOIN sesiones s ON s.id = rs.sesion_id
       JOIN preguntas p ON p.id = rs.pregunta_id
       WHERE rs.user_id = $1 AND rs.vista AND p.origen = 'oficial' AND p.anulada = false
     ),
     tendencia_especialidad AS (
       SELECT especialidad,
              AVG(CASE WHEN orden <= total_respuestas / 2.0 THEN correcta::int END) AS pct_antigua,
              AVG(CASE WHEN orden > total_respuestas / 2.0 THEN correcta::int END) AS pct_reciente
       FROM respuestas_ordenadas
       GROUP BY especialidad
     )
     SELECT esp.especialidad,
            COUNT(rs.id)::int AS total,
            COUNT(*) FILTER (WHERE rs.correcta)::int AS aciertos,
            -- Preguntas del banco (sin anuladas): ordena las no practicadas en /inicio.
            COUNT(DISTINCT p.id)::int AS preguntas,
            t.pct_antigua,
            t.pct_reciente
     -- Solo especialidades del banco oficial: el banco IA (pausado) no debe
     -- aparecer como especialidad "sin empezar".
     FROM (SELECT DISTINCT especialidad FROM preguntas WHERE origen = 'oficial' AND anulada = false) esp
     LEFT JOIN preguntas p ON p.especialidad = esp.especialidad AND p.origen = 'oficial' AND p.anulada = false
     LEFT JOIN respuestas_sesion rs ON rs.pregunta_id = p.id AND rs.user_id = $1 AND rs.vista
     LEFT JOIN tendencia_especialidad t ON t.especialidad = esp.especialidad
     GROUP BY esp.especialidad, t.pct_antigua, t.pct_reciente
     ORDER BY total DESC, esp.especialidad ASC`,
    [userId]
  );
  return rows;
}

// Temas respondidos, del de peor acierto al de mejor.
export async function getAciertosPorTema(userId) {
  const { rows } = await query(
    `SELECT p.especialidad,
            p.tema,
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE rs.correcta)::int AS aciertos
     FROM respuestas_sesion rs
     JOIN preguntas p ON p.id = rs.pregunta_id
     WHERE rs.user_id = $1 AND rs.vista AND p.origen = 'oficial' AND p.tema IS NOT NULL
     GROUP BY p.especialidad, p.tema
     ORDER BY (COUNT(*) FILTER (WHERE rs.correcta))::float / COUNT(*) ASC`,
    [userId]
  );
  return rows;
}

// /errores: una fila por pregunta fallada al menos una vez (blancos de
// preguntas abiertas incluidos), con las veces que se falló, cuántas fueron en
// blanco y su estado en el repaso espaciado.
export async function getPreguntasFalladas(userId) {
  const { rows } = await query(
    `SELECT p.id, p.especialidad, p.pregunta, p.año, p.numero, p.origen,
              COUNT(*)::int AS veces_fallada,
              -- Cuántas de esas veces fue en blanco (no contestada): si todas,
              -- /errores la muestra como "En blanco" en vez de "Fallada".
              COUNT(*) FILTER (WHERE rs.respuesta_dada IS NULL)::int AS veces_en_blanco,
              -- Estado en el repaso espaciado: días hasta que toca (0 o menos = hoy)
              -- o dominada. NULL si no está en repaso.
              (r.proxima - ${HOY_CANARIAS}) AS repaso_dias,
              (r.dominada_en IS NOT NULL) AS repaso_dominada
       FROM respuestas_sesion rs
       JOIN preguntas p ON p.id = rs.pregunta_id
       LEFT JOIN repaso_espaciado r ON r.user_id = rs.user_id AND r.pregunta_id = p.id
       WHERE rs.user_id = $1 AND rs.correcta = false AND rs.vista AND p.origen = 'oficial'
       GROUP BY p.id, p.especialidad, p.pregunta, p.año, p.numero, p.origen, r.proxima, r.dominada_en
       ORDER BY p.especialidad ASC NULLS LAST, veces_fallada DESC, p.id ASC`,
    [userId]
  );
  return rows;
}
