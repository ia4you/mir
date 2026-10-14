"use client";

import { useEffect } from "react";
import { leerConsentimiento, EVENTO_CAMBIO } from "../lib/consentimiento";

// Contador agregado de visitas diarias (sin identificador). Es analítica, así
// que solo cuenta con el consentimiento de análisis.
function contarVisita() {
  const clave = `visitado_hoy_${new Date().toISOString().slice(0, 10)}`;
  if (localStorage.getItem(clave)) return;
  fetch("/api/track-visit", { method: "POST" })
    .then(() => localStorage.setItem(clave, "1"))
    .catch(() => {});
}

export default function VisitaTracker() {
  useEffect(() => {
    if (leerConsentimiento()?.analitica) contarVisita();
    const alCambiar = (e) => e.detail?.analitica && contarVisita();
    window.addEventListener(EVENTO_CAMBIO, alCambiar);
    return () => window.removeEventListener(EVENTO_CAMBIO, alCambiar);
  }, []);

  return null;
}
