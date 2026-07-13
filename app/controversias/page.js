import Link from "next/link";
import { getControversias } from "../lib/controversias";

export const metadata = {
  title: "Preguntas MIR con respuesta oficial cuestionada | MIR Turel",
  description:
    "Listado de preguntas del examen MIR cuya respuesta oficial ha sido identificada como controvertida, verificadas contra las plantillas definitivas del Ministerio de Sanidad.",
  alternates: { canonical: "https://mir.turel.es/controversias" },
};

// El build de Dokploy no tiene acceso a mir-db; se fuerza SSR por request
// en vez de prerenderizar en build time.
export const dynamic = "force-dynamic";

const LETRAS = ["a", "b", "c", "d", "e"];

export default async function ControversiasPage() {
  const controversias = await getControversias();

  const schemaFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: controversias.map((c) => ({
      "@type": "Question",
      name: c.pregunta,
      acceptedAnswer: {
        "@type": "Answer",
        text: c.objecion
          ? `Respuesta oficial: ${c.correcta}. ${c.objecion}`
          : `Respuesta oficial: ${c.correcta}. Respuesta cuestionada — sin detalle disponible.`,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-surface px-5 py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFaq) }}
      />
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-semibold text-brand">
          ← Volver a inicio
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          Preguntas MIR con respuesta oficial cuestionada
        </h1>

        <p className="mt-4 text-ink-muted">
          Las siguientes preguntas del examen MIR tienen una respuesta oficial verificada
          contra las plantillas definitivas del Ministerio de Sanidad, pero han sido
          identificadas como controvertidas por contradecir la práctica clínica estándar o
          contener posibles errores conceptuales.
        </p>

        <div className="mt-5 rounded-2xl bg-panel p-4 text-sm text-ink-muted">
          Las respuestas marcadas como correctas son las oficiales del Ministerio de Sanidad.
          MIR Turel no modifica las respuestas oficiales en su banco de preguntas.
        </div>

        <p className="mt-5 text-sm font-semibold text-ink-muted">
          {controversias.length} preguntas documentadas
        </p>

        <div className="mt-8 flex flex-col gap-6">
          {controversias.map((c) => (
            <article key={c.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block rounded-full bg-badge-bg px-3 py-1 text-xs font-bold text-badge-text">
                  {c.especialidad}
                </span>
                <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                  MIR {c.año} — Pregunta {c.numero}
                </span>
              </div>

              <h2 className="mt-3 text-base font-bold leading-snug text-ink">{c.pregunta}</h2>

              <ul className="mt-4 flex flex-col gap-2 text-sm">
                {LETRAS.map((letra) => {
                  const opcion = c[`opcion_${letra}`];
                  if (!opcion || !opcion.trim()) return null;
                  const esCorrecta = c.correcta?.trim().toUpperCase() === letra.toUpperCase();
                  return (
                    <li
                      key={letra}
                      className={`rounded-xl border-2 p-3 ${
                        esCorrecta ? "border-brand bg-brand-light" : "border-track"
                      }`}
                    >
                      <span className="font-bold text-ink">{letra.toUpperCase()})</span>{" "}
                      <span className="text-ink">{opcion}</span>
                      {esCorrecta && (
                        <span className="ml-2 inline-block rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-white">
                          Respuesta oficial
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>

              {c.objecion ? (
                <div className="mt-4">
                  <p className="text-sm font-bold text-danger-text">⚠️ Respuesta cuestionada</p>
                  <p className="mt-1 text-sm text-ink-muted">{c.objecion}</p>
                </div>
              ) : (
                <p className="mt-4 text-sm font-bold text-danger-text">
                  ⚠️ Respuesta cuestionada — sin detalle disponible
                </p>
              )}
            </article>
          ))}
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
