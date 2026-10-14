import test from "node:test";
import assert from "node:assert/strict";
import { temaConVideo, temaCorto, elegirVideo, busquedaYouTube, formatoDuracion } from "./videos.js";

test("tema vacío u Otros no tiene vídeo", () => {
  assert.equal(temaConVideo(null), null);
  assert.equal(temaConVideo("  "), null);
  assert.equal(temaConVideo("Otros/Miscelánea"), null);
  assert.equal(temaConVideo("Arritmias"), "Arritmias");
});

test("tema corto quita el detalle tras la raya", () => {
  assert.equal(temaCorto("Patología mamaria — BIRADS, manejo de nódulos"), "Patología mamaria");
  assert.equal(temaCorto("Valvulopatías"), "Valvulopatías");
});

test("elegirVideo: activo, principal y más reciente", () => {
  const base = { estado: "activo", disponibilidad: "disponible" };
  const filas = [
    { ...base, id: 1, principal: false, fecha_publicacion: "2024-01-01" },
    { ...base, id: 2, principal: true, fecha_publicacion: "2020-01-01" },
    { ...base, id: 3, principal: true, fecha_publicacion: "2025-01-01", estado: "oculto" },
  ];
  assert.equal(elegirVideo(filas).id, 2);
  assert.equal(elegirVideo(filas.slice(0, 1).concat(filas[2])).id, 1);
  assert.equal(elegirVideo([{ ...base, principal: true, disponibilidad: "borrado" }]), null);
  assert.equal(elegirVideo([]), null);
});

test("búsqueda por tema corto o por especialidad", () => {
  const b = busquedaYouTube("Ginecología", "Patología mamaria — BIRADS");
  assert.equal(b.texto, "Patología mamaria");
  assert.equal(b.url, "https://www.youtube.com/results?search_query=MIR%20Patolog%C3%ADa%20mamaria");
  assert.equal(busquedaYouTube("Neumología", "").texto, "Neumología");
  assert.equal(busquedaYouTube("Neumología", "Otros/Miscelánea").texto, "Neumología");
});

test("formato de duración", () => {
  assert.equal(formatoDuracion(344), "5:44");
  assert.equal(formatoDuracion(3723), "1:02:03");
});
