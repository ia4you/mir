import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// No hay tabla de usuarios/autenticación todavía, así que estas estadísticas
// son globales (agregan todas las sesiones). La meta diaria se guarda en
// localStorage (ver app/lib/preferencias.js) y se pasa como ?meta=N; 20 es
// solo el valor por defecto si no se indica.
const META_DIARIA_POR_DEFECTO = 20;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const metaParam = parseInt(searchParams.get("meta"), 10);
    const metaDiariaPreguntas =
      Number.isInteger(metaParam) && metaParam > 0 ? metaParam : META_DIARIA_POR_DEFECTO;

    const diasRes = await query(
      `SELECT DISTINCT DATE(fecha) AS dia FROM sesiones ORDER BY dia DESC`
    );
    const dias = diasRes.rows.map((r) => r.dia.toISOString().slice(0, 10));

    let racha = 0;
    let cursor = new Date();
    for (;;) {
      const clave = cursor.toISOString().slice(0, 10);
      if (dias.includes(clave)) {
        racha++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    const hoyRes = await query(
      `SELECT COUNT(*)::int AS total
       FROM respuestas_sesion rs
       JOIN sesiones s ON s.id = rs.sesion_id
       WHERE DATE(s.fecha) = CURRENT_DATE`
    );
    const respondidasHoy = hoyRes.rows[0].total;
    const metaDiariaPct = Math.min(
      100,
      Math.round((respondidasHoy / metaDiariaPreguntas) * 100)
    );

    const especialidadesRes = await query(
      `SELECT p.especialidad,
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE rs.correcta)::int AS aciertos
       FROM respuestas_sesion rs
       JOIN preguntas p ON p.id = rs.pregunta_id
       GROUP BY p.especialidad
       ORDER BY total DESC`
    );

    return NextResponse.json({
      racha_dias: racha,
      meta_diaria: {
        objetivo: metaDiariaPreguntas,
        respondidas_hoy: respondidasHoy,
        porcentaje: metaDiariaPct,
      },
      especialidades: especialidadesRes.rows.map((r) => ({
        especialidad: r.especialidad,
        total: r.total,
        aciertos: r.aciertos,
        porcentaje: r.total > 0 ? Math.round((r.aciertos / r.total) * 100) : 0,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al calcular estadísticas" }, { status: 500 });
  }
}
