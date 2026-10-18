import { test } from "node:test";
import assert from "node:assert/strict";
import { elegirParaReforzar } from "./reforzar.js";

const e = (especialidad, total, porcentaje, preguntas = 30) => ({ especialidad, total, porcentaje, preguntas });

test("menos de 20 respuestas válidas en total: nada", () => {
  assert.deepEqual(elegirParaReforzar([e("A", 10, 20), e("B", 9, 10)]), []);
});

test("5 tarjetas de las de 5+ respondidas, de peor a mejor y sin tope del 60 %", () => {
  const r = elegirParaReforzar([
    e("A", 10, 90), e("B", 10, 70), e("C", 10, 65), e("D", 10, 80), e("E", 10, 75), e("F", 10, 95), e("G", 3, 0),
  ]);
  assert.deepEqual(r.map((x) => x.especialidad), ["C", "B", "E", "D", "A"]);
  assert.ok(r.every((x) => x.tipo === "normal"));
});

test("empate de porcentaje: primero la de más respondidas, luego la de más preguntas", () => {
  const r = elegirParaReforzar([e("A", 6, 50, 10), e("B", 8, 50, 10), e("C", 6, 50, 40), e("D", 20, 99)]);
  assert.deepEqual(r.slice(0, 3).map((x) => x.especialidad), ["B", "C", "A"]);
});

test("se completa con pocas (1-4) y luego con no practicadas por tamaño del banco", () => {
  const r = elegirParaReforzar([
    e("A", 18, 40), e("B", 4, 25), e("C", 2, 0), e("D", 0, 0, 20), e("E", 0, 0, 80), e("F", 0, 0, 50),
  ]);
  assert.deepEqual(r.map((x) => [x.especialidad, x.tipo]), [
    ["A", "normal"], ["C", "pocas"], ["B", "pocas"], ["E", "nueva"], ["F", "nueva"],
  ]);
});
