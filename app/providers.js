"use client";

import { SessionProvider } from "next-auth/react";

// Nota (2026-09-09): se evaluó migrar de next-auth v4 a Auth.js v5 para
// ahorrar ~9.8 KB gzip. Se descartó: el sitio ya está en 100/100 de
// rendimiento desktop (el ahorro no es perceptible) y v5 cambia la API de
// configuración, sesiones y middleware, con riesgo real sobre login/registro
// /premium. Decisión: quedarse en v4 hasta que haya una razón de peso
// distinta al tamaño de bundle para revisar esto.
export default function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}
