// Preferencias guardadas en localStorage (sin backend: uso personal, sin login).

const CLAVE_META_DIARIA = "mir_meta_diaria";
const CLAVE_TEMPORIZADOR = "mir_temporizador_defecto";

export const META_DIARIA_POR_DEFECTO = 20;
export const TEMPORIZADOR_POR_DEFECTO = { activo: false, segundos: 60 };

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
