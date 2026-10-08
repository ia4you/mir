"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Coma decimal y signo menos real (−), no guion.
function fmt(n, conSigno = false) {
  const txt = Math.abs(n).toLocaleString("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  if (n < 0) return `−${txt}`;
  return conSigno && n > 0 ? `+${txt}` : txt;
}

function fmtFecha(fecha) {
  return new Date(fecha).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Estilo cotización de bolsa: sin fondo ni borde. El color nunca va solo: la
// flecha y la diferencia siempre acompañan. Tonos claros solo en modo oscuro
// (ratios sobre la tarjeta: verde 5,02 claro / 8,40 oscuro; rojo 4,67 / 5,29).
const COLOR = {
  sube: "text-green-700 dark:text-green-400",
  baja: "text-danger dark:text-red-400",
};

// `sub` es la línea pequeña de debajo ("vs. hace 7 días", fecha, etc.).
function Nota({ nota, direccion, diferencia, textoIgual, textoSinRef, sub }) {
  const color = COLOR[direccion] || "text-ink-muted";
  const sube = direccion === "sube";
  const cambia = sube || direccion === "baja";
  return (
    <>
      <p className={`flex items-baseline gap-x-3 ${color}`}>
        <span className="flex items-baseline gap-x-1.5">
          <span className="text-4xl font-extrabold">{fmt(nota)}</span>
          <span className="text-sm font-normal text-ink-muted">/ 200</span>
        </span>
        <span className="flex items-baseline gap-x-1 text-base font-bold">
          {cambia ? (
            <>
              <span aria-hidden="true" className="text-xl leading-none">
                {sube ? "▲" : "▼"}
              </span>
              <span className="sr-only">{sube ? "Sube" : "Baja"}</span>
              {fmt(diferencia, true)}
            </>
          ) : (
            <>
              <span aria-hidden="true">–</span>
              {direccion === "igual" ? textoIgual : textoSinRef}
            </>
          )}
        </span>
      </p>
      {sub && <p className="mt-1 text-xs text-ink-muted">{sub}</p>}
    </>
  );
}

function Tarjeta({ titulo, children }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-sm">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">{titulo}</h2>
      {children}
    </div>
  );
}

function TarjetaEvolucion({ e }) {
  if (e.nota === null) {
    const faltan = e.respondidas < e.minimo;
    return (
      <Tarjeta titulo="Evolución">
        <p className="text-sm text-ink-muted">
          Aún no hay datos suficientes{faltan ? ` (${e.respondidas}/${e.minimo})` : ""}
        </p>
      </Tarjeta>
    );
  }
  return (
    <Tarjeta titulo="Evolución">
      <Nota
        nota={e.nota}
        direccion={e.direccion}
        diferencia={e.diferencia}
        textoIgual="sin cambios"
        textoSinRef="sin referencia aún"
        sub={e.direccion ? "vs. hace 7 días" : null}
      />
    </Tarjeta>
  );
}

function TarjetaSimulacro({ s, plan }) {
  if (plan !== "premium") {
    return (
      <Tarjeta titulo="Simulacro">
        <p className="text-sm font-semibold text-ink">🔒 Disponible en Premium</p>
        <Link href="/premium" className="mt-2 inline-block text-sm font-bold text-brand">
          Ver planes →
        </Link>
      </Tarjeta>
    );
  }
  if (!s) {
    return (
      <Tarjeta titulo="Simulacro">
        <p className="text-sm text-ink-muted">Aún no has hecho ningún simulacro</p>
        <Link
          href="/configuracion"
          className="mt-3 flex h-10 items-center justify-center rounded-xl bg-brand text-sm font-bold text-white active:bg-brand-dark"
        >
          Hacer simulacro
        </Link>
      </Tarjeta>
    );
  }
  return (
    <Tarjeta titulo="Simulacro">
      <Nota
        nota={s.nota}
        direccion={s.direccion}
        diferencia={s.diferencia}
        textoIgual="sin cambios"
        textoSinRef="sin referencia aún"
        sub={`${fmtFecha(s.fecha)} · ${s.direccion ? "vs. simulacro anterior" : "primer simulacro"}`}
      />
    </Tarjeta>
  );
}

export default function NotasInicio() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/estadisticas/notas")
      .then((r) => {
        if (!r.ok) throw new Error("fallo");
        return r.json();
      })
      .then(setDatos)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <p className="mx-5 mt-3 rounded-2xl bg-card p-4 text-sm text-ink-muted shadow-sm">
        No se han podido cargar tus notas.
      </p>
    );
  }
  if (!datos) {
    return (
      <div className="mt-3 grid grid-cols-1 gap-3 px-5">
        {[0, 1].map((i) => (
          <div key={i} className="h-[96px] animate-pulse rounded-2xl bg-card shadow-sm" />
        ))}
      </div>
    );
  }
  return (
    <section className="mt-3 grid grid-cols-1 gap-3 px-5">
      <TarjetaEvolucion e={datos.evolucion} />
      <TarjetaSimulacro s={datos.simulacro} plan={datos.plan} />
    </section>
  );
}
