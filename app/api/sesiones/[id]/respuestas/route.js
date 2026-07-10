import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const sesionId = parseInt(params.id, 10);
  if (!Number.isInteger(sesionId)) {
    return NextResponse.json({ error: "id de sesión inválido" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const preguntaId = body ? parseInt(body.pregunta_id, 10) : NaN;
  // respuesta_dada es opcional: si se agota el temporizador sin que el
  // usuario haya elegido nada, se registra como fallo automático (null).
  const respuestaDada = body?.respuesta_dada ? String(body.respuesta_dada).trim().toUpperCase() : null;

  if (!Number.isInteger(preguntaId)) {
    return NextResponse.json({ error: "pregunta_id es obligatorio" }, { status: 400 });
  }

  try {
    const sesionRes = await query(`SELECT user_id FROM sesiones WHERE id = $1`, [sesionId]);
    if (sesionRes.rows.length === 0) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }
    if (sesionRes.rows[0].user_id !== Number(session.user.id)) {
      return NextResponse.json({ error: "No tienes acceso a esta sesión" }, { status: 403 });
    }

    const { rows } = await query(
      `SELECT correcta, explicacion FROM preguntas WHERE id = $1`,
      [preguntaId]
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });
    }

    const respuestaCorrecta = rows[0].correcta.trim();
    const esCorrecta = respuestaDada !== null && respuestaDada === respuestaCorrecta;

    await query(
      `INSERT INTO respuestas_sesion (sesion_id, pregunta_id, respuesta_dada, correcta, user_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [sesionId, preguntaId, respuestaDada, esCorrecta, session.user.id]
    );

    return NextResponse.json({
      correcta: esCorrecta,
      respuesta_correcta: respuestaCorrecta,
      explicacion: rows[0].explicacion,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al registrar la respuesta" }, { status: 500 });
  }
}
