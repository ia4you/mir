"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { simulacrosPendientes } from "../lib/simulacroLocal";

// "Tienes un simulacro sin entregar" en /inicio: simulacros empezados en este
// dispositivo (localStorage) por esta cuenta y aún no entregados. Si el tiempo
// ya se acabó, al abrirlo se entrega lo que haya.
export default function BloqueSimulacroPendiente() {
  const { data: session } = useSession();
  const [pendiente, setPendiente] = useState(null);

  useEffect(() => {
    if (session?.user?.id) setPendiente(simulacrosPendientes(session.user.id)[0] || null);
  }, [session]);

  if (!pendiente) return null;

  const h = Math.floor(pendiente.restante / 3600);
  const m = Math.floor((pendiente.restante % 3600) / 60);
  const agotado = pendiente.restante === 0;

  return (
    <section className="rounded-2xl border-2 border-accent bg-card p-4 lg:flex lg:items-center lg:justify-between lg:gap-6 lg:p-5">
      <div>
        <p className="font-bold text-ink">Tienes un simulacro sin entregar</p>
        <p className="mt-1 text-sm text-ink-muted">
          <span className="font-mono text-ink">{pendiente.respondidas}</span> de{" "}
          <span className="font-mono text-ink">{pendiente.total}</span> respondidas ·{" "}
          {agotado ? (
            "el tiempo se ha acabado: al abrirlo se entregará lo que tengas"
          ) : (
            <>
              quedan <span className="font-mono text-ink">{h > 0 ? `${h} h ${m} min` : `${m} min`}</span>
            </>
          )}
        </p>
      </div>
      <Link
        href={`/test/${pendiente.id}`}
        className="mt-3 flex h-12 items-center justify-center rounded-xl bg-brand px-6 font-bold text-on-brand active:bg-brand-dark lg:mt-0 lg:flex-shrink-0"
      >
        {agotado ? "Entregar →" : "Continuar →"}
      </Link>
    </section>
  );
}
