import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  getEspecialidadPorSlug,
  getPreguntasPaginadas,
  PREGUNTAS_POR_PAGINA,
} from "../../../../lib/especialidades";
import ListaPreguntasEspecialidad from "../../../../components/ListaPreguntasEspecialidad";
import PaginacionEspecialidad from "../../../../components/PaginacionEspecialidad";
import CtaPractica from "../../../../components/CtaPractica";
import { breadcrumb } from "../../../../lib/jsonld";
import { metaSocial } from "../../../../lib/social";

// Mismo patrón ISR que /especialidades/[slug]: el build de Dokploy no tiene
// acceso a mir-db, así que no se pueden enumerar páginas en build time.
export async function generateStaticParams() {
  return [];
}

export const revalidate = 3600;

function paginaValida(n) {
  return Number.isInteger(n) && n >= 1;
}

export async function generateMetadata({ params }) {
  const pagina = parseInt(params.n, 10);
  if (!paginaValida(pagina)) return {};

  const especialidad = await getEspecialidadPorSlug(params.slug);
  if (!especialidad) return {};

  const title = `Preguntas MIR de ${especialidad.nombre} — Página ${pagina} (${especialidad.anioMin}-${especialidad.anioMax}) | MIR Turel`;
  const description = `${especialidad.total} preguntas de ${especialidad.nombre} de las convocatorias MIR ${especialidad.anioMin}-${especialidad.anioMax}. Página ${pagina}. Practica gratis con preguntas oficiales verificadas.`;
  return {
    title,
    description,
    ...metaSocial({ title, description, url: `https://mir.turel.es/especialidades/${especialidad.slug}/pagina/${pagina}` }),
    alternates: {
      // Autorreferencial a propósito: cada página de la paginación es su
      // propia canonical, no la página 1 — si no, Google nunca indexaría el
      // contenido propio de las páginas 2+ (justo el problema que se está
      // corrigiendo).
      canonical: `https://mir.turel.es/especialidades/${especialidad.slug}/pagina/${pagina}`,
    },
  };
}

export default async function EspecialidadPaginaPage({ params }) {
  const pagina = parseInt(params.n, 10);
  if (!paginaValida(pagina)) notFound();
  // La página 1 vive en /especialidades/[slug] — evita contenido duplicado
  // bajo dos URLs distintas.
  if (pagina === 1) redirect(`/especialidades/${params.slug}`);

  const especialidad = await getEspecialidadPorSlug(params.slug);
  if (!especialidad) notFound();

  const totalPaginas = Math.max(1, Math.ceil(especialidad.total / PREGUNTAS_POR_PAGINA));
  if (pagina > totalPaginas) notFound();

  const preguntas = await getPreguntasPaginadas(especialidad.nombre, pagina);

  const schemaMigas = breadcrumb([
    ["Inicio", "https://mir.turel.es/"],
    ["Especialidades", "https://mir.turel.es/especialidades"],
    [especialidad.nombre, `https://mir.turel.es/especialidades/${especialidad.slug}`],
  ]);

  return (
    <div className="min-h-screen bg-surface px-5 py-10 sm:py-14 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMigas) }}
      />
      {pagina > 1 && (
        <link
          rel="prev"
          href={`https://mir.turel.es/especialidades/${especialidad.slug}${
            pagina - 1 === 1 ? "" : `/pagina/${pagina - 1}`
          }`}
        />
      )}
      {pagina < totalPaginas && (
        <link
          rel="next"
          href={`https://mir.turel.es/especialidades/${especialidad.slug}/pagina/${pagina + 1}`}
        />
      )}

      {/* Escritorio: preguntas a la izquierda y el botón en el lateral. */}
      <div className="mx-auto max-w-2xl lg:grid lg:max-w-[1240px] lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-x-12">
        <div>
          <Link href="/" className="text-sm font-semibold text-accent">
            ← Volver a inicio
          </Link>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
            Preguntas MIR de {especialidad.nombre}
          </h1>

          <p className="mt-4 text-sm font-semibold text-ink-muted">
            {especialidad.total} preguntas disponibles · convocatorias {especialidad.anioMin}–
            {especialidad.anioMax}
          </p>

          <h2 className="mt-10 text-xl font-extrabold text-ink">
            Todas las preguntas de {especialidad.nombre} — página {pagina}
          </h2>

          <ListaPreguntasEspecialidad preguntas={preguntas} especialidadSlug={especialidad.slug} />

          <PaginacionEspecialidad
            especialidadSlug={especialidad.slug}
            paginaActual={pagina}
            totalPaginas={totalPaginas}
          />
        </div>

        <CtaPractica
          texto="Practica con todas las preguntas → Crear cuenta gratis"
          etiqueta={`Practicar ${especialidad.nombre}`}
          lote={{ especialidad: especialidad.nombre }}
          className="mt-8 flex h-14 items-center justify-center rounded-2xl bg-brand px-6 text-center text-lg font-bold text-on-brand shadow-sm active:bg-brand-dark lg:mt-0"
        />

        <Link href="/" className="mt-6 block text-center text-sm font-semibold text-ink-muted lg:col-span-2 lg:mt-10">
          ← Volver a la página principal
        </Link>
      </div>
    </div>
  );
}
