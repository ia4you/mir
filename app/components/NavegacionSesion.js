"use client";

import { useSession } from "next-auth/react";
import AppHeader from "./AppHeader";
import BottomNav from "./BottomNav";

// Páginas públicas (convocatorias, especialidades, preguntas, temas,
// controversias, blog): con sesión iniciada llevan la navegación de la app;
// sin sesión, lo de siempre (`children`, p. ej. BlogHeader, o nada).
export function CabeceraConSesion({ children = null }) {
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
