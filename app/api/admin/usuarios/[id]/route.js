import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { query } from "@/lib/db";
import { eliminarUsuarioComoAdmin } from "@/lib/eliminarCuenta";

export const dynamic = "force-dynamic";

// Solo cuenta filas relacionadas, no borra nada — lo usa el modal de
// confirmación del botón "Borrar" en /admin antes de que el admin confirme.
export async function GET(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const id = parseInt(params.id, 10);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "id no válido" }, { status: 400 });
  }

  const { rows } = await query(`SELECT id, nombre, email FROM usuarios WHERE id = $1`, [id]);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }
  const usuario = rows[0];

  const [sesiones, respuestas, push, listaPremium, lista, contacto, solicitudes] =
    await Promise.all([
      query(`SELECT COUNT(*)::int AS n FROM sesiones WHERE user_id = $1`, [id]),
      query(`SELECT COUNT(*)::int AS n FROM respuestas_sesion WHERE user_id = $1`, [id]),
      query(`SELECT COUNT(*)::int AS n FROM push_subscriptions WHERE user_id = $1`, [id]),
      query(`SELECT COUNT(*)::int AS n FROM lista_espera_premium WHERE user_id = $1`, [id]),
      query(`SELECT COUNT(*)::int AS n FROM lista_espera WHERE email = $1`, [usuario.email]),
      query(`SELECT COUNT(*)::int AS n FROM contacto WHERE email = $1`, [usuario.email]),
      query(`SELECT COUNT(*)::int AS n FROM solicitudes_eliminacion WHERE email = $1`, [
        usuario.email,
      ]),
    ]);

  return NextResponse.json({
    usuario,
    relacionados: {
      sesiones: sesiones.rows[0].n,
      respuestas_sesion: respuestas.rows[0].n,
      push_subscriptions: push.rows[0].n,
      lista_espera_premium: listaPremium.rows[0].n,
      lista_espera: lista.rows[0].n,
      contacto: contacto.rows[0].n,
      solicitudes_eliminacion: solicitudes.rows[0].n,
    },
  });
}

// Borra al usuario y todo su rastro (ver eliminarUsuarioComoAdmin). Solo se
// llega aquí tras la confirmación explícita del admin en el modal.
export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const id = parseInt(params.id, 10);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "id no válido" }, { status: 400 });
  }

  const { rows } = await query(`SELECT id, email FROM usuarios WHERE id = $1`, [id]);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  try {
    const borrados = await eliminarUsuarioComoAdmin(id, rows[0].email);
    return NextResponse.json({ ok: true, borrados });
  } catch (err) {
    console.error("Error eliminando usuario desde admin:", err);
    return NextResponse.json({ error: "No se ha podido eliminar el usuario" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const id = parseInt(params.id, 10);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "id no válido" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const plan = body?.plan;
  if (plan !== "premium" && plan !== "free") {
    return NextResponse.json({ error: "plan debe ser 'premium' o 'free'" }, { status: 400 });
  }

  const { rows } = await query(
    `UPDATE usuarios SET plan = $1 WHERE id = $2 RETURNING id, plan`,
    [plan, id]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}
