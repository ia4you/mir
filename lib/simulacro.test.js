import { test } from "node:test";
import assert from "node:assert/strict";
import { validarEntrega, corregir } from "./simulacro.js";

test("validarEntrega: limpia letras y acepta blancos", () => {
  const r = validarEntrega({ respuestas: [{ pregunta_id: "5", respuesta_dada: " b " }, { pregunta_id: 6, respuesta_dada: null }], duracion_segundos: 100 }, 210);
  assert.deepEqual(r, { respuestas: [{ pregunta_id: 5, respuesta_dada: "B" }, { pregunta_id: 6, respuesta_dada: null }], vistas: null, dudosas: new Set(), duracion: 100 });
});

test("validarEntrega: rechaza lo que no cuadra", () => {
  assert.ok(validarEntrega({ respuestas: [] }, 210).error);
  assert.ok(validarEntrega({}, 210).error);
  assert.ok(validarEntrega({ respuestas: [{ pregunta_id: 1, respuesta_dada: "F" }] }, 210).error);
  assert.ok(validarEntrega({ respuestas: [{ pregunta_id: 1 }, { pregunta_id: 1 }] }, 210).error);
  assert.ok(validarEntrega({ respuestas: [{ pregunta_id: 1 }, { pregunta_id: 2 }] }, 1).error);
  assert.equal(validarEntrega({ respuestas: [{ pregunta_id: 1 }], duracion_segundos: -3 }, 1).duracion, null);
  assert.ok(validarEntrega({ respuestas: [{ pregunta_id: 1 }], vistas: ["1"] }, 1).error);
  assert.ok(validarEntrega({ respuestas: [{ pregunta_id: 1 }], dudosas: "1" }, 1).error);
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

test("entregado por tiempo con 5 vistas: solo esas 5 pueden ir al repaso", () => {
  const preguntas = new Map();
  for (let id = 1; id <= 210; id++) preguntas.set(id, { correcta: "A", origen: "oficial", anulada: false });
  // vistas 1-5: tres contestadas (una bien), dos en blanco; 6-210 sin abrir
  const dadas = { 1: "A", 2: "B", 3: "C" };
  const { respuestas, vistas } = validarEntrega(
    {
      respuestas: [...preguntas.keys()].map((id) => ({ pregunta_id: id, respuesta_dada: dadas[id] ?? null })),
      vistas: [1, 2, 3, 4, 5],
    },
    210
  );
  const { filas, aciertos } = corregir(respuestas, preguntas, vistas);
  assert.equal(filas.length, 210); // todas se guardan y cuentan en la nota
  assert.equal(aciertos, 1);
  assert.equal(filas.filter((f) => f.respuesta_dada === null).length, 207);
  assert.deepEqual(filas.filter((f) => f.vista).map((f) => f.pregunta_id), [1, 2, 3, 4, 5]);
  assert.deepEqual(filas.filter((f) => f.repaso).map((f) => f.pregunta_id), [1, 2, 3, 4, 5]);
});

test("contestar implica haberla visto, aunque no venga en vistas", () => {
  const preguntas = new Map([[7, { correcta: "A", origen: "oficial", anulada: false }]]);
  const { filas } = corregir([{ pregunta_id: 7, respuesta_dada: "B" }], preguntas, new Set());
  assert.equal(filas[0].vista, true);
  assert.equal(filas[0].repaso, true);
});

test("dudosas: se marcan solo las indicadas", () => {
  const preguntas = new Map([
    [1, { correcta: "A", origen: "oficial", anulada: false }],
    [2, { correcta: "B", origen: "oficial", anulada: false }],
  ]);
  const e = validarEntrega({ respuestas: [{ pregunta_id: 1, respuesta_dada: "A" }, { pregunta_id: 2 }], dudosas: [2] }, 2);
  const { filas } = corregir(e.respuestas, preguntas, e.vistas, e.dudosas);
  assert.deepEqual(filas.map((f) => f.dudosa), [false, true]);
});
