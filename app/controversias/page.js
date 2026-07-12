import Link from "next/link";
import { getControversias } from "../lib/controversias";

export const metadata = {
  title: "Preguntas MIR con respuesta oficial cuestionada | MIR Turel",
  description:
    "Listado de preguntas del examen MIR cuya respuesta oficial ha sido cuestionada por la comunidad médica, verificadas contra las plantillas definitivas del Ministerio de Sanidad.",
  alternates: { canonical: "https://mir.turel.es/controversias" },
};

export const revalidate = 3600;

function renderConNegritas(texto) {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((parte, i) => {
    if (parte.startsWith("**") && parte.endsWith("**")) {
      return <strong key={i}>{parte.slice(2, -2)}</strong>;
    }
    return <span key={i}>{parte}</span>;
  });
}

export default async function ControversiasPage() {
  const controversias = await getControversias();

  return (
    <div className="min-h-screen bg-surface px-5 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-brand">
          ← Volver a inicio
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          Preguntas MIR con respuesta oficial cuestionada
        </h1>

        <div className="mt-5 rounded-2xl bg-panel p-4 text-sm text-ink-muted">
          Las respuestas marcadas como correctas son las oficiales del Ministerio de Sanidad.
          Las controversias aquí documentadas son opiniones técnicas basadas en literatura
          médica estándar y han sido verificadas contra los PDFs oficiales de cada
          convocatoria.
        </div>

        <p className="mt-5 text-sm font-semibold text-ink-muted">
          {controversias.length} preguntas documentadas
        </p>

        <div className="mt-8 flex flex-col gap-8">
          {controversias.map((c) => {
            const primaria = c.ids[0];
            return (
              <article
                key={c.ids.map((x) => x.id).join("-")}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-brand">
                  {primaria.especialidad} · MIR {primaria.anio} · pregunta {primaria.numero}
                  {c.ids.length > 1 &&
                    ` (también ${c.ids
                      .slice(1)
                      .map((x) => `MIR ${x.anio} pregunta ${x.numero}`)
                      .join(", ")})`}
                </p>

                <h2 className="mt-1 text-lg font-bold leading-snug text-ink">{c.titulo}</h2>

                <p className="mt-3 text-sm text-ink-muted">{primaria.pregunta}</p>

                <p className="mt-3 text-sm text-ink">
                  <span className="font-bold">Respuesta oficial: </span>
                  {renderConNegritas(c.oficial)}
                </p>

                <p className="mt-2 text-sm text-ink">
                  <span className="font-bold">Por qué es controvertida: </span>
                  {renderConNegritas(c.objecion)}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <h2 className="text-xl font-extrabold text-ink">
            ¿Quieres practicar con el banco completo?
          </h2>
          <Link
            href="/registro"
            className="mx-auto mt-4 flex h-14 max-w-xs items-center justify-center rounded-2xl bg-brand px-6 text-lg font-bold text-white shadow-sm active:bg-brand-dark"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </div>
    </div>
  );
}
