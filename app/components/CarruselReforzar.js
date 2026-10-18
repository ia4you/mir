"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowRight,
  Baby,
  Bean,
  Bone,
  Brain,
  Bug,
  ChartColumn,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Ear,
  Eye,
  FlaskConical,
  Hand,
  HeartPulse,
  Ribbon,
  Scale,
  Scissors,
  Shapes,
  Siren,
  Speech,
  Stethoscope,
  Sun,
  Utensils,
  Venus,
  Wind,
  X,
} from "lucide-react";
import { fmtPorcentaje } from "@/lib/formato";
import { leerConsentimiento, EVENTO_CAMBIO } from "../lib/consentimiento";

// Ventana de /inicio con las especialidades de menos acierto del usuario (las
// elige lib/reforzar.js). Se cierra con la X, «Ahora no», Escape o al pulsar
// «Practicar», y no vuelve a salir en esta pestaña hasta cerrar sesión (ver
// /perfil).
const CLAVE = "mir_reforzar_cerrado";

export function olvidarCarruselReforzar() {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {}
}

const ICONOS = {
  Cardiología: HeartPulse,
  Neurología: Brain,
  Respiratorio: Wind,
  Oncología: Ribbon,
  Endocrinología: FlaskConical,
  Urgencias: Siren,
  Digestivo: Utensils,
  Pediatría: Baby,
  Infecciosas: Bug,
  Ginecología: Venus,
  Cirugía: Scissors,
  Traumatología: Bone,
  Nefrología: Bean,
  Psiquiatría: Speech,
  Hematología: Droplet,
  MFyC: Stethoscope,
  Reumatología: Hand,
  Bioestadística: ChartColumn,
  Dermatología: Sun,
  ORL: Ear,
  "Ética médica": Scale,
  Oftalmología: Eye,
  Miscelánea: Shapes,
};

function mensaje(e) {
  if (e.tipo === "nueva") return "Empieza con un test corto y sabrás en qué punto estás.";
  const pct = e.porcentaje;
  if (pct >= 60) return "Vas bien, pero es de tus especialidades menos fuertes. Un repaso te ayudará a mantenerla.";
  if (pct < 40) return "Aquí tienes tu mayor margen de mejora. Un test centrado en esta especialidad es la forma más rápida de subir.";
  if (pct < 50) return "Te falta poco para el aprobado. Repasar los fallos de esta especialidad es el camino más corto.";
  if (pct < 55) return "Vas por buen camino, pero aún se te escapan puntos fáciles. Un test centrado aquí te ayudará a afianzarla.";
  return "Casi la tienes. Unas cuantas sesiones más y dejará de estar en esta lista.";
}

// Rojo por debajo del 50 %, dorado del 50 al 59 % y neutro del 60 % o sin
// practicar: cabecera, cifra y barra.
const TONOS = {
  rojo: ["bg-danger-bg text-danger-text", "text-danger-text", "bg-danger-bar"],
  dorado: ["bg-brand-light text-accent", "text-accent", "bg-brand"],
  neutro: ["bg-track text-ink-muted", "text-ink", "bg-ink-muted"],
};
function tono(e) {
  if (e.tipo === "nueva" || e.porcentaje >= 60) return TONOS.neutro;
  return e.porcentaje < 50 ? TONOS.rojo : TONOS.dorado;
}

// Ancho de una tarjeta más el hueco: lo que avanza cada flecha.
function paso(ul) {
  return ul.firstElementChild.offsetWidth + parseFloat(getComputedStyle(ul).columnGap);
}

// Posición del carrusel: tarjeta en el borde izquierdo y cuántas posiciones
// hay (1 si caben todas).
function medir(ul) {
  const p = paso(ul);
  const visibles = Math.max(1, Math.round((ul.clientWidth + p - ul.firstElementChild.offsetWidth) / p));
  return { actual: Math.round(ul.scrollLeft / p), paginas: Math.max(1, ul.children.length - visibles + 1) };
}

