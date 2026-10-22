import Link from "next/link";
import { getControversias } from "../lib/controversias";
import CtaPractica from "../components/CtaPractica";
import ImagenPregunta from "../components/ImagenPregunta";

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

  return (
    <div className="min-h-screen bg-surface px-5 py-10 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-3xl lg:max-w-[1240px]">
        {/* Escritorio: cabecera a dos columnas (texto ~60 % a la izquierda, los
            dos avisos ~40 % a la derecha, alineados con el H1) y tarjetas en 2
            columnas tipo mosaico (son largas y de alto desigual). En móvil, una
            columna en el orden de siempre: el envoltorio de la izquierda es
            `contents` y `order-*` intercala los avisos antes del recuento. */}
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-x-12">
          <div className="contents lg:block">
            <Link href="/" className="order-1 text-sm font-semibold text-accent lg:order-none">
              ← Volver a inicio
            </Link>

            <h1 className="order-2 mt-4 text-3xl font-extrabold leading-tight text-ink sm:text-4xl lg:order-none">
              Preguntas MIR con respuesta oficial cuestionada
            </h1>

            <p className="order-3 mt-4 text-ink-muted lg:order-none">
              Las siguientes preguntas del examen MIR tienen una respuesta oficial verificada
              contra las plantillas definitivas del Ministerio de Sanidad, pero han sido
              identificadas como controvertidas por contradecir la práctica clínica estándar o
              contener posibles errores conceptuales.
            </p>

            <p className="order-5 mt-5 text-sm font-semibold text-ink-muted lg:order-none">
              {controversias.length} preguntas documentadas
            </p>
          </div>

          {/* lg:mt-9: el alto de "← Volver a inicio" más su margen, para que los
              avisos empiecen a la altura del H1. */}
          <div className="order-4 lg:order-none lg:mt-9">
            <div className="mt-5 rounded-2xl bg-panel p-4 text-sm text-ink-muted lg:mt-0">
              Las respuestas marcadas como correctas son las oficiales del Ministerio de Sanidad.
              MIR Turel no modifica las respuestas oficiales en su banco de preguntas.
            </div>

            <div className="mt-4 rounded-2xl border border-warning-border bg-warning-bg p-4 text-sm text-warning-text">
              ⚠️ Las explicaciones de esta sección reflejan análisis clínico basado en literatura
              médica. La respuesta válida en el examen MIR es siempre la de la plantilla oficial del
              Ministerio de Sanidad.
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6 lg:block lg:columns-2 lg:gap-6">
          {controversias.map((c) => (
            <article key={c.id} className="rounded-2xl bg-card p-5 shadow-sm lg:mb-6 lg:break-inside-avoid">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block rounded-full bg-badge-bg px-3 py-1 text-xs font-bold text-badge-text">
                  {c.especialidad}
                </span>
                <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                  MIR {c.año} — Pregunta {c.numero}
                </span>
              </div>

              <h2 className="mt-3 text-base font-normal leading-relaxed text-ink">{c.pregunta}</h2>
              {c.imagen_path && <ImagenPregunta src={c.imagen_path} className="mt-3" />}

              <ul className="mt-4 flex flex-col gap-2 text-sm">
                {LETRAS.map((letra) => {
                  const opcion = c[`opcion_${letra}`];
                  if (!opcion || !opcion.trim()) return null;
                  const esCorrecta = c.correcta?.trim().toUpperCase() === letra.toUpperCase();
                  return (
                    <li
                      key={letra}
                      className={`rounded-xl border-2 p-3 ${
                        esCorrecta ? "border-accent bg-brand-light" : "border-track"
                      }`}
                    >
                      <span className="font-bold text-ink">{letra.toUpperCase()})</span>{" "}
                      <span className="text-ink">{opcion}</span>
                      {esCorrecta && (
                        <span className="ml-2 inline-block rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-on-brand">
                          Respuesta oficial
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex flex-col gap-3 border-t border-track pt-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-danger-text">
                    🔴 Respuesta oficial Ministerio
                  </p>
                  <p className="texto-lectura mt-1 text-ink">
                    {c.correcta?.trim().toUpperCase()} —{" "}
                    {c[`opcion_${c.correcta?.trim().toLowerCase()}`]}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-warning-text">
                    🟡 Respuesta alternativa defendible
                  </p>
                  <p className="texto-lectura mt-1 text-ink">
                    {c.recomendada
                      ? `${c.recomendada.letra} — ${c.recomendada.texto}`
                      : "No se identifica una única alternativa clara — ver motivo de la discrepancia."}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                    📚 Motivo de la discrepancia
                  </p>
                  <p className="texto-lectura mt-1 text-ink-muted">
                    {c.objecion || "Respuesta cuestionada — sin detalle documentado."}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                    🎯 Consejo para el examen
                  </p>
                  <p className="texto-lectura mt-1 text-ink-muted">
                    En el MIR debes marcar la respuesta oficial aunque la evidencia clínica pueda
                    apuntar a otra dirección.
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <h2 className="text-xl font-extrabold text-ink">
            ¿Quieres practicar con el banco completo?
          </h2>
          <CtaPractica
          texto="Crear cuenta gratis"
          etiqueta={"Practicar con el banco completo"}
          lote={{}}
          className="mx-auto mt-4 flex h-14 max-w-xs items-center justify-center rounded-2xl bg-brand px-6 text-lg font-bold text-on-brand shadow-sm active:bg-brand-dark"
        />
        </div>
      </div>
    </div>
  );
}
