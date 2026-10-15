import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { pool } from "@/lib/db";
import { validarEntrega, corregir } from "@/lib/simulacro";
import { actualizarRepaso } from "@/lib/repasoDb";

export const dynamic = "force-dynamic";

// Entrega de un simulacro: todas las respuestas en un solo envío (las que se
// dejaron en blanco van con respuesta_dada null). Se corrige aquí, contra la
// BD, y se guarda en una transacción. Una sesión solo se entrega una vez: si
// ya estaba entregada responde 409 "ya_entregado" (p. ej. un reintento cuya
// primera petición sí llegó), y el navegador va directo a los resultados.
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
  const userId = Number(session.user.id);

  const client = await pool.connect();
  let filas;
  let aciertos;
  try {
    await client.query("BEGIN");
    const { rows: sesiones } = await client.query(
      `SELECT user_id, modo, total_preguntas, duracion_segundos FROM sesiones WHERE id = $1 FOR UPDATE`,
      [sesionId]
    );
    const sesion = sesiones[0];
    if (!sesion) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }
    if (sesion.user_id !== userId) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "No tienes acceso a esta sesión" }, { status: 403 });
    }
    if (sesion.modo !== "simulacro") {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Solo se entregan simulacros" }, { status: 400 });
    }
    if (sesion.duracion_segundos !== null) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "ya_entregado" }, { status: 409 });
    }

    const entrega = validarEntrega(body, sesion.total_preguntas);
    if (entrega.error) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: entrega.error }, { status: 400 });
    }

    const ids = entrega.respuestas.map((r) => r.pregunta_id);
    const { rows: preguntas } = await client.query(
      `SELECT id, correcta, origen, anulada FROM preguntas WHERE id = ANY($1::int[])`,
      [ids]
    );
    if (preguntas.length !== ids.length) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 400 });
    }
    ({ filas, aciertos } = corregir(
      entrega.respuestas,
      new Map(preguntas.map((p) => [p.id, p])),
      entrega.vistas
    ));

    // Por si un cliente antiguo llegó a guardar respuestas sueltas de esta
    // sesión antes de entregarla: la entrega es la versión definitiva.
    await client.query(`DELETE FROM respuestas_sesion WHERE sesion_id = $1`, [sesionId]);
    await client.query(
      `INSERT INTO respuestas_sesion (sesion_id, pregunta_id, respuesta_dada, correcta, user_id, vista)
       SELECT $1, f.pregunta_id, f.respuesta_dada, f.correcta, $2, f.vista
       FROM jsonb_to_recordset($3::jsonb) AS f(pregunta_id int, respuesta_dada text, correcta boolean, vista boolean)`,
      [sesionId, userId, JSON.stringify(filas)]
    );
    await client.query(
      `UPDATE sesiones SET aciertos = $1, duracion_segundos = $2 WHERE id = $3`,
      [aciertos, entrega.duracion ?? 0, sesionId]
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(err);
    return NextResponse.json({ error: "Error al entregar el simulacro" }, { status: 500 });
  } finally {
    client.release();
  }

  // Repaso espaciado, fuera de la transacción y sin impedir la entrega (igual
  // que al responder en /test). Los blancos de preguntas vistas cuentan como
  // fallo; las que nunca se abrieron no entran.
  for (const f of filas) {
    if (!f.repaso) continue;
    try {
      await actualizarRepaso(userId, f.pregunta_id, f.correcta);
    } catch (err) {
      console.error("Repaso espaciado no actualizado:", err.message);
      break;
    }
  }

  return NextResponse.json({ ok: true, aciertos, total: filas.length });
}
