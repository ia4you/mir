import { cache } from "react";
import { query } from "../../lib/db";
import { temaCorto, tituloVisible } from "../../lib/videos";
import { slugify } from "./especialidades";

// Biblioteca de /videos: los vídeos principales activos y disponibles, uno
// por especialidad + tema, agrupados por especialidad (de más a menos vídeos)
// y, dentro, por nº de preguntas válidas que lo muestran. Un vídeo que cubre dos
// temas sale en los dos. Las especialidades sin vídeo no aparecen.
export const getBiblioteca = cache(async () => {
  const [{ rows }, { rows: canales }] = await Promise.all([
    query(
      // preguntas: las válidas que muestran de verdad este vídeo en esta
      // tarjeta (pregunta_video, con las exclusiones aplicadas); solo ordena.
      `WITH n AS (
         SELECT pv.video_id, pv.especialidad, pv.tema, COUNT(*)::int AS preguntas
         FROM pregunta_video pv JOIN preguntas p ON p.id = pv.pregunta_id
         WHERE pv.video_id IS NOT NULL AND p.anulada = false
         GROUP BY 1, 2, 3
       )
       SELECT v.youtube_id, v.titulo, v.fecha_publicacion, v.duracion_seg,
              c.nombre AS canal, c.url AS canal_url, vt.especialidad, vt.tema,
              COALESCE(n.preguntas, 0) AS preguntas
       FROM video_temas vt
       JOIN videos v ON v.id = vt.video_id
       JOIN video_canales c ON c.id = v.canal_id
       LEFT JOIN n ON n.video_id = vt.video_id AND n.especialidad = vt.especialidad AND n.tema = vt.tema
       WHERE vt.principal AND v.estado = 'activo' AND v.disponibilidad = 'disponible'
       ORDER BY preguntas DESC, v.titulo`
    ),
    // Solo los canales con al menos un vídeo visible en la biblioteca.
    query(
      `SELECT c.nombre, c.url FROM video_canales c
       WHERE c.activo AND EXISTS (
         SELECT 1 FROM videos v WHERE v.canal_id = c.id AND v.estado = 'activo' AND v.disponibilidad = 'disponible'
       )
       ORDER BY c.nombre`
    ),
  ]);

  const grupos = new Map();
  for (const r of rows) {
    if (!grupos.has(r.especialidad)) {
      grupos.set(r.especialidad, { especialidad: r.especialidad, slug: slugify(r.especialidad), videos: [] });
    }
    grupos.get(r.especialidad).videos.push({
      youtube_id: r.youtube_id,
      titulo: tituloVisible(r.titulo),
      anio: new Date(r.fecha_publicacion).getFullYear(),
      duracion_seg: r.duracion_seg,
      canal: r.canal,
      canal_url: r.canal_url,
      especialidad: r.especialidad,
      tema: temaCorto(r.tema),
      preguntas: r.preguntas,
    });
  }

  return {
    grupos: [...grupos.values()].sort(
      (a, b) => b.videos.length - a.videos.length || a.especialidad.localeCompare(b.especialidad, "es")
    ),
    totalVideos: new Set(rows.map((r) => r.youtube_id)).size,
    canales,
  };
});
