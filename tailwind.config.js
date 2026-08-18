/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Paleta extraída del PDF de diseño (MIR_Quiz.pdf) — no inventar
        // tonos nuevos, reutilizar estos en toda la app.
        // surface/track/ink/panel/brand.light están atados a variables CSS
        // (ver globals.css) para poder tener modo oscuro; brand.DEFAULT y
        // brand.dark quedan fijos a propósito, el teal es igual en ambos modos.
        brand: {
          DEFAULT: "#00878E", // botones primarios, acentos, nav activo
          light: "var(--brand-light)", // tarjeta "días seguidos", opción seleccionada
          dark: "#006166", // hover/estados pulsados
        },
        surface: "var(--surface)", // fondo de página
        card: "var(--card)", // tarjetas y superficies elevadas (antes bg-white)
        track: "var(--track)", // pista gris de barras de progreso
        ink: {
          DEFAULT: "var(--ink)", // texto principal
          muted: "var(--ink-muted)", // texto secundario ("Hola,", labels)
        },
        success: {
          DEFAULT: "#218A45", // barras de progreso altas
          bg: "#D9F3DD",
          border: "#A3D5AF",
          text: "#005E26",
        },
        danger: {
          DEFAULT: "#CB4644", // barras de progreso bajas, incorrecto
          bg: "#FFE6E3",
          border: "#DE8A89",
          text: "#972527",
        },
        warning: {
          DEFAULT: "#C58D04", // barras de progreso medias
          bg: "#FBEFD1", // badge "explicación orientativa"
          border: "#E8C874",
          text: "#8A6100",
        },
        badge: {
          bg: "#DDEDFF", // etiqueta de especialidad en la pregunta
          text: "#124A7B",
        },
        panel: "var(--panel)", // caja de explicación en la corrección
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
