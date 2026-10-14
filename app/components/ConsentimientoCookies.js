"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  leerConsentimiento,
  guardarConsentimiento,
  EVENTO_ABRIR,
} from "../lib/consentimiento";

// Banner de cookies (guía de la AEPD): "Aceptar" y "Rechazar" con el mismo
// peso visual y "Configurar" para elegir por categoría. Sale mientras no haya
// una elección válida (o haya caducado, 12 meses). Los enlaces "Configurar
// cookies" abren el mismo panel con abrirConfiguracionCookies(). El aviso
// global (DisclaimerBanner) espera a que haya elección, así nunca se apilan.
export default function ConsentimientoCookies() {
  const [banner, setBanner] = useState(false);
  const [panel, setPanel] = useState(false);
  const [analitica, setAnalitica] = useState(false);
  const barra = useRef(null);

  useEffect(() => {
    if (!leerConsentimiento()) setBanner(true);
    function abrir() {
      setAnalitica(leerConsentimiento()?.analitica === true);
      setPanel(true);
    }
    window.addEventListener(EVENTO_ABRIR, abrir);
    return () => window.removeEventListener(EVENTO_ABRIR, abrir);
  }, []);

  // Como el aviso global: la barra es fija y reserva su alto en el body para
  // no tapar botones al final de la página.
  useEffect(() => {
    if (!banner || !barra.current) return;
    const el = barra.current;
    const observer = new ResizeObserver(() => {
      document.body.style.paddingBottom = `${el.offsetHeight}px`;
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.body.style.paddingBottom = "";
    };
  }, [banner]);

  function elegir(valor) {
    guardarConsentimiento(valor);
    setBanner(false);
    setPanel(false);
  }

  const claseBoton =
    "flex min-h-11 flex-1 items-center justify-center rounded-xl border-2 border-accent px-5 text-sm font-bold text-ink active:bg-track sm:w-32 sm:flex-none";

  return (
    <>
      {banner && !panel && (
        <div
          ref={barra}
          role="region"
          aria-label="Aviso de cookies"
          className="fixed inset-x-0 bottom-0 z-50 border-t border-track bg-card px-4 pb-safe pt-4 shadow-[0_-4px_16px_rgba(0,0,0,0.12)]"
        >
          <div className="mx-auto flex max-w-[1240px] flex-col gap-3 pb-4 lg:flex-row lg:items-center lg:gap-8">
            <p className="flex-1 text-sm leading-relaxed text-ink-muted">
              Usamos cookies técnicas para que la web funcione y, solo si aceptas, cookies de análisis de
              Google Analytics para saber cómo se usa. Puedes cambiar tu elección cuando quieras en
              «Configurar cookies».{" "}
              <Link href="/cookies" className="font-semibold text-accent underline underline-offset-2">
                Más información
              </Link>
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
              <button type="button" onClick={() => elegir(false)} className={claseBoton}>
                Rechazar
              </button>
              <button type="button" onClick={() => elegir(true)} className={claseBoton}>
                Aceptar
              </button>
              <button
                type="button"
                onClick={() => {
                  setAnalitica(false);
                  setPanel(true);
                }}
                aria-haspopup="dialog"
                className="flex min-h-11 w-full items-center justify-center px-3 text-sm font-semibold text-accent underline underline-offset-2 sm:w-auto"
              >
                Configurar
              </button>
            </div>
          </div>
        </div>
      )}

      {panel && (
        <PanelCookies
          analitica={analitica}
          setAnalitica={setAnalitica}
          onGuardar={() => elegir(analitica)}
          onCerrar={() => setPanel(false)}
        />
      )}
    </>
  );
}

function PanelCookies({ analitica, setAnalitica, onGuardar, onCerrar }) {
  const dialogo = useRef(null);
  // En un ref para que el efecto de abajo se ejecute solo al abrir (si no, cada
  // cambio de interruptor lo repetiría y devolvería el foco al primer botón).
  const cerrar = useRef(onCerrar);
  cerrar.current = onCerrar;

  useEffect(() => {
    const previo = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogo.current?.querySelector("button")?.focus();
    function teclas(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        cerrar.current();
      } else if (e.key === "Tab") {
        const enfocables = [...dialogo.current.querySelectorAll("button:not([disabled]), a[href]")];
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
      document.removeEventListener("keydown", teclas);
      document.body.style.overflow = overflow;
      previo?.focus?.();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center overflow-y-auto bg-black/70 p-4 sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div
        ref={dialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-cookies"
        className="w-full max-w-lg rounded-2xl border border-track bg-card p-5 shadow-xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="titulo-cookies" className="font-serif text-2xl text-ink [text-rendering:geometricPrecision]">
            Configurar cookies
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-panel hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <ul className="mt-4 flex flex-col gap-3">
          <li className="rounded-xl bg-panel p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="font-bold text-ink">Técnicas</p>
              <Interruptor activo bloqueado etiqueta="Cookies técnicas (siempre activas)" />
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              Necesarias para que la web funcione: tu sesión, tus preferencias y tu elección sobre cookies.
              Siempre activas.
            </p>
          </li>
          <li className="rounded-xl bg-panel p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="font-bold text-ink">Análisis (Google Analytics)</p>
              <Interruptor activo={analitica} onCambiar={() => setAnalitica(!analitica)} etiqueta="Cookies de análisis" />
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              Nos ayudan a saber cómo se usa la web, de forma agregada: Google Analytics 4 y nuestro contador
              de visitas diarias. Desactivadas salvo que las aceptes.
            </p>
          </li>
        </ul>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/cookies" onClick={onCerrar} className="text-sm font-semibold text-accent underline underline-offset-2">
            Política de cookies
          </Link>
          <button
            type="button"
            onClick={onGuardar}
            className="flex min-h-11 items-center justify-center rounded-xl bg-brand px-6 text-sm font-bold text-on-brand active:bg-brand-dark"
          >
            Guardar mi elección
          </button>
        </div>
      </div>
    </div>
  );
}

function Interruptor({ activo, onCambiar, bloqueado = false, etiqueta }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      disabled={bloqueado}
      onClick={onCambiar}
      className="flex h-11 min-w-[52px] flex-shrink-0 items-center justify-center disabled:cursor-not-allowed"
    >
      <span
        className={`flex h-7 w-12 items-center rounded-full p-[3px] transition-colors motion-reduce:transition-none ${
          activo ? "bg-brand" : "bg-track"
        } ${bloqueado ? "opacity-60" : ""}`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${
            activo ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
