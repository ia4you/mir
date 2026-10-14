"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import EspecialidadesStatsTable from "../../components/EspecialidadesStatsTable";
import TemasPorEspecialidad from "../../components/TemasPorEspecialidad";
import PuntosDebiles from "../../components/PuntosDebiles";
import { getMetaDiaria } from "../../lib/preferencias";

// Carga diferida: recharts es pesado y solo hace falta cuando esta pestaña
// de evolución está visible, no en el JS inicial de /estadisticas.
const EvolucionAciertosChart = dynamic(() => import("../../components/EvolucionAciertosChart"), {
  ssr: false,
});

const ETIQUETA_MODO = {
  practica: "Práctica",
  repaso: "Repaso de fallos",
  puntos_debiles: "Puntos débiles",
  repaso_errores: "Repaso de errores",
  repaso_espaciado: "Repaso espaciado",
  simulacro: "Simulacro MIR",
};

// Punto de miles también con 4 cifras (toLocaleString("es-ES") no lo pone en 1025).
function formatearMiles(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Cifra de la fila superior: etiqueta, valor en mono, detalle y barra opcional.
function Cifra({ etiqueta, valor, detalle, porcentaje }) {
  return (
    <div className="rounded-2xl border border-track bg-card p-4 lg:p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">{etiqueta}</p>
      <p className="mt-2 font-mono text-3xl text-ink">{valor ?? "—"}</p>
      {porcentaje !== undefined && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-track" aria-hidden="true">
          <div className="h-full rounded-full bg-accent" style={{ width: `${porcentaje ?? 0}%` }} />
        </div>
      )}
      <p className="mt-2 text-xs text-ink-muted">{detalle}</p>
    </div>
  );
}

function formatearFecha(iso) {
  const d = new Date(iso);
  const fecha = d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  const hora = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return `${fecha}, ${hora}`;
}

