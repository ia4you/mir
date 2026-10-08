// Lógica pura de las "notas" (netas sobre 200). Sin acceso a BD para poder
// testearla con node:test; las consultas viven en lib/notasDb.js.

export const ESCALA = 200;
export const VENTANA = 100;
export const MINIMO_RESPUESTAS = 30;
export const MINIMO_POR_ESPECIALIDAD = 3;
export const DIAS_REFERENCIA = 7;

// Netas = aciertos − errores/3. Los blancos no se pasan aquí: ni puntúan ni
// penalizan.
export function netas(aciertos, errores) {
  return aciertos - errores / 3;
}

export function redondear1(n) {
  return Math.round(n * 10) / 10;
}

// Una respuesta aporta +1 si acierta, −1/3 si falla y 0 si es blanco
// (respuesta_dada NULL, incluido el temporizador agotado).
export function puntosRespuesta(r) {
  if (r.respuesta_dada === null || r.respuesta_dada === undefined) return 0;
  return netas(r.correcta ? 1 : 0, r.correcta ? 0 : 1);
}

// Compara dos notas ya redondeadas a 1 decimal. Devuelve null si no hay
// referencia con la que comparar.
export function comparar(nota, referencia) {
  if (nota === null || referencia === null || referencia === undefined) {
    return { diferencia: null, direccion: null };
  }
  const diferencia = redondear1(nota - referencia);
  const direccion = diferencia > 0 ? "sube" : diferencia < 0 ? "baja" : "igual";
  return { diferencia, direccion };
}

// Nota de evolución sobre una lista de primeras respuestas ya filtradas
// (sin anuladas ni simulacro), cada una con { especialidad, respuesta_dada,
// correcta, fecha, id }. `pesos` es { especialidad: pct_medio }.
// Devuelve { nota, respondidas } con nota=null si no llega al mínimo.
//
// ponytail: la ponderación divide por TODAS las respuestas de la especialidad
// en la ventana (blancos incluidos), porque un blanco rinde 0 netas en el
// examen real. Si se prefiere solo sobre contestadas, cambiar `respondidas`.
export function notaEvolucion(primeras, pesos) {
  // Solo cuentan especialidades con peso (banco oficial): una pregunta sin
  // peso (p. ej. del banco IA) no debe ocupar sitio en la ventana ni en el
  // mínimo de 30.
  const ventana = primeras
    .filter((r) => parseFloat(pesos[r.especialidad]) > 0)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha) || a.id - b.id)
    .slice(-VENTANA);
  const respondidas = ventana.length;
  if (respondidas < MINIMO_RESPUESTAS) return { nota: null, respondidas };

  const porEsp = new Map();
  for (const r of ventana) {
    const a = porEsp.get(r.especialidad) || { n: 0, puntos: 0 };
    a.n += 1;
    a.puntos += puntosRespuesta(r);
    porEsp.set(r.especialidad, a);
  }

  let suma = 0;
  let sumaPesos = 0;
  for (const [esp, a] of porEsp) {
    const peso = parseFloat(pesos[esp]);
    if (a.n < MINIMO_POR_ESPECIALIDAD || !(peso > 0)) continue;
    suma += peso * (a.puntos / a.n);
    sumaPesos += peso;
  }
  // Ninguna especialidad con 3+ respuestas (o sin peso): no hay nota fiable.
  if (sumaPesos === 0) return { nota: null, respondidas };

  return { nota: redondear1((suma / sumaPesos) * ESCALA), respondidas };
}

// Nota actual, nota de hace 7 días y comparación entre ambas.
export function evolucion(primeras, pesos, ahora = new Date()) {
  const actual = notaEvolucion(primeras, pesos);
  const corte = new Date(ahora.getTime() - DIAS_REFERENCIA * 24 * 3600 * 1000);
  const previas = primeras.filter((r) => new Date(r.fecha) < corte);
  const ref = notaEvolucion(previas, pesos);
  return {
    nota: actual.nota,
    referencia: ref.nota,
    ...comparar(actual.nota, ref.nota),
    respondidas: actual.respondidas,
    minimo: MINIMO_RESPUESTAS,
  };
}

// Netas de un simulacro escaladas a 200 sobre el total de preguntas de la
// sesión (no sobre las contestadas).
export function notaSimulacro(aciertos, errores, totalPreguntas) {
  if (!(totalPreguntas > 0)) return null;
  return redondear1((netas(aciertos, errores) * ESCALA) / totalPreguntas);
}
