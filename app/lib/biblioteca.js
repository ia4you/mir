import { cache } from "react";
import { query } from "../../lib/db";
import { temaCorto, tituloVisible } from "../../lib/videos";
import { slugify } from "./especialidades";

// Biblioteca de /videos: los vídeos principales activos y disponibles, uno
// por especialidad + tema, agrupados por especialidad (de más a menos vídeos)
// y, dentro, por nº de preguntas válidas del tema. Un vídeo que cubre dos
// temas sale en los dos. Las especialidades sin vídeo no aparecen.
export const getBiblioteca = cache(async () => {
  const [{ rows }, { rows: canales }] = await Promise.all([
    query(
      `SELECT v.youtube_id, v.titulo, v.fecha_publicacion, v.duracion_seg,
              c.nombre AS canal, c.url AS canal_url, vt.especialidad, vt.tema,
              (SELECT COUNT(*) FROM preguntas p
               WHERE p.especialidad = vt.especialidad AND p.tema = vt.tema
                 AND p.origen = 'oficial' AND p.anulada = false)::int AS preguntas
       FROM video_temas vt
       JOIN videos v ON v.id = vt.video_id
       JOIN video_canales c ON c.id = v.canal_id
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
