import Link from "next/link";
import { metaSocial } from "../lib/social";
import { getConvocatorias, slugConvocatoria } from "../lib/convocatorias";

// El build de Dokploy no tiene acceso a mir-db: SSR por request, no prerender.
// Un tono azul distinto por tarjeta (de 2026 hacia atrás).
const HUES = [212, 198, 226, 186, 240, 204, 172, 250, 192, 220];

export const dynamic = "force-dynamic";

const TITULO = "Exámenes MIR por convocatoria: preguntas y respuestas oficiales | MIR Turel";
const DESCRIPCION =
  "Todas las convocatorias MIR con preguntas y respuestas oficiales del Ministerio de Sanidad: accede al cuadernillo desglosado de cada año y practica por especialidad.";

export const metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: "https://mir.turel.es/convocatorias" },
  ...metaSocial({ title: TITULO, description: DESCRIPCION, url: "https://mir.turel.es/convocatorias" }),
};

export default async function ConvocatoriasPage() {
  const convocatorias = await getConvocatorias();
  return (
    <div className="min-h-screen bg-surface px-5 py-10 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-2xl lg:max-w-[1240px]">
        <Link href="/" className="text-sm font-semibold text-accent">
          ← Volver a inicio
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          Exámenes MIR por convocatoria
        </h1>
        <p className="mt-4 text-ink-muted">
          Preguntas y respuestas oficiales del Ministerio de Sanidad, desglosadas por convocatoria.
        </p>
        <ul className="mt-6 grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))] lg:mt-8">
          {convocatorias.map((c, i) => {
            const h = HUES[i % HUES.length];
            return (
              <li key={c.anio}>
                <Link
                  href={`/convocatorias/${slugConvocatoria(c.anio)}`}
                  className="block overflow-hidden rounded-[14px] border border-[#262c3c] bg-[#151a25] transition duration-200 hover:-translate-y-1 hover:border-[#e8b84a] focus-visible:-translate-y-1 focus-visible:border-[#e8b84a]"
                >
                  <div
                    className="relative h-[130px]"
                    style={{ background: `linear-gradient(135deg, hsl(${h},45%,22%), hsl(${h + 24},40%,12%))` }}
                  >
                    <svg aria-hidden="true" viewBox="0 0 200 130" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                      <polyline
                        points="0,60 50,60 62,60 70,30 80,92 90,44 98,60 140,60 150,52 160,60 200,60"
                        fill="none" stroke="#e8b84a" strokeOpacity=".55" strokeWidth="2"
                        strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                    <span className="absolute bottom-1 left-3 font-serif text-[56px] leading-none text-white/[.14]" aria-hidden="true">
                      {c.anio}
                    </span>
                  </div>
                  <div className="p-4">
                    <span className="block text-[17px] font-semibold text-[#f1f3f8]">Examen MIR {c.anio}</span>
                    <span className="mt-1 block text-sm font-semibold text-[#e8b84a]">Ver examen →</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
