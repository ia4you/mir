import { query } from "./db.js";

// Aciertos de /estadisticas por especialidad y por tema. Las preguntas de un
// simulacro que nunca se abrieron (vista = false) no cuentan: no se
// intentaron. Sí cuentan en la nota del simulacro (lib/notasDb.js).

// Todas las especialidades del banco oficial (también las no empezadas), con
// la media de acierto de la mitad más antigua y la más reciente de las
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
       WHERE rs.user_id = $1 AND rs.vista
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
            t.pct_antigua,
            t.pct_reciente
     -- Solo especialidades del banco oficial: el banco IA (pausado) no debe
     -- aparecer como especialidad "sin empezar".
     FROM (SELECT DISTINCT especialidad FROM preguntas WHERE origen = 'oficial' AND anulada = false) esp
     LEFT JOIN preguntas p ON p.especialidad = esp.especialidad
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
     WHERE rs.user_id = $1 AND rs.vista AND p.tema IS NOT NULL
     GROUP BY p.especialidad, p.tema
     ORDER BY (COUNT(*) FILTER (WHERE rs.correcta))::float / COUNT(*) ASC`,
    [userId]
  );
  return rows;
}
