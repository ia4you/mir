"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const VENTAJAS = [
  "Preguntas ilimitadas, sin el límite de 10 al día del plan gratuito",
  "Acceso completo a las 1.004 preguntas oficiales de las 5 convocatorias",
  "Simulacros completos sin restricciones",
];

export default function Premium() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState("idle"); // idle | enviando | ok | error

  async function apuntarse(e) {
    e.preventDefault();
    setEstado("enviando");
    try {
      const res = await fetch("/api/lista-espera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email || session?.user?.email }),
      });
      if (!res.ok) throw new Error();
      setEstado("ok");
    } catch {
      setEstado("error");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-6 pb-10 pt-safe text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-light text-3xl">
        ⭐
      </div>
      <h1 className="mt-5 text-2xl font-extrabold text-ink">MIR Turel Premium</h1>
      <p className="mt-2 text-ink-muted">
        Prepara el MIR sin límites diarios, con acceso completo al banco de preguntas.
      </p>

      <ul className="mt-6 flex w-full max-w-sm flex-col gap-3 text-left">
        {VENTAJAS.map((v) => (
          <li key={v} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-success text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-3.5 w-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4 10-10" />
              </svg>
            </span>
            <span className="text-sm font-medium text-ink">{v}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 w-full max-w-sm rounded-2xl bg-brand-light p-4">
        <p className="text-sm font-bold uppercase tracking-wide text-brand">Precio</p>
        <p className="mt-1 text-2xl font-extrabold text-ink">Próximamente</p>
        <p className="mt-1 text-sm text-ink-muted">
          Estamos preparando el pago online. Apúntate y te avisamos en cuanto esté disponible.
        </p>
      </div>

      {estado === "ok" ? (
        <div className="mt-6 w-full max-w-sm rounded-2xl bg-success-bg p-4 text-sm font-semibold text-success-text">
          ¡Listo! Te avisaremos en cuanto Premium esté disponible.
        </div>
      ) : (
        <form onSubmit={apuntarse} className="mt-6 flex w-full max-w-sm flex-col gap-3">
          <input
            type="email"
            required
            value={email || session?.user?.email || ""}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="h-12 w-full rounded-xl border border-track bg-white px-4 text-center font-medium text-ink focus:border-brand focus:outline-none"
          />
          {estado === "error" && (
            <p className="text-sm font-semibold text-danger-text">
              No se ha podido registrar tu email. Inténtalo de nuevo.
            </p>
          )}
          <button
            type="submit"
            disabled={estado === "enviando"}
            className="flex h-12 w-full items-center justify-center rounded-xl bg-brand font-bold text-white shadow-sm active:bg-brand-dark disabled:opacity-60"
          >
            {estado === "enviando" ? "Enviando…" : "Avisadme cuando esté disponible"}
          </button>
        </form>
      )}

      <Link
        href="/inicio"
        className="mt-6 flex h-12 w-full max-w-xs items-center justify-center rounded-2xl border border-track font-bold text-ink"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
