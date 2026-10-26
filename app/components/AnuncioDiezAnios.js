"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// Para retirar el anuncio: quitar <AnuncioDiezAnios /> de app/page.js.
// Para volver a mostrarlo a quien ya lo cerró: subir la versión de CLAVE.
const CLAVE = "anuncio-diez-anios-v1";

function marcar() {
  try { localStorage.setItem(CLAVE, "1"); } catch {}
}

export default function AnuncioDiezAnios() {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef(null);
  const previo = useRef(null);
  const router = useRouter();

  // Solo en cliente: nada en el HTML del servidor.
  useEffect(() => {
    let visto = false;
    try { visto = !!localStorage.getItem(CLAVE); } catch {}
    if (visto) return;
    const t = setTimeout(() => {
      previo.current = document.activeElement;
      setAbierto(true);
    }, 800);
    return () => clearTimeout(t);
  }, []);

  function cerrar() {
    marcar();
    setAbierto(false);
  }

  useEffect(() => {
    if (!abierto) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    caja.current?.focus();
    function onKey(e) {
      if (e.key === "Escape") return cerrar();
      if (e.key !== "Tab") return;
      const f = caja.current.querySelectorAll("a[href],button");
      const primero = f[0], ultimo = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === primero || document.activeElement === caja.current)) {
        e.preventDefault(); ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault(); primero.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previo.current?.focus?.();
    };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div
      className="anuncio-fondo fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
      onMouseDown={(e) => e.target === e.currentTarget && cerrar()}
    >
      <div
        ref={caja}
        role="dialog"
        aria-modal="true"
        aria-labelledby="anuncio-titulo"
        tabIndex={-1}
        className="anuncio-caja relative max-h-[calc(100vh-32px)] w-full max-w-[720px] overflow-y-auto rounded-2xl border border-[#262c3c] bg-[#151a25] text-left shadow-2xl outline-none"
      >
        <div
          className="relative h-[200px] overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(212,45%,22%), hsl(236,40%,12%))" }}
        >
          <svg aria-hidden="true" viewBox="0 0 720 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-x-0 top-0 h-[100px] w-full">
            <path d="M0 50 H280 L310 50 L335 12 L365 88 L395 32 L420 50 H720"
              fill="none" stroke="#e8b84a" strokeOpacity=".6" strokeWidth="2.5"
              strokeLinejoin="round" strokeLinecap="round" />
          </svg>
          <span aria-hidden="true" className="absolute bottom-3 left-5 font-serif text-[72px] leading-none text-white/[.14]">
            2017-2026
          </span>
        </div>
        <button
          type="button"
          aria-label="Cerrar anuncio"
          onClick={cerrar}
          className="absolute right-3 top-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-[#0d1016]/70 text-white hover:bg-[#0d1016] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e8b84a]"
        >
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4l12 12M16 4L4 16" /></svg>
        </button>
        <div className="p-6 sm:px-10 sm:py-9">
          <span className="text-[13px] font-bold uppercase tracking-[.12em] text-[#e8b84a]">Novedad</span>
          <h2 id="anuncio-titulo" className="mt-1 font-serif text-[34px] leading-tight sm:text-[48px] text-[#f1f3f8]">
            Diez años de exámenes MIR
          </h2>
          <p className="mt-1 text-xl font-semibold text-[#e8b84a]">2017-2026</p>
          <p className="mt-3 text-lg leading-[1.55] text-[#c5cad8]">
            Ya puedes practicar con 2.082 preguntas oficiales de las diez últimas convocatorias, hacer simulacros de 210 preguntas y repasar tus fallos con vídeos.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => { marcar(); setAbierto(false); router.push("/convocatorias"); }}
              className="min-h-[56px] w-full sm:w-auto sm:px-12 rounded-xl bg-[#e8b84a] px-5 py-3 text-[17px] font-bold text-[#17130a] hover:bg-[#d4a847] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Ver los exámenes
            </button>
            <button type="button" onClick={cerrar}
              className="min-h-[44px] px-3 text-base text-[#aab1c3] underline hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e8b84a]">
              Ahora no
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes anuncio-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .anuncio-fondo,.anuncio-caja{animation:anuncio-in .25s ease-out}
        @media (prefers-reduced-motion:reduce){.anuncio-fondo,.anuncio-caja{animation:none}}
      `}</style>
    </div>
  );
}
