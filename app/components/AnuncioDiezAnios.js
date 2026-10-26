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
        className="anuncio-caja relative max-h-[calc(100vh-32px)] w-full max-w-[520px] overflow-y-auto rounded-2xl border border-[#262c3c] bg-[#151a25] text-left shadow-2xl outline-none"
      >
        <div
          className="relative h-[120px]"
          style={{ background: "linear-gradient(135deg, hsl(212,45%,22%), hsl(236,40%,12%))" }}
        >
          <svg aria-hidden="true" viewBox="0 0 520 60" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-[60px] w-full">
            <path d="M0 30 H200 L220 30 L240 6 L262 54 L284 20 L300 30 H520"
              fill="none" stroke="#e8b84a" strokeOpacity=".55" strokeWidth="2"
              strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
          <span aria-hidden="true" className="absolute bottom-[10px] left-5 font-serif text-[48px] leading-none text-white/[.14]">
            2017-2026
          </span>
        </div>
        <button
          type="button"
          aria-label="Cerrar anuncio"
          onClick={cerrar}
          className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full text-2xl leading-none text-white/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e8b84a]"
        >
          <span aria-hidden="true">×</span>
        </button>
        <div className="p-6">
          <span className="text-xs font-bold uppercase tracking-[.12em] text-[#e8b84a]">Novedad</span>
          <h2 id="anuncio-titulo" className="mt-1 font-serif text-[32px] leading-tight text-[#f1f3f8]">
            Diez años de exámenes MIR
          </h2>
          <p className="mt-1 text-base font-semibold text-[#e8b84a]">2017-2026</p>
          <p className="mt-3 text-[15px] leading-relaxed text-[#c5cad8]">
            Ya puedes practicar con 2.082 preguntas oficiales de las diez últimas convocatorias, hacer simulacros de 210 preguntas y repasar tus fallos con vídeos.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => { marcar(); setAbierto(false); router.push("/convocatorias"); }}
              className="min-h-[44px] w-full rounded-xl bg-[#e8b84a] px-5 py-3 text-base font-bold text-[#17130a] hover:bg-[#d4a847] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Ver los exámenes
            </button>
            <button type="button" onClick={cerrar}
              className="min-h-[44px] px-3 text-sm text-[#aab1c3] underline hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e8b84a]">
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
