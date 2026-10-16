import { Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";
import DisclaimerBanner from "./components/DisclaimerBanner";
import VisitaTracker from "./components/VisitaTracker";
import ConsentimientoCookies from "./components/ConsentimientoCookies";
import AnaliticaGA from "./components/AnaliticaGA";
import Providers from "./providers";

// Geist no está en el next/font/google de Next 14.2: woff2 variables (subset
// latin, de Google Fonts) servidos en local. Licencia en app/fonts/OFL.txt.
const geist = localFont({
  src: "./fonts/Geist-Variable.woff2",
  weight: "100 900",
  variable: "--font-geist",
  display: "swap",
});
const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  weight: "100 900",
  variable: "--font-geist-mono",
  display: "swap",
});
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://mir.turel.es"),
  title: "MIR Turel",
  description: "Practica el examen MIR con preguntas reales de convocatorias anteriores.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "MIR Turel",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0C0E", // oscuro por defecto; aplicarTema lo cambia si se elige claro
};

// Se ejecuta antes de hidratar React para fijar la clase "dark" sin parpadeo
// (flash of wrong theme). Clave duplicada de CLAVE_TEMA en app/lib/preferencias.js.
// Oscuro es el tema principal y siempre el predeterminado: se ignora
// prefers-color-scheme y solo se pasa a claro si el usuario lo eligió
// ("claro" en mir_tema). El <html> ya sale con "dark" del servidor, así que
// sin JS también se ve oscuro. El antiguo valor "sistema" se migra a "oscuro".
// theme-color: misma lógica que aplicarTema() en app/lib/preferencias.js.
const SCRIPT_TEMA = `
(function () {
  try {
    var t = localStorage.getItem("mir_tema");
    if (t === "sistema") localStorage.setItem("mir_tema", "oscuro");
    if (t === "claro") {
      document.documentElement.classList.remove("dark");
      var m = document.querySelector('meta[name="theme-color"]');
      if (m) m.setAttribute("content", "#F7F5F0");
    }
  } catch (e) {}
})();
`;

// Solo se carga en producción: evita contaminar la propiedad GA4 real con
// tráfico de desarrollo/preview. GA_MEASUREMENT_ID vacío en local si no se
// define NEXT_PUBLIC_GA_MEASUREMENT_ID en .env.local.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_ENABLED = process.env.NODE_ENV === "production" && !!GA_MEASUREMENT_ID;
// NEXT_PUBLIC_GA_DEBUG=true manda debug_mode a GA4: los eventos aparecen al
// instante en GA4 > Admin > DebugView en vez de esperar horas al informe
// estándar. Pensado para activarlo puntualmente (local apuntando al build de
// producción, o como variable temporal en Dokploy), no para dejarlo siempre.
const GA_DEBUG = process.env.NEXT_PUBLIC_GA_DEBUG === "true";

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} ${instrument.variable} font-sans antialiased bg-surface text-ink`}>
        <Providers>
          <main>{children}</main>
          <ServiceWorkerRegister />
          <ConsentimientoCookies />
          <DisclaimerBanner />
          <VisitaTracker />
        </Providers>
        {/* GA4 solo con consentimiento de cookies de análisis (guía de la
            AEPD): AnaliticaGA no inserta gtag.js ni contacta con Google hasta
            que el usuario acepta en ConsentimientoCookies. Los eventos de la
            app comprueban typeof window.gtag, así que sin consentimiento no se
            envían ni dan error. */}
        {GA_ENABLED && <AnaliticaGA id={GA_MEASUREMENT_ID} debug={GA_DEBUG} />}
      </body>
    </html>
  );
}
