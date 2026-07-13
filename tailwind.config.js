/** @type {import('tailwindcss').Config} */
module.exports = {
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
        brand: {
          DEFAULT: "#00878E", // botones primarios, acentos, nav activo
          light: "#D1F3F4", // tarjeta "días seguidos", opción seleccionada
          dark: "#006166", // hover/estados pulsados
        },
        surface: "#F1F6F8", // fondo de página
        track: "#DEE5EA", // pista gris de barras de progreso
        ink: {
          DEFAULT: "#0E171E", // texto principal
          muted: "#5F6B74", // texto secundario ("Hola,", labels)
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
        panel: "#EEF3F5", // caja de explicación en la corrección
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
