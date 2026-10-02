import Link from "next/link";
import { getConvocatorias, slugConvocatoria } from "../lib/convocatorias";

// El build de Dokploy no tiene acceso a mir-db: SSR por request, no prerender.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Exámenes MIR por convocatoria: preguntas y respuestas oficiales | MIR Turel",
  description:
    "Todas las convocatorias MIR con preguntas y respuestas oficiales del Ministerio de Sanidad: accede al cuadernillo desglosado de cada año y practica por especialidad.",
  alternates: { canonical: "https://mir.turel.es/convocatorias" },
};

export default async function ConvocatoriasPage() {
  const convocatorias = await getConvocatorias();
  return (
    <div className="min-h-screen bg-surface px-5 py-10 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-semibold text-brand">
          ← Volver a inicio
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          Exámenes MIR por convocatoria
        </h1>
        <p className="mt-4 text-ink-muted">
          Preguntas y respuestas oficiales del Ministerio de Sanidad, desglosadas por convocatoria.
        </p>
        <ul className="mt-6 grid gap-3">
          {convocatorias.map((c) => (
            <li key={c.anio}>
              <Link
                href={`/convocatorias/${slugConvocatoria(c.anio)}`}
                className="block rounded-2xl border border-track bg-card p-5 active:bg-surface"
              >
                <span className="text-lg font-extrabold text-ink">Examen MIR {c.anio}</span>
                <span className="mt-1 block text-sm text-ink-muted">
                  {c.publicas} preguntas
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
