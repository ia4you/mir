import Link from "next/link";
import { getBiblioteca } from "../lib/biblioteca";
import { breadcrumb } from "../lib/jsonld";
import BibliotecaVideos from "../components/BibliotecaVideos";

// El build de Dokploy no tiene acceso a mir-db: SSR por request, no prerender.
export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const { totalVideos } = await getBiblioteca();
  return {
    title: `Vídeos MIR por especialidad: ${totalVideos} clases cortas | MIR Turel`,
    description: `${totalVideos} clases cortas en vídeo (3–20 min) de academias MIR y médicos, ordenadas por especialidad y tema del MIR. Gratis y sin registro, con el reproductor de YouTube.`,
    alternates: { canonical: "https://mir.turel.es/videos" },
  };
}

export default async function VideosPage({ searchParams }) {
  const { grupos, canales } = await getBiblioteca();

  const schemaMigas = breadcrumb([
    ["Inicio", "https://mir.turel.es/"],
    ["Vídeos", "https://mir.turel.es/videos"],
  ]);

  return (
    <div className="min-h-screen bg-surface px-5 py-10 sm:py-14 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMigas) }} />
      <div className="mx-auto max-w-2xl lg:max-w-[1240px]">
        <Link href="/" className="text-sm font-semibold text-accent">
          ← Volver a inicio
        </Link>

        <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-widest text-accent">
          Biblioteca de vídeos
        </p>
        <h1 className="mt-2 font-serif text-4xl leading-tight text-ink sm:text-5xl">Clases cortas, tema a tema</h1>
        <p className="mt-4 max-w-2xl text-ink-muted">
          Vídeos de academias MIR y médicos, ordenados por especialidad y tema. Cada vídeo enlaza al
          canal de su autor.
        </p>

        <BibliotecaVideos
          grupos={grupos}
          especialidadInicial={typeof searchParams?.especialidad === "string" ? searchParams.especialidad : ""}
          temaInicial={typeof searchParams?.tema === "string" ? searchParams.tema : ""}
        />

        <section className="mt-16 rounded-2xl border border-track bg-card p-5 lg:p-8">
          <h2 className="font-serif text-2xl text-ink [text-rendering:geometricPrecision]">De dónde salen los vídeos</h2>
          <p className="mt-2 max-w-3xl text-sm text-ink-muted">
            Solo usamos vídeos de esta lista de canales. Se reproducen con el reproductor oficial de
            YouTube y el contenido es responsabilidad de cada autor.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
            {canales.map((c) => (
              <li key={c.url}>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-accent"
                >
                  {c.nombre} ↗
                </a>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-8 max-w-3xl text-xs text-ink-subtle">
          Los vídeos pertenecen a sus autores y se muestran con el reproductor oficial de YouTube. MIR
          Turel no está afiliado a YouTube ni a las academias citadas.
        </p>
      </div>
    </div>
  );
}
