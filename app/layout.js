import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";
import DisclaimerBanner from "./components/DisclaimerBanner";
import InstallBanner from "./components/InstallBanner";
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
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#00878E",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased bg-surface text-ink`}>
        <Providers>
          {children}
          <ServiceWorkerRegister />
          <DisclaimerBanner />
          <InstallBanner />
        </Providers>
        <GoogleAnalytics gaId="G-CSHZ2YHZ02" />
      </body>
    </html>
  );
}
