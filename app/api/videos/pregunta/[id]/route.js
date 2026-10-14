import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { temaConVideo, temaCorto, elegirVideo, busquedaYouTube, tituloVisible } from "@/lib/videos";
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
      const tema = temaConVideo(pregunta.tema);
      const { rows } = tema
        ? await query(
            `SELECT v.youtube_id, v.titulo, v.fecha_publicacion, v.duracion_seg, v.estado,
                    v.disponibilidad, vt.principal, c.nombre AS canal, c.url AS canal_url
             FROM video_temas vt
             JOIN videos v ON v.id = vt.video_id
             JOIN video_canales c ON c.id = v.canal_id
             WHERE vt.especialidad = $1 AND vt.tema = $2`,
            [pregunta.especialidad, tema]
          )
        : { rows: [] };
      const v = elegirVideo(rows);
      cuerpo = v
        ? {
            video: {
              youtube_id: v.youtube_id,
              titulo: tituloVisible(v.titulo),
              anio: new Date(v.fecha_publicacion).getFullYear(),
              duracion_seg: v.duracion_seg,
              canal: v.canal,
              canal_url: v.canal_url,
              especialidad: pregunta.especialidad,
              especialidad_slug: slugify(pregunta.especialidad),
              tema: temaCorto(tema),
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