const botonRedondo =
  "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-track bg-card text-ink hover:border-accent aria-disabled:opacity-35";

export default function CarruselReforzar({ especialidades, onPracticar, enviando, aviso }) {
  const dialogo = useRef(null);
  const lista = useRef(null);
  const titulo = useId();
  // paginas = 0 hasta medir: centrar antes de medir dejaría la lista
  // desplazada a la tarjeta del medio al quitar el centrado.
  const [pos, setPos] = useState({ actual: 0, paginas: 0 });

  useEffect(() => {
    try {
      if (sessionStorage.getItem(CLAVE)) return;
    } catch {}
    const actualizar = () => setPos(medir(lista.current));
    function abrir() {
      window.removeEventListener(EVENTO_CAMBIO, abrir);
      if (!dialogo.current.open) dialogo.current.showModal();
      actualizar();
      window.addEventListener("resize", actualizar);
    }
    // Con el aviso de cookies pendiente, espera a que el usuario elija
    // (aceptar, rechazar o configurar): la ventana lo dejaría inaccesible.
    if (leerConsentimiento()) abrir();
    else window.addEventListener(EVENTO_CAMBIO, abrir);
    return () => {
      window.removeEventListener(EVENTO_CAMBIO, abrir);
      window.removeEventListener("resize", actualizar);
    };
  }, []);

  function marcarVisto() {
    try {
      sessionStorage.setItem(CLAVE, "1");
    } catch {}
  }

  // Tab y Mayús+Tab dan la vuelta dentro de la ventana en vez de salir a la
  // barra del navegador.
  function cicloTab(ev) {
    if (ev.key !== "Tab") return;
    const botones = [...dialogo.current.querySelectorAll("button:not([disabled])")].filter((b) => b.offsetParent);
    const limite = ev.shiftKey ? botones[0] : botones.at(-1);
    if (document.activeElement === limite) {
      ev.preventDefault();
      (ev.shiftKey ? botones.at(-1) : botones[0]).focus();
    }
  }

  // Las flechas usan aria-disabled y no disabled: desactivar el botón que
  // tiene el foco lo tiraría al <body>.
  function mover(dir) {
    if (dir < 0 ? pos.actual === 0 : pos.actual >= pos.paginas - 1) return;
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lista.current.scrollBy({ left: dir * paso(lista.current), behavior: suave ? "smooth" : "auto" });
  }

  const conFlechas = pos.paginas > 1;

  return (
    <dialog
      ref={dialogo}
      aria-labelledby={titulo}
      onClose={marcarVisto}
      onKeyDown={cicloTab}
      className="dialogo-reforzar m-0 mt-auto max-h-[100dvh] w-full max-w-none overflow-y-auto rounded-t-3xl border border-track bg-surface p-0 text-ink backdrop:bg-black/75 sm:m-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100%-2rem)] sm:max-w-[1120px] sm:rounded-3xl"
    >
      <div className="relative flex flex-col gap-5 px-4 pb-7 pt-6 sm:gap-7 sm:px-10 sm:pb-9 sm:pt-10">
        <button
          type="button"
          onClick={() => dialogo.current.close()}
          aria-label="Cerrar"
          className={`absolute right-3.5 top-3.5 sm:right-5 sm:top-5 ${botonRedondo}`}
        >
          <X className="h-[18px] w-[18px]" aria-hidden="true" />
        </button>

        <div className="flex flex-col gap-1.5 pr-14 sm:gap-2.5">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-accent">Tu plan de repaso</p>
          <h2 id={titulo} className="font-serif text-[26px] leading-tight text-ink sm:text-4xl">
            Tus especialidades con menos acierto
          </h2>
          <p className="hidden max-w-xl text-ink-muted sm:block">
            Según tus respuestas. Elige una y te preparamos un test solo de esa especialidad.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {conFlechas && (
            <button
              type="button"
              onClick={() => mover(-1)}
              aria-disabled={pos.actual === 0}
              aria-label="Anteriores"
              className={`hidden sm:flex ${botonRedondo}`}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          )}

          <ul
            ref={lista}
            onScroll={() => setPos(medir(lista.current))}
            className={`flex min-w-0 flex-1 snap-x snap-mandatory gap-5 overflow-x-auto [scrollbar-width:none] ${pos.paginas === 1 ? "justify-center" : ""}`}
          >
            {especialidades.map((e) => {
              const Icono = ICONOS[e.especialidad] ?? Stethoscope;
              const [cabecera, cifra, barra] = tono(e);
              return (
                <li
                  key={e.especialidad}
                  className="flex w-full flex-shrink-0 snap-start flex-col overflow-hidden rounded-[18px] border border-track bg-card md:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
                >
                  <div
                    className={`flex h-[110px] items-center justify-center sm:h-[150px] ${cabecera}`}
                  >
                    <Icono className="h-14 w-14 sm:h-[72px] sm:w-[72px]" strokeWidth={1.4} aria-hidden="true" />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4 sm:gap-3.5 sm:px-[22px] sm:pb-[22px] sm:pt-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className="text-xl font-bold text-ink sm:text-[22px]">{e.especialidad}</h3>
                      {e.tipo !== "nueva" && (
                        <span className={`font-mono text-2xl font-semibold ${cifra}`}>{fmtPorcentaje(e.porcentaje)}</span>
                      )}
                    </div>
                    {e.tipo === "nueva" ? (
                      <p className="font-mono text-xs text-ink-muted">Todavía no la has practicado</p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <div className="h-2 overflow-hidden rounded-full bg-track" aria-hidden="true">
                          <div className={`h-full rounded-full ${barra}`} style={{ width: `${e.porcentaje}%` }} />
                        </div>
                        <p className="font-mono text-xs text-ink-muted">Tu acierto · {e.total} respondidas</p>
                        {e.tipo === "pocas" && (
                          <span className="self-start rounded-full bg-track px-2.5 py-0.5 text-xs font-semibold text-ink-muted">
                            Pocas respuestas todavía
                          </span>
                        )}
                      </div>
                    )}
                    <p className="flex-1 leading-relaxed text-ink-muted">{mensaje(e)}</p>
                    <button
                      type="button"
                      onClick={() => {
                        marcarVisto();
                        onPracticar(e.especialidad);
                      }}
                      disabled={enviando !== null}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-[15px] font-bold text-on-brand hover:bg-brand-dark disabled:opacity-60"
                    >
                      {enviando === e.especialidad ? "Preparando…" : `Practicar ${e.especialidad}`}
                      <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {conFlechas && (
            <button
              type="button"
              onClick={() => mover(1)}
              aria-disabled={pos.actual >= pos.paginas - 1}
              aria-label="Siguientes"
              className={`hidden sm:flex ${botonRedondo}`}
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {aviso && (
          <p role="alert" className="rounded-xl bg-danger-bg p-3 text-sm font-semibold text-danger-text">
            {aviso}
          </p>
        )}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {conFlechas ? (
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => mover(-1)}
                aria-disabled={pos.actual === 0}
                aria-label="Anterior"
                className={`sm:hidden ${botonRedondo}`}
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: pos.paginas }, (_, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className={`h-2 rounded-full ${i === pos.actual ? "w-6 bg-brand" : "w-2 bg-track"}`}
                  />
                ))}
                <span className="ml-1.5 font-mono text-xs text-ink-muted sm:hidden">
                  {pos.actual + 1} de {pos.paginas}
                </span>
              </div>
              <button
                type="button"
                onClick={() => mover(1)}
                aria-disabled={pos.actual >= pos.paginas - 1}
                aria-label="Siguiente"
                className={`sm:hidden ${botonRedondo}`}
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <span className="hidden sm:block" />
          )}
          <button
            type="button"
            onClick={() => dialogo.current.close()}
            className="min-h-11 rounded-xl border border-track px-[18px] font-semibold text-ink hover:border-accent"
          >
            Ahora no, prefiero un test variado
          </button>
        </div>
      </div>
    </dialog>
  );
}
