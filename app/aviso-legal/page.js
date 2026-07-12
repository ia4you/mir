import Link from "next/link";

export const metadata = {
  title: "Aviso Legal y Términos de Uso — MIR Turel",
  description:
    "Aviso legal de MIR Turel: titularidad del sitio, fuentes del banco de preguntas, tratamiento de las explicaciones generadas por IA y de las respuestas oficiales.",
  alternates: { canonical: "https://mir.turel.es/aviso-legal" },
};

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-surface px-5 py-10 pb-32 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-semibold text-brand">
          ← Volver a inicio
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          Aviso Legal y Términos de Uso — MIR Turel
        </h1>

        <div className="mt-8 flex flex-col gap-8 text-ink-muted">
          <section>
            <h2 className="text-lg font-bold text-ink">Titular del sitio</h2>
            <p className="mt-2">
              Este sitio web (mir.turel.es) está operado por José, en adelante &ldquo;MIR
              Turel&rdquo;.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">Fuentes del banco de preguntas</h2>
            <p className="mt-2">
              Las preguntas de este banco proceden de los cuadernillos oficiales del examen MIR
              de las convocatorias 2021–2025, publicados por el{" "}
              <a
                href="https://www.sanidad.gob.es"
                rel="noopener noreferrer"
                target="_blank"
                className="font-semibold text-brand"
              >
                Ministerio de Sanidad
              </a>
              . Se trata de documentos de dominio público, reutilizados al amparo de la Ley
              37/2007, de 16 de noviembre, sobre reutilización de la información del sector
              público.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">
              Explicaciones generadas por inteligencia artificial
            </h2>
            <p className="mt-2">
              Las explicaciones incluidas han sido generadas mediante inteligencia artificial y
              pueden contener errores. No sustituyen el criterio clínico, los manuales oficiales
              de preparación MIR ni las guías clínicas vigentes. MIR Turel no se hace
              responsable de decisiones tomadas basándose en el contenido de esta plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">Imágenes</h2>
            <p className="mt-2">
              Las imágenes incluidas pertenecen a los cuadernillos oficiales del examen MIR
              publicados por el Ministerio de Sanidad y se reproducen al amparo de su carácter
              de documento público.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">
              Respuestas oficiales y controversias
            </h2>
            <p className="mt-2">
              Las respuestas correctas son las oficiales de las plantillas definitivas del
              Ministerio de Sanidad. Algunas respuestas han sido documentadas como controvertidas
              por la comunidad médica —{" "}
              <Link href="/controversias" className="font-semibold text-brand">
                consulta /controversias
              </Link>{" "}
              para más información.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-ink">Contacto</h2>
            <p className="mt-2">
              Para cualquier duda, consulta o solicitud relacionada con este aviso legal, puedes
              escribir a{" "}
              <a href="mailto:contacto@mir.turel.es" className="font-semibold text-brand">
                contacto@mir.turel.es
              </a>
              .
            </p>
          </section>
        </div>

        <Link
          href="/"
          className="mt-10 block text-center text-sm font-semibold text-ink-muted"
        >
          ← Volver a la página principal
        </Link>
      </div>
    </div>
  );
}
