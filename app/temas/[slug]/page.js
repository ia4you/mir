import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getTemaPorSlug,
  getPreguntasMuestraTema,
  calcularLimiteMuestraTema,
} from "../../lib/temas";

// Mismo motivo que en /especialidades/[slug]: el build de Dokploy no tiene
// acceso a mir-db, así que generateStaticParams no puede enumerar slugs en
// build time (devuelve []). Con dynamicParams=true (default), cada slug no
// listado se renderiza en su primera petición y el HTML se cachea
// `revalidate` segundos.
export async function generateStaticParams() {
  return [];
}

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const tema = await getTemaPorSlug(params.slug);
  if (!tema) return {};

  return {
    title: `Preguntas MIR de ${tema.nombre} (${tema.anioMin}-${tema.anioMax}) – Test Online Gratis | MIR Turel`,
    description: `${tema.total} preguntas de ${tema.nombre} (${tema.especialidad}) de las convocatorias MIR ${tema.anioMin}–${tema.anioMax}. Practica gratis con preguntas oficiales verificadas.`,
    alternates: {
      canonical: `https://mir.turel.es/temas/${tema.slug}`,
    },
  };
}

export default async function TemaPage({ params }) {
  const tema = await getTemaPorSlug(params.slug);
  if (!tema) notFound();

  const limiteMuestra = calcularLimiteMuestraTema(tema.total);
  const preguntas = await getPreguntasMuestraTema(tema.nombre, limiteMuestra);

  const schemaCurso = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `Preguntas MIR de ${tema.nombre}`,
    description: `${tema.total} preguntas oficiales de ${tema.nombre} de las convocatorias MIR ${tema.anioMin}-${tema.anioMax}.`,
    provider: {
      "@type": "Organization",
      name: "MIR Turel",
      url: "https://mir.turel.es",
    },
    url: `https://mir.turel.es/temas/${tema.slug}`,
    educationalLevel: "Professional",
    inLanguage: "es",
  };

  return (
    <div className="min-h-screen bg-surface px-5 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaCurso) }}
      />
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-semibold text-brand">
          ← Volver a inicio
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          {tema.nombre}
        </h1>

        <p className="mt-2 text-sm font-semibold text-ink-muted">
          Parte de{" "}
          <Link href={`/especialidades/${tema.especialidadSlug}`} className="text-brand">
            {tema.especialidad}
          </Link>
        </p>

        <p className="mt-4 text-ink-muted">{tema.intro}</p>

        <p className="mt-4 text-sm font-semibold text-ink-muted">
          {tema.total} preguntas de las convocatorias {tema.anioMin}–{tema.anioMax}
        </p>

        {preguntas.length > 0 && (
          <>
            <h2 className="mt-10 text-xl font-extrabold text-ink">
              Preguntas de muestra de {tema.nombre}
            </h2>

            <ol className="mt-4 flex flex-col gap-3">
              {preguntas.map((p) => (
                <li key={p.id} className="rounded-2xl bg-card p-4 shadow-sm">
                  <p className="text-sm font-semibold leading-snug text-ink">{p.pregunta}</p>
                  <ul className="mt-3 flex flex-col gap-1.5 text-sm text-ink-muted">
                    <li>A) {p.opcion_a}</li>
                    <li>B) {p.opcion_b}</li>
                    <li>C) {p.opcion_c}</li>
                    <li>D) {p.opcion_d}</li>
                    {p.opcion_e && <li>E) {p.opcion_e}</li>}
                  </ul>
                </li>
              ))}
            </ol>
          </>
        )}

        <Link
          href="/registro"
          className="mt-8 flex h-14 items-center justify-center rounded-2xl bg-brand px-6 text-center text-lg font-bold text-white shadow-sm active:bg-brand-dark"
        >
          Practica gratis este tema → Crear cuenta gratis
        </Link>

        <Link
          href="/"
          className="mt-6 block text-center text-sm font-semibold text-ink-muted"
        >
          ← Volver a la página principal
        </Link>
      </div>
    </div>
  );
}
