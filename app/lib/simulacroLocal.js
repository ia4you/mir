// Simulacro en curso guardado en este dispositivo (localStorage), para no
// perder 4 h 30 min de examen si se cierra la pestaña. Clave por sesión:
// mir_simulacro_{id} → { userId, preguntas, segundosTotales, inicio (ms),
// respuestas: { preguntaId: letra | null }, indice }. Se borra solo cuando la
// entrega se ha guardado en el servidor.
const PREFIJO = "mir_simulacro_";

export function leerSimulacro(id) {
  try {
    return JSON.parse(localStorage.getItem(PREFIJO + id) || "null");
  } catch {
    return null;
  }
}

// Devuelve false si no se ha podido guardar (modo privado, cuota llena...).
export function guardarSimulacro(id, datos) {
  try {
    localStorage.setItem(PREFIJO + id, JSON.stringify(datos));
    return true;
  } catch {
    return false;
  }
}

export function borrarSimulacro(id) {
  try {
    localStorage.removeItem(PREFIJO + id);
  } catch {}
}

// Simulacros sin entregar de este usuario en este dispositivo, el más
// reciente primero: [{ id, respondidas, total, restante (s) }].
export function simulacrosPendientes(userId, ahora = Date.now()) {
  const lista = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const clave = localStorage.key(i);
      if (!clave?.startsWith(PREFIJO)) continue;
      const d = leerSimulacro(clave.slice(PREFIJO.length));
      if (!d || String(d.userId) !== String(userId)) continue;
      lista.push({
        id: clave.slice(PREFIJO.length),
        inicio: d.inicio,
        respondidas: Object.values(d.respuestas || {}).filter((r) => r !== null).length,
        total: d.preguntas.length,
        restante: Math.max(0, d.segundosTotales - Math.round((ahora - d.inicio) / 1000)),
      });
    }
  } catch {}
  return lista.sort((a, b) => b.inicio - a.inicio);
}
