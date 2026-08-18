"use client";
import { useEffect, useState } from "react";

function formatearFecha(iso) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const POST_VACIO = { id: null, titulo: "", resumen: "", contenido: "", publicado: false };

export default function AdminBlog() {
  const [posts, setPosts] = useState(null);
  const [editando, setEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    try {
      const res = await fetch("/api/admin/blog");
      if (!res.ok) throw new Error();
      setPosts(await res.json());
    } catch {
      setError("No se ha podido cargar la lista de posts.");
    }
  }

  async function guardar() {
    if (!editando.titulo.trim() || !editando.contenido.trim()) {
      setError("Título y contenido son obligatorios.");
      return;
    }
    setGuardando(true);
    setError("");
    try {
      const esNuevo = !editando.id;
      const res = await fetch(esNuevo ? "/api/admin/blog" : `/api/admin/blog/${editando.id}`, {
        method: esNuevo ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editando),
      });
      if (!res.ok) throw new Error();
      setEditando(null);
      cargar();
    } catch {
      setError("No se ha podido guardar el post.");
    } finally {
      setGuardando(false);
    }
  }

  async function borrar(id) {
    if (!confirm("¿Seguro que quieres borrar este post? No se puede deshacer.")) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      cargar();
    } catch {
      setError("No se ha podido borrar el post.");
    }
  }

  if (editando) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <h2 className="text-lg font-bold mb-4">
          {editando.id ? "Editar post" : "Nuevo post"}
        </h2>
        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold mb-1">Título</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={editando.titulo}
              onChange={(e) => setEditando({ ...editando, titulo: e.target.value })}
              placeholder="Título del post"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Resumen (opcional)</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={editando.resumen || ""}
              onChange={(e) => setEditando({ ...editando, resumen: e.target.value })}
              placeholder="Resumen corto para el listado del blog"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Contenido (Markdown)</label>
            <textarea
              className="w-full border rounded px-3 py-2 font-mono text-sm"
              rows={18}
              value={editando.contenido}
              onChange={(e) => setEditando({ ...editando, contenido: e.target.value })}
              placeholder="Escribe el post en Markdown"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editando.publicado}
              onChange={(e) => setEditando({ ...editando, publicado: e.target.checked })}
            />
            Publicado (visible en /blog)
          </label>
          <div className="flex gap-2 pt-2">
            <button
              onClick={guardar}
              disabled={guardando}
              className="bg-brand text-white font-bold px-4 py-2 rounded"
            >
              {guardando ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={() => { setEditando(null); setError(""); }}
              className="border px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Blog ({posts?.length ?? "..."})</h2>
        <button
          onClick={() => setEditando({ ...POST_VACIO })}
          className="bg-brand text-white font-bold px-4 py-2 rounded"
        >
          + Nuevo post
        </button>
      </div>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {!posts ? (
        <p>Cargando...</p>
      ) : posts.length === 0 ? (
        <p className="text-ink-muted">Todavía no hay posts.</p>
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <div key={p.id} className="border rounded p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold truncate">{p.titulo}</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      p.publicado ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {p.publicado ? "Publicado" : "Borrador"}
                  </span>
                </div>
                <p className="text-xs text-ink-muted">
                  /blog/{p.slug} · actualizado {formatearFecha(p.updated_at)}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={async () => {
                    const res = await fetch(`/api/admin/blog/${p.id}`);
                    setEditando(await res.json());
                  }}
                  className="text-sm border px-3 py-1.5 rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => borrar(p.id)}
                  className="text-sm border border-red-300 text-red-600 px-3 py-1.5 rounded"
                >
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
