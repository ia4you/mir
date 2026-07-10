import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT especialidad, COUNT(*)::int AS total
       FROM preguntas
       WHERE especialidad IS NOT NULL
       GROUP BY especialidad
       ORDER BY especialidad`
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al consultar especialidades" }, { status: 500 });
  }
}
