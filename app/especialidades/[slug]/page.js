import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getEspecialidadPorSlug,
  getPreguntasPaginadas,
  getExtrasEspecialidad,
  PREGUNTAS_POR_PAGINA,
} from "../../lib/especialidades";
import { getConvocatorias, slugConvocatoria } from "../../lib/convocatorias";
import ListaPreguntasEspecialidad from "../../components/ListaPreguntasEspecialidad";
import PaginacionEspecialidad from "../../components/PaginacionEspecialidad";

// El build de Dokploy no tiene acceso a mir-db, así que generateStaticParams
// no puede enumerar slugs en build time (devuelve []). Next necesita esta
// función presente -aunque esté vacía- para tratar la ruta como ISR: con
// dynamicParams=true (default) cada slug no listado se renderiza en su
// primera petición y el HTML se cachea `revalidate` segundos, sirviéndose
// cacheado al resto de peticiones sin volver a tocar la BD. Sin
// generateStaticParams, Next ignora `revalidate` y hace SSR puro siempre.
export async function generateStaticParams() {
  return [];
}

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const especialidad = await getEspecialidadPorSlug(params.slug);
  if (!especialidad) return {};

  return {
    title: `Preguntas MIR de ${especialidad.nombre} (${especialidad.anioMin}-${especialidad.anioMax}) – Test Online Gratis | MIR Turel`,
    description: `${especialidad.total} preguntas de ${especialidad.nombre} de las convocatorias MIR ${especialidad.anioMin}–${especialidad.anioMax}. Practica gratis con preguntas oficiales verificadas.`,
    alternates: {
      canonical: `https://mir.turel.es/especialidades/${especialidad.slug}`,
    },
  };
}

export default async function EspecialidadPage({ params }) {
  const especialidad = await getEspecialidadPorSlug(params.slug);
  if (!especialidad) notFound();

  const totalPaginas = Math.max(1, Math.ceil(especialidad.total / PREGUNTAS_POR_PAGINA));
  const preguntas = await getPreguntasPaginadas(especialidad.nombre, 1);
  const convocatorias = await getConvocatorias();
  const extras = await getExtrasEspecialidad(especialidad.nombre);
  const mediaPorConvocatoria = extras.convocatorias
    ? Math.round(especialidad.total / extras.convocatorias)
    : null;

  const schemaCurso = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: `Preguntas MIR de ${especialidad.nombre}`,
    description: `${especialidad.total} preguntas oficiales de ${especialidad.nombre} de las convocatorias MIR ${especialidad.anioMin}-${especialidad.anioMax}.`,
    provider: {
      "@type": "Organization",
      name: "MIR Turel",
      url: "https://mir.turel.es",
    },
    url: `https://mir.turel.es/especialidades/${especialidad.slug}`,
    educationalLevel: "Professional",
    inLanguage: "es",
  };

  return (
    <div className="min-h-screen bg-surface px-5 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaCurso) }}
      />
      {/* Next.js hoista cualquier <link> renderizado en la página al <head>
          real del documento — no hace falta pasar por generateMetadata para
          esto (que no tiene un campo dedicado a rel=next/prev). */}
      {totalPaginas > 1 && (
        <link rel="next" href={`https://mir.turel.es/especialidades/${especialidad.slug}/pagina/2`} />
      )}
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-semibold text-brand">
          ← Volver a inicio
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          Preguntas MIR de {especialidad.nombre}
        </h1>

        <p className="mt-4 text-ink-muted">{especialidad.descripcion}</p>

        <p className="mt-4 text-ink-muted">
          Practica con {especialidad.total} preguntas reales de {especialidad.nombre} de los
          exámenes oficiales del Ministerio de Sanidad (convocatorias {especialidad.anioMin} a{" "}
          {especialidad.anioMax})
          {mediaPorConvocatoria
            ? `, con una media de ${mediaPorConvocatoria} preguntas por convocatoria.`
            : "."}
        </p>

        {extras.temas.length > 0 && (
          <div className="mt-6 rounded-2xl border border-track bg-card p-5">
            <h2 className="text-lg font-extrabold text-ink">
              Temas más preguntados en {especialidad.nombre}
            </h2>
            <ul className="mt-2 list-disc pl-5 text-ink-muted">
              {extras.temas.map((t) => (
                <li key={t.tema}>
                  {t.tema} ({t.total} preguntas)
                </li>
              ))}
            </ul>
          </div>
        )}

        {extras.controversias.length > 0 && (
          <div className="mt-6 rounded-2xl border border-track bg-card p-5">
            <h2 className="text-lg font-extrabold text-ink">
              Preguntas con respuesta oficial controvertida
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Revisa con especial atención estas preguntas de {especialidad.nombre}; consulta el{" "}
              <Link href="/controversias" className="font-semibold text-brand">
                listado completo de controversias
              </Link>
              .
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm text-ink-muted">
              {extras.controversias.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/preguntas/${especialidad.slug}/${c.id}`}
                    className="font-semibold text-brand"
                  >
                    MIR {c.año}, pregunta {c.numero}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <h2 className="mt-10 text-xl font-extrabold text-ink">
          Todas las preguntas de {especialidad.nombre}
        </h2>

        <ListaPreguntasEspecialidad preguntas={preguntas} especialidadSlug={especialidad.slug} />

        <PaginacionEspecialidad
          especialidadSlug={especialidad.slug}
          paginaActual={1}
          totalPaginas={totalPaginas}
        />

        <p className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-muted">
          Ver por convocatoria:
          {convocatorias.map((c) => (
            <Link
              key={c.anio}
              href={`/convocatorias/${slugConvocatoria(c.anio)}`}
              className="font-semibold text-brand"
            >
              MIR {c.anio}
            </Link>
          ))}
        </p>

        <Link
          href="/registro"
          className="mt-8 flex h-14 items-center justify-center rounded-2xl bg-brand px-6 text-center text-lg font-bold text-white shadow-sm active:bg-brand-dark"
        >
          Practica con todas las preguntas → Crear cuenta gratis
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
