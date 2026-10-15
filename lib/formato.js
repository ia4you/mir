// Números al estilo español: coma decimal, punto de miles y espacio fino no
// separable antes de % ("64,8 %"). Sin Intl a propósito: con el ICU reducido
// de Node, toLocaleString("es-ES") devuelve "64.8" en el servidor sin avisar
// (ver formatearMiles en app/lib/especialidades.js), y el HTML del servidor
// no coincidiría con el del navegador.

// `decimales`: máximo de decimales; con `fijos`, siempre esos (121,70).
// Con `signo`, "+" delante de los positivos. El menos es el signo real (−).
export function fmtNumero(n, { decimales = 1, fijos = false, signo = false } = {}) {
  const v = Number(n);
  let [ent, dec = ""] = Math.abs(v).toFixed(decimales).split(".");
  if (!fijos) dec = dec.replace(/0+$/, "");
  ent = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const txt = dec ? `${ent},${dec}` : ent;
  if (txt === "0" || /^0,0*$/.test(txt)) return txt;
  return v < 0 ? `−${txt}` : signo ? `+${txt}` : txt;
}

export function fmtPorcentaje(n, opciones) {
  return `${fmtNumero(n, opciones)} %`;
}
