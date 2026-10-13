import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { calcularRacha, diaCanarias, HOY_CANARIAS, semanaActual } from "@/lib/racha";

export const dynamic = "force-dynamic";

// Estas estadísticas son por usuario (cada uno ve solo lo suyo). La meta
// diaria se guarda en localStorage (ver app/lib/preferencias.js) y se pasa
// como ?meta=N; 20 es solo el valor por defecto si no se indica.
const META_DIARIA_POR_DEFECTO = 20;

// Con menos respuestas que esto en una especialidad no hay datos suficientes
// para partir en "mitad antigua / mitad reciente" y calcular una tendencia fiable.
const MIN_RESPUESTAS_TENDENCIA = 4;
// Diferencia mínima (en proporción, 0-1) entre la mitad reciente y la
// antigua para considerar que hay una tendencia real y no ruido.
const UMBRAL_TENDENCIA = 0.15;

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { searchParams } = new URL(request.url);
    const metaParam = parseInt(searchParams.get("meta"), 10);
    const metaDiariaPreguntas =
      Number.isInteger(metaParam) && metaParam > 0 ? metaParam : META_DIARIA_POR_DEFECTO;

    // Días en hora de Canarias, no en UTC (ver lib/racha.js).
    const diasRes = await query(
      `SELECT ${HOY_CANARIAS}::text AS hoy,
              ARRAY(SELECT DISTINCT ${diaCanarias()}::text FROM sesiones WHERE user_id = $1) AS dias`,
      [userId]
    );
    const racha = calcularRacha(diasRes.rows[0].dias, diasRes.rows[0].hoy);

    const hoyRes = await query(
      `SELECT COUNT(*)::int AS total
       FROM respuestas_sesion rs
       JOIN sesiones s ON s.id = rs.sesion_id
       WHERE ${diaCanarias("s.fecha")} = ${HOY_CANARIAS} AND rs.user_id = $1`,
      [userId]
    );
    const respondidasHoy = hoyRes.rows[0].total;
    const metaDiariaPct = Math.min(
      100,
      Math.round((respondidasHoy / metaDiariaPreguntas) * 100)
    );

    // Preguntas distintas del banco oficial respondidas alguna vez, sobre el total.
    const bancoRes = await query(
      `SELECT (SELECT COUNT(*)::int FROM preguntas WHERE origen = 'oficial' AND anulada = false) AS total,
              (SELECT COUNT(DISTINCT rs.pregunta_id)::int
               FROM respuestas_sesion rs
               JOIN preguntas p ON p.id = rs.pregunta_id
               WHERE rs.user_id = $1 AND p.origen = 'oficial' AND p.anulada = false) AS respondidas`,
      [userId]
    );

    // Partimos de TODAS las especialidades (no solo las ya practicadas) para
    // que el usuario vea el mapa completo desde el primer día, con 0% en las
    // que todavía no ha tocado. La tendencia compara la mitad más reciente de
    // respuestas de cada especialidad (por fecha de sesión) contra la mitad
    // más antigua.
    const especialidadesRes = await query(
      `WITH respuestas_ordenadas AS (
         SELECT p.especialidad,
                rs.correcta,
                ROW_NUMBER() OVER (PARTITION BY p.especialidad ORDER BY s.fecha ASC, rs.id ASC) AS orden,
                COUNT(*) OVER (PARTITION BY p.especialidad) AS total_respuestas
         FROM respuestas_sesion rs
         JOIN sesiones s ON s.id = rs.sesion_id
         JOIN preguntas p ON p.id = rs.pregunta_id
         WHERE rs.user_id = $1
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
       LEFT JOIN respuestas_sesion rs ON rs.pregunta_id = p.id AND rs.user_id = $1
       LEFT JOIN tendencia_especialidad t ON t.especialidad = esp.especialidad
       GROUP BY esp.especialidad, t.pct_antigua, t.pct_reciente
       ORDER BY total DESC, esp.especialidad ASC`,
      [userId]
    );

    return NextResponse.json({
      racha_dias: racha,
      semana: semanaActual(diasRes.rows[0].dias, diasRes.rows[0].hoy),
      meta_diaria: {
        objetivo: metaDiariaPreguntas,
        respondidas_hoy: respondidasHoy,
        porcentaje: metaDiariaPct,
      },
      banco: bancoRes.rows[0],
      especialidades: especialidadesRes.rows.map((r) => {
        const total = r.total;
        const aciertos = r.aciertos;
        let tendencia = "flat";
        if (total >= MIN_RESPUESTAS_TENDENCIA && r.pct_antigua !== null && r.pct_reciente !== null) {
          const diff = parseFloat(r.pct_reciente) - parseFloat(r.pct_antigua);
          if (diff >= UMBRAL_TENDENCIA) tendencia = "up";
          else if (diff <= -UMBRAL_TENDENCIA) tendencia = "down";
        }
        return {
          especialidad: r.especialidad,
          total,
          aciertos,
          porcentaje: total > 0 ? Math.round((aciertos / total) * 100) : 0,
          tendencia,
        };
      }),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al calcular estadísticas" }, { status: 500 });
  }
}
