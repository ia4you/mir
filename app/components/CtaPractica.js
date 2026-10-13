"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getMetaDiaria, getTemporizadorDefecto } from "../lib/preferencias";
import { cantidadParaHoy, iniciarPractica, LIMITE_DIARIO_FREE } from "../lib/iniciarTest";

// Llamada a la acción de las páginas públicas. Sin sesión (y en el HTML del
// servidor, que es el que ve Google) es el enlace a /registro de siempre; con
// sesión pasa a ser un botón que arranca una práctica con el filtro de la
// página (`lote`: { anio } / { especialidad } / { tema } / {}).
export default function CtaPractica({ texto, etiqueta, lote = {}, className, href = "/registro" }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState(null);

  if (status !== "authenticated") {
    return (
      <Link href={href} className={className}>
        {texto}
      </Link>
    );
  }

  const esPremium = session.user?.plan === "premium";

  async function empezar() {
    setEnviando(true);
    setAviso(null);
    try {
      const cantidad = await cantidadParaHoy(esPremium, getMetaDiaria());
      if (cantidad > 0) {
        const temporizador = getTemporizadorDefecto();
        const r = await iniciarPractica([{ ...lote, cantidad }], {
          especialidad: lote.especialidad ?? null,
          segundosPorPregunta: temporizador.activo ? temporizador.segundos : null,
        });
        if (r.id) {
          router.push(`/test/${r.id}`);
          return;
        }
        setAviso(r.error === "limite_diario" ? "limite" : "No hay preguntas disponibles con este filtro.");
      } else {
        setAviso("limite");
      }
    } catch {
      setAviso("No se ha podido preparar la sesión. Inténtalo de nuevo.");
    }
    setEnviando(false);
  }

  return (
    <>
      <button type="button" onClick={empezar} disabled={enviando} className={`w-full ${className} disabled:opacity-60`}>
        {enviando ? "Preparando…" : etiqueta}
      </button>
      {aviso && (
        <p role="alert" className="mt-3 rounded-xl bg-danger-bg p-3 text-sm font-semibold text-danger-text">
          {aviso === "limite" ? (
            <>
              Has llegado al límite de {LIMITE_DIARIO_FREE} preguntas de hoy del plan gratuito.{" "}
              <Link href="/premium" className="underline">
                Hazte premium
              </Link>
            </>
          ) : (
            aviso
          )}
        </p>
      )}
    </>
  );
}
