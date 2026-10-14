import test from "node:test";
import assert from "node:assert/strict";
import { INTERVALOS, sumarDias, siguienteEstado, seleccionarHoy, repartirCarga, TOPE_FREE } from "./repaso.js";

test("sumar días cruza meses y años", () => {
  assert.equal(sumarDias("2026-10-30", 3), "2026-11-02");
  assert.equal(sumarDias("2026-12-31", 1), "2027-01-01");
});

test("fallar: nivel 0 y vuelve mañana, esté como esté", () => {
  assert.deepEqual(siguienteEstado(null, false, "2026-10-14"), { nivel: 0, proxima: "2026-10-15" });
  assert.deepEqual(siguienteEstado({ nivel: 3, proxima: "2026-11-01" }, false, "2026-10-14"), { nivel: 0, proxima: "2026-10-15" });
  // Una dominada que se vuelve a fallar entra de nuevo.
  assert.deepEqual(siguienteEstado({ nivel: null }, false, "2026-10-14"), { nivel: 0, proxima: "2026-10-15" });
});

test("acertar cuando toca: 1 → 3 → 7 → 14 → 30 días → dominada", () => {
  let hoy = "2026-10-14";
  let estado = { ...siguienteEstado(null, false, hoy) }; // falla hoy → mañana
  const esperas = [];
  for (let i = 0; i < INTERVALOS.length - 1; i++) {
    hoy = estado.proxima; // repasa justo el día que toca
    const nuevo = siguienteEstado(estado, true, hoy);
    esperas.push((new Date(nuevo.proxima) - new Date(hoy)) / 86400000);
    estado = nuevo;
  }
  assert.deepEqual(esperas, [3, 7, 14, 30]);
  assert.deepEqual(siguienteEstado(estado, true, estado.proxima), { dominada: true });
});

test("acertar con retraso también cuenta y el siguiente intervalo cuenta desde hoy", () => {
  assert.deepEqual(siguienteEstado({ nivel: 1, proxima: "2026-10-10" }, true, "2026-10-14"), { nivel: 2, proxima: "2026-10-21" });
});

test("acertar antes de tiempo, sin estar en repaso o ya dominada: no cambia nada", () => {
  assert.equal(siguienteEstado({ nivel: 2, proxima: "2026-10-20" }, true, "2026-10-14"), null);
  assert.equal(siguienteEstado(null, true, "2026-10-14"), null);
  assert.equal(siguienteEstado({ nivel: null }, true, "2026-10-14"), null);
});

test("repaso de hoy: atrasadas primero, luego nivel más bajo, con tope", () => {
  const filas = [
    { pregunta_id: 1, nivel: 2, proxima: "2026-10-14" },
    { pregunta_id: 2, nivel: 0, proxima: "2026-10-14" },
    { pregunta_id: 3, nivel: 4, proxima: "2026-10-10" },
    { pregunta_id: 4, nivel: 0, proxima: "2026-10-15" }, // mañana: no toca
    { pregunta_id: 5, nivel: null, proxima: null }, // dominada
  ];
  assert.deepEqual(seleccionarHoy(filas, "2026-10-14", 20), { ids: [3, 2, 1], pendientes: 3, atrasadas: 0 });
  assert.deepEqual(seleccionarHoy(filas, "2026-10-14", 2), { ids: [3, 2], pendientes: 3, atrasadas: 1 });
  const muchas = Array.from({ length: 25 }, (_, i) => ({ pregunta_id: i + 1, nivel: 0, proxima: "2026-10-14" }));
  assert.equal(seleccionarHoy(muchas, "2026-10-14", TOPE_FREE).ids.length, 10);
});

test("carga inicial: como mucho 10 por día, desde mañana", () => {
  const ids = Array.from({ length: 23 }, (_, i) => i + 1);
  const r = repartirCarga(ids, "2026-10-14");
  assert.equal(r.filter((x) => x.proxima === "2026-10-15").length, 10);
  assert.equal(r.filter((x) => x.proxima === "2026-10-16").length, 10);
  assert.equal(r.filter((x) => x.proxima === "2026-10-17").length, 3);
  assert.equal(r[0].pregunta_id, 1);
});
