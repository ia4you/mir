import { test } from "node:test";
import assert from "node:assert/strict";
import { validarEntrega, corregir } from "./simulacro.js";

test("validarEntrega: limpia letras y acepta blancos", () => {
  const r = validarEntrega({ respuestas: [{ pregunta_id: "5", respuesta_dada: " b " }, { pregunta_id: 6, respuesta_dada: null }], duracion_segundos: 100 }, 210);
  assert.deepEqual(r, { respuestas: [{ pregunta_id: 5, respuesta_dada: "B" }, { pregunta_id: 6, respuesta_dada: null }], duracion: 100 });
});

test("validarEntrega: rechaza lo que no cuadra", () => {
  assert.ok(validarEntrega({ respuestas: [] }, 210).error);
  assert.ok(validarEntrega({}, 210).error);
  assert.ok(validarEntrega({ respuestas: [{ pregunta_id: 1, respuesta_dada: "F" }] }, 210).error);
  assert.ok(validarEntrega({ respuestas: [{ pregunta_id: 1 }, { pregunta_id: 1 }] }, 210).error);
  assert.ok(validarEntrega({ respuestas: [{ pregunta_id: 1 }, { pregunta_id: 2 }] }, 1).error);
  assert.equal(validarEntrega({ respuestas: [{ pregunta_id: 1 }], duracion_segundos: -3 }, 1).duracion, null);
});

test("corregir: aciertos, fallos, blancos y anuladas", () => {
  const preguntas = new Map([
    [1, { correcta: "A ", origen: "oficial", anulada: false }],
    [2, { correcta: "B", origen: "oficial", anulada: false }],
    [3, { correcta: "C", origen: "oficial", anulada: false }],
    [4, { correcta: "D", origen: "oficial", anulada: true }],
    [5, { correcta: "E", origen: "ia_generada", anulada: false }],
  ]);
  const { filas, aciertos } = corregir(
    [
      { pregunta_id: 1, respuesta_dada: "A" }, // acierto
      { pregunta_id: 2, respuesta_dada: "C" }, // fallo
      { pregunta_id: 3, respuesta_dada: null }, // en blanco
      { pregunta_id: 4, respuesta_dada: "D" }, // anulada: no suma
      { pregunta_id: 5, respuesta_dada: "E" }, // IA: suma, sin repaso
    ],
    preguntas
  );
  assert.equal(aciertos, 2);
  assert.deepEqual(filas.map((f) => f.correcta), [true, false, false, true, true]);
  assert.deepEqual(filas.map((f) => f.repaso), [true, true, true, false, false]);
});
