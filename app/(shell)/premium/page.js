"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const FILAS_COMPARATIVA = [
  { caracteristica: "Preguntas por día", free: "10", premium: "∞" },
  { caracteristica: "Acceso a especialidades", free: "Todas", premium: "Todas" },
  { caracteristica: "Historial y estadísticas", free: true, premium: true },
  { caracteristica: "Repaso de fallos", free: true, premium: true },
  { caracteristica: "Simulacro completo", free: false, premium: true },
  { caracteristica: "Sin límite diario", free: false, premium: true },
];

function Celda({ valor }) {
  if (valor === true) {
    return <span className="text-success">✓</span>;
  }
  if (valor === false) {
    return <span className="text-danger">✗</span>;
  }
  return <span>{valor}</span>;
}

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
      <h1 className="mt-5 text-2xl font-extrabold text-ink">Plan Premium — MIR Turel</h1>
      <p className="mt-2 text-ink-muted">Prepara el MIR sin límites</p>

      <div className="mt-6 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-track bg-panel">
              <th className="px-3 py-2.5 font-bold text-ink">Característica</th>
              <th className="px-3 py-2.5 text-center font-bold text-ink-muted">Free</th>
              <th className="px-3 py-2.5 text-center font-bold text-brand">Premium</th>
            </tr>
          </thead>
          <tbody>
            {FILAS_COMPARATIVA.map((fila) => (
              <tr key={fila.caracteristica} className="border-b border-track last:border-0">
                <td className="px-3 py-2.5 text-ink">{fila.caracteristica}</td>
                <td className="px-3 py-2.5 text-center text-ink-muted">
                  <Celda valor={fila.free} />
                </td>
                <td className="px-3 py-2.5 text-center font-semibold text-ink">
                  <Celda valor={fila.premium} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 w-full max-w-sm rounded-2xl bg-brand-light p-4">
        <p className="text-sm font-bold uppercase tracking-wide text-brand">Precio</p>
        <p className="mt-1 text-2xl font-extrabold text-ink">Próximamente</p>
        <p className="mt-1 text-sm text-ink-muted">Lista de espera</p>
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
            {estado === "enviando" ? "Enviando…" : "Apúntame a la lista"}
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
