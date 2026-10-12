import test from "node:test";
import assert from "node:assert/strict";
import { calcularRacha } from "./racha.js";

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