export default function Estadisticas() {
  const [datos, setDatos] = useState(null);
  const [temas, setTemas] = useState(null);
  const [sesiones, setSesiones] = useState(null);
  const [sesionesEvolucion, setSesionesEvolucion] = useState(null);
  const [notas, setNotas] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/estadisticas?meta=${getMetaDiaria()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setDatos)
      .catch(() => setError(true));

    fetch("/api/estadisticas/notas")
      .then((r) => (r.ok ? r.json() : null))
      .then(setNotas)
      .catch(() => {});

    fetch("/api/estadisticas/temas")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setTemas(d.temas))
      .catch(() => setTemas([]));

    fetch("/api/sesiones")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setSesiones)
      .catch(() => setSesiones([]));

    // Una sola carga al montar: la agrupación por especialidad ya viene
    // resuelta del backend, así que el clic en la leyenda del gráfico solo
    // cambia qué grupo ya cargado se pinta, sin volver a pedir datos.
    fetch("/api/sesiones/evolucion")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setSesionesEvolucion)
      .catch(() => setSesionesEvolucion([]));
  }, []);

  const nota = notas?.evolucion;
  const banco = datos?.banco;
  const hayEvolucion = sesionesEvolucion && sesionesEvolucion.length > 0;
  const hayEspecialidades = !error && datos && datos.especialidades.length > 0;

  return (
    <div className="ancho-app min-h-screen pb-nav lg:px-8">
      <header className="px-5 pt-5 lg:px-0 lg:pt-10">
        <h1 className="text-2xl font-extrabold text-ink">Estadísticas</h1>
      </header>

      <section className="mt-5 grid grid-cols-2 gap-3 px-5 lg:mt-8 lg:grid-cols-4 lg:gap-6 lg:px-0">
        <Cifra
          etiqueta="Racha"
          valor={datos?.racha_dias}
          detalle={datos?.racha_dias === 1 ? "día seguido" : "días seguidos"}
        />
        <Cifra
          etiqueta="Meta diaria"
          valor={datos && `${datos.meta_diaria.respondidas_hoy}/${datos.meta_diaria.objetivo}`}
          porcentaje={datos?.meta_diaria.porcentaje}
          detalle={datos ? `${datos.meta_diaria.porcentaje} % de hoy` : "…"}
        />
        <Cifra
          etiqueta="Nota estimada"
          valor={
            nota?.nota != null
              ? nota.nota.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
              : null
          }
          detalle={
            !nota
              ? "…"
              : nota.nota != null
                ? "sobre 200 netas"
                : `Faltan ${nota.minimo - nota.respondidas} respuestas para estimarla`
          }
        />
        <Cifra
          etiqueta="Banco completado"
          valor={banco && formatearMiles(banco.respondidas)}
          porcentaje={banco ? (banco.respondidas / banco.total) * 100 : null}
          detalle={banco ? `de ${formatearMiles(banco.total)} preguntas` : "…"}
        />
      </section>

      {(hayEvolucion || hayEspecialidades) && (
        <div className="mt-7 grid gap-7 lg:mt-10 lg:grid-cols-3 lg:items-start lg:gap-6">
          {hayEvolucion && (
            <div className="lg:col-span-2">
              <EvolucionAciertosChart sesionesEvolucion={sesionesEvolucion} />
            </div>
          )}
          {hayEspecialidades && (
            <div className={hayEvolucion ? "" : "lg:col-span-3"}>
              <PuntosDebiles especialidades={datos.especialidades} />
            </div>
          )}
        </div>
      )}

      <section className="mt-7 px-5 lg:mt-10 lg:px-0">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">
          Por especialidad
        </h2>

        {error && (
          <p className="rounded-2xl bg-card p-4 text-sm text-ink-muted shadow-sm">
            No se ha podido cargar tu progreso.
          </p>
        )}

        {!error && datos && datos.especialidades.length === 0 && (
          <div className="rounded-2xl bg-card p-4 text-sm text-ink-muted shadow-sm">
            Todavía no has respondido ninguna pregunta.
          </div>
        )}

        {hayEspecialidades && <EspecialidadesStatsTable especialidades={datos.especialidades} />}

        {!error && !datos && (
          <div className="flex flex-col gap-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-[76px] animate-pulse rounded-2xl bg-card shadow-sm" />
            ))}
          </div>
        )}
      </section>

      {temas && temas.length > 0 && (
        <TemasPorEspecialidad temas={temas} especialidades={datos?.especialidades} />
      )}

      <section className="mt-7 px-5 lg:mt-10 lg:px-0">
        <Link
          href="/errores"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-accent font-bold text-accent lg:inline-flex lg:w-auto lg:px-10"
        >
          Mis errores →
        </Link>
      </section>

      <section className="mt-7 px-5 lg:mt-10 lg:px-0">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">
          Historial de sesiones
        </h2>

        {sesiones && sesiones.length === 0 && (
          <div className="rounded-2xl bg-card p-4 text-sm text-ink-muted shadow-sm">
            Todavía no has completado ningún test — ¡empieza desde{" "}
            <span className="font-semibold text-accent">Práctica</span>!
          </div>
        )}

        {sesiones && sesiones.length > 0 && (
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3">
            {sesiones.map((s) => (
              <div key={s.id} className="rounded-2xl bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-ink">{s.especialidad || "Todas las especialidades"}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {ETIQUETA_MODO[s.modo] || s.modo} · {formatearFecha(s.fecha)}
                    </p>
                  </div>
                  <span
                    className={`flex-shrink-0 font-bold ${
                      s.porcentaje > 70
                        ? "text-success"
                        : s.porcentaje >= 40
                        ? "text-warning"
                        : "text-danger"
                    }`}
                  >
                    {s.porcentaje}%
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  {s.aciertos}/{s.total_preguntas} preguntas
                </p>
              </div>
            ))}
          </div>
        )}

        {!sesiones && (
          <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[70px] animate-pulse rounded-2xl bg-card shadow-sm" />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
