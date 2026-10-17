// Lógica pura de la biblioteca de vídeos (sin BD ni React), con test en
// lib/videos.test.js.

// Tema con el que se busca vídeo: null si la pregunta no tiene tema ('' o
// NULL) o es un "Otros/Miscelánea", que no tienen vídeo propio.
export function temaConVideo(tema) {
  const t = (tema || "").trim();
  if (!t || /^otros\b/i.test(t)) return null;
  return t;
}

// Parte principal de un tema largo ("Patología obstétrica — sangrado, …" →
// "Patología obstétrica"), para mostrarlo y para buscar en YouTube.
export function temaCorto(tema) {
  return (tema || "").split(/\s+—\s+/)[0].trim();
}

// Respaldo cuando no hay vídeo: búsqueda de YouTube por tema o, sin tema,
// por especialidad.
export function busquedaYouTube(especialidad, tema) {
  const texto = temaCorto(temaConVideo(tema) || "") || especialidad;
  return {
    texto,
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`MIR ${texto}`)}`,
  };
}

// 344 → "5:44"; 3723 → "1:02:03".
export function formatoDuracion(seg) {
  const h = Math.floor(seg / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = String(seg % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

// Título para mostrar: sin los puntos y espacios del principio que algunos
// autores ponen (". Manejo de…" → "Manejo de…"). En la BD se guarda tal cual
// lo da YouTube.
export function tituloVisible(titulo) {
  return String(titulo || "").replace(/^[.\s]+/, "");
}

// Aviso bajo el título de los vídeos de Oncología, donde los tratamientos
// cambian rápido y la biblioteca admite vídeos de hasta 5–7 años.
export function avisoVigencia(v) {
  if (v.especialidad !== "Oncología") return null;
  return `Vídeo de ${v.anio}. En Oncología los tratamientos cambian rápido: comprueba que el tratamiento que se explica sigue vigente.`;
}

// Clave de un tema en la biblioteca: especialidad + tema corto (lo que lleva
// cada tarjeta de /videos).
export const claveTema = (especialidad, tema) => `${especialidad}|${temaCorto(tema)}`;

// "Tus vídeos para repasar": las tarjetas de los temas con preguntas
// falladas; primero las no vistas, luego por nº de preguntas falladas y, a
// igualdad, por nº de preguntas del tema en el banco.
// `fallados`: Map clave → nº de preguntas falladas. `vistos`: Set de youtube_id.
export function ordenarParaRepasar(videos, fallados, vistos) {
  return videos
    .filter((v) => fallados.get(claveTema(v.especialidad, v.tema)) > 0)
    .map((v) => ({ ...v, fallos: fallados.get(claveTema(v.especialidad, v.tema)), visto: vistos.has(v.youtube_id) }))
    .sort((a, b) => Number(a.visto) - Number(b.visto) || b.fallos - a.fallos || b.preguntas - a.preguntas);
}

// Progreso por especialidad (vídeos vistos / vídeos de la especialidad) y
// total de vídeos distintos (uno puede estar en dos especialidades).
export function calcularProgreso(grupos, vistos) {
  const distintos = new Set(grupos.flatMap((g) => g.videos.map((v) => v.youtube_id)));
  return {
    total: distintos.size,
    vistos: [...distintos].filter((id) => vistos.has(id)).length,
    especialidades: grupos.map((g) => ({
      especialidad: g.especialidad,
      slug: g.slug,
      total: g.videos.length,
      vistos: g.videos.filter((v) => vistos.has(v.youtube_id)).length,
    })),
  };
}
