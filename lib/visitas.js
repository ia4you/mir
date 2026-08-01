// Compartido entre middleware.js (edge) y app/api/track-visit (node), así
// que no puede usar APIs específicas de ninguno de los dos entornos.

const PREFIJOS_TRACKEADOS = ["/especialidades", "/preguntas"];
const EXACTAS_TRACKEADAS = ["/", "/controversias", "/demo"];

export function esRutaTrackeada(pathname) {
  if (!pathname || pathname.startsWith("/api/")) return false;
  if (EXACTAS_TRACKEADAS.includes(pathname)) return true;
  return PREFIJOS_TRACKEADOS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function esBot(userAgent) {
  const ua = (userAgent || "").toLowerCase();
  return ua.includes("bot") || ua.includes("crawler") || ua.includes("spider");
}
