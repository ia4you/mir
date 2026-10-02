import { notFound } from "next/navigation";
import Link from "next/link";
import { getConvocatoria, getConvocatorias, slugConvocatoria } from "../../lib/convocatorias";
import { getControversias } from "../../lib/controversias";
import { breadcrumb } from "../../lib/jsonld";
import { slugify } from "../../lib/especialidades";

// Mismo patrón que /especialidades/[slug]: el build no ve la BD, así que no se
// enumeran años en build; cada año se renderiza en su primera petición (ISR).
export async function generateStaticParams() {
  return [];
}

export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const conv = await getConvocatoria(params.slug);
  if (!conv) return {};
  return {
    title: `Examen MIR ${conv.anio} Desglosado: Preguntas y Respuestas Oficiales`,
    description: `Examen MIR ${conv.anio} con ${conv.publicas} preguntas y respuestas oficiales del Ministerio de Sanidad. Resuélvelo online o filtra por especialidad.`,
    alternates: { canonical: `https://mir.turel.es/convocatorias/${params.slug}` },
  };
}

export default async function ConvocatoriaPage({ params }) {
  const conv = await getConvocatoria(params.slug);
  if (!conv) notFound();

  const otras = (await getConvocatorias()).filter((c) => c.anio !== conv.anio);
  const controversias = (await getControversias()).filter(
    (c) => c.año === conv.anio && !conv.excluidas.includes(c.numero)
  );

  const schemaMigas = breadcrumb([
    ["Inicio", "https://mir.turel.es/"],
    ["Convocatorias", "https://mir.turel.es/convocatorias"],
    [`MIR ${conv.anio}`, `https://mir.turel.es/convocatorias/${params.slug}`],
  ]);

  return (
    <div className="min-h-screen bg-surface px-5 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMigas) }}
      />
      <div className="mx-auto max-w-2xl">
        <Link href="/convocatorias" className="text-sm font-semibold text-brand">
          ← Todas las convocatorias
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          Examen Oficial MIR {conv.anio} - Cuadernillo Desglosado
        </h1>

        <p className="mt-4 text-ink-muted">
          Se publican {conv.publicas} preguntas del examen MIR {conv.anio}, con la respuesta de la
          plantilla oficial del Ministerio de Sanidad. No es el examen completo: no se incluyen las
          preguntas anuladas ni las de reserva
          {conv.excluidas.length > 0 && ` (n.º ${conv.excluidas.join(", ")})`}.
        </p>

        <Link
          href="/registro"
          className="mt-6 flex h-14 items-center justify-center rounded-2xl bg-brand px-6 text-center text-lg font-bold text-white shadow-sm active:bg-brand-dark"
        >
          Practica gratis → Crear cuenta
        </Link>

        <h2 className="mt-10 text-xl font-extrabold text-ink">
          Preguntas del MIR {conv.anio} por especialidad
        </h2>
        <ul className="mt-3 grid gap-2">
          {conv.especialidades.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/especialidades/${e.slug}`}
                className="flex justify-between rounded-xl border border-track bg-card px-4 py-3 font-semibold text-ink"
              >
                <span>{e.nombre}</span>
                <span className="text-ink-muted">{e.total}</span>
              </Link>
            </li>
          ))}
        </ul>

        {controversias.length > 0 && (
          <>
            <h2 className="mt-10 text-xl font-extrabold text-ink">
              Preguntas con respuesta oficial controvertida
            </h2>
            <ul className="mt-3 list-disc pl-5 text-ink-muted">
              {controversias.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/preguntas/${slugify(c.especialidad)}/${c.id}`}
                    className="font-semibold text-brand"
                  >
                    Pregunta {c.numero} ({c.especialidad})
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <h2 className="mt-10 text-xl font-extrabold text-ink">Otras convocatorias</h2>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          {otras.map((c) => (
            <Link
              key={c.anio}
              href={`/convocatorias/${slugConvocatoria(c.anio)}`}
              className="font-semibold text-brand"
            >
              MIR {c.anio}
            </Link>
          ))}
        </p>
      </div>
    </div>
  );
}
