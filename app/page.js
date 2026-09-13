import Link from "next/link";
import { getImageProps } from "next/image";
import { getEspecialidadesConConteo } from "./lib/especialidades";
import { getControversias } from "./lib/controversias";
import LandingHeader from "./components/LandingHeader";

// Imagen del hero con "art direction" real (móvil vs escritorio) vía
// getImageProps + <picture>, en vez de dos <Image priority> alternados con
// CSS: con dos <Image priority> Next inyecta un <link rel="preload"> por
// cada una en el <head> (no sabe cuál esconde el CSS), duplicando la
// petición de máxima prioridad justo en la imagen que no debe retrasar el
// LCP. Con <picture>, el navegador decide una sola fuente — un único
// fetch — y seguimos pasando por el optimizador de next/image (hay sharp
// instalado, ya se usa en el resto de la app sin `unoptimized`).
function imagenHero() {
  const alt =
    "Estudiante de medicina con bata revisando la app MIR Turel en una tablet, con libros de texto de fondo";
  const {
    props: { srcSet: movilSrcSet },
  } = getImageProps({
    src: "/images/hero-640w.webp",
    alt,
    width: 640,
    height: 447,
    priority: true,
    sizes: "100vw",
  });
  const {
    props: { srcSet: escritorioSrcSet },
  } = getImageProps({
    src: "/images/hero-1024w.webp",
    alt,
    width: 1024,
    height: 716,
    priority: true,
    sizes: "(min-width: 1024px) 45vw, 100vw",
  });
  // El <img> base (fallback universal si el navegador no entiende
  // <picture>/<source>, prácticamente inexistente hoy) usa directamente el
  // .jpg de compatibilidad que se nos dio para ese propósito.
  const { props: imgProps } = getImageProps({
    src: "/images/hero-1024w.jpg",
    alt,
    width: 1024,
    height: 716,
    priority: true,
    sizes: "(min-width: 1024px) 45vw, 100vw",
  });
  return { movilSrcSet, escritorioSrcSet, imgProps, alt };
}

