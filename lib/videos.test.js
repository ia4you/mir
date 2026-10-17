import test from "node:test";
import assert from "node:assert/strict";
import {
  temaConVideo,
  temaCorto,
  busquedaYouTube,
  formatoDuracion,
  tituloVisible,
  claveTema,
  ordenarParaRepasar,
  calcularProgreso,
  avisoVigencia,
} from "./videos.js";

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

test("título visible sin puntos ni espacios al principio", () => {
  assert.equal(tituloVisible(". Manejo de la Hematuria en Urgencias."), "Manejo de la Hematuria en Urgencias.");
  assert.equal(tituloVisible(" .. Ictus"), "Ictus");
  assert.equal(tituloVisible("Urgencias pediátricas."), "Urgencias pediátricas.");
});

test("para repasar: solo temas fallados, no vistos primero, luego más fallos", () => {
  const v = (id, especialidad, tema, preguntas) => ({ youtube_id: id, especialidad, tema, preguntas });
  const videos = [v("a", "Cardiología", "Arritmias", 10), v("b", "Neurología", "Ictus", 12), v("c", "Pediatría", "Exantemas", 8), v("d", "ORL", "Otitis", 3)];
  const fallados = new Map([
    [claveTema("Cardiología", "Arritmias"), 2],
    [claveTema("Neurología", "Ictus — ACV isquémico"), 5],
    [claveTema("Pediatría", "Exantemas"), 2],
  ]);
  const lista = ordenarParaRepasar(videos, fallados, new Set(["b"]));
  assert.deepEqual(lista.map((x) => x.youtube_id), ["a", "c", "b"]);
  assert.equal(lista[2].visto, true);
  assert.equal(lista[0].fallos, 2);
});

test("progreso por especialidad y total de vídeos distintos", () => {
  const grupos = [
    { especialidad: "Urgencias", slug: "urgencias", videos: [{ youtube_id: "x" }, { youtube_id: "y" }] },
    { especialidad: "Miscelánea", slug: "miscelanea", videos: [{ youtube_id: "x" }] },
  ];
  const p = calcularProgreso(grupos, new Set(["x"]));
  assert.equal(p.total, 2);
  assert.equal(p.vistos, 1);
  assert.deepEqual(p.especialidades.map((e) => `${e.slug} ${e.vistos}/${e.total}`), ["urgencias 1/2", "miscelanea 1/1"]);
});

test("avisoVigencia: solo en Oncología, con el año del vídeo", () => {
  assert.equal(
    avisoVigencia({ especialidad: "Oncología", anio: 2020 }),
    "Vídeo de 2020. En Oncología los tratamientos cambian rápido: comprueba que el tratamiento que se explica sigue vigente."
  );
  assert.equal(avisoVigencia({ especialidad: "Neurología", anio: 2021 }), null);
});
