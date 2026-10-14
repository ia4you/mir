// Consentimiento de cookies (guía de la AEPD). Se guarda en localStorage:
// la decisión solo la usa el navegador (Google Analytics se carga en el
// cliente), así que no hace falta que el servidor la conozca. Caduca a los
// 12 meses o si cambia VERSION (p. ej. al añadir otra herramienta).

const CLAVE = "mir_consentimiento";
export const VERSION = 1;
const DOCE_MESES_MS = 365 * 24 * 60 * 60 * 1000;
// Aviso entre componentes de la misma pestaña: cambio de elección y "abrir
// el panel de configuración" (enlaces "Configurar cookies").
export const EVENTO_CAMBIO = "mir-consentimiento";
export const EVENTO_ABRIR = "mir-configurar-cookies";

// { analitica: boolean, fecha } o null si no hay elección válida.
export function leerConsentimiento() {
  try {
    const c = JSON.parse(localStorage.getItem(CLAVE) || "null");
    if (!c || c.version !== VERSION || Date.now() - new Date(c.fecha).getTime() > DOCE_MESES_MS) return null;
    return { analitica: c.analitica === true, fecha: c.fecha };
  } catch {
    return null;
  }
}

export function guardarConsentimiento(analitica) {
  const c = { analitica: Boolean(analitica), fecha: new Date().toISOString(), version: VERSION };
  try {
    localStorage.setItem(CLAVE, JSON.stringify(c));
  } catch {
    // sin almacenamiento: la elección vale solo para esta visita
  }
  window.dispatchEvent(new CustomEvent(EVENTO_CAMBIO, { detail: c }));
  return c;
}

export function abrirConfiguracionCookies() {
  window.dispatchEvent(new Event(EVENTO_ABRIR));
}

// Borra las cookies de Google Analytics de este sitio (al rechazar o retirar
// el consentimiento). GA las pone en el dominio principal (.turel.es) o en
// el propio host; se prueban los dos.
export function borrarCookiesAnalitica() {
  const host = window.location.hostname;
  const partes = host.split(".");
  const dominios = ["", host, `.${host}`, partes.length > 2 ? `.${partes.slice(-2).join(".")}` : null].filter((d) => d !== null);
  for (const par of document.cookie.split(";")) {
    const nombre = par.split("=")[0].trim();
    if (!/^_ga/.test(nombre)) continue;
    for (const d of dominios) {
      document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ""}`;
    }
  }
}
