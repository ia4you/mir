"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MIN_RESPUESTAS_PARA_CONTAR = 3;
const TOTAL_PREGUNTAS_ENTRENAMIENTO = 20;

export default function PuntosDebiles({ especialidades }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const debiles = especialidades
    .filter((e) => e.total >= MIN_RESPUESTAS_PARA_CONTAR)
    .sort((a, b) => a.porcentaje - b.porcentaje || b.total - a.total)
    .slice(0, 5);

  async function entrenarPuntosDebiles() {
    if (debiles.length === 0 || cargando) return;
    setError("");
    setCargando(true);
    try {
      const listaEspecialidades = debiles.map((e) => e.especialidad).join(",");
      const resPreguntas = await fetch(
        `/api/preguntas?especialidades=${encodeURIComponent(listaEspecialidades)}&cantidad=${TOTAL_PREGUNTAS_ENTRENAMIENTO}`
      );
      if (!resPreguntas.ok) throw new Error("preguntas");
      const preguntas = await resPreguntas.json();
      if (preguntas.length === 0) throw new Error("sin_preguntas");

      const resSesion = await fetch("/api/sesiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo: "puntos_debiles",
          especialidad: null,
          total_preguntas: preguntas.length,
        }),
      });

      if (resSesion.status === 403) {
        const data = await resSesion.json().catch(() => null);
        setError(data?.message || "Has alcanzado tu límite diario de preguntas.");
        setCargando(false);
        return;
      }
      if (!resSesion.ok) throw new Error("sesion");
      const { id } = await resSesion.json();

      sessionStorage.setItem(
        `mir_test_${id}`,
        JSON.stringify({ preguntas, segundosPorPregunta: null })
      );
      router.push(`/test/${id}`);
    } catch (e) {
      setError("No se ha podido preparar el test. Inténtalo de nuevo.");
      setCargando(false);
    }
  }

  return (
    <section className="mt-7 px-5">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">
        Tus 5 puntos débiles
      </h2>

      {debiles.length === 0 ? (
        <div className="rounded-2xl bg-white p-4 text-sm text-ink-muted shadow-sm">
          Responde al menos {MIN_RESPUESTAS_PARA_CONTAR} preguntas de una especialidad para que
          detectemos tus puntos débiles.
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <ul className="flex flex-col divide-y divide-track">
            {debiles.map((e, i) => (
              <li key={e.especialidad} className="flex items-center justify-between py-2.5">
                <span className="font-semibold text-ink">
                  {i + 1}. {e.especialidad}
                </span>
                <span className="font-bold text-danger">{e.porcentaje}%</span>
              </li>
            ))}
          </ul>

          {error && (
            <p className="mt-3 rounded-xl bg-danger-bg p-2 text-xs font-semibold text-danger-text">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={entrenarPuntosDebiles}
            disabled={cargando}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand font-bold text-white shadow-sm active:bg-brand-dark disabled:opacity-60"
          >
            {cargando ? "Preparando…" : "Entrenar mis puntos débiles →"}
          </button>
        </div>
      )}
    </section>
  );
}
