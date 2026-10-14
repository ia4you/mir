"use client";

import { abrirConfiguracionCookies } from "../lib/consentimiento";

// "Configurar cookies": abre el panel de ConsentimientoCookies desde cualquier
// sitio (pie de la portada, /privacidad, /cookies, Perfil). Es un botón con
// aspecto de enlace porque no navega.
export default function EnlaceConfigurarCookies({ children = "Configurar cookies", className = "" }) {
  return (
    <button type="button" onClick={abrirConfiguracionCookies} aria-haspopup="dialog" className={className}>
      {children}
    </button>
  );
}
