"use client";

import { useEffect } from "react";
import { leerConsentimiento, EVENTO_CAMBIO, borrarCookiesAnalitica } from "../lib/consentimiento";

// Google Analytics 4 solo con consentimiento: hasta que el usuario acepta la
// analítica no se inserta gtag.js ni se contacta con Google. Si la acepta en
// mitad de la visita, se carga en ese momento; si la retira, se desactiva
// (ga-disable) y se borran sus cookies. Los eventos de la app ya comprueban
// `typeof window.gtag === "function"`, así que sin consentimiento no se envían.
function cargarGA(id, debug) {
  window[`ga-disable-${id}`] = false;
  if (document.getElementById("ga-gtag")) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", id, debug ? { debug_mode: true } : {});
  const s = document.createElement("script");
  s.id = "ga-gtag";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
}

export default function AnaliticaGA({ id, debug = false }) {
  useEffect(() => {
    function aplicar(c) {
      if (c?.analitica) cargarGA(id, debug);
      else {
        window[`ga-disable-${id}`] = true;
        borrarCookiesAnalitica();
      }
    }
    const inicial = leerConsentimiento();
    if (inicial?.analitica) cargarGA(id, debug);
    const alCambiar = (e) => aplicar(e.detail);
    window.addEventListener(EVENTO_CAMBIO, alCambiar);
    return () => window.removeEventListener(EVENTO_CAMBIO, alCambiar);
  }, [id, debug]);

  return null;
}
