import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// Solo sesiones ya finalizadas (duracion_segundos se rellena al terminar el
// test en /test/[id]); las abandonadas a medias no aparecen en el historial.
export async function GET() {
  try {
    const { rows } = await query(
      `SELECT id, fecha, modo, especialidad, total_preguntas, aciertos, duracion_segundos
       FROM sesiones
       WHERE duracion_segundos IS NOT NULL
       ORDER BY fecha DESC
       LIMIT 20`
    );
    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        fecha: r.fecha,
        modo: r.modo,
        especialidad: r.especialidad,
        total_preguntas: r.total_preguntas,
        aciertos: r.aciertos,
        porcentaje: r.total_preguntas > 0 ? Math.round((r.aciertos / r.total_preguntas) * 100) : 0,
        duracion_segundos: r.duracion_segundos,
      }))
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al consultar sesiones" }, { status: 500 });
  }
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || !body.modo || !Number.isInteger(body.total_preguntas)) {
    return NextResponse.json(
      { error: "modo y total_preguntas son obligatorios" },
      { status: 400 }
    );
  }

  const { modo, especialidad = null, total_preguntas } = body;

  try {
    const { rows } = await query(
      `INSERT INTO sesiones (modo, especialidad, total_preguntas, aciertos)
       VALUES ($1, $2, $3, 0)
       RETURNING id`,
      [modo, especialidad, total_preguntas]
    );
    return NextResponse.json({ id: rows[0].id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al crear la sesión" }, { status: 500 });
  }
}
