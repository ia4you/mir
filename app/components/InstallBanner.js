"use client";

import { useEffect, useRef, useState } from "react";

const SESSION_KEY = "mir_install_banner_cerrado";

function detectarIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function detectarMovil() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function detectarStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true // bandera antigua de iOS Safari
  );
}

export default function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const [esIOS, setEsIOS] = useState(false);
  const [mostrarInstruccionesIOS, setMostrarInstruccionesIOS] = useState(false);
  const deferredPromptRef = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {
      // sessionStorage no disponible (modo privado, etc.) — no mostramos el banner
    }
    if (detectarStandalone() || !detectarMovil()) return;

    if (detectarIOS()) {
      setEsIOS(true);
      setVisible(true);
      return;
    }

    // Android/Chrome: solo aparece si el navegador considera la PWA instalable
    // y dispara este evento (criterios de manifest + service worker + heurística).
    function onBeforeInstallPrompt(e) {
      e.preventDefault();
      deferredPromptRef.current = e;
      setVisible(true);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  // Igual que DisclaimerBanner: reserva su altura real como padding del body
  // mientras esté visible, componiendo con el padding que ya haya reservado
  // otro banner fixed (para que no se tapen entre sí ni tapen contenido).
  useEffect(() => {
    if (!visible || !ref.current) return;
    const altoPropio = ref.current.offsetHeight;
    const paddingPrevio = parseInt(document.body.style.paddingBottom || "0", 10);
    document.body.style.paddingBottom = `${paddingPrevio + altoPropio}px`;
    ref.current.style.bottom = `${paddingPrevio}px`;
    return () => {
      document.body.style.paddingBottom = `${paddingPrevio}px`;
    };
  }, [visible]);

  function cerrar() {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // si no se puede persistir, al menos se cierra en esta sesión
    }
    setVisible(false);
    setMostrarInstruccionesIOS(false);
  }

  async function instalar() {
    if (esIOS) {
      setMostrarInstruccionesIOS(true);
      return;
    }
    const prompt = deferredPromptRef.current;
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice.catch(() => {});
    deferredPromptRef.current = null;
    cerrar();
  }

  if (!visible) return null;

  return (
    <>
      <div
        ref={ref}
        className="fixed inset-x-0 bottom-0 z-40 bg-brand px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.15)]"
      >
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <img src="/icons/icon-192.png" alt="" className="h-11 w-11 flex-shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">Añade MIR Turel a tu pantalla de inicio</p>
            <p className="text-xs text-white/80">Ábrela siempre de un toque, sin navegador</p>
          </div>
          <button
            type="button"
            onClick={instalar}
            className="flex-shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-bold text-brand active:bg-white/90"
          >
            Instalar
          </button>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar"
            className="flex-shrink-0 text-white/80"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      </div>

      {mostrarInstruccionesIOS && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 px-4 pb-24"
          onClick={() => setMostrarInstruccionesIOS(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-bold text-ink">Instalar MIR Turel</p>
            <p className="mt-2 text-sm text-ink-muted">
              Pulsa el botón compartir <span className="font-bold">(□↑)</span> y luego{" "}
              <span className="font-bold">&quot;Añadir a pantalla de inicio&quot;</span>.
            </p>
            <button
              type="button"
              onClick={() => setMostrarInstruccionesIOS(false)}
              className="mt-4 h-11 w-full rounded-xl bg-brand font-bold text-white"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
