"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Imagen de una pregunta MIR con lupa: al pulsarla se amplía a pantalla
// completa (mismo aspecto que en /test). Esc, la X o un clic fuera la cierran.
export default function ImagenPregunta({ src, className = "" }) {
  const [ampliada, setAmpliada] = useState(false);

  useEffect(() => {
    if (!ampliada) return;
    const teclas = (e) => e.key === "Escape" && setAmpliada(false);
    document.addEventListener("keydown", teclas);
    return () => document.removeEventListener("keydown", teclas);
  }, [ampliada]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAmpliada(true)}
        aria-label="Ampliar imagen de la pregunta"
        className={`relative block w-full ${className}`}
      >
        <Image
          src={src}
          alt="Imagen clínica de la pregunta MIR"
          width={600}
          height={400}
          sizes="(min-width: 1024px) 560px, 100vw"
          className="h-auto w-full rounded-lg bg-panel object-contain"
        />
        <span className="pointer-events-none absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="m21 21-4.3-4.3" />
          </svg>
        </span>
      </button>

      {ampliada && (
        <div className="fixed inset-0 z-50 bg-black/90" onClick={() => setAmpliada(false)}>
          <button
            type="button"
            onClick={() => setAmpliada(false)}
            aria-label="Cerrar imagen"
            autoFocus
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
          <div className="absolute inset-6" onClick={(e) => e.stopPropagation()}>
            <Image src={src} alt="Imagen clínica de la pregunta MIR" fill className="object-contain" sizes="100vw" />
          </div>
        </div>
      )}
    </>
  );
}
