"use client";

import { useState } from "react";

// Mismos umbrales que EspecialidadesStatsTable, para que el "nivel" de un
// tema se lea igual que el de una especialidad en el resto de la pantalla.
function nivel(porcentaje) {
  if (porcentaje >= 75) return { emoji: "🟢", clase: "text-success" };
  if (porcentaje >= 50) return { emoji: "🟡", clase: "text-warning" };
  return { emoji: "🔴", clase: "text-danger" };
}

// Agrupa manteniendo el orden de primera aparición: como `temas` ya llega
// ordenado por porcentaje ascendente desde el endpoint, la primera
// especialidad del grupo es la que contiene el tema más flojo de todas.
function agruparPorEspecialidad(temas) {
  const grupos = new Map();
  for (const t of temas) {
    if (!grupos.has(t.especialidad)) grupos.set(t.especialidad, []);
    grupos.get(t.especialidad).push(t);
  }
  for (const lista of grupos.values()) {
    lista.sort((a, b) => a.porcentaje - b.porcentaje);
  }
  return Array.from(grupos.entries());
}

export default function TemasPorEspecialidad({ temas }) {
  const [abiertas, setAbiertas] = useState(() => new Set());

  if (!temas || temas.length === 0) return null;

  const grupos = agruparPorEspecialidad(temas);

  function toggle(especialidad) {
    setAbiertas((prev) => {
      const next = new Set(prev);
      if (next.has(especialidad)) next.delete(especialidad);
      else next.add(especialidad);
      return next;
    });
  }

  return (
    <section className="mt-7 px-5">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">
        Por tema
      </h2>

      <div className="flex flex-col gap-2">
        {grupos.map(([especialidad, temasEspecialidad]) => {
          const abierta = abiertas.has(especialidad);
          const peorTema = temasEspecialidad[0];

          return (
            <div key={especialidad} className="overflow-hidden rounded-2xl bg-card shadow-sm">
              <button
                type="button"
                onClick={() => toggle(especialidad)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left"
              >
                <span className="font-semibold text-ink">{especialidad}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ink-muted">
                    {temasEspecialidad.length} tema{temasEspecialidad.length !== 1 ? "s" : ""}
                  </span>
                  <span className={`text-sm font-bold ${nivel(peorTema.porcentaje).clase}`}>
                    {peorTema.porcentaje}%
                  </span>
                  <span
                    className={`text-ink-muted transition-transform ${abierta ? "rotate-180" : ""}`}
                  >
                    ▾
                  </span>
                </div>
              </button>

              {abierta && (
                <ul className="flex flex-col divide-y divide-track border-t border-track">
                  {temasEspecialidad.map((t) => {
                    const { emoji, clase } = nivel(t.porcentaje);
                    return (
                      <li
                        key={t.tema}
                        className="flex items-center justify-between gap-3 px-4 py-3"
                      >
                        <span className="min-w-0 flex-1 text-sm text-ink">
                          {emoji} {t.tema}
                        </span>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          {!t.fiable && (
                            <span className="rounded-full bg-track px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-muted">
                              Pocos datos
                            </span>
                          )}
                          <span className={`text-sm font-bold ${clase}`}>{t.porcentaje}%</span>
                          <span className="w-12 text-right text-xs text-ink-muted">
                            {t.aciertos}/{t.total}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
