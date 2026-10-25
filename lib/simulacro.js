// Entrega del simulacro en un solo envío: validación del cuerpo y corrección
// contra la BD. Sin acceso a BD para poder testearla con node:test; la ruta
// es app/api/sesiones/[id]/entregar.

// Convocatorias que existen en el banco pero NO entran en el simulacro, en el peso por especialidad
// de las notas ni en la demo pública. Vacía: entran las diez (2017-2026); añadir años para excluirlos.
export const ANIOS_FUERA_SIMULACRO = [];

const LETRAS = new Set(["A", "B", "C", "D", "E"]);

// body: { respuestas: [{ pregunta_id, respuesta_dada }], vistas: [ids],
// dudosas: [ids], duracion_segundos }. respuesta_dada null = en blanco. `vistas`: preguntas
// que llegaron a mostrarse; sin ella (cliente antiguo) se toman todas como
// vistas. Devuelve { error } o los datos limpios.
export function validarEntrega(body, totalPreguntas) {
  const lista = body?.respuestas;
  if (!Array.isArray(lista) || lista.length === 0 || lista.length > totalPreguntas) {
    return { error: "respuestas no válidas" };
  }
  const ids = new Set();
  const respuestas = [];
  for (const r of lista) {
    const id = Number(r?.pregunta_id);
    if (!Number.isInteger(id) || ids.has(id)) return { error: "pregunta_id no válido o repetido" };
    ids.add(id);
    const letra = r.respuesta_dada == null ? null : String(r.respuesta_dada).trim().toUpperCase();
    if (letra !== null && !LETRAS.has(letra)) return { error: "respuesta_dada no válida" };
    respuestas.push({ pregunta_id: id, respuesta_dada: letra });
  }
  const listaIds = (v) => Array.isArray(v) && v.every((id) => Number.isInteger(id));
  if (body.vistas !== undefined && !listaIds(body.vistas)) return { error: "vistas no válidas" };
  if (body.dudosas !== undefined && !listaIds(body.dudosas)) return { error: "dudosas no válidas" };
  const vistas = body.vistas === undefined ? null : new Set(body.vistas);
  const dudosas = new Set(body.dudosas || []);
  const duracion = Number.isInteger(body.duracion_segundos) && body.duracion_segundos >= 0 ? body.duracion_segundos : null;
  return { respuestas, vistas, dudosas, duracion };
}

// preguntas: Map id → { correcta, origen, anulada } (de la BD). Un blanco no
// es acierto. `aciertos` no cuenta anuladas, igual que getSimulacros.
// `vista`: la pregunta llegó a mostrarse (contestar implica verla). Las no
// vistas se guardan en blanco y cuentan en la nota, pero no van al repaso
// ni a /errores. `repaso`: si debe actualizar el repaso espaciado (banco
// oficial, no anulada y vista), como al responder en /test.
// `dudosa`: marcada como dudosa durante el simulacro.
export function corregir(respuestas, preguntas, vistas = null, dudosas = new Set()) {
  let aciertos = 0;
  const filas = respuestas.map(({ pregunta_id, respuesta_dada }) => {
    const p = preguntas.get(pregunta_id);
    const correcta = respuesta_dada !== null && respuesta_dada === p.correcta.trim();
    if (correcta && !p.anulada) aciertos += 1;
    const vista = vistas === null || vistas.has(pregunta_id) || respuesta_dada !== null;
    return {
      pregunta_id,
      respuesta_dada,
      correcta,
      vista,
      dudosa: dudosas.has(pregunta_id),
      repaso: vista && p.origen === "oficial" && !p.anulada,
    };
  });
  return { filas, aciertos };
}
