import test from "node:test";
import assert from "node:assert/strict";
import {
  duracionASegundos,
  disponibilidadDe,
  limiteAnos,
  demasiadoAntiguo,
  cruzaLimiteEntre,
  hayQueAvisar,
} from "./comprobar-videos.mjs";

test("duración ISO 8601 a segundos", () => {
  assert.equal(duracionASegundos("PT5M44S"), 344);
  assert.equal(duracionASegundos("PT1H2M3S"), 3723);
  assert.equal(duracionASegundos("P0D"), 0);
  assert.equal(duracionASegundos(undefined), 0);
});

test("disponibilidad según videos.list", () => {
  assert.equal(disponibilidadDe(undefined), "borrado");
  assert.equal(disponibilidadDe({ status: { privacyStatus: "private", embeddable: true } }), "privado");
  assert.equal(disponibilidadDe({ status: { privacyStatus: "unlisted", embeddable: true } }), "privado");
  assert.equal(disponibilidadDe({ status: { privacyStatus: "public", embeddable: false } }), "no_insertable");
  assert.equal(disponibilidadDe({ status: { privacyStatus: "public", embeddable: true } }), "disponible");
});

test("límite de antigüedad por tipo de tema", () => {
  assert.equal(limiteAnos("Bioestadística", "Estudios de cohortes"), null);
  assert.equal(limiteAnos("Cardiología", "ECG básico"), null);
  assert.equal(limiteAnos("Cardiología", "Insuficiencia cardíaca"), 3);
  assert.equal(limiteAnos("Oncología", "Cáncer de pulmón"), 3);
  assert.equal(limiteAnos("Neurología", "Epilepsia"), 7);
});

test("demasiado antiguo", () => {
  const hoy = new Date("2026-10-14");
  assert.equal(demasiadoAntiguo("2022-01-01", 3, hoy), true);
  assert.equal(demasiadoAntiguo("2024-06-22", 3, hoy), false);
  assert.equal(demasiadoAntiguo("2001-01-01", null, hoy), false);
});

test("aviso de antigüedad nuevo solo si cruza el límite desde la comprobación anterior", () => {
  // Publicado 2023-10-20, límite 3 años → cruza el 2026-10-20.
  assert.equal(cruzaLimiteEntre("2023-10-20", 3, "2026-10-13", "2026-10-26"), true);
  assert.equal(cruzaLimiteEntre("2023-10-20", 3, "2026-10-26", "2026-11-02"), false);
  assert.equal(cruzaLimiteEntre("2020-01-01", null, "2026-10-13", "2026-10-26"), false);
});

test("correo solo si hay algo que mirar", () => {
  assert.equal(hayQueAvisar({}), false);
  assert.equal(hayQueAvisar({ ocultados: 0, borrados: 0, antiguedadNuevos: 0 }), false);
  assert.equal(hayQueAvisar({ ocultados: 1 }), true);
  assert.equal(hayQueAvisar({ borrados: 1 }), true);
  assert.equal(hayQueAvisar({ antiguedadNuevos: 2 }), true);
  assert.equal(hayQueAvisar({ error: new Error("x") }), true);
});
