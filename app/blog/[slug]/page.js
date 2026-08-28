import { notFound } from "next/navigation";
import Link from "next/link";
import { marked } from "marked";
import { query } from "@/lib/db";
import { imagenDePost } from "@/lib/blog";
import BlogHeader from "../../components/BlogHeader";
import BlogImagen from "../../components/BlogImagen";

export const dynamic = "force-dynamic";

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

async function getPost(slug) {
  const { rows } = await query(
    `SELECT titulo, resumen, contenido, imagen_portada, created_at
     FROM blog_posts
     WHERE slug = $1 AND publicado = true`,
    [slug]
  );
  return rows[0] || null;
}

async function getUltimosPosts(slugActual) {
  const { rows } = await query(
    `SELECT titulo, slug, contenido, imagen_portada, created_at
     FROM blog_posts
     WHERE publicado = true AND slug != $1
     ORDER BY created_at DESC
     LIMIT 4`,
    [slugActual]
  );
  return rows;
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  if (!post) return {};
  const imagen = imagenDePost(post);
  return {
    title: `${post.titulo} | MIR Turel`,
    description: post.resumen || undefined,
    alternates: { canonical: `https://mir.turel.es/blog/${params.slug}` },
    openGraph: {
      title: post.titulo,
      description: post.resumen || undefined,
      url: `https://mir.turel.es/blog/${params.slug}`,
      images: imagen ? [{ url: imagen }] : undefined,
    },
  };
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const [html, ultimos] = await Promise.all([
    marked.parse(post.contenido),
    getUltimosPosts(params.slug),
  ]);
  const imagenHero = post.imagen_portada;

  return (
    <div className="min-h-screen bg-surface">
      <BlogHeader />
      <div className="mx-auto max-w-5xl px-5 py-8 sm:py-12 lg:grid lg:grid-cols-[1fr_300px] lg:items-start lg:gap-12">
        <article className="mx-auto w-full max-w-[700px] lg:mx-0">
          <Link href="/blog" className="text-sm font-bold text-brand">
            ← Volver al blog
          </Link>

          {imagenHero && (
            <div className="mt-4 overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagenHero}
                alt=""
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          )}

          <h1 className="mt-5 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
            {post.titulo}
          </h1>
          <p className="mt-2 text-sm font-semibold text-ink-muted">
            {formatearFecha(post.created_at)}
          </p>

          <div
            className="prose prose-sm sm:prose-base mt-8 max-w-none
              prose-headings:font-extrabold prose-headings:text-ink
              prose-h2:mt-10 prose-h2:text-2xl
              prose-h3:mt-8 prose-h3:text-xl
              prose-p:leading-relaxed prose-p:text-ink
              prose-a:font-semibold prose-a:text-brand
              prose-strong:text-ink
              prose-img:rounded-xl
              prose-li:text-ink"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <p className="mt-8 border-t border-track pt-6 text-sm text-ink-muted">
            ¿Preparas el EIR en vez del MIR? Visita{" "}
            <a
              href="https://eir.turel.es"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-brand"
            >
              eir.turel.es
            </a>
            , el mismo banco de preguntas oficiales para Enfermería.
          </p>
        </article>

        <aside className="mt-10 space-y-6 lg:mt-0">
          <div className="rounded-2xl bg-brand-light p-5 text-center">
            <p className="font-bold text-ink">Empieza gratis hoy</p>
            <p className="mt-1 text-sm text-ink-muted">
              1.004 preguntas MIR oficiales verificadas.
            </p>
            <a
              href="https://play.google.com/store/apps/details?id=es.turel.mir"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-auto mt-3 block w-fit"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://play.google.com/intl/es/badges/static/images/badges/es_badge_web_generic.png"
                alt="Disponible en Google Play"
                style={{ height: "50px", width: "auto" }}
              />
            </a>
            <Link
              href="/demo"
              className="mt-3 inline-block text-sm font-bold text-brand underline"
            >
              O pruébalo gratis en el navegador →
            </Link>
          </div>

          {ultimos.length > 0 && (
            <div className="rounded-2xl bg-card p-5 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted">
                Últimos posts
              </p>
              <div className="space-y-3">
                {ultimos.map((u) => (
                  <Link key={u.slug} href={`/blog/${u.slug}`} className="group flex gap-3">
                    <BlogImagen
                      src={imagenDePost(u)}
                      alt=""
                      className="h-14 w-14 flex-shrink-0 rounded-lg"
                    />
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-bold leading-snug text-ink group-hover:text-brand">
                        {u.titulo}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {formatearFecha(u.created_at)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
