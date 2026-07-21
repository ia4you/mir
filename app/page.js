import Link from "next/link";
import Image from "next/image";
import { getEspecialidadesConConteo } from "./lib/especialidades";
import Logo from "./components/Logo";

export const metadata = {
  title: "Prepara el MIR con preguntas oficiales | MIR Turel",
  description:
    "Prepara el MIR con 1.004 preguntas oficiales (2021–2025) verificadas de Sanidad. Practica por especialidades, simulacros y repasa tus fallos gratis.",
  alternates: { canonical: "https://mir.turel.es" },
  openGraph: {
    title: "MIR Turel — Banco de preguntas oficiales MIR",
    description: "1.004 preguntas reales verificadas. Gratis.",
    url: "https://mir.turel.es",
    siteName: "MIR Turel",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00878E",
};

// El build de Dokploy corre sin acceso a mir-db (red de build aislada de la
// red de runtime), así que las páginas que consultan la BD no pueden
// prerenderizarse en build time — se fuerza SSR por request.
export const dynamic = "force-dynamic";

const PASOS = [
  {
    titulo: "Elige especialidad o año",
    texto: "Practica por bloque temático o repasa una convocatoria completa.",
    icono: (props) => (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5c2-1 5-1 8 0v14c-3-1-6-1-8 0v-14Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 5.5c-2-1-5-1-8 0v14c3-1 6-1 8 0v-14Z" />
      </svg>
    ),
  },
  {
    titulo: "Responde las preguntas",
    texto: "Corrige tus respuestas al instante y consulta la explicación clínica cuando esté disponible.",
    icono: (props) => (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4 10-10" />
      </svg>
    ),
  },
  {
    titulo: "Ve tu progreso por especialidad",
    texto: "Detecta tus puntos débiles y enfoca el repaso donde más falta hace.",
    icono: (props) => (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 20V10M12 20V4M19 20v-7" />
      </svg>
    ),
  },
];

const TESTIMONIOS = [
  {
    nombre: "Marta G.",
    ciudad: "Sevilla",
    texto: "Repasar por especialidad me ha ayudado a detectar mis puntos débiles antes del examen.",
    avatar: "/testimonios/avatar1.jpg",
  },
  {
    nombre: "Javier R.",
    ciudad: "Madrid",
    texto: "Las preguntas son iguales que las del examen real, se nota que están bien verificadas.",
    avatar: "/testimonios/avatar2.jpg",
  },
  {
    nombre: "Lucía M.",
    ciudad: "Valencia",
    texto: "Poder practicar unos minutos cada día desde el móvil me ha hecho mucho más constante.",
    avatar: "/testimonios/avatar3.jpg",
  },
];

const SCHEMA_ORGANIZACION = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "MIR Turel",
  url: "https://mir.turel.es",
  description:
    "Plataforma de preparación del examen MIR con 1.004 preguntas oficiales de las convocatorias 2021-2025 del Ministerio de Sanidad.",
  educationalCredentialAwarded: "Médico Interno Residente (MIR)",
  provider: {
    "@type": "Organization",
    name: "MIR Turel",
    url: "https://mir.turel.es",
  },
};

