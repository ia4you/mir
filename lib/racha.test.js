import test from "node:test";
import assert from "node:assert/strict";
import { calcularRacha, semanaActual } from "./racha.js";

test("racha cuenta hasta hoy", () => {
  assert.equal(calcularRacha(["2026-10-12", "2026-10-11", "2026-10-09"], "2026-10-12"), 2);
});

test("sin práctica hoy, la racha sigue viva desde ayer", () => {
  assert.equal(calcularRacha(["2026-10-11", "2026-10-10"], "2026-10-12"), 2);
});

test("hueco de un día rompe la racha", () => {
  assert.equal(calcularRacha(["2026-10-10"], "2026-10-12"), 0);
  assert.equal(calcularRacha([], "2026-10-12"), 0);
});

test("cruza cambio de mes", () => {
  assert.equal(calcularRacha(["2026-11-01", "2026-10-31", "2026-10-30"], "2026-11-01"), 3);
});

test("semana de lunes a domingo con los días practicados", () => {
  // 2026-10-14 es miércoles
  const s = semanaActual(["2026-10-12", "2026-10-14", "2026-10-11"], "2026-10-14");
  assert.deepEqual(s.map((d) => d.fecha), ["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16", "2026-10-17", "2026-10-18"]);
  assert.deepEqual(s.map((d) => d.activo), [true, false, true, false, false, false, false]);
  assert.equal(s.findIndex((d) => d.hoy), 2);
  assert.deepEqual(s.map((d) => d.futuro), [false, false, false, true, true, true, true]);
});

test("en domingo la semana empieza el lunes anterior", () => {
  assert.equal(semanaActual([], "2026-10-18")[0].fecha, "2026-10-12");
});
