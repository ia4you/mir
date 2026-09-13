"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";

// Exclusivo de la landing pública (app/page.js) — no lo importa ningún otro
// sitio de la app. Necesita "use client" solo por el estado de
// abierto/cerrado del menú móvil; el resto de la landing sigue siendo un
// Server Component.
const ENLACES = [
  { href: "#hero", label: "Inicio" },
  { href: "#diferencias", label: "Por qué es distinto" },
  { href: "#controversias", label: "Controversias" },
  { href: "#especialidades", label: "Especialidades" },
];

// Reemplaza la badge oficial de Google Play (pensada para el hero, no para
// caber en una fila de menú de ~40px) por un icono de reproducción + texto,
// al mismo tamaño que el resto de los enlaces del header.
function IconoPlay({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4 3.6c0-.5.3-.9.7-1.1.4-.2.9-.2 1.3.1l12 8.4c.3.2.5.6.5 1s-.2.8-.5 1l-12 8.4c-.4.3-.9.3-1.3.1-.4-.2-.7-.6-.7-1.1V3.6Z" />
    </svg>
  );
}

export default function LandingHeader() {
  const [abierto, setAbierto] = useState(false);

  return (
    <header className="border-b border-track bg-card px-5 py-3 pt-safe">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          aria-label="Ir al inicio"
          className="flex-shrink-0"
          onClick={() => setAbierto(false)}
        >
          <Logo className="h-11 w-auto sm:h-12 md:h-14 lg:h-16" />
        </Link>

        {/* Nav principal: a partir de md cabe entera junto al logo y los
            botones de sesión. Por debajo de md se sustituye por el botón
            de menú y el desplegable de aquí abajo. */}
        <nav className="hidden items-center gap-6 md:flex">
          {ENLACES.map((enlace) => (
            <a
              key={enlace.href}
              href={enlace.href}
              className="whitespace-nowrap text-sm font-semibold text-ink hover:text-brand"
            >
              {enlace.label}
            </a>
          ))}
          <Link href="/blog" className="whitespace-nowrap text-sm font-semibold text-ink hover:text-brand">
            Blog
          </Link>
          <a
            href="https://play.google.com/store/apps/details?id=es.turel.mir"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-ink hover:text-brand"
          >
            <IconoPlay className="h-4 w-4" />
            Google Play
          </a>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login" className="whitespace-nowrap text-sm font-bold text-ink">
            Login
          </Link>
          <Link
            href="/registro"
            className="whitespace-nowrap rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white active:bg-brand-dark"
          >
            Registro
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          aria-controls="menu-landing-movil"
          aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-ink md:hidden"
        >
          {abierto ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {abierto && (
        <nav id="menu-landing-movil" className="mt-3 flex flex-col gap-1 border-t border-track pt-3 md:hidden">
          {ENLACES.map((enlace) => (
            <a
              key={enlace.href}
              href={enlace.href}
              onClick={() => setAbierto(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-semibold text-ink active:bg-panel"
            >
              {enlace.label}
            </a>
          ))}
          <Link
            href="/blog"
            onClick={() => setAbierto(false)}
            className="rounded-lg px-2 py-2.5 text-sm font-semibold text-ink active:bg-panel"
          >
            Blog
          </Link>
          <a
            href="https://play.google.com/store/apps/details?id=es.turel.mir"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setAbierto(false)}
            className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-semibold text-ink active:bg-panel"
          >
            <IconoPlay className="h-4 w-4" />
            Google Play
          </a>
          <div className="mt-2 flex flex-col gap-2 border-t border-track pt-3">
            <Link
              href="/login"
              onClick={() => setAbierto(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-bold text-ink active:bg-panel"
            >
              Login
            </Link>
            <Link
              href="/registro"
              onClick={() => setAbierto(false)}
              className="flex h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-bold text-white active:bg-brand-dark"
            >
              Registro
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
