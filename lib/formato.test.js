import { test } from "node:test";
import assert from "node:assert/strict";
import { fmtNumero as numero, fmtPorcentaje as porcentaje } from "./formato.js";

test("coma decimal y decimales", () => {
  assert.equal(numero(64.8), "64,8");
  assert.equal(numero(64.84), "64,8");
  assert.equal(numero(50), "50");
  assert.equal(numero(50.0, { decimales: 1, fijos: true }), "50,0");
  assert.equal(numero(121.67, { decimales: 2, fijos: true }), "121,67");
  assert.equal(numero(90, { decimales: 2, fijos: true }), "90,00");
});

test("miles, signo y cero", () => {
  assert.equal(numero(1025), "1.025");
  assert.equal(numero(-3.25, { decimales: 1 }), "−3,3");
  assert.equal(numero(2.5, { signo: true }), "+2,5");
  assert.equal(numero(0, { signo: true }), "0");
  assert.equal(numero(-0.01, { decimales: 1, fijos: true }), "0,0");
});

test("porcentaje con espacio no separable", () => {
  assert.equal(porcentaje(64.8), "64,8 %");
  assert.equal(porcentaje(100), "100 %");
});
