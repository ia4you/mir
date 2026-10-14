"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Logo from "./Logo";
import ThemeSwitch from "./ThemeSwitch";

// Cabecera pública: la de la portada (con anclas a sus secciones) y, sin
// sesión, la de las páginas públicas (con ENLACES_PUBLICOS, vía
// NavegacionSesion). Mide lo mismo que AppHeader (h-14, lg:h-16) para que al
// llegar la sesión se cambie una por otra sin mover el contenido. Necesita
// "use client" solo por el estado de abierto/cerrado del menú.
const ENLACES_PORTADA = [
  { href: "#hero", label: "Inicio" },
  { href: "#diferencias", label: "Por qué es distinto" },
  { href: "#controversias", label: "Controversias" },
  { href: "#especialidades", label: "Especialidades" },
];

export const ENLACES_PUBLICOS = [
  { href: "/", label: "Inicio" },
  { href: "/convocatorias", label: "Exámenes MIR" },
  { href: "/especialidades", label: "Especialidades" },
  { href: "/controversias", label: "Controversias" },
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

export default function LandingHeader({ enlaces = ENLACES_PORTADA }) {
  const [abierto, setAbierto] = useState(false);
  // La portada muestra esta cabecera también con sesión: ahí, en vez de Login
  // y Crear cuenta, "Ir a mi panel". Mientras se comprueba la sesión (y para
  // los rastreadores) se pinta la versión sin sesión.
  const conSesion = useSession().status === "authenticated";

  return (
    <header className="border-b border-track bg-card px-4 pt-safe max-[359px]:px-3 md:px-5 lg:px-8">
      <div className="flex h-14 items-center justify-between gap-2 md:gap-3 lg:mx-auto lg:h-16 lg:max-w-[1240px]">
        <Link
          href="/"
          aria-label="Ir al inicio"
          className="flex-shrink-0"
          onClick={() => setAbierto(false)}
        >
          <Logo className="flex min-h-[44px] items-center text-3xl max-[389px]:text-[26px] max-[359px]:text-[22px] sm:text-4xl" />
        </Link>

        {/* Nav principal: a partir de xl (1280 px) cabe entera junto al logo,
            el interruptor y los botones de sesión (por debajo desbordaba la
            pantalla). Por debajo de xl se sustituye por el botón de menú y el
            desplegable de aquí abajo; Login y Crear cuenta siguen visibles en la barra. */}
        <nav className="hidden items-center gap-6 xl:flex">
          {enlaces.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              className="whitespace-nowrap text-sm font-semibold text-ink hover:text-accent"
            >
              {enlace.label}
            </Link>
          ))}
          <Link href="/blog" className="whitespace-nowrap text-sm font-semibold text-ink hover:text-accent">
            Blog
          </Link>
          <Link href="/contacto" className="whitespace-nowrap text-sm font-semibold text-ink hover:text-accent">
            Contacto
          </Link>
          <a
            href="https://play.google.com/store/apps/details?id=es.turel.mir"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-ink hover:text-accent"
          >
            <IconoPlay className="h-4 w-4" />
            Google Play
          </a>
        </nav>

        {/* Un solo ThemeSwitch, a la izquierda de Login/Crear cuenta. */}
        <div className="flex items-center gap-1 md:gap-4">
          <ThemeSwitch compactoMovil />

          {/* Visibles en todos los anchos (también siguen en el menú); por
              debajo de md, compactos pero con 40 px de alto para pulsar. Por
              debajo de 405 px el interruptor pasa a botón redondo, por debajo
              de 390 px el logo baja a 26 px y por debajo de 375 px no cabe
              Login (queda en el menú); por debajo de 360 px se reducen logo y
              márgenes para que quepa Crear cuenta. */}
          {conSesion ? (
            <Link
              href="/inicio"
              className="flex h-10 items-center whitespace-nowrap rounded-lg bg-brand px-2.5 text-[13px] font-bold text-on-brand active:bg-brand-dark md:px-4 md:text-sm"
            >
              Ir a mi panel
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 md:gap-4">
              <Link href="/login" className="flex h-10 items-center whitespace-nowrap text-sm font-bold text-ink max-[374px]:hidden">
                Login
              </Link>
              <Link
                href="/registro"
                className="flex h-10 items-center whitespace-nowrap rounded-lg bg-brand px-2 text-[13px] font-bold text-on-brand active:bg-brand-dark md:px-4 md:text-sm"
              >
                Crear cuenta
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-controls="menu-landing-movil"
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-ink xl:hidden"
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
      </div>

      {abierto && (
        <nav id="menu-landing-movil" className="flex flex-col gap-1 border-t border-track pb-3 pt-3 xl:hidden">
          {enlaces.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              onClick={() => setAbierto(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-semibold text-ink active:bg-panel"
            >
              {enlace.label}
            </Link>
          ))}
          <Link
            href="/blog"
            onClick={() => setAbierto(false)}
            className="rounded-lg px-2 py-2.5 text-sm font-semibold text-ink active:bg-panel"
          >
            Blog
          </Link>
          <Link
            href="/contacto"
            onClick={() => setAbierto(false)}
            className="rounded-lg px-2 py-2.5 text-sm font-semibold text-ink active:bg-panel"
          >
            Contacto
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
            {conSesion ? (
              <Link
                href="/inicio"
                onClick={() => setAbierto(false)}
                className="flex h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-bold text-on-brand active:bg-brand-dark"
              >
                Ir a mi panel
              </Link>
            ) : (
              <>
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
                  className="flex h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-bold text-on-brand active:bg-brand-dark"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
