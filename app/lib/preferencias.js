// Preferencias guardadas en localStorage (sin backend: uso personal, sin login).

const CLAVE_META_DIARIA = "mir_meta_diaria";
const CLAVE_TEMPORIZADOR = "mir_temporizador_defecto";
// Misma clave que usa el script de arranque inline en app/layout.js (no se
// puede importar este módulo ahí porque ese script debe ejecutarse antes de
// hidratar React, así que la clave está duplicada a propósito).
export const CLAVE_TEMA = "mir_tema";

export const META_DIARIA_POR_DEFECTO = 20;
export const TEMPORIZADOR_POR_DEFECTO = { activo: false, segundos: 60 };
// Oscuro es el predeterminado y no depende del sistema operativo; "claro"
// solo si el usuario lo elige en Perfil.
export const TEMA_POR_DEFECTO = "oscuro";

export function getMetaDiaria() {
  if (typeof window === "undefined") return META_DIARIA_POR_DEFECTO;
  const v = parseInt(localStorage.getItem(CLAVE_META_DIARIA), 10);
  return Number.isInteger(v) && v > 0 ? v : META_DIARIA_POR_DEFECTO;
}

export function setMetaDiaria(valor) {
  localStorage.setItem(CLAVE_META_DIARIA, String(valor));
}

export function getTemporizadorDefecto() {
  if (typeof window === "undefined") return TEMPORIZADOR_POR_DEFECTO;
  try {
    const raw = localStorage.getItem(CLAVE_TEMPORIZADOR);
    if (!raw) return TEMPORIZADOR_POR_DEFECTO;
    const parsed = JSON.parse(raw);
    return {
      activo: Boolean(parsed.activo),
      segundos: Number.isInteger(parsed.segundos) ? parsed.segundos : TEMPORIZADOR_POR_DEFECTO.segundos,
    };
  } catch {
    return TEMPORIZADOR_POR_DEFECTO;
  }
}

export function setTemporizadorDefecto(valor) {
  localStorage.setItem(CLAVE_TEMPORIZADOR, JSON.stringify(valor));
}

export function getTema() {
  if (typeof window === "undefined") return TEMA_POR_DEFECTO;
  const v = localStorage.getItem(CLAVE_TEMA);
  return v === "claro" ? "claro" : TEMA_POR_DEFECTO;
}

// Aplica el tema al <html> (clase "dark") y lo persiste. Misma lógica que
// SCRIPT_TEMA en app/layout.js.
export function setTema(valor) {
  localStorage.setItem(CLAVE_TEMA, valor);
  aplicarTema(valor);
}

export function aplicarTema(valor) {
  if (typeof document === "undefined") return;
  const claro = valor === "claro";
  document.documentElement.classList.toggle("dark", !claro);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", claro ? "#F7F5F0" : "#0B0C0E");
}
