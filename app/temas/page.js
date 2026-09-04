import Link from "next/link";
import { getTemasConConteo } from "../lib/temas";

// Página estática (no [slug]): mismo patrón que blog/page.js y
// controversias/page.js, no el patrón ISR de especialidades/[slug]. El
// build de Dokploy no tiene acceso a mir-db, así que una ruta estática con
// consulta a BD tiene que forzarse a SSR por request en vez de intentar
// prerenderizarse en build time.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Temas MIR más preguntados por especialidad | MIR Turel",
  description:
    "Explora las preguntas oficiales del examen MIR agrupadas por tema clínico dentro de cada especialidad: valvulopatías, arritmias, diabetes mellitus y más de 100 temas con preguntas verificadas.",
  alternates: { canonical: "https://mir.turel.es/temas" },
};

// Agrupa por especialidad y ordena: los grupos por volumen total de
// preguntas descendente (mismo criterio que la lista de especialidades de
// la portada), y dentro de cada grupo los temas por volumen descendente
// (ya vienen así desde getTemasConConteo, pero se reordena explícitamente
// por si el orden de entrada cambiara).
function agruparPorEspecialidad(temas) {
  const grupos = new Map();
  for (const t of temas) {
    if (!grupos.has(t.especialidad)) {
      grupos.set(t.especialidad, { especialidad: t.especialidad, especialidadSlug: t.especialidadSlug, temas: [], total: 0 });
    }
    const grupo = grupos.get(t.especialidad);
    grupo.temas.push(t);
    grupo.total += t.total;
  }
  const lista = Array.from(grupos.values());
  for (const grupo of lista) {
    grupo.temas.sort((a, b) => b.total - a.total);
  }
  lista.sort((a, b) => b.total - a.total);
  return lista;
}

export default async function TemasIndexPage() {
  const temas = await getTemasConConteo();
  const grupos = agruparPorEspecialidad(temas);

  return (
    <div className="min-h-screen bg-surface px-5 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-semibold text-brand">
          ← Volver a inicio
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
          Temas MIR por especialidad
        </h1>

        <p className="mt-4 max-w-2xl text-ink-muted">
          {temas.length} temas clínicos con preguntas oficiales verificadas, agrupados por
          especialidad y ordenados por volumen de preguntas.
        </p>

        <div className="mt-10 flex flex-col gap-10">
          {grupos.map((grupo) => (
            <section key={grupo.especialidad}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-xl font-extrabold text-ink">
                  <Link href={`/especialidades/${grupo.especialidadSlug}`} className="hover:text-brand">
                    {grupo.especialidad}
                  </Link>
                </h2>
                <span className="text-sm font-semibold text-ink-muted">
                  {grupo.temas.length} tema{grupo.temas.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {grupo.temas.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/temas/${t.slug}`}
                    className="flex flex-col justify-between rounded-2xl bg-card p-4 shadow-sm active:bg-brand-light"
                  >
                    <span className="font-bold leading-snug text-ink">{t.nombre}</span>
                    <span className="mt-1 text-sm text-ink-muted">{t.total} preguntas</span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <Link
          href="/registro"
          className="mt-10 flex h-14 items-center justify-center rounded-2xl bg-brand px-6 text-center text-lg font-bold text-white shadow-sm active:bg-brand-dark"
        >
          Practica gratis todos los temas → Crear cuenta gratis
        </Link>

        <Link href="/" className="mt-6 block text-center text-sm font-semibold text-ink-muted">
          ← Volver a la página principal
        </Link>
      </div>
    </div>
  );
}
