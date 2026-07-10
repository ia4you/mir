"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import BottomNav from "./components/BottomNav";
import ResumenDiario from "./components/ResumenDiario";
import SpecialtyProgressRow from "./components/SpecialtyProgressRow";
import { getMetaDiaria } from "./lib/preferencias";

const MENSAJES_ERROR = {
  sesion_no_encontrada: "No se ha encontrado esa sesión de test. Puede que ya no exista.",
};

function AvisoDesdeUrl() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [avisoUrl, setAvisoUrl] = useState(null);

  useEffect(() => {
    const codigo = searchParams.get("error");
    if (codigo && MENSAJES_ERROR[codigo]) {
      setAvisoUrl(MENSAJES_ERROR[codigo]);
      router.replace("/");
    }
  }, [searchParams, router]);

  if (!avisoUrl) return null;

  return (
    <div className="mx-5 mt-4 flex items-start justify-between gap-3 rounded-2xl bg-badge-bg p-3 text-sm text-badge-text">
      <span>{avisoUrl}</span>
      <button
        type="button"
        onClick={() => setAvisoUrl(null)}
        aria-label="Cerrar aviso"
        className="flex-shrink-0 font-bold"
      >
        ×
      </button>
    </div>
  );
}

export default function Inicio() {
  const { data: session } = useSession();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/estadisticas?meta=${getMetaDiaria()}`)
      .then((r) => {
        if (!r.ok) throw new Error("fallo");
        return r.json();
      })
      .then(setDatos)
      .catch(() => setError(true));
  }, []);

  return (
    <div className="min-h-screen pb-28">
      <header className="px-5 pt-safe">
        <p className="text-ink-muted">Hola,</p>
        <h1 className="text-3xl font-extrabold text-ink">{session?.user?.name || "…"}</h1>
      </header>

      <Suspense fallback={null}>
        <AvisoDesdeUrl />
      </Suspense>

      <div className="mt-5">
        <ResumenDiario
          racha={datos?.racha_dias}
          metaDiariaPct={datos?.meta_diaria.porcentaje}
        />
      </div>

      <section className="mt-5 px-5">
        <Link
          href="/configuracion"
          className="flex h-14 w-full items-center justify-center rounded-2xl bg-brand text-lg font-bold text-white shadow-sm active:bg-brand-dark"
        >
          Continuar test
        </Link>
      </section>

      <section className="mt-7 px-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">
          Especialidades
        </h2>

        {error && (
          <p className="rounded-2xl bg-white p-4 text-sm text-ink-muted shadow-sm">
            No se ha podido cargar tu progreso. Inténtalo de nuevo más tarde.
          </p>
        )}

        {!error && datos && datos.especialidades.length === 0 && (
          <div className="rounded-2xl bg-white p-4 text-sm text-ink-muted shadow-sm">
            Todavía no has respondido ninguna pregunta. Pulsa{" "}
            <span className="font-semibold text-brand">Continuar test</span> para empezar a
            practicar y aquí verás tu progreso por especialidad.
          </div>
        )}

        {!error && datos && datos.especialidades.length > 0 && (
          <div className="flex flex-col gap-3">
            {datos.especialidades.slice(0, 5).map((e) => (
              <SpecialtyProgressRow
                key={e.especialidad}
                nombre={e.especialidad}
                porcentaje={e.porcentaje}
              />
            ))}
          </div>
        )}

        {!error && !datos && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[76px] animate-pulse rounded-2xl bg-white shadow-sm" />
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  );
}
