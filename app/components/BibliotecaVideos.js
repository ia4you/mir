"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import TarjetaVideo from "./TarjetaVideo";
import { claveTema, ordenarParaRepasar, calcularProgreso } from "@/lib/videos";

// Píldoras de especialidad visibles antes de "+ N especialidades".
const PILDORAS_VISIBLES = 6;
// "Tus vídeos para repasar" y "Tu progreso", antes de "Ver…".
const REPASAR_VISIBLES = 3;
const PROGRESO_VISIBLES = 4;

// Filtros de /videos (especialidad y tema, en la URL para poder compartir el
// enlace), índice de especialidades y una sección por especialidad. Sin
// filtro se ve todo. Los valores iniciales llegan del servidor, así el HTML
// ya sale filtrado.
//
// Con sesión, lo personal se pide en el navegador (/api/videos/personal), así
// el HTML es igual para todos: casilla "Solo temas que he fallado" y marca en
// las tarjetas (Free y Premium); con Premium, además, "Tus vídeos para
// repasar", "Tu progreso" y "Marcar como visto".
export default function BibliotecaVideos({ grupos, especialidadInicial = "", temaInicial = "" }) {
  const router = useRouter();
  const [especialidad, setEspecialidad] = useState(
    grupos.some((g) => g.slug === especialidadInicial) ? especialidadInicial : ""
  );
  const [tema, setTema] = useState(temaInicial);
  const [todasPildoras, setTodasPildoras] = useState(false);
  const { status } = useSession();
  const [personal, setPersonal] = useState(null);
  const [soloFallados, setSoloFallados] = useState(false);
  const [todosRepasar, setTodosRepasar] = useState(false);
  const [todoProgreso, setTodoProgreso] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/videos/personal")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) =>
        d &&
        setPersonal({
          premium: d.premium,
          fallados: new Map(d.fallados.map((f) => [f.clave, f.fallos])),
          vistos: new Set(d.vistos),
        })
      )
      .catch(() => {});
  }, [status]);

  const fallosDe = (v) => personal?.fallados.get(claveTema(v.especialidad, v.tema)) || 0;

  // Marca o desmarca un vídeo; se actualiza al momento y se deshace si falla.
  async function cambiarVisto(youtubeId) {
    const estaba = personal.vistos.has(youtubeId);
    const cambiar = (marcar) =>
      setPersonal((p) => {
        const vistos = new Set(p.vistos);
        marcar ? vistos.add(youtubeId) : vistos.delete(youtubeId);
        return { ...p, vistos };
      });
    cambiar(!estaba);
    const r = await fetch(`/api/videos/vistos/${youtubeId}`, { method: estaba ? "DELETE" : "POST" }).catch(() => null);
    if (!r?.ok) cambiar(estaba);
  }

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
        .map((g) => ({
          ...g,
          videos: g.videos.filter(
            (v) => (!tema || v.tema === tema) && (!soloFallados || personal?.fallados.get(claveTema(v.especialidad, v.tema)) > 0)
          ),
        }))
        .filter((g) => g.videos.length),
    [grupos, especialidad, tema, soloFallados, personal]
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

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
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
        {personal && (
          <label
            className={`flex min-h-11 items-center gap-2 text-sm font-semibold ${
              personal.fallados.size ? "cursor-pointer text-ink" : "text-ink-subtle"
            }`}
          >
            <input
              type="checkbox"
              checked={soloFallados}
              disabled={!personal.fallados.size}
              onChange={(e) => setSoloFallados(e.target.checked)}
              className="h-5 w-5 accent-[#E3B95C]"
            />
            {personal.fallados.size ? "Solo temas que he fallado" : "Aún no has fallado preguntas"}
          </label>
        )}
        <p className="font-mono text-sm text-ink-muted" aria-live="polite">
          {total} {total === 1 ? "vídeo" : "vídeos"}
        </p>
      </div>

      {personal && !personal.premium && (
        <p className="mt-6 rounded-2xl bg-panel px-4 py-3 text-sm text-ink-muted">
          Con Premium, tu lista de vídeos según tus fallos y tu progreso.{" "}
          <Link href="/premium" className="font-bold text-accent">
            Ver Premium →
          </Link>
        </p>
      )}

      {personal?.premium && !especialidad && !tema && !soloFallados && (
        <SeccionesPremium
          grupos={grupos}
          personal={personal}
          fallosDe={fallosDe}
          cambiarVisto={cambiarVisto}
          todosRepasar={todosRepasar}
          verTodosRepasar={() => setTodosRepasar(true)}
          todoProgreso={todoProgreso}
          verTodoProgreso={() => setTodoProgreso(true)}
        />
      )}

      {!especialidad && !tema && (
        <>
          {/* Móvil: plegado, para que el primer vídeo aparezca antes. Desde lg,
              abierto. Son dos bloques (y no un <details> que se abra con JS)
              para que no se mueva la página al cargar. */}
          <details className="group mt-8 rounded-2xl bg-panel lg:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink-muted [&::-webkit-details-marker]:hidden">
              Ir a una especialidad
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 transition-transform group-open:rotate-180" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
              </svg>
            </summary>
            <nav aria-label="Índice de especialidades" className="px-4 pb-3">
              <IndiceEspecialidades grupos={grupos} />
            </nav>
          </details>
          <nav aria-label="Índice de especialidades" className="mt-8 hidden rounded-2xl bg-panel p-4 lg:block">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Ir a una especialidad</p>
            <div className="mt-2">
              <IndiceEspecialidades grupos={grupos} />
            </div>
          </nav>
        </>
      )}

      {visibles.map((g) => (
        <section key={g.slug} id={g.slug} className="mt-10 scroll-mt-24">
          <h2 className="font-serif text-2xl text-ink [text-rendering:geometricPrecision] lg:text-3xl">
            {g.especialidad} · {g.videos.length} {g.videos.length === 1 ? "vídeo" : "vídeos"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.videos.map((v) => (
              <TarjetaVideo
                key={v.youtube_id + v.tema}
                video={v}
                fallos={fallosDe(v)}
                visto={personal?.vistos.has(v.youtube_id)}
                onVisto={personal?.premium ? () => cambiarVisto(v.youtube_id) : undefined}
              />
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

function IndiceEspecialidades({ grupos }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {grupos.map((g) => (
        <li key={g.slug}>
          <a href={`#${g.slug}`} className="inline-flex min-h-11 items-center text-sm font-semibold text-accent">
            {g.especialidad} · {g.videos.length}
          </a>
        </li>
      ))}
    </ul>
  );
}

function SeccionesPremium({ grupos, personal, fallosDe, cambiarVisto, todosRepasar, verTodosRepasar, todoProgreso, verTodoProgreso }) {
  const repasar = ordenarParaRepasar(
    grupos.flatMap((g) => g.videos),
    personal.fallados,
    personal.vistos
  );
  const progreso = calcularProgreso(grupos, personal.vistos);
  const filas = todoProgreso ? progreso.especialidades : progreso.especialidades.slice(0, PROGRESO_VISIBLES);

  return (
    <>
      <section className="mt-8 rounded-2xl border border-track bg-card p-5 lg:p-6" aria-labelledby="titulo-repasar">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="titulo-repasar" className="font-serif text-2xl text-ink [text-rendering:geometricPrecision] lg:text-3xl">
            Tus vídeos para repasar
          </h2>
          {repasar.length > 0 && (
            <p className="font-mono text-xs text-ink-muted">
              {Math.min(todosRepasar ? repasar.length : REPASAR_VISIBLES, repasar.length)} de {repasar.length}
            </p>
          )}
        </div>
        {repasar.length ? (
          <>
            <p className="mt-1 text-sm text-ink-muted">
              Los temas en los que más preguntas has fallado, primero. Los que marques como vistos pasan al final.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(todosRepasar ? repasar : repasar.slice(0, REPASAR_VISIBLES)).map((v) => (
                <TarjetaVideo
                  key={v.youtube_id + v.tema}
                  video={v}
                  fallos={fallosDe(v)}
                  visto={v.visto}
                  onVisto={() => cambiarVisto(v.youtube_id)}
                />
              ))}
            </div>
            {!todosRepasar && repasar.length > REPASAR_VISIBLES && (
              <button type="button" onClick={verTodosRepasar} className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-accent">
                Ver los {repasar.length} vídeos de tus temas fallados →
              </button>
            )}
          </>
        ) : (
          <p className="mt-2 text-sm text-ink-muted">Cuando falles preguntas, aquí aparecerán los vídeos de esos temas.</p>
        )}
      </section>

      <section className="mt-6 rounded-2xl bg-panel p-5 lg:p-6" aria-labelledby="titulo-progreso">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="titulo-progreso" className="font-serif text-2xl text-ink [text-rendering:geometricPrecision]">
            Tu progreso
          </h2>
          <p className="font-mono text-sm text-ink-muted">
            {progreso.vistos} de {progreso.total} vídeos vistos
          </p>
        </div>
        <span className="mt-3 block h-2 overflow-hidden rounded-full bg-track" aria-hidden="true">
          <span className="block h-full rounded-full bg-accent" style={{ width: `${(progreso.vistos / progreso.total) * 100}%` }} />
        </span>
        <ul className="mt-4 grid gap-2 lg:grid-cols-2 lg:gap-x-10">
          {filas.map((e) => (
            <li key={e.slug} className="flex items-center gap-3 text-sm">
              <a href={`#${e.slug}`} className="w-32 flex-shrink-0 truncate text-ink hover:text-accent">
                {e.especialidad}
              </a>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-track" aria-hidden="true">
                <span className="block h-full rounded-full bg-accent" style={{ width: `${(e.vistos / e.total) * 100}%` }} />
              </span>
              <span className="w-10 text-right font-mono text-xs text-ink-muted">
                {e.vistos}/{e.total}
              </span>
            </li>
          ))}
        </ul>
        {!todoProgreso && progreso.especialidades.length > PROGRESO_VISIBLES && (
          <button type="button" onClick={verTodoProgreso} className="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-accent">
            Ver las {progreso.especialidades.length} especialidades
          </button>
        )}
      </section>
    </>
  );
}
