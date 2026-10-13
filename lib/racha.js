// Días de práctica en hora de Canarias (los usuarios y el MIR son de aquí).
// `sesiones.fecha` es timestamp sin zona guardado en UTC (default now() con
// TimeZone=UTC), así que primero se marca como UTC y luego se pasa a Canarias.
// Mismas expresiones duplicadas en scripts/enviar-recordatorio.mjs (lo
// ejecuta node a pelo, no puede importar este módulo).
export const ZONA = "Atlantic/Canary";
export const diaCanarias = (col = "fecha") => `((${col} AT TIME ZONE 'UTC') AT TIME ZONE '${ZONA}')::date`;
export const HOY_CANARIAS = `(now() AT TIME ZONE '${ZONA}')::date`;

// Días consecutivos con práctica terminando hoy o, si hoy aún no hay, ayer
// (la racha no se rompe hasta que acaba el día sin practicar).
// `dias`: lista de 'YYYY-MM-DD'; `hoy`: 'YYYY-MM-DD', ambos en hora de Canarias.
export function calcularRacha(dias, hoy) {
  const set = new Set(dias);
  const d = new Date(`${hoy}T00:00:00Z`);
  if (!set.has(hoy)) d.setUTCDate(d.getUTCDate() - 1);
  let racha = 0;
  while (set.has(d.toISOString().slice(0, 10))) {
    racha++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return racha;
}

// Semana actual (lunes a domingo) con los días practicados marcados. `dias` y
// `hoy` en "YYYY-MM-DD" (hora de Canarias, como en calcularRacha).
export function semanaActual(dias, hoy) {
  const set = new Set(dias);
  const d = new Date(`${hoy}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return Array.from({ length: 7 }, () => {
    const fecha = d.toISOString().slice(0, 10);
    d.setUTCDate(d.getUTCDate() + 1);
    return { fecha, activo: set.has(fecha), hoy: fecha === hoy, futuro: fecha > hoy };
  });
}
