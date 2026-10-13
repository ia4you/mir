import Link from "next/link";
import Logo from "./Logo";

// Cabecera mínima compartida por /blog y /blog/[slug], consistente con la
// landing (mismo header bar) pero sin la navegación de login/registro. Mismo
// alto que AppHeader, que la sustituye al cargar la sesión sin mover la página.
export default function BlogHeader() {
  return (
    <header className="border-b border-track bg-card px-5 pt-safe lg:px-8">
      <div className="flex h-14 items-center justify-between gap-3 lg:mx-auto lg:h-16 lg:max-w-[1240px]">
        <Link href="/" aria-label="Ir al inicio" className="flex-shrink-0">
          <Logo className="flex min-h-[44px] items-center text-3xl sm:text-4xl" />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/premium"
            className="whitespace-nowrap rounded-lg border border-warning-border bg-warning-bg px-2 py-1 text-xs font-bold text-warning-text sm:px-3 sm:py-1.5 sm:text-sm"
          >
            ★ Premium
          </Link>
          <Link
            href="/demo"
            className="whitespace-nowrap rounded-xl bg-brand px-4 py-2 text-sm font-bold text-on-brand shadow-sm active:bg-brand-dark"
          >
            Empezar gratis
          </Link>
        </nav>
      </div>
    </header>
  );
}
