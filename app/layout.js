import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";
import DisclaimerBanner from "./components/DisclaimerBanner";
import VisitaTracker from "./components/VisitaTracker";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
  themeColor: "#00838A",
};

// Se ejecuta antes de hidratar React para fijar la clase "dark" sin parpadeo
// (flash of wrong theme). Clave duplicada de CLAVE_TEMA en app/lib/preferencias.js.
const SCRIPT_TEMA = `
(function () {
  try {
    var t = localStorage.getItem("mir_tema");
    var oscuro = t === "oscuro" || (t !== "claro" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", oscuro);
  } catch (e) {}
})();
`;

// Solo se carga en producción: evita contaminar la propiedad GA4 real con
// tráfico de desarrollo/preview. GA_MEASUREMENT_ID vacío en local si no se
// define NEXT_PUBLIC_GA_MEASUREMENT_ID en .env.local.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GA_ENABLED = process.env.NODE_ENV === "production" && !!GA_MEASUREMENT_ID;

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-surface text-ink`}>
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
                gtag('config', '${GA_MEASUREMENT_ID}');
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
