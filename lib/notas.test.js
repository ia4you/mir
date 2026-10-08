import test from "node:test";
import assert from "node:assert/strict";
import {
  netas,
  puntosRespuesta,
  notaEvolucion,
  evolucion,
  notaSimulacro,
  comparar,
} from "./notas.js";

const DIA = 24 * 3600 * 1000;
const AHORA = new Date("2026-10-08T12:00:00Z");
let seq = 0;
// n respuestas de una especialidad: `ok` aciertos, `ko` fallos, resto blancos.
function resp(esp, ok, ko, blancos = 0, diasAtras = 1) {
  const out = [];
  const mk = (correcta, dada) =>
    out.push({
      id: ++seq,
      especialidad: esp,
      correcta,
      respuesta_dada: dada,
      fecha: new Date(AHORA.getTime() - diasAtras * DIA - (1000 - seq)).toISOString(),
    });
  for (let i = 0; i < ok; i++) mk(true, "A");
  for (let i = 0; i < ko; i++) mk(false, "B");
  for (let i = 0; i < blancos; i++) mk(false, null);
  return out;
}

test("netas = aciertos − errores/3", () => {
  assert.equal(netas(30, 6), 28);
  assert.equal(netas(0, 3), -1);
});

test("blancos (también por temporizador) no puntúan ni penalizan", () => {
  assert.equal(puntosRespuesta({ correcta: false, respuesta_dada: null }), 0);
  assert.equal(puntosRespuesta({ correcta: true, respuesta_dada: "A" }), 1);
  assert.equal(puntosRespuesta({ correcta: false, respuesta_dada: "B" }), -1 / 3);
});

test("mínimo de 30 respuestas: por debajo, nota null con contador", () => {
  const r = notaEvolucion(resp("X", 29, 0), { X: 10 });
  assert.deepEqual(r, { nota: null, respondidas: 29 });
  assert.equal(notaEvolucion(resp("X", 30, 0), { X: 10 }).nota, 200);
});

test("ventana: solo cuentan las últimas 100 primeras respuestas", () => {
  const viejas = resp("X", 0, 50, 0, 5); // 50 fallos antiguos
  const nuevas = resp("X", 100, 0, 0, 1); // 100 aciertos recientes
  const r = notaEvolucion([...viejas, ...nuevas], { X: 10 });
  assert.equal(r.respondidas, 100);
  assert.equal(r.nota, 200);
});

test("ponderación: especialidades con <3 respuestas se ignoran y se renormaliza", () => {
  // A: 30 aciertos (1.0), B: 2 fallos (ignorada, <3), C: 30 con 0 netas
  const datos = [...resp("A", 30, 0), ...resp("B", 0, 2), ...resp("C", 0, 0, 30)];
  const pesos = { A: 10, B: 80, C: 10 };
  // solo A y C: (10*1 + 10*0)/20 = 0.5 → 100
  assert.equal(notaEvolucion(datos, pesos).nota, 100);
});

test("ponderación respeta el peso de cada especialidad", () => {
  const datos = [...resp("A", 30, 0), ...resp("C", 0, 0, 30)];
  // (30*1 + 10*0)/40 = 0.75 → 150
  assert.equal(notaEvolucion(datos, { A: 30, C: 10 }).nota, 150);
});

test("referencia a 7 días: solo respuestas anteriores a ahora−7d", () => {
  const antiguas = resp("X", 30, 0, 0, 10); // 200 hace 10 días
  const recientes = resp("X", 0, 30, 0, 1); // −66,7 hace 1 día
  const r = evolucion([...antiguas, ...recientes], { X: 10 }, AHORA);
  assert.equal(r.referencia, 200);
  // ventana de 60: 30 aciertos + 30 fallos → (30 − 10)/60 × 200 = 66.7
  assert.equal(r.nota, 66.7);
  assert.equal(r.diferencia, -133.3);
  assert.equal(r.direccion, "baja");
});

test("sin referencia válida (menos de 30 previas) no hay comparación", () => {
  const r = evolucion(resp("X", 40, 0, 0, 1), { X: 10 }, AHORA);
  assert.equal(r.referencia, null);
  assert.equal(r.diferencia, null);
  assert.equal(r.direccion, null);
});

test("comparar: sube / baja / igual con 1 decimal", () => {
  assert.deepEqual(comparar(54.2, 50), { diferencia: 4.2, direccion: "sube" });
  assert.deepEqual(comparar(50, 50), { diferencia: 0, direccion: "igual" });
  assert.deepEqual(comparar(null, 50), { diferencia: null, direccion: null });
});

test("simulacro: netas escaladas a 200 sobre total_preguntas", () => {
  // 100 aciertos, 30 errores, 80 blancos de 210: netas 90 → 90*200/210
  assert.equal(notaSimulacro(100, 30, 210), 85.7);
  assert.equal(notaSimulacro(0, 0, 0), null);
});
