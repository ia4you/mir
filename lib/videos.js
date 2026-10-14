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

// De las filas de video_temas + videos de un mismo par especialidad + tema,
// el vídeo a mostrar: solo activos y disponibles; primero el principal y,
// entre iguales, el más reciente. null si no queda ninguno.
export function elegirVideo(filas) {
  const validas = filas.filter((f) => f.estado === "activo" && f.disponibilidad === "disponible");
  validas.sort(
    (a, b) =>
      Number(b.principal) - Number(a.principal) ||
      new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion)
  );
  return validas[0] || null;
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
