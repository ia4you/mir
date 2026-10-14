// Repaso espaciado de fallos: lógica pura (sin BD), con test en
// lib/repaso.test.js. Las fechas son 'YYYY-MM-DD' en hora de Canarias.

// Días de espera de cada nivel (nivel 0 = 1 día … nivel 4 = 30 días).
export const INTERVALOS = [1, 3, 7, 14, 30];
// Preguntas de repaso como máximo por día (Premium / Free) y fallos antiguos
// que entran como máximo por día en la carga inicial.
export const TOPE_PREMIUM = 20;
export const TOPE_FREE = 10;
export const CARGA_POR_DIA = 10;

export function sumarDias(fecha, dias) {
  const d = new Date(`${fecha}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

// Nuevo estado de una pregunta tras responderla. `actual`: null si no está en
// repaso, { nivel: null } si está dominada, o { nivel, proxima }.
// Devuelve null si no cambia nada, { dominada: true } o { nivel, proxima }.
// - Fallar (en cualquier modo y estado): nivel 0, vuelve mañana.
// - Acertar cuando toca (proxima <= hoy): sube un nivel; en el último, dominada.
// - Acertar antes de tiempo, sin estar en repaso o ya dominada: no cambia nada.
export function siguienteEstado(actual, correcta, hoy) {
  if (!correcta) return { nivel: 0, proxima: sumarDias(hoy, INTERVALOS[0]) };
  if (!actual || actual.nivel === null || actual.nivel === undefined) return null;
  if (actual.proxima > hoy) return null;
  if (actual.nivel >= INTERVALOS.length - 1) return { dominada: true };
  const nivel = actual.nivel + 1;
  return { nivel, proxima: sumarDias(hoy, INTERVALOS[nivel]) };
}

// Repaso de hoy: las que tocan (proxima <= hoy), primero las más atrasadas y,
// a igualdad, las de nivel más bajo; como mucho `tope`.
export function seleccionarHoy(filas, hoy, tope) {
  const pendientes = filas
    .filter((f) => f.proxima && f.proxima <= hoy)
    .sort((a, b) => a.proxima.localeCompare(b.proxima) || a.nivel - b.nivel || a.pregunta_id - b.pregunta_id);
  return {
    ids: pendientes.slice(0, tope).map((f) => f.pregunta_id),
    pendientes: pendientes.length,
    // Las que no caben hoy por el tope.
    atrasadas: Math.max(0, pendientes.length - tope),
  };
}

// Carga inicial de los fallos antiguos (ya ordenados, los más recientes
// primero): como mucho `porDia` por día, empezando mañana.
export function repartirCarga(preguntaIds, hoy, porDia = CARGA_POR_DIA) {
  return preguntaIds.map((pregunta_id, i) => ({ pregunta_id, proxima: sumarDias(hoy, 1 + Math.floor(i / porDia)) }));
}

// Etiqueta del estado de repaso de una pregunta en /errores.
// `repaso`: null (no está en repaso), { dominada: true } o { dias } (días hasta
// que toca; 0 o negativo = hoy).
export function etiquetaRepaso(repaso) {
  if (!repaso) return null;
  if (repaso.dominada) return { texto: "Dominada", tono: "dominada" };
  if (repaso.dias <= 0) return { texto: "Repaso: hoy", tono: "hoy" };
  if (repaso.dias === 1) return { texto: "Repaso: mañana", tono: "futuro" };
  return { texto: `Repaso: en ${repaso.dias} días`, tono: "futuro" };
}
