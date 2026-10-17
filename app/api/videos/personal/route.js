import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { claveTema } from "@/lib/videos";

export const dynamic = "force-dynamic";

// Datos personales de /videos (se piden en el navegador tras cargar, así el
// HTML es igual para todos): temas con preguntas falladas (Free y Premium) y,
// solo Premium, los vídeos marcados como vistos. Una pregunta fallada cuenta
// siempre, aunque luego se acierte (mismo criterio que /errores).
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const userId = session.user.id;

  try {
    const [{ rows: fallos }, { rows: usuario }] = await Promise.all([
      query(
        // Cada fallo cuenta para el vídeo que se le mostró (pregunta_video, con
        // las exclusiones aplicadas): nada si se quedó sin vídeo.
        `SELECT pv.especialidad, pv.tema, COUNT(DISTINCT p.id)::int AS fallos
         FROM respuestas_sesion rs
         JOIN preguntas p ON p.id = rs.pregunta_id
         JOIN pregunta_video pv ON pv.pregunta_id = p.id AND pv.video_id IS NOT NULL
         WHERE rs.user_id = $1 AND rs.correcta = false AND rs.vista AND p.anulada = false
         GROUP BY pv.especialidad, pv.tema`,
        [userId]
      ),
      // Plan real de la BD (el del JWT puede ir desfasado tras un pago).
      query(`SELECT plan FROM usuarios WHERE id = $1`, [userId]),
    ]);
    const premium = usuario[0]?.plan === "premium";

    let vistos = [];
    if (premium) {
      const { rows } = await query(
        `SELECT v.youtube_id FROM video_vistos vv JOIN videos v ON v.id = vv.video_id WHERE vv.user_id = $1`,
        [userId]
      );
      vistos = rows.map((r) => r.youtube_id);
    }

    return NextResponse.json(
      {
        premium,
        fallados: fallos.map((f) => ({ clave: claveTema(f.especialidad, f.tema), fallos: f.fallos })),
        vistos,
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Error en /api/videos/personal:", error);
    return NextResponse.json({ error: "Error al cargar tus datos de vídeos" }, { status: 500 });
  }
}
