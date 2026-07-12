import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// Nunca se selecciona la columna `correcta` aquí: la respuesta correcta solo
// se consulta en el backend, en /api/sesiones/[id]/respuestas, al corregir.
export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const especialidad = searchParams.get("especialidad");
  const anioParam = searchParams.get("anio");
  const cantidadParam = searchParams.get("cantidad");
  const idsParam = searchParams.get("ids");

  // Modo "repaso": pide un listado exacto de preguntas por id (p.ej. las
  // falladas de una sesión anterior), ignorando el resto de filtros y sin
  // orden aleatorio.
  if (idsParam) {
    const ids = idsParam
      .split(",")
      .map((v) => parseInt(v.trim(), 10))
      .filter(Number.isInteger);
    if (ids.length === 0) {
      return NextResponse.json({ error: "ids inválido" }, { status: 400 });
    }
    try {
      const { rows } = await query(
        `SELECT id, año, numero, especialidad, pregunta,
                opcion_a, opcion_b, opcion_c, opcion_d, opcion_e, imagen_path
         FROM preguntas
         WHERE id = ANY($1::int[])`,
        [ids]
      );
      return NextResponse.json(rows);
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Error al consultar preguntas" }, { status: 500 });
    }
  }

  const cantidad = cantidadParam ? parseInt(cantidadParam, 10) : 10;
  if (!Number.isInteger(cantidad) || cantidad <= 0 || cantidad > 210) {
    return NextResponse.json(
      { error: "cantidad debe ser un entero entre 1 y 210" },
      { status: 400 }
    );
  }

  let anio = null;
  if (anioParam) {
    anio = parseInt(anioParam, 10);
    if (!Number.isInteger(anio)) {
      return NextResponse.json({ error: "anio inválido" }, { status: 400 });
    }
  }

  const condiciones = [];
  const valores = [];
  if (especialidad) {
    valores.push(especialidad);
    condiciones.push(`especialidad = $${valores.length}`);
  }
  if (anio !== null) {
    valores.push(anio);
    condiciones.push(`año = $${valores.length}`);
  }
  const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
  valores.push(cantidad);

  try {
    const { rows } = await query(
      `SELECT id, año, numero, especialidad, pregunta,
              opcion_a, opcion_b, opcion_c, opcion_d, opcion_e, imagen_path
       FROM preguntas
       ${where}
       ORDER BY RANDOM()
       LIMIT $${valores.length}`,
      valores
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al consultar preguntas" }, { status: 500 });
  }
}
