import { Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";
import DisclaimerBanner from "./components/DisclaimerBanner";
import VisitaTracker from "./components/VisitaTracker";
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
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F0" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0C0E" },
  ],
};

// Se ejecuta antes de hidratar React para fijar la clase "dark" sin parpadeo
// (flash of wrong theme). Clave duplicada de CLAVE_TEMA en app/lib/preferencias.js.
// Oscuro es el predeterminado: sin preferencia guardada se sigue al sistema,
// y solo se pasa a claro si el sistema lo pide explícitamente. El <html> ya
// sale con "dark" del servidor, así que sin JS también se ve oscuro.
const SCRIPT_TEMA = `
(function () {
  try {
    var t = localStorage.getItem("mir_tema");
    var oscuro = t === "oscuro" || (t !== "claro" && !window.matchMedia("(prefers-color-scheme: light)").matches);
    document.documentElement.classList.toggle("dark", oscuro);
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
          <DisclaimerBanner />
          <VisitaTracker />
        </Providers>
        {/* Mismo gtag.js/GA4 que antes (equivalente manual del componente
            <GoogleAnalytics> de @next/third-parties/google), pero con
            strategy="lazyOnload" en vez de su "afterInteractive" por
            defecto: se carga en tiempo muerto del navegador (requestIdleCallback)
            en vez de justo tras la hidratación, donde competía por el hilo
            principal con todo lo demás. No cambia qué se mide (mismo
            pageview automático + Enhanced Measurement de GA4), solo cuándo
            se ejecuta — verificado con Lighthouse antes/después (ver
            commit). */}
        {GA_ENABLED && (
          <>
            <Script id="ga-init" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}'${GA_DEBUG ? ", { debug_mode: true }" : ""});
              `}
            </Script>
            <Script
              strategy="lazyOnload"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
          </>
        )}
      </body>
    </html>
  );
}
