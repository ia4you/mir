"use client";

import { useSession } from "next-auth/react";
import AppHeader from "./AppHeader";
import LandingHeader, { ENLACES_PUBLICOS } from "./LandingHeader";
import BottomNav from "./BottomNav";

// Páginas públicas (convocatorias, especialidades, preguntas, temas,
// controversias, blog): con sesión iniciada llevan la navegación de la app;
// sin sesión (y mientras se comprueba), la cabecera pública (`children`, p. ej.
// BlogHeader, o LandingHeader con los enlaces de las páginas públicas). Miden lo
// mismo que AppHeader (h-14, lg:h-16), así que al llegar la sesión se cambia
// una por otra sin mover el contenido.
export function CabeceraConSesion({ children = <LandingHeader enlaces={ENLACES_PUBLICOS} /> }) {
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
