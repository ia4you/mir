// Parte una explicación en párrafos para leerla mejor: la justificación de la correcta y, aparte, el descarte de cada
// opción. Solo presentación: no toca la BD. Regla de seguridad: si el texto reunido no es idéntico al original o salen
// menos de 2 párrafos, devuelve el texto tal cual ([texto]).
//
// Una frase abre párrafo si descarta una opción distinta de la correcta, es decir, si:
//  - empieza por «Descartamos X», «La opción X», «La/El X …» (con X = A-D sola), o «X) …»; o
//  - cita una opción entre paréntesis, como «(B)».
// Las frases que solo citan la letra correcta se quedan en el párrafo en que están.
const MARCAS = [
  /^(?:Descartamos|La opción|Las opciones|La|El) ([A-D])\b/,
  /^([A-D])\)\s/,
];

function letrasDeDescarte(frase) {
  const letras = new Set();
  for (const re of MARCAS) {
    const m = re.exec(frase);
    if (m) letras.add(m[1]);
  }
  for (const m of frase.matchAll(/\(([A-D])\)/g)) letras.add(m[1]);
  return letras;
}

const normalizar = (t) => t.replace(/\s+/g, " ").trim();

export function partirExplicacion(texto) {
  if (typeof texto !== "string" || !texto.trim()) return [texto];
  const correcta = /^La respuesta correcta es ([A-D])\)/.exec(texto.trim())?.[1] || null;
  const frases = texto.trim().split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡(])/);
  const parrafos = [];
  let actual = [];
  for (const frase of frases) {
    const letras = [...letrasDeDescarte(frase)].filter((l) => l !== correcta);
    if (letras.length > 0 && actual.length > 0) {
      parrafos.push(actual.join(" "));
      actual = [];
    }
    actual.push(frase);
  }
  if (actual.length > 0) parrafos.push(actual.join(" "));
  if (parrafos.length < 2 || normalizar(parrafos.join(" ")) !== normalizar(texto)) return [texto];
  return parrafos;
}

// Para el informe de calidad (scripts/probar-particion-explicaciones.mjs): casos en los que conviene mirar a mano el corte.
export function casosDudosos(texto, parrafos) {
  const correcta = /^La respuesta correcta es ([A-D])\)/.exec(texto.trim())?.[1] || null;
  const dudas = [];
  if (parrafos.length < 2) return dudas;
  const resto = parrafos.slice(1);
  if (resto.length !== 3) dudas.push(`${resto.length} párrafos de descarte (se esperaban 3)`);
  const vistas = new Map();
  resto.forEach((p, i) => {
    for (const l of letrasDeDescarte(p)) {
      if (l === correcta) dudas.push(`el párrafo ${i + 2} cita la letra correcta ${l}`);
      else if (vistas.has(l)) dudas.push(`la letra ${l} aparece en los párrafos ${vistas.get(l)} y ${i + 2}`);
      else vistas.set(l, i + 2);
    }
  });
  const faltan = "ABCD".split("").filter((l) => l !== correcta && !vistas.has(l));
  if (correcta && faltan.length) dudas.push(`sin párrafo para la opción ${faltan.join(", ")}`);
  return dudas;
}