// No usar toLocaleString("es-ES"): depende de que el runtime de Node tenga
// datos ICU completos, y el build small-icu por defecto (el mismo que
// probablemente corre en producción) lo ignora en silencio y devuelve el
// número sin separador — verificado con un screenshot real antes de esto.
function formatearMiles(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export const metadata = {
  title: "Preguntas MIR 100% oficiales, sin pagar mil euros | MIR Turel",
  description:
    "1.004 preguntas oficiales del Ministerio de Sanidad (2021–2025), verificadas contra los cuadernillos oficiales. Sin contenido generado por IA mezclado en el banco. Controversias documentadas. Empieza gratis.",
  alternates: { canonical: "https://mir.turel.es" },
  openGraph: {
    title: "MIR Turel — Banco de preguntas 100% oficial, sin pagar mil euros",
    description:
      "1.004 preguntas oficiales verificadas del Ministerio de Sanidad. Sin IA mezclada en el banco. Controversias documentadas. Gratis para empezar.",
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
  },
  {
    titulo: "Responde las preguntas",
    texto: "Corrige tus respuestas al instante y consulta la explicación clínica cuando esté disponible.",
  },
  {
    titulo: "Ve tu progreso por especialidad",
    texto: "Detecta tus puntos débiles y enfoca el repaso donde más falta hace.",
  },
];

const DIFERENCIALES = [
  {
    etiqueta: "Precio",
    titulo: "Gratis para empezar",
    texto:
      "El plan Premium cuesta una fracción de lo habitual en el sector — sin pagar mil euros por un banco de preguntas.",
  },
  {
    etiqueta: "Origen del banco",
    titulo: "100% preguntas oficiales",
    texto:
      "Convocatorias 2021–2025 verificadas contra los cuadernillos del Ministerio de Sanidad. Sin preguntas generadas por IA mezcladas en el banco.",
  },
  {
    etiqueta: "Contenido único",
    titulo: "Controversias documentadas",
    texto:
      "Cuando una respuesta oficial contradice la práctica clínica estándar, lo señalamos y explicamos por qué — con la respuesta oficial siempre clara para el examen.",
  },
];

export default async function LandingPage() {
  const { movilSrcSet, escritorioSrcSet, imgProps: heroImgProps, alt: heroAlt } = imagenHero();

  const especialidades = await getEspecialidadesConConteo();
  const totalPreguntas = especialidades.reduce((acc, e) => acc + e.total, 0);
  const totalEspecialidades = especialidades.length;

  const todasControversias = await getControversias();
  // Igual que getPreguntasMuestra/getPreguntasMuestraTema: fuera las que
  // referencian una imagen que aquí no se muestra (dejarían el enunciado
  // incomprensible en el preview).
  const SIN_IMAGEN = /\b(imagen|imágen|figura|radiografía)\b/i;
  const controversiasElegibles = todasControversias.filter((c) => !SIN_IMAGEN.test(c.pregunta));
  const controversiasDestacadas = (
    controversiasElegibles.filter((c) => c.recomendada).length >= 2
      ? controversiasElegibles.filter((c) => c.recomendada)
      : controversiasElegibles
  ).slice(0, 2);

  const SCHEMA_ORGANIZACION = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "MIR Turel",
    url: "https://mir.turel.es",
    description: `Plataforma de preparación del examen MIR con ${formatearMiles(totalPreguntas)} preguntas oficiales de las convocatorias 2021-2025 del Ministerio de Sanidad, sin contenido generado por IA mezclado en el banco.`,
    educationalCredentialAwarded: "Médico Interno Residente (MIR)",
    provider: {
      "@type": "Organization",
      name: "MIR Turel",
      url: "https://mir.turel.es",
    },
  };

  return (
    <div className="min-h-screen bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ORGANIZACION) }}
      />

      <LandingHeader />

      <section id="hero" className="px-5 pt-4 pb-14 sm:pt-6 sm:pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">
            Banco 100% oficial · Ministerio de Sanidad
          </p>

          <h1 className="mx-auto mt-1 max-w-2xl text-4xl font-extrabold leading-tight text-ink sm:mt-1 sm:text-5xl">
            Preparación MIR sin pagar mil euros
          </h1>

          {/* Altura limitada tanto en móvil (<sm, 160px) como en escritorio
              (≥sm, 160px) — object-cover recorta sin deformar — para que el
              CTA quede libre del banner fijo de aviso legal en la primera
              visita (también tapa parte de la pantalla en escritorio, no
              solo en móvil). Márgenes recortados en ambos casos, cada uno
              con su propio ajuste. */}
          <div className="mx-auto mt-2 h-40 max-w-2xl overflow-hidden rounded-2xl border border-track sm:mt-3 sm:h-44">
            <picture>
              <source media="(max-width: 640px)" srcSet={movilSrcSet} />
              <source media="(min-width: 641px)" srcSet={escritorioSrcSet} />
              {/* eslint-disable-next-line @next/next/no-img-element -- <picture> con
                  art direction no lo soporta next/image como componente; los
                  srcSet ya pasan por su optimizador vía getImageProps. */}
              <img
                {...heroImgProps}
                alt={heroAlt}
                className="h-full w-full object-cover object-center sm:object-[center_68%]"
              />
            </picture>
          </div>

          <p className="mx-auto mt-2 max-w-xl text-ink-muted sm:mt-3 sm:text-lg">
            {formatearMiles(totalPreguntas)} preguntas reales de las convocatorias
            2021–2025, verificadas contra los cuadernillos oficiales. Sin preguntas generadas por
            IA mezcladas en el banco. Con las controversias de respuestas oficiales que otros
            bancos no señalan.
          </p>

          <div className="mx-auto mt-3 grid max-w-2xl gap-1.5 text-left sm:mt-4 sm:grid-cols-3">
            <p className="rounded-xl border border-track bg-card p-1.5 text-sm font-semibold text-ink">
              Gratis para empezar. Premium a bajo coste.
            </p>
            <p className="rounded-xl border border-track bg-card p-1.5 text-sm font-semibold text-ink">
              100% oficiales. Nunca mezcladas con IA.
            </p>
            <p className="rounded-xl border border-track bg-card p-1.5 text-sm font-semibold text-ink">
              Controversias documentadas y explicadas.
            </p>
          </div>

          <div className="mx-auto mt-3 flex max-w-xs flex-col gap-3 sm:mt-4 sm:max-w-none sm:flex-row sm:justify-center">
            <Link
              href="/demo"
              className="flex h-14 items-center justify-center rounded-2xl bg-brand px-8 text-lg font-bold text-white shadow-sm active:bg-brand-dark"
            >
              Empezar gratis
            </Link>
            <a
              href="#controversias"
              className="flex h-14 items-center justify-center rounded-2xl border-2 border-brand px-8 text-lg font-bold text-brand"
            >
              Ver controversias
            </a>
          </div>

          <p className="mx-auto mt-8 max-w-2xl text-sm font-semibold text-ink-muted">
            {formatearMiles(totalPreguntas)} preguntas oficiales · {totalEspecialidades}{" "}
            especialidades · Verificadas con cuadernillos oficiales
          </p>
        </div>
      </section>

      <section id="diferencias" className="border-t border-track px-5 py-14 sm:py-16">
        <h2 className="text-center text-2xl font-extrabold text-ink">Por qué es distinto</h2>
        <div className="mx-auto mt-9 grid max-w-4xl gap-6 sm:grid-cols-3">
          {DIFERENCIALES.map((d) => (
            <div key={d.titulo} className="border-t-2 border-brand pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-brand">{d.etiqueta}</p>
              <h3 className="mt-1 text-lg font-bold text-ink">{d.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{d.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {controversiasDestacadas.length > 0 && (
        <section id="controversias" className="border-t border-track px-5 py-14 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-extrabold text-ink">
              Cuando la respuesta oficial no cuadra, lo decimos
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-ink-muted">
              Algunas preguntas oficiales del MIR tienen una respuesta que contradice la práctica
              clínica estándar. La marcamos, explicamos por qué y dejamos siempre clara cuál es la
              respuesta que hay que dar en el examen.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              {controversiasDestacadas.map((c) => (
                <article key={c.id} className="rounded-2xl border border-track bg-card p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-block rounded-full bg-badge-bg px-3 py-1 text-xs font-bold text-badge-text">
                      {c.especialidad}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                      MIR {c.año} — Pregunta {c.numero}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm font-semibold text-ink">{c.pregunta}</p>

                  <div className="mt-4 flex flex-col gap-2 border-t border-track pt-3 text-sm">
                    <p>
                      <span className="font-bold text-danger-text">Respuesta oficial: </span>
                      <span className="text-ink">
                        {c.correcta?.trim().toUpperCase()} —{" "}
                        {c[`opcion_${c.correcta?.trim().toLowerCase()}`]}
                      </span>
                    </p>
                    <p>
                      <span className="font-bold text-warning-text">Alternativa defendible: </span>
                      <span className="text-ink">
                        {c.recomendada
                          ? `${c.recomendada.letra} — ${c.recomendada.texto}`
                          : "Sin una única alternativa clara — ver detalle completo."}
                      </span>
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link href="/controversias" className="text-sm font-bold text-brand">
                Ver todas las controversias documentadas →
              </Link>
            </div>
          </div>
        </section>
      )}

      <section id="como-funciona" className="border-t border-track px-5 py-14 sm:py-16">
        <h2 className="text-center text-2xl font-extrabold text-ink">Cómo funciona</h2>
        <div className="mx-auto mt-9 grid max-w-4xl gap-6 sm:grid-cols-3">
          {PASOS.map((paso, i) => (
            <div key={paso.titulo} className="rounded-2xl border border-track bg-card p-5">
              <p className="text-2xl font-extrabold text-brand">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-lg font-bold text-ink">{paso.titulo}</h3>
              <p className="mt-1 text-sm text-ink-muted">{paso.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="especialidades" className="border-t border-track px-5 py-14 sm:py-16">
        <h2 className="text-center text-2xl font-extrabold text-ink">Especialidades</h2>
        <div className="mx-auto mt-9 grid max-w-5xl gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {especialidades.map((e) => (
            <Link
              key={e.slug}
              href={`/especialidades/${e.slug}`}
              className="flex flex-col justify-between rounded-xl border border-track bg-card p-4 active:bg-brand-light"
            >
              <span className="font-bold text-ink">{e.nombre}</span>
              <span className="mt-1 text-sm text-ink-muted">{e.total} preguntas</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-track px-5 py-16 text-center sm:py-20">
        <h2 className="text-2xl font-extrabold text-ink">Crea tu cuenta gratis</h2>
        <p className="mt-2 text-ink-muted">Sin tarjeta de crédito.</p>
        <Link
          href="/registro"
          className="mx-auto mt-6 flex h-14 max-w-xs items-center justify-center rounded-2xl bg-brand px-8 text-lg font-bold text-white shadow-sm active:bg-brand-dark"
        >
          Crear cuenta gratis
        </Link>
      </section>

      <section className="border-t border-track px-5 py-10 text-center">
        <div className="mx-auto max-w-md rounded-2xl bg-panel p-5">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
            También te puede interesar
          </p>
          <p className="mt-2 text-sm font-bold text-ink">
            ¿Preparas el EIR de Enfermería, no el MIR de Medicina?
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Tenemos un proyecto hermano con el mismo enfoque: preguntas oficiales verificadas para
            el examen EIR.
          </p>
          <a
            href="https://eir.turel.es"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-bold text-brand"
          >
            Visitar eir.turel.es →
          </a>
        </div>
      </section>

      {/* Compacto a propósito: la navegación principal (Inicio, Por qué es
          distinto, Controversias, Especialidades) y Login/Registro ya viven
          en LandingHeader, así que aquí solo quedan los enlaces legalmente
          obligatorios y el disclaimer de fuente/no afiliación. */}
      <footer className="border-t border-track px-5 py-6 text-center text-xs text-ink-muted">
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1 font-semibold text-brand">
          <Link href="/aviso-legal">Aviso legal</Link>
          <Link href="/privacidad">Privacidad</Link>
        </nav>
        <p className="mx-auto mt-3 max-w-2xl">
          Fuentes: cuadernillos oficiales MIR 2021–2025,{" "}
          <a
            href="https://www.sanidad.gob.es"
            rel="noopener noreferrer"
            target="_blank"
            className="font-semibold text-brand"
          >
            Ministerio de Sanidad
          </a>
          . MIR Turel no está afiliado al Ministerio de Sanidad ni a ninguna academia de
          preparación MIR.
        </p>
      </footer>
    </div>
  );
}
