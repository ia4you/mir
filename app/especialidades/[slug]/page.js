import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getEspecialidadesConConteo,
  getEspecialidadPorSlug,
  getPreguntasMuestra,
} from "../../lib/especialidades";

export const revalidate = 3600;

export async function generateStaticParams() {
  const especialidades = await getEspecialidadesConConteo();
  return especialidades.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }) {
  const especialidad = await getEspecialidadPorSlug(params.slug);
  if (!especialidad) return {};

  return {
    title: `Preguntas MIR de ${especialidad.nombre} | MIR Turel`,
    description: `${especialidad.total} preguntas de ${especialidad.nombre} de las convocatorias MIR 2021–2025. Practica gratis con preguntas oficiales verificadas.`,
    alternates: {
      canonical: `https://mir.turel.es/especialidades/${especialidad.slug}`,
    },
  };
}

const LETRAS = ["a", "b", "c", "d"];

export default async function EspecialidadPage({ params }) {
  const especialidad = await getEspecialidadPorSlug(params.slug);
  if (!especialidad) notFound();

  const preguntas = await getPreguntasMuestra(especialidad.nombre, 3);

  return (
    <div className="min-h-screen bg-surface px-5 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-semibold text-brand">
          ← Volver a inicio
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          Preguntas MIR de {especialidad.nombre}
        </h1>

        <p className="mt-4 text-ink-muted">{especialidad.descripcion}</p>

        <p className="mt-4 text-sm font-semibold text-ink-muted">
          {especialidad.total} preguntas disponibles · convocatorias {especialidad.anioMin}–
          {especialidad.anioMax}
        </p>

        <div className="mt-8 flex flex-col gap-5">
          {preguntas.map((p) => (
            <div key={p.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <h3 className="text-base font-bold leading-snug text-ink">{p.pregunta}</h3>
              <ul className="mt-4 flex flex-col gap-2 text-sm text-ink-muted">
                {LETRAS.map((letra) => {
                  const opcion = p[`opcion_${letra}`];
                  if (!opcion || !opcion.trim()) return null;
                  return (
                    <li key={letra}>
                      <span className="font-bold text-ink">{letra.toUpperCase()})</span> {opcion}
                    </li>
                  );
                })}
              </ul>
              <Link
                href="/registro"
                className="mt-4 inline-block text-sm font-bold text-brand"
              >
                Ver respuesta →
              </Link>
            </div>
          ))}
        </div>

        <Link
          href="/registro"
          className="mt-8 flex h-14 items-center justify-center rounded-2xl bg-brand px-6 text-center text-lg font-bold text-white shadow-sm active:bg-brand-dark"
        >
          Ver todas las preguntas de {especialidad.nombre}
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
