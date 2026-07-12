import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// Estas estadísticas son por usuario (cada uno ve solo lo suyo). La meta
// diaria se guarda en localStorage (ver app/lib/preferencias.js) y se pasa
// como ?meta=N; 20 es solo el valor por defecto si no se indica.
const META_DIARIA_POR_DEFECTO = 20;

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

    const diasRes = await query(
      `SELECT DISTINCT DATE(fecha) AS dia FROM sesiones WHERE user_id = $1 ORDER BY dia DESC`,
      [userId]
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
       WHERE DATE(s.fecha) = CURRENT_DATE AND rs.user_id = $1`,
      [userId]
    );
    const respondidasHoy = hoyRes.rows[0].total;
    const metaDiariaPct = Math.min(
      100,
      Math.round((respondidasHoy / metaDiariaPreguntas) * 100)
    );

    // Partimos de TODAS las especialidades (no solo las ya practicadas) para
    // que el usuario vea el mapa completo desde el primer día, con 0% en las
    // que todavía no ha tocado.
    const especialidadesRes = await query(
      `SELECT esp.especialidad,
              COUNT(rs.id)::int AS total,
              COUNT(*) FILTER (WHERE rs.correcta)::int AS aciertos
       FROM (SELECT DISTINCT especialidad FROM preguntas) esp
       LEFT JOIN preguntas p ON p.especialidad = esp.especialidad
       LEFT JOIN respuestas_sesion rs ON rs.pregunta_id = p.id AND rs.user_id = $1
       GROUP BY esp.especialidad
       ORDER BY total DESC, esp.especialidad ASC`,
      [userId]
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
