import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const sesionId = parseInt(params.id, 10);
  if (!Number.isInteger(sesionId)) {
    return NextResponse.json({ error: "id de sesión inválido" }, { status: 400 });
  }

  try {
    const sesionRes = await query(
      `SELECT id, modo, especialidad, total_preguntas, aciertos, duracion_segundos
       FROM sesiones WHERE id = $1`,
      [sesionId]
    );
    if (sesionRes.rows.length === 0) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }
    const sesion = sesionRes.rows[0];

    const desgloseRes = await query(
      `SELECT p.especialidad,
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE rs.correcta)::int AS aciertos
       FROM respuestas_sesion rs
       JOIN preguntas p ON p.id = rs.pregunta_id
       WHERE rs.sesion_id = $1
       GROUP BY p.especialidad
       ORDER BY p.especialidad`,
      [sesionId]
    );

    const falladasRes = await query(
      `SELECT rs.pregunta_id AS id
       FROM respuestas_sesion rs
       WHERE rs.sesion_id = $1 AND rs.correcta = false`,
      [sesionId]
    );

    const porcentajeAciertos =
      sesion.total_preguntas > 0
        ? Math.round((sesion.aciertos / sesion.total_preguntas) * 1000) / 10
        : 0;

    return NextResponse.json({
      sesion_id: sesion.id,
      modo: sesion.modo,
      especialidad: sesion.especialidad,
      total_preguntas: sesion.total_preguntas,
      aciertos: sesion.aciertos,
      fallos: sesion.total_preguntas - sesion.aciertos,
      porcentaje_aciertos: porcentajeAciertos,
      duracion_segundos: sesion.duracion_segundos,
      desglose_especialidad: desgloseRes.rows.map((r) => ({
        especialidad: r.especialidad,
        total: r.total,
        aciertos: r.aciertos,
        porcentaje: r.total > 0 ? Math.round((r.aciertos / r.total) * 1000) / 10 : 0,
      })),
      preguntas_falladas: falladasRes.rows.map((r) => r.id),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al calcular el resultado" }, { status: 500 });
  }
}
