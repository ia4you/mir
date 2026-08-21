import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { rows } = await query("SELECT * FROM blog_posts WHERE id = $1", [params.id]);
  if (rows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PATCH(req, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { titulo, resumen, contenido, publicado, imagen_portada } = await req.json();
  const { rows } = await query(
    `UPDATE blog_posts
     SET titulo = $1, resumen = $2, contenido = $3, publicado = $4, imagen_portada = $5, updated_at = now()
     WHERE id = $6
     RETURNING id, titulo, slug, resumen, publicado, created_at, updated_at, imagen_portada`,
    [titulo, resumen || null, contenido, !!publicado, imagen_portada || null, params.id]
  );
  if (rows.length === 0) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(req, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  await query("DELETE FROM blog_posts WHERE id = $1", [params.id]);
  return NextResponse.json({ ok: true });
}
