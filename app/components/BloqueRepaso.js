"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { iniciarConIds, LIMITE_DIARIO_FREE, SEGUNDOS_POR_PREGUNTA } from "../lib/iniciarTest";
import { INTERVALOS } from "@/lib/repaso";

// "Repaso de hoy" en /inicio: preguntas falladas que toca volver a ver hoy
// (repaso espaciado 1 · 3 · 7 · 14 · 30 días) y el botón para empezar. El
// test reutiliza el de siempre (modo "repaso_espaciado"). Si el usuario
// nunca ha fallado nada, no se muestra.
const fechaLarga = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("es-ES", { day: "numeric", month: "long", timeZone: "UTC" });

export default function BloqueRepaso() {
  const router = useRouter();
  const [datos, setDatos] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    fetch("/api/repaso/hoy")
      .then((r) => (r.ok ? r.json() : null))
      .then(setDatos)
      .catch(() => {});
  }, []);

  if (!datos || (datos.enRepaso === 0 && datos.dominadas === 0)) return null;

  const n = datos.ids.length;
  const limiteAgotado = !datos.premium && datos.pendientes > 0 && n === 0;

  async function empezar() {
    setEnviando(true);
    setAviso("");
    try {
      const r = await iniciarConIds(datos.ids, { modo: "repaso_espaciado" });
      if (r.error === "limite_diario") setAviso(r.message || "Has llegado a tu límite diario de preguntas.");
      else if (r.error) setAviso("No hay preguntas para repasar ahora mismo.");
      else return router.push(`/test/${r.id}`);
    } catch {
      setAviso("No se ha podido preparar el repaso. Inténtalo de nuevo.");
    }
    setEnviando(false);
  }

  let titulo;
  if (n > 0) titulo = `Repaso de hoy: ${n} ${n === 1 ? "pregunta" : "preguntas"}`;
  else if (limiteAgotado) titulo = "Repaso pendiente para mañana";
  else titulo = "Hoy no tienes repaso";

  let explicacion;
  if (n > 0) explicacion = "Preguntas que fallaste y que toca volver a ver hoy. Si aciertas, vuelven más tarde; si fallas, mañana.";
  else if (limiteAgotado)
    explicacion = `Hoy ya has usado tus ${LIMITE_DIARIO_FREE} preguntas. Las ${datos.pendientes} de repaso te esperan mañana.`;
  else if (datos.proximo)
    explicacion = `Próximo: ${datos.proximo.esManana ? "mañana" : `el ${fechaLarga(datos.proximo.fecha)}`} (${datos.proximo.preguntas} ${datos.proximo.preguntas === 1 ? "pregunta" : "preguntas"}).`;
  else explicacion = "Has dominado todas las preguntas que fallaste. Las que falles a partir de ahora aparecerán aquí.";

  return (
    <section
      aria-labelledby="titulo-repaso"
      className={`rounded-2xl border bg-card p-5 lg:p-6 ${n > 0 ? "border-accent" : "border-track"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Repaso espaciado</p>
          <h2 id="titulo-repaso" className="mt-1 font-serif text-3xl text-ink [text-rendering:geometricPrecision]">
            {titulo}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">{explicacion}</p>
        </div>
        {(datos.manana > 0 || datos.atrasadas > 0) && n > 0 && (
          <p className="rounded-full bg-panel px-3 py-1 font-mono text-xs text-ink-muted">
            {datos.atrasadas > 0 ? `+ ${datos.atrasadas} sin hueco hoy` : `+ ${datos.manana} para mañana`}
          </p>
        )}
      </div>

      <p className="mt-5 text-xs text-ink-subtle">Tus preguntas según su etapa de repaso</p>
      <ul className="mt-2 grid grid-cols-5 gap-2 rounded-xl bg-panel px-3 py-3" aria-label="Tus preguntas según su etapa de repaso">
        {INTERVALOS.map((dias, i) => (
          <li
            key={dias}
            title={`${datos.porNivel[i]} ${datos.porNivel[i] === 1 ? "pregunta" : "preguntas"} en la etapa de ${dias} ${dias === 1 ? "día" : "días"}`}
            className="flex flex-col items-center gap-1"
          >
            <span className={`font-mono text-lg font-semibold ${datos.porNivel[i] ? "text-ink" : "text-ink-subtle"}`}>
              {datos.porNivel[i]}
            </span>
            <span className="text-[11px] text-ink-muted">
              {dias} {dias === 1 ? "día" : "días"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-ink-subtle">
        En repaso: {datos.enRepaso} · Dominadas: {datos.dominadas}
      </p>

      {n > 0 && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={empezar}
            disabled={enviando}
            className="flex h-12 items-center justify-center rounded-xl bg-brand px-6 font-bold text-on-brand hover:bg-brand-dark disabled:opacity-60"
          >
            {enviando ? "Preparando…" : `Empezar repaso (${n}) →`}
          </button>
          <p className="text-xs text-ink-muted">
            {datos.premium
              ? `Unos ${Math.max(1, Math.round((n * SEGUNDOS_POR_PREGUNTA) / 60))} minutos.`
              : `Cuenta dentro de tus ${LIMITE_DIARIO_FREE} preguntas de hoy · te quedan ${datos.restanteHoy}.`}
          </p>
        </div>
      )}
      {aviso && (
        <p role="alert" className="mt-3 rounded-xl bg-danger-bg p-3 text-sm font-semibold text-danger-text">
          {aviso}
        </p>
      )}
    </section>
  );
}
