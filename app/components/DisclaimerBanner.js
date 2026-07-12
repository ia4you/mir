"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "mir_disclaimer_aceptado";

export default function DisclaimerBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") {
        setVisible(true);
      }
    } catch {
      // localStorage no disponible (modo privado, etc.) — no mostramos el banner
    }
  }, []);

  function aceptar() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // si no se puede persistir, al menos se cierra en esta sesión
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-track bg-white px-5 pb-safe pt-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-ink-muted">
          MIR Turel usa preguntas oficiales del Ministerio de Sanidad (dominio público). Las
          explicaciones son generadas por IA y pueden contener errores — no sustituyen material
          oficial de preparación. Consulta nuestro aviso legal.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <a
            href="/aviso-legal"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center justify-center rounded-xl border-2 border-brand px-5 text-sm font-bold text-brand"
          >
            Aviso legal
          </a>
          <button
            type="button"
            onClick={aceptar}
            className="flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-bold text-white active:bg-brand-dark"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
