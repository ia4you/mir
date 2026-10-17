import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { temaCorto, busquedaYouTube, tituloVisible } from "@/lib/videos";
import { slugify } from "@/app/lib/especialidades";

export const dynamic = "force-dynamic";

// Vídeo recomendado para una pregunta fallada. Público: los vídeos son para
// todos (también la demo). Devuelve { video } o { busqueda } (respaldo con
// la búsqueda de YouTube); para preguntas que no son del banco oficial,
// ninguno de los dos.
export async function GET(_request, { params }) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "id no válido" }, { status: 400 });
  }

  try {
    const { rows: [pregunta] } = await query(
      `SELECT especialidad, tema, origen FROM preguntas WHERE id = $1`,
      [id]
    );
    if (!pregunta) return NextResponse.json({ error: "Pregunta no encontrada" }, { status: 404 });

    let cuerpo = {};
    if (pregunta.origen === "oficial") {
      // pregunta_video ya aplica video_exclusiones; especialidad y tema son los
      // de la tarjeta del vídeo en /videos (los de un alternativo, si lo es).
      const { rows: [v] } = await query(
        `SELECT v.youtube_id, v.titulo, v.fecha_publicacion, v.duracion_seg,
                c.nombre AS canal, c.url AS canal_url, pv.especialidad, pv.tema
         FROM pregunta_video pv
         JOIN videos v ON v.id = pv.video_id
         JOIN video_canales c ON c.id = v.canal_id
         WHERE pv.pregunta_id = $1`,
        [id]
      );
      cuerpo = v
        ? {
            video: {
              youtube_id: v.youtube_id,
              titulo: tituloVisible(v.titulo),
              anio: new Date(v.fecha_publicacion).getFullYear(),
              duracion_seg: v.duracion_seg,
              canal: v.canal,
              canal_url: v.canal_url,
              especialidad: v.especialidad,
              especialidad_slug: slugify(v.especialidad),
              tema: temaCorto(v.tema),
            },
          }
        : { busqueda: busquedaYouTube(pregunta.especialidad, pregunta.tema) };
    }

    return NextResponse.json(cuerpo, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch (error) {
    console.error("Error en /api/videos/pregunta:", error);
    return NextResponse.json({ error: "Error al buscar el vídeo" }, { status: 500 });
  }
}
