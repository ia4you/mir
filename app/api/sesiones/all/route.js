import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// Borra todo el historial (sesiones + respuestas_sesion, esta última en
// cascada por la FK ON DELETE CASCADE). Irreversible; la confirmación vive
// en el frontend (pantalla de Perfil).
export async function DELETE() {
  try {
    const { rowCount } = await query(`DELETE FROM sesiones`);
    return NextResponse.json({ eliminadas: rowCount });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al borrar el historial" }, { status: 500 });
  }
}
