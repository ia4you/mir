"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { iniciarConIds } from "../../lib/iniciarTest";
import { etiquetaRepaso } from "@/lib/repaso";

async function iniciarRepaso({ router, ids, especialidad, onError }) {
  try {
    const r = await iniciarConIds(ids, { modo: "repaso_errores", especialidad: especialidad || null });
    if (r.error === "limite_diario") {
      onError(r.message || "Has alcanzado tu límite diario de preguntas.");
      return;
    }
    if (r.error) throw new Error(r.error);
    router.push(`/test/${r.id}`);
  } catch (e) {
    onError("No se ha podido preparar el repaso. Inténtalo de nuevo.");
  }
}

export default function MisErrores() {
  const router = useRouter();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);
  const [repasando, setRepasando] = useState(null); // null | "todos" | especialidad
  const [errorRepaso, setErrorRepaso] = useState("");

  useEffect(() => {
    fetch("/api/errores")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setDatos)
      .catch(() => setError(true));
  }, []);

  function repasar(ids, especialidad, clave) {
    if (ids.length === 0 || repasando) return;
    setErrorRepaso("");
    setRepasando(clave);
    iniciarRepaso({
      router,
      ids,
      especialidad,
      onError: (msg) => {
        setErrorRepaso(msg);
        setRepasando(null);
      },
    });
  }

  const todosLosIds = datos ? datos.grupos.flatMap((g) => g.preguntas.map((p) => p.id)) : [];
  // Preguntas que solo se dejaron en blanco (nunca se fallaron contestando).
  const enBlanco = datos ? datos.grupos.reduce((n, g) => n + g.preguntas.filter((p) => p.solo_en_blanco).length, 0) : 0;

  return (
    <div className="ancho-app min-h-screen pb-nav lg:px-8">
      <header className="flex items-center gap-3 px-5 pt-5 lg:px-0 lg:pt-10">
        <Link
          href="/estadisticas"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-card shadow-sm"
          aria-label="Volver a estadísticas"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-ink">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15 5-7 7 7 7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-extrabold text-ink">Mis errores</h1>
      </header>

      <div className="mt-5 px-5 lg:mt-8 lg:px-0">
        {error && (
          <p className="rounded-2xl bg-card p-4 text-sm text-ink-muted shadow-sm">
            No se han podido cargar tus errores.
          </p>
        )}

        {!error && !datos && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-card shadow-sm" />
            ))}
          </div>
        )}

        {!error && datos && datos.total_preguntas_falladas === 0 && (
          <div className="rounded-2xl bg-card p-4 text-sm text-ink-muted shadow-sm">
            Todavía no has fallado ninguna pregunta. ¡Sigue así!
          </div>
        )}

        {!error && datos && datos.total_preguntas_falladas > 0 && (
          <>
            <div className="rounded-2xl bg-card p-4 shadow-sm lg:flex lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-6 lg:p-5">
              <ResumenErrores
                falladas={datos.total_preguntas_falladas - enBlanco}
                enBlanco={enBlanco}
              />
              {errorRepaso && (
                <p className="mt-3 rounded-xl bg-danger-bg p-2 text-xs font-semibold text-danger-text lg:order-last lg:w-full">
                  {errorRepaso}
                </p>
              )}
              <button
                type="button"
                onClick={() => repasar(todosLosIds, null, "todos")}
                disabled={repasando !== null}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand font-bold text-on-brand shadow-sm active:bg-brand-dark disabled:opacity-60 lg:mt-0 lg:w-auto lg:px-8"
              >
                {repasando === "todos" ? "Preparando…" : "Repasar estos errores →"}
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-5 lg:mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
              {datos.grupos.map((g) => (
                <section key={g.especialidad}>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted">
                      {g.especialidad}
                    </h2>
                    <span className="text-xs font-semibold text-ink-muted">
                      {g.total_preguntas} {g.total_preguntas === 1 ? "pregunta" : "preguntas"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 rounded-2xl bg-card p-4 shadow-sm">
                    {g.preguntas.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-start justify-between gap-3 border-b border-track pb-2.5 last:border-0 last:pb-0"
                      >
                        <p className="line-clamp-2 flex-1 text-sm text-ink">{p.pregunta}</p>
                        <div className="flex flex-shrink-0 flex-col items-end gap-1">
                          {p.solo_en_blanco ? (
                            <span className="whitespace-nowrap rounded-full bg-track px-2.5 py-0.5 text-xs font-bold text-ink-muted">
                              En blanco{p.veces_fallada > 1 ? ` ${p.veces_fallada}×` : ""}
                            </span>
                          ) : (
                            <span className="whitespace-nowrap rounded-full bg-danger-bg px-2.5 py-0.5 text-xs font-bold text-danger-text">
                              Fallada {p.veces_fallada}×
                            </span>
                          )}
                          <EtiquetaRepaso repaso={p.repaso} />
                          {p.recurrente && (
                            <span className="whitespace-nowrap rounded-full bg-track px-2.5 py-0.5 text-xs font-bold text-ink-muted">
                              🔁 Recurrente
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() =>
                        repasar(g.preguntas.map((p) => p.id), g.especialidad, g.especialidad)
                      }
                      disabled={repasando !== null}
                      className="mt-1 h-11 w-full rounded-xl border-2 border-accent text-sm font-bold text-accent disabled:border-track disabled:text-ink-muted"
                    >
                      {repasando === g.especialidad
                        ? "Preparando…"
                        : `Repasar ${g.especialidad} →`}
                    </button>
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}

// Estado de la pregunta en el repaso espaciado (el mismo que usa "Repaso de
// hoy" en /inicio): toca hoy, en N días o dominada.
function EtiquetaRepaso({ repaso }) {
  const e = etiquetaRepaso(repaso);
  if (!e) return null;
  const clases = {
    hoy: "bg-brand text-on-brand",
    futuro: "bg-track text-ink-muted",
    dominada: "bg-success-bg text-success-text",
  };
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold ${clases[e.tono]}`}>
      {e.tono === "dominada" ? "✓ " : ""}
      {e.texto}
    </span>
  );
}

// "Has fallado N preguntas distintas y dejaste M en blanco", sin la parte que
// sea 0.
function ResumenErrores({ falladas, enBlanco }) {
  const n = (x) => <span className="font-bold text-ink">{x}</span>;
  if (falladas === 0) {
    return (
      <p className="text-sm text-ink-muted">
        Dejaste {n(enBlanco)} {enBlanco === 1 ? "pregunta" : "preguntas"} en blanco.
      </p>
    );
  }
  return (
    <p className="text-sm text-ink-muted">
      Has fallado <span className="font-bold text-danger">{falladas}</span>{" "}
      {falladas === 1 ? "pregunta distinta" : "preguntas distintas"}
      {enBlanco > 0 && <> y dejaste {n(enBlanco)} en blanco</>}.
    </p>
  );
}
