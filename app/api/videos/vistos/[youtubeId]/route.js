import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// Marcar (POST), desmarcar (DELETE) o consultar (GET) un vídeo como visto.
// Solo Premium, con el plan leído de la BD.
async function preparar(params) {
  const session = await getServerSession(authOptions);
  if (!session) return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  if (!/^[A-Za-z0-9_-]{11}$/.test(params.youtubeId || "")) {
    return { error: NextResponse.json({ error: "Vídeo no válido" }, { status: 400 }) };
  }
  const userId = session.user.id;
  const [{ rows: usuario }, { rows: video }] = await Promise.all([
    query(`SELECT plan FROM usuarios WHERE id = $1`, [userId]),
    query(`SELECT id FROM videos WHERE youtube_id = $1`, [params.youtubeId]),
  ]);
  if (usuario[0]?.plan !== "premium") {
    return { error: NextResponse.json({ error: "Solo Premium" }, { status: 403 }) };
  }
  if (!video.length) return { error: NextResponse.json({ error: "Vídeo no encontrado" }, { status: 404 }) };
  return { userId, videoId: video[0].id };
}

function responder(visto) {
  return NextResponse.json({ visto }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function GET(_request, { params }) {
  try {
    const p = await preparar(params);
    if (p.error) return p.error;
    const { rows } = await query(`SELECT 1 FROM video_vistos WHERE user_id = $1 AND video_id = $2`, [p.userId, p.videoId]);
    return responder(rows.length > 0);
  } catch (error) {
    console.error("Error en GET /api/videos/vistos:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function POST(_request, { params }) {
  try {
    const p = await preparar(params);
    if (p.error) return p.error;
    await query(
      `INSERT INTO video_vistos (user_id, video_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [p.userId, p.videoId]
    );
    return responder(true);
  } catch (error) {
    console.error("Error en POST /api/videos/vistos:", error);
    return NextResponse.json({ error: "No se ha podido guardar" }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    const p = await preparar(params);
    if (p.error) return p.error;
    await query(`DELETE FROM video_vistos WHERE user_id = $1 AND video_id = $2`, [p.userId, p.videoId]);
    return responder(false);
  } catch (error) {
    console.error("Error en DELETE /api/videos/vistos:", error);
    return NextResponse.json({ error: "No se ha podido guardar" }, { status: 500 });
  }
}
