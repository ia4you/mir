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
      // Todos los colores son variables CSS de app/globals.css (tema claro en
      // :root, oscuro en :root.dark); no poner hex aquí.
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          DEFAULT: "var(--brand)", // relleno dorado: botón principal, nav activo
          light: "var(--brand-light)", // fondo dorado suave (seleccionado, racha)
          dark: "var(--brand-hover)", // hover/pulsado del dorado
        },
        "on-brand": "var(--on-brand)", // texto sobre bg-brand
        accent: "var(--accent)", // dorado como texto, borde o anillo (AA en ambos temas)
        surface: "var(--surface)", // fondo de página
        card: {
          DEFAULT: "var(--card)", // tarjeta
          2: "var(--panel)", // tarjeta secundaria
        },
        panel: "var(--panel)", // = card-2 (caja de explicación, etc.)
        track: "var(--track)", // bordes y pista de barras
        line: "var(--line)", // separadores
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)", // texto secundario
          subtle: "var(--ink-subtle)", // texto terciario
        },
        success: {
          DEFAULT: "var(--success)",
          bg: "var(--success-bg)",
          border: "var(--success-border)",
          text: "var(--success-text)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          bar: "var(--danger-bar)", // barras "a reforzar"
          bg: "var(--danger-bg)",
          border: "var(--danger-border)",
          text: "var(--danger-text)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          bg: "var(--warning-bg)",
          border: "var(--warning-border)",
          text: "var(--warning-text)",
        },
        "on-status": "var(--on-status)", // texto sobre success/danger/warning sólidos
        badge: {
          bg: "var(--badge-bg)",
          text: "var(--badge-text)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist)", "system-ui", "sans-serif"], // interfaz
        serif: ["var(--font-instrument)", "Georgia", "serif"], // logo, saludo, títulos grandes
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"], // cifras
      },
      borderRadius: {
        // Tarjetas: 18px en móvil, 20px desde sm. Los botones usan rounded-xl (12px).
        "2xl": "var(--radius-card)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
