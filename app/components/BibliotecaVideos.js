"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TarjetaVideo from "./TarjetaVideo";

// Píldoras de especialidad visibles antes de "+ N especialidades".
const PILDORAS_VISIBLES = 6;

// Filtros de /videos (especialidad y tema, en la URL para poder compartir el
// enlace), índice de especialidades y una sección por especialidad. Sin
// filtro se ve todo. Los valores iniciales llegan del servidor, así el HTML
// ya sale filtrado.
export default function BibliotecaVideos({ grupos, especialidadInicial = "", temaInicial = "" }) {
  const router = useRouter();
  const [especialidad, setEspecialidad] = useState(
    grupos.some((g) => g.slug === especialidadInicial) ? especialidadInicial : ""
  );
  const [tema, setTema] = useState(temaInicial);
  const [todasPildoras, setTodasPildoras] = useState(false);

  function aplicar(nuevaEspecialidad, nuevoTema) {
    setEspecialidad(nuevaEspecialidad);
    setTema(nuevoTema);
    const qs = new URLSearchParams();
    if (nuevaEspecialidad) qs.set("especialidad", nuevaEspecialidad);
    if (nuevoTema) qs.set("tema", nuevoTema);
    router.replace(qs.size ? `/videos?${qs}` : "/videos", { scroll: false });
  }

  const visibles = useMemo(
    () =>
      grupos
        .filter((g) => !especialidad || g.slug === especialidad)
        .map((g) => ({ ...g, videos: g.videos.filter((v) => !tema || v.tema === tema) }))
        .filter((g) => g.videos.length),
    [grupos, especialidad, tema]
  );
  // Vídeos distintos: uno que cubre dos temas sale en dos tarjetas.
  const total = new Set(visibles.flatMap((g) => g.videos.map((v) => v.youtube_id))).size;

  // Temas del selector: los de la especialidad elegida o, sin ella, todos
  // agrupados por especialidad.
  const gruposTema = grupos.filter((g) => !especialidad || g.slug === especialidad);
  const pildoras = todasPildoras || grupos.findIndex((g) => g.slug === especialidad) >= PILDORAS_VISIBLES
    ? grupos
    : grupos.slice(0, PILDORAS_VISIBLES);
  const ocultas = grupos.length - pildoras.length;

  const clasePildora = (activa) =>
    `flex min-h-11 items-center whitespace-nowrap rounded-full border px-4 text-sm font-semibold ${
      activa ? "border-accent bg-brand text-on-brand" : "border-track bg-card text-ink hover:border-accent"
    }`;

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar por especialidad">
        <button type="button" aria-pressed={!especialidad} onClick={() => aplicar("", "")} className={clasePildora(!especialidad)}>
          Todas
        </button>
        {pildoras.map((g) => (
          <button
            key={g.slug}
            type="button"
            aria-pressed={especialidad === g.slug}
            onClick={() => aplicar(g.slug, "")}
            className={clasePildora(especialidad === g.slug)}
          >
            {g.especialidad}
          </button>
        ))}
        {ocultas > 0 && (
          <button
            type="button"
            onClick={() => setTodasPildoras(true)}
            className="flex min-h-11 items-center whitespace-nowrap rounded-full px-3 text-sm font-semibold text-accent"
          >
            + {ocultas} especialidades
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex flex-col gap-1 text-sm font-semibold text-ink sm:flex-row sm:items-center sm:gap-3">
          Tema
          <select
            value={tema}
            onChange={(e) => {
              const valor = e.target.value;
              if (!valor) return aplicar(especialidad, "");
              const [slug, t] = valor.split("|");
              aplicar(slug, t);
            }}
            className="min-h-11 w-full rounded-xl border border-track bg-card px-3 text-sm font-normal text-ink sm:w-80"
          >
            <option value="">Todos los temas</option>
            {gruposTema.map((g) => (
              <optgroup key={g.slug} label={g.especialidad}>
                {g.videos.map((v) => (
                  <option key={v.tema} value={`${g.slug}|${v.tema}`}>
                    {v.tema}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <p className="font-mono text-sm text-ink-muted" aria-live="polite">
          {total} {total === 1 ? "vídeo" : "vídeos"}
        </p>
      </div>

      {!especialidad && !tema && (
        <nav aria-label="Índice de especialidades" className="mt-8 rounded-2xl bg-panel p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Ir a una especialidad</p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {grupos.map((g) => (
              <li key={g.slug}>
                <a href={`#${g.slug}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-accent">
                  {g.especialidad} · {g.videos.length}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {visibles.map((g) => (
        <section key={g.slug} id={g.slug} className="mt-10 scroll-mt-24">
          <h2 className="font-serif text-2xl text-ink [text-rendering:geometricPrecision] lg:text-3xl">
            {g.especialidad} · {g.videos.length} {g.videos.length === 1 ? "vídeo" : "vídeos"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.videos.map((v) => (
              <TarjetaVideo key={v.youtube_id + v.tema} video={v} />
            ))}
          </div>
        </section>
      ))}

      {total === 0 && (
        <p className="mt-10 text-ink-muted">
          No hay vídeos con ese filtro.{" "}
          <button type="button" onClick={() => aplicar("", "")} className="font-bold text-accent">
            Ver todos
          </button>
        </p>
      )}
    </>
  );
}
