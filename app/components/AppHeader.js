"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Logo from "./Logo";
import ThemeSwitch from "./ThemeSwitch";
import { esRutaApp } from "./BottomNav";

const ENLACES = [
  { href: "/inicio", label: "Inicio" },
  { href: "/convocatorias", label: "Exámenes MIR" },
  { href: "/configuracion", label: "Práctica" },
  { href: "/estadisticas", label: "Estadísticas" },
  { href: "/controversias", label: "Controversias" },
];

// MIR 2027: 23/01/2027. Los días se cuentan en el calendario local del
// navegador, tras montar (en el servidor no se conoce la fecha del usuario).
const FECHA_MIR = Date.UTC(2027, 0, 23);

function DiasMir() {
  const [dias, setDias] = useState(null);

  useEffect(() => {
    const h = new Date();
    setDias(Math.round((FECHA_MIR - Date.UTC(h.getFullYear(), h.getMonth(), h.getDate())) / 864e5));
  }, []);

  if (dias !== null && dias < 0) return null;

  return (
    <span
      title="Días que faltan para el MIR 2027 (23/01/2027)"
      className="flex h-8 items-center gap-1 whitespace-nowrap rounded-full border border-track bg-panel px-3 text-xs font-semibold text-ink-muted"
    >
      <span className="font-mono text-sm text-accent">{dias ?? "–"}</span>
      días<span className="hidden sm:inline"> al MIR 2027</span>
    </span>
  );
}

// Cabecera de la app con sesión (rutas de esRutaApp, o cualquiera con
// `forzar`, que usan las páginas públicas cuando hay sesión). En móvil: logo, días al
// MIR e interruptor de tema; la navegación va en BottomNav. Desde lg: además
// la navegación principal, Premium (solo plan gratuito) y el avatar.
export default function AppHeader({ forzar = false }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!forzar && !esRutaApp(pathname)) return null;

  const esGratis = session && session.user?.plan !== "premium";
  const inicial = (session?.user?.name || "").trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-20 border-b border-track bg-card px-5 pt-safe lg:px-8">
      <div className="flex h-14 items-center justify-between gap-3 lg:mx-auto lg:h-16 lg:max-w-[1240px]">
        <Link href="/inicio" aria-label="Ir al inicio" className="flex-shrink-0">
          <Logo className="flex min-h-[44px] items-center text-3xl" />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
          {ENLACES.map((e) => {
            const activo = pathname.startsWith(e.href);
            return (
              <Link
                key={e.href}
                href={e.href}
                aria-current={activo ? "page" : undefined}
                className={`flex h-11 items-center whitespace-nowrap rounded-xl px-3 text-sm font-semibold ${
                  activo ? "bg-panel text-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                {e.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 lg:gap-3">
          <DiasMir />
          <ThemeSwitch />
          {esGratis && (
            <Link
              href="/premium"
              className="hidden h-11 items-center whitespace-nowrap rounded-xl bg-brand px-4 text-sm font-bold text-on-brand hover:bg-brand-dark lg:flex"
            >
              Premium
            </Link>
          )}
          <Link
            href="/perfil"
            aria-label="Perfil"
            aria-current={pathname.startsWith("/perfil") ? "page" : undefined}
            className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-track bg-panel font-semibold text-ink lg:flex"
          >
            {inicial}
          </Link>
        </div>
      </div>
    </header>
  );
}