export default async function LandingPage() {
  const especialidades = await getEspecialidadesConConteo();

  return (
    <div className="min-h-screen bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORGANIZACION) }}
      />
      <header className="flex items-center justify-between gap-3 border-b border-track bg-white px-5 py-3 pt-safe">
        <Link href="/" aria-label="Ir al inicio" className="flex-shrink-0">
          <Logo className="h-11 w-auto sm:h-12 md:h-14 lg:h-16" />
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="whitespace-nowrap rounded-lg px-2 py-1 text-xs font-bold text-brand sm:hidden"
          >
            Login
          </Link>
          <Link
            href="/login"
            className="hidden whitespace-nowrap text-sm font-bold text-ink sm:inline"
          >
            Login
          </Link>
          <Link
            href="/registro"
            className="hidden whitespace-nowrap rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white shadow-sm active:bg-brand-dark sm:inline-block"
          >
            Registro
          </Link>
        </nav>
      </header>

      <section id="hero" className="px-5 pt-10 pb-12 text-center sm:pt-14 sm:pb-16">
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
          Prepara el MIR con preguntas oficiales
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-ink-muted sm:text-lg">
          1.004 preguntas reales de las convocatorias 2021–2025, verificadas de los cuadernillos
          oficiales del Ministerio de Sanidad
        </p>

        <div className="mx-auto mt-7 flex max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Link
            href="/demo"
            className="flex h-14 items-center justify-center rounded-2xl bg-brand px-8 text-lg font-bold text-white shadow-sm active:bg-brand-dark"
          >
            Empezar gratis
          </Link>
          <a
            href="#como-funciona"
            className="flex h-14 items-center justify-center rounded-2xl border-2 border-brand px-8 text-lg font-bold text-brand"
          >
            Ver cómo funciona
          </a>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-sm font-semibold text-ink-muted">
          1.004 preguntas oficiales · 23 especialidades · Convocatorias 2021–2025
        </p>
      </section>

      <section id="como-funciona" className="px-5 py-12 sm:py-16">
        <h2 className="text-center text-2xl font-extrabold text-ink">Cómo funciona</h2>
        <div className="mx-auto mt-8 grid max-w-4xl gap-5 sm:grid-cols-3">
          {PASOS.map((paso, i) => (
            <div key={paso.titulo} className="rounded-2xl bg-white p-5 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
                <paso.icono className="h-6 w-6" />
              </div>
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-brand">
                Paso {i + 1}
              </p>
              <h3 className="mt-1 text-lg font-bold text-ink">{paso.titulo}</h3>
              <p className="mt-1 text-sm text-ink-muted">{paso.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="especialidades" className="px-5 py-12 sm:py-16">
        <h2 className="text-center text-2xl font-extrabold text-ink">Especialidades</h2>
        <div className="mx-auto mt-8 grid max-w-5xl gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {especialidades.map((e) => (
            <Link
              key={e.slug}
              href={`/especialidades/${e.slug}`}
              className="flex flex-col justify-between rounded-2xl bg-white p-4 shadow-sm active:bg-brand-light"
            >
              <span className="font-bold text-ink">{e.nombre}</span>
              <span className="mt-1 text-sm text-ink-muted">{e.total} preguntas</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="testimonios" className="px-5 py-12 sm:py-16">
        <h2 className="text-center text-2xl font-extrabold text-ink">
          Lo que dicen nuestros usuarios
        </h2>
        <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
          {TESTIMONIOS.map((t) => (
            <div key={t.nombre} className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm text-ink">&ldquo;{t.texto}&rdquo;</p>
              <div className="mt-3 flex items-center gap-3">
                <Image
                  src={t.avatar}
                  alt={t.nombre}
                  width={56}
                  height={56}
                  className="h-14 w-14 flex-shrink-0 rounded-full object-cover ring-2 ring-brand/20"
                />
                <p className="text-sm font-bold text-ink">
                  {t.nombre} <span className="font-normal text-ink-muted">— {t.ciudad}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-14 text-center sm:py-16">
        <h2 className="text-2xl font-extrabold text-ink">Empieza hoy</h2>
        <p className="mt-2 text-ink-muted">Empieza gratis — sin tarjeta de crédito</p>
        <Link
          href="/registro"
          className="mx-auto mt-6 flex h-14 max-w-xs items-center justify-center rounded-2xl bg-brand px-8 text-lg font-bold text-white shadow-sm active:bg-brand-dark"
        >
          Crear cuenta gratis
        </Link>
      </section>

      <footer className="border-t border-track px-5 py-10 text-sm text-ink-muted">
        <nav className="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-6 gap-y-2 text-center font-semibold text-brand">
          <a href="#hero">Inicio</a>
          <a href="#especialidades">Especialidades</a>
          <Link href="/controversias">Controversias</Link>
          <Link href="/login">Login</Link>
          <Link href="/registro">Registro</Link>
          <Link href="/aviso-legal">Aviso legal</Link>
          <Link href="/contacto">Contacto</Link>
          <a href="/sitemap.xml">Sitemap</a>
        </nav>
        <div className="mx-auto mt-6 max-w-4xl text-center">
          <p>
            Fuentes: cuadernillos oficiales MIR 2021–2025,{" "}
            <a
              href="https://www.sanidad.gob.es"
              rel="noopener noreferrer"
              target="_blank"
              className="font-semibold text-brand"
            >
              Ministerio de Sanidad
            </a>
            .
          </p>
          <p className="mt-2">
            MIR Turel no está afiliado al Ministerio de Sanidad ni a ninguna academia de
            preparación MIR.
          </p>
        </div>
      </footer>
    </div>
  );
}
