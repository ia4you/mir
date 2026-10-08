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

// El color nunca va solo: la flecha y la diferencia siempre acompañan.
const COLOR_NOTA = { sube: "text-success", baja: "text-danger" };
const COLOR_PILDORA = {
  sube: "bg-success-bg text-success-text",
  baja: "bg-danger-bg text-danger-text",
};

function Nota({ nota, direccion, diferencia, textoIgual, textoCompara, textoSinRef }) {
  const claseNota = COLOR_NOTA[direccion] || "text-ink-muted";
  return (
    <>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className={`text-3xl font-extrabold ${claseNota}`}>{fmt(nota)}</span>
        <span className="text-sm text-ink-muted">/ 200</span>
      </p>
      {direccion === "sube" || direccion === "baja" ? (
        <p className="mt-2 text-xs text-ink-muted">
          <span
            className={`mr-1.5 inline-block rounded-full px-2 py-0.5 font-bold ${COLOR_PILDORA[direccion]}`}
          >
            {direccion === "sube" ? "▲" : "▼"} {fmt(diferencia, true)}
          </span>
          {textoCompara}
        </p>
      ) : (
        <p className="mt-2 text-xs text-ink-muted">
          {direccion === "igual" ? textoIgual : textoSinRef}
        </p>
      )}
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
        textoCompara="respecto a hace 7 días"
        textoIgual="sin cambios respecto a hace 7 días"
        textoSinRef="sin referencia aún"
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
        textoCompara="respecto al anterior"
        textoIgual="sin cambios respecto al anterior"
        textoSinRef="primer simulacro"
      />
      <p className="mt-1 text-xs text-ink-muted">{fmtFecha(s.fecha)}</p>
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
      <div className="mt-3 grid grid-cols-2 gap-3 px-5">
        {[0, 1].map((i) => (
          <div key={i} className="h-[104px] animate-pulse rounded-2xl bg-card shadow-sm" />
        ))}
      </div>
    );
  }
  return (
    <section className="mt-3 grid grid-cols-2 gap-3 px-5">
      <TarjetaEvolucion e={datos.evolucion} />
      <TarjetaSimulacro s={datos.simulacro} plan={datos.plan} />
    </section>
  );
}
