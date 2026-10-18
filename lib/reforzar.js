// Tarjetas del carrusel «especialidades para reforzar» de /inicio, a partir de
// las especialidades de /api/estadisticas ({ especialidad, total, porcentaje,
// preguntas }). Siempre TARJETAS: primero las de 5+ respondidas, luego las de
// 1-4 («pocas») y, si faltan, las no practicadas con más preguntas en el
// banco. Solo si el usuario lleva MIN_TOTAL respuestas válidas.

export const TARJETAS = 5;
export const MIN_TOTAL = 20;
const MIN_FIABLE = 5;

// De menor a mayor acierto; a igualdad, más respondidas y luego más preguntas
// en el banco.
const peorPrimero = (a, b) => a.porcentaje - b.porcentaje || b.total - a.total || b.preguntas - a.preguntas;

export function elegirParaReforzar(especialidades) {
  const total = especialidades.reduce((s, e) => s + e.total, 0);
  if (total < MIN_TOTAL) return [];
  const fiables = especialidades.filter((e) => e.total >= MIN_FIABLE).sort(peorPrimero);
  const pocas = especialidades.filter((e) => e.total > 0 && e.total < MIN_FIABLE).sort(peorPrimero);
  const nuevas = especialidades.filter((e) => e.total === 0).sort((a, b) => b.preguntas - a.preguntas);
  return [
    ...fiables.map((e) => ({ ...e, tipo: "normal" })),
    ...pocas.map((e) => ({ ...e, tipo: "pocas" })),
    ...nuevas.map((e) => ({ ...e, tipo: "nueva" })),
  ].slice(0, TARJETAS);
}
