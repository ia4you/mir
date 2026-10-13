"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import AppHeader from "./AppHeader";
import Logo from "./Logo";
import BottomNav from "./BottomNav";

// Páginas públicas (convocatorias, especialidades, preguntas, temas,
// controversias, blog): con sesión iniciada llevan la navegación de la app;
// sin sesión (y mientras se comprueba), la cabecera pública (`children`, p. ej.
// BlogHeader, o solo el logo). Las dos miden lo mismo (h-14, lg:h-16), así que al
// llegar la sesión se cambia una por otra sin mover el contenido.
function CabeceraPublica() {
  return (
    <header className="border-b border-track bg-card px-5 pt-safe lg:px-8">
      <div className="flex h-14 items-center lg:mx-auto lg:h-16 lg:max-w-[1240px]">
        <Link href="/" aria-label="Ir al inicio" className="flex-shrink-0">
          <Logo className="flex min-h-[44px] items-center text-3xl" />
        </Link>
      </div>
    </header>
  );
}

export function CabeceraConSesion({ children = <CabeceraPublica /> }) {
  const { status } = useSession();
  return status === "authenticated" ? <AppHeader forzar /> : children;
}

// Barra inferior móvil con sesión, más un hueco de su alto para que no tape
// el final de la página.
export function BarraConSesion() {
  const { status } = useSession();
  if (status !== "authenticated") return null;
  return (
    <>
      <div className="pb-nav lg:hidden" aria-hidden="true" />
      <BottomNav forzar />
    </>
  );
}

export default function LayoutPublico({ children }) {
  return (
    <>
      <CabeceraConSesion />
      {children}
      <BarraConSesion />
    </>
  );
}
