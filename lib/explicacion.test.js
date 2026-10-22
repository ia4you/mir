import { test } from "node:test";
import assert from "node:assert/strict";
import { partirExplicacion, casosDudosos } from "./explicacion.js";

const reunir = (p) => p.join(" ").replace(/\s+/g, " ");

// Formato 2017 (y 14 de 2016): «Descartamos X, porque…»
const F_DESCARTAMOS =
  "La respuesta correcta es B) Cáncer de pulmón: un varón de 65 años fumador con tos de 3 meses debe hacer sospechar neoplasia. " +
  "Descartamos A, porque la neumonía no dura tanto tiempo. Descartamos C, porque el asma no explica la edad de inicio. " +
  "Descartamos D, porque el TEP no cursa así de forma crónica.";

// Formato 2016 y 2022-2026: la letra entre paréntesis tras describir la opción.
const F_PARENTESIS =
  "La respuesta correcta es D) Presenta una alteración mixta que sugiere EPOC. Una vez confirmada la ausencia de reversibilidad, se puede iniciar tratamiento. " +
  "No es una alteración de predominio restrictivo (A): el cociente tan bajo indica obstrucción. " +
  "No puede establecerse aún el diagnóstico de EPOC (B), porque hace falta la espirometría tras broncodilatador. " +
  "Los corticoides inhalados (C) no son el tratamiento inicial de la EPOC.";

// Formato 2022-2026: «La A es falsa: …».
const F_LA_A =
  "La respuesta correcta es B) La presencia de la metilación aumenta la supervivencia. La enzima MGMT repara el daño del ADN. " +
  "La A es falsa: la metilación de MGMT es un factor pronóstico. La C dice lo contrario de lo que ocurre: la metilación predice mayor beneficio. " +
  "La D tampoco es correcta: no es un argumento para sustituirlos por cisplatino.";

test("los tres formatos: un párrafo de justificación y uno por opción descartada", () => {
  for (const [texto, letras] of [[F_DESCARTAMOS, "ACD"], [F_PARENTESIS, "ABC"], [F_LA_A, "ACD"]]) {
    const p = partirExplicacion(texto);
    assert.equal(p.length, 4);
    assert.match(p[0], /^La respuesta correcta es/);
    letras.split("").forEach((l, i) => assert.ok(p[i + 1].includes(l)));
    assert.equal(reunir(p), texto.replace(/\s+/g, " "));
    assert.deepEqual(casosDudosos(texto, p), []);
  }
});

test("una frase que razona la correcta y cita su letra no abre párrafo", () => {
  const t = "La respuesta correcta es C) Hipotiroidismo. Como indica la opción (C), la TSH elevada lo confirma. Descartamos A, porque no hay bocio. Descartamos B, porque falta la clínica. Descartamos D, porque no coincide.";
  const p = partirExplicacion(t);
  assert.equal(p.length, 4);
  assert.match(p[0], /\(C\)/);
});

test("seguridad: sin marcas, texto vacío o un solo párrafo, se devuelve el original", () => {
  const t = "La respuesta correcta es A) Sí. Es la única opción compatible con el cuadro descrito en el enunciado.";
  assert.deepEqual(partirExplicacion(t), [t]);
  assert.deepEqual(partirExplicacion(""), [""]);
  assert.deepEqual(partirExplicacion(null), [null]);
  assert.deepEqual(partirExplicacion("  "), ["  "]);
});

test("casosDudosos avisa si faltan opciones descartadas", () => {
  const t = "La respuesta correcta es A) X. Es así por el cuadro. Descartamos B, porque no. Descartamos C, porque tampoco.";
  const p = partirExplicacion(t);
  assert.equal(p.length, 3);
  assert.ok(casosDudosos(t, p).some((d) => d.includes("sin párrafo para la opción D")));
});
