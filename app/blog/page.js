import Link from "next/link";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export const metadata = {
  title: "Blog | MIR Turel",
  description: "Artículos sobre preparación del examen MIR, preguntas oficiales y controversias documentadas.",
};

export default async function BlogIndex() {
  const { rows: posts } = await query(
    `SELECT id, titulo, slug, resumen, created_at
     FROM blog_posts
     WHERE publicado = true
     ORDER BY created_at DESC`
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Blog de MIR Turel</h1>
      {posts.length === 0 ? (
        <p className="text-ink-muted">Todavía no hay artículos publicados.</p>
      ) : (
        <div className="space-y-6">
          {posts.map((p) => (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="block border rounded-lg p-4 hover:border-brand transition"
            >
              <h2 className="text-lg font-bold">{p.titulo}</h2>
              <p className="text-xs text-ink-muted mt-1">{formatearFecha(p.created_at)}</p>
              {p.resumen && <p className="text-sm mt-2">{p.resumen}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
