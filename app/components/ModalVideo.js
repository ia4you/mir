"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { formatoDuracion } from "@/lib/videos";

// Ventana grande para ver un vídeo (tarjeta tras fallar, /videos). El iframe
// oficial de youtube-nocookie.com solo existe mientras el modal está abierto:
// al cerrar se desmonta y el vídeo se para. Nada encima del reproductor (la X
// va fuera, arriba). `accion` es un nodo extra bajo el título (el botón de
// "Marcar como visto" de Premium, con el mismo estado que la tarjeta).
//
// Cerrar (X, Esc, clic en el fondo o el botón "atrás" del móvil) pasa siempre
// por el historial: al abrir se añade una entrada y cerrar es volver atrás,
// así "atrás" cierra el modal en vez de salir de la página. Next.js copia su
// estado interno en esa entrada, así que volver no recarga ni cambia nada.
export default function ModalVideo({ video: v, onCerrar, accion = null }) {
  const idTitulo = useId();
  const dialogo = useRef(null);
  const botonCerrar = useRef(null);
  const alCerrar = useRef(onCerrar);
  alCerrar.current = onCerrar;

  useEffect(() => {
    const previo = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    botonCerrar.current?.focus();

    window.history.pushState({ modalVideo: true }, "");
    const alVolver = () => alCerrar.current();
    window.addEventListener("popstate", alVolver);

    function teclas(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        cerrar();
      } else if (e.key === "Tab") {
        // Foco atrapado dentro del modal.
        const enfocables = [...dialogo.current.querySelectorAll("button, a[href], iframe")];
        const primero = enfocables[0];
        const ultimo = enfocables[enfocables.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    }
    document.addEventListener("keydown", teclas);

    return () => {
      window.removeEventListener("popstate", alVolver);
      document.removeEventListener("keydown", teclas);
      document.body.style.overflow = overflow;
      previo?.focus?.();
    };
  }, []);

  function cerrar() {
    if (window.history.state?.modalVideo) window.history.back();
    else alCerrar.current();
  }

  const urlYouTube = `https://www.youtube.com/watch?v=${v.youtube_id}`;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4"
      onClick={(e) => e.target === e.currentTarget && cerrar()}
    >
      <div
        ref={dialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        // 16:9, máximo 1100 px de ancho y el reproductor nunca más alto que
        // el 80 % de la pantalla; en móvil, todo el ancho menos 16 px por lado.
        style={{ width: "min(1100px, calc(100vw - 32px), calc(80vh * 16 / 9))" }}
        className="my-auto"
      >
        <div className="mb-2 flex justify-end">
          <button
            ref={botonCerrar}
            type="button"
            onClick={cerrar}
            aria-label="Cerrar vídeo"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-t-2xl bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${v.youtube_id}?autoplay=1&rel=0`}
            title={v.titulo}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
        <div className="flex flex-col gap-3 rounded-b-2xl bg-card p-4 sm:flex-row sm:items-end sm:justify-between lg:p-5">
          <div className="min-w-0">
            <h2 id={idTitulo} className="font-serif text-xl leading-snug text-ink [text-rendering:geometricPrecision] lg:text-2xl">
              {v.titulo}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Vídeo de{" "}
              <a href={v.canal_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline-offset-2 hover:underline">
                {v.canal}
              </a>
            </p>
            <p className="mt-1 font-mono text-xs text-ink-subtle">
              {formatoDuracion(v.duracion_seg)} · {v.anio}
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
            <a
              href={urlYouTube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center justify-center rounded-xl border-2 border-track px-4 text-sm font-bold text-ink active:bg-track"
            >
              Abrir en YouTube ↗
            </a>
            {accion}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
