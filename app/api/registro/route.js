import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const nombre = body?.nombre?.trim();
  const email = body?.email?.toLowerCase().trim();
  const password = body?.password;

  if (!nombre || !email || !password) {
    return NextResponse.json(
      { error: "Nombre, email y contraseña son obligatorios" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 6 caracteres" },
      { status: 400 }
    );
  }

  try {
    const existe = await query(`SELECT id FROM usuarios WHERE email = $1`, [email]);
    if (existe.rows.length > 0) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { rows } = await query(
      `INSERT INTO usuarios (nombre, email, password_hash, plan)
       VALUES ($1, $2, $3, 'free')
       RETURNING id`,
      [nombre, email, passwordHash]
    );

    return NextResponse.json({ id: rows[0].id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al crear la cuenta" }, { status: 500 });
  }
}
