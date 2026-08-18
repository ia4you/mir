import { notFound } from "next/navigation";
import Link from "next/link";
import { marked } from "marked";
import { query } from "@/lib/db";

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
    `SELECT titulo, resumen, contenido, created_at
     FROM blog_posts
     WHERE slug = $1 AND publicado = true`,
    [slug]
  );
  return rows[0] || null;
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  if (!post) return {};
  return {
    title: `${post.titulo} | MIR Turel`,
    description: post.resumen || undefined,
  };
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const html = marked.parse(post.contenido);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/blog" className="text-sm text-brand font-bold">
        ← Volver al blog
      </Link>
      <h1 className="text-2xl font-bold mt-4">{post.titulo}</h1>
      <p className="text-xs text-ink-muted mt-1">{formatearFecha(post.created_at)}</p>
      <div
        className="prose prose-sm max-w-none mt-6"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
