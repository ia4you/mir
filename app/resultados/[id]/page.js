"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SpecialtyProgressRow from "../../components/SpecialtyProgressRow";

export default function Resultados({ params }) {
  const router = useRouter();
  const sesionId = params.id;

  const [datos, setDatos] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [repasando, setRepasando] = useState(false);

  useEffect(() => {
    fetch(`/api/sesiones/${sesionId}/resultado`)
      .then((r) => {
        if (!r.ok) throw new Error("no encontrada");
        return r.json();
      })
      .then(setDatos)
      .catch(() => setNotFound(true));
  }, [sesionId]);

  useEffect(() => {
    if (notFound) {
      router.replace("/?error=sesion_no_encontrada");
    }
  }, [notFound, router]);

  async function repasarFallos() {
    if (!datos || datos.preguntas_falladas.length === 0 || repasando) return;
    setRepasando(true);
    try {
      const idsParam = datos.preguntas_falladas.join(",");
      const resPreguntas = await fetch(`/api/preguntas?ids=${idsParam}`);
      const preguntas = await resPreguntas.json();

      const resSesion = await fetch("/api/sesiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo: "repaso",
          especialidad: null,
          total_preguntas: preguntas.length,
        }),
      });
      const { id: nuevoId } = await resSesion.json();

      sessionStorage.setItem(
        `mir_test_${nuevoId}`,
        JSON.stringify({ preguntas, segundosPorPregunta: null })
      );
      router.push(`/test/${nuevoId}`);
    } catch (e) {
      setRepasando(false);
    }
  }

  if (notFound) return null;

  if (!datos) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-ink-muted">Cargando resultados…</p>
      </div>
    );
  }

  const tiempoMedio =
    datos.duracion_segundos != null && datos.total_preguntas > 0
      ? Math.round(datos.duracion_segundos / datos.total_preguntas)
      : null;

  const sinFallos = datos.preguntas_falladas.length === 0;

  return (
    <div className="min-h-screen pb-10">
      <header className="rounded-b-3xl bg-brand px-5 pb-8 pt-safe text-center text-white">
        <p className="mt-2 text-sm">Resultados de la sesión</p>
        <p className="mt-2 text-5xl font-extrabold">
          {datos.aciertos}/{datos.total_preguntas}
        </p>
        <p className="mt-2 text-lg">{datos.porcentaje_aciertos}% de aciertos</p>
      </header>

      <section className="-mt-6 px-5">
        <div className="grid grid-cols-3 divide-x divide-track rounded-2xl bg-white py-4 shadow-sm">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-success">{datos.aciertos}</p>
            <p className="text-sm text-ink-muted">Aciertos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-danger">{datos.fallos}</p>
            <p className="text-sm text-ink-muted">Fallos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold text-ink">
              {tiempoMedio !== null ? `${tiempoMedio}s` : "—"}
            </p>
            <p className="text-sm text-ink-muted">T. medio</p>
          </div>
        </div>
      </section>

      {datos.desglose_especialidad.length > 0 && (
        <section className="mt-6 px-5">
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-ink-muted">
            Por especialidad
          </h2>
          <div className="divide-y divide-track">
            {datos.desglose_especialidad.map((e) => (
              <SpecialtyProgressRow
                key={e.especialidad}
                nombre={e.especialidad}
                porcentaje={e.porcentaje}
                variante="plain"
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 flex gap-3 px-5">
        <button
          type="button"
          onClick={repasarFallos}
          disabled={sinFallos || repasando}
          className="h-14 flex-1 rounded-2xl border-2 border-brand font-bold text-brand disabled:border-track disabled:text-ink-muted"
        >
          {repasando ? "Preparando…" : "Repasar fallos"}
        </button>
        <Link
          href="/"
          className="flex h-14 flex-1 items-center justify-center rounded-2xl bg-brand font-bold text-white active:bg-brand-dark"
        >
          Volver al inicio
        </Link>
      </section>
    </div>
  );
}
