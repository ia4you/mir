// Entrega del simulacro en un solo envío: validación del cuerpo y corrección
// contra la BD. Sin acceso a BD para poder testearla con node:test; la ruta
// es app/api/sesiones/[id]/entregar.

const LETRAS = new Set(["A", "B", "C", "D", "E"]);

// body: { respuestas: [{ pregunta_id, respuesta_dada }], duracion_segundos }.
// respuesta_dada null = en blanco. Devuelve { error } o los datos limpios.
export function validarEntrega(body, totalPreguntas) {
  const lista = body?.respuestas;
  if (!Array.isArray(lista) || lista.length === 0 || lista.length > totalPreguntas) {
    return { error: "respuestas no válidas" };
  }
  const vistas = new Set();
  const respuestas = [];
  for (const r of lista) {
    const id = Number(r?.pregunta_id);
    if (!Number.isInteger(id) || vistas.has(id)) return { error: "pregunta_id no válido o repetido" };
    vistas.add(id);
    const letra = r.respuesta_dada == null ? null : String(r.respuesta_dada).trim().toUpperCase();
    if (letra !== null && !LETRAS.has(letra)) return { error: "respuesta_dada no válida" };
    respuestas.push({ pregunta_id: id, respuesta_dada: letra });
  }
  const duracion = Number.isInteger(body.duracion_segundos) && body.duracion_segundos >= 0 ? body.duracion_segundos : null;
  return { respuestas, duracion };
}

// preguntas: Map id → { correcta, origen, anulada } (de la BD). Un blanco no
// es acierto. `aciertos` no cuenta anuladas, igual que getSimulacros.
// `repaso`: si la respuesta debe actualizar el repaso espaciado (banco
// oficial, no anulada), como al responder en /test.
export function corregir(respuestas, preguntas) {
  let aciertos = 0;
  const filas = respuestas.map(({ pregunta_id, respuesta_dada }) => {
    const p = preguntas.get(pregunta_id);
    const correcta = respuesta_dada !== null && respuesta_dada === p.correcta.trim();
    if (correcta && !p.anulada) aciertos += 1;
    return { pregunta_id, respuesta_dada, correcta, repaso: p.origen === "oficial" && !p.anulada };
  });
  return { filas, aciertos };
}
