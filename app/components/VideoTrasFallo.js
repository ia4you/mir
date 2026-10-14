"use client";

import { useEffect, useState } from "react";
import ReproductorYouTube from "./ReproductorYouTube";
import { formatoDuracion } from "@/lib/videos";

// Bloque que aparece al fallar una pregunta (en /test y /demo): el vídeo del
// tema de la pregunta o, si no hay, la búsqueda de YouTube. Los vídeos son
// para todos los planes; `mostrarPremium` solo añade, para Free, una línea
// sobre lo que aporta Premium. Si la petición falla, no se muestra nada.
export default function VideoTrasFallo({ preguntaId, mostrarPremium = false }) {
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    let vigente = true;
    fetch(`/api/videos/pregunta/${preguntaId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => vigente && setDatos(d))
      .catch(() => {});
    return () => {
      vigente = false;
    };
  }, [preguntaId]);

  if (!datos || (!datos.video && !datos.busqueda)) return null;

  return (
    <div className="mt-5">
      {datos.video ? <VideoRecomendado video={datos.video} /> : <VideoBusqueda busqueda={datos.busqueda} />}
      {mostrarPremium && (
        <p className="mt-3 text-xs text-ink-subtle">
          Con Premium guardamos tu lista de vídeos para repasar según tus fallos.
        </p>
      )}
    </div>
  );
}

function VideoRecomendado({ video: v }) {
  const [cargado, setCargado] = useState(false);
  const urlYouTube = `https://www.youtube.com/watch?v=${v.youtube_id}`;

  return (
    <section aria-label="Vídeo recomendado" className="rounded-2xl border border-track bg-card p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-accent">
        Vídeo recomendado para repasar este tema
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="sm:w-1/2 sm:max-w-[320px] sm:flex-shrink-0">
          <ReproductorYouTube
            youtubeId={v.youtube_id}
            titulo={v.titulo}
            duracionSeg={v.duracion_seg}
            cargado={cargado}
            onCargar={() => setCargado(true)}
          />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-wide text-accent">
            {v.especialidad} · {v.tema}
          </p>
          <h3 className="mt-1 font-serif text-xl leading-snug text-ink">{v.titulo}</h3>
          <p className="mt-1 text-sm text-ink-muted">
            Vídeo de{" "}
            <a href={v.canal_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline-offset-2 hover:underline">
              {v.canal}
            </a>
          </p>
          <p className="mt-1 font-mono text-xs text-ink-subtle">
            {formatoDuracion(v.duracion_seg)} · {v.anio}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {!cargado && (
          <button
            type="button"
            onClick={() => setCargado(true)}
            className="flex h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-bold text-on-brand active:bg-brand-dark"
          >
            Ver ahora
          </button>
        )}
        <a
          href={urlYouTube}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 items-center justify-center rounded-xl border-2 border-track px-5 text-sm font-bold text-ink active:bg-track"
        >
          Abrir en YouTube
        </a>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-subtle">
        El reproductor de YouTube solo se carga cuando pulsas play. El contenido del vídeo es
        responsabilidad de su autor.
      </p>
    </section>
  );
}

function VideoBusqueda({ busqueda }) {
  return (
    <section aria-label="Buscar vídeos" className="rounded-2xl border-2 border-dashed border-track p-4">
      <p className="text-sm text-ink">Aún no hemos seleccionado un vídeo para {busqueda.texto}.</p>
      <a
        href={busqueda.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-track px-4 py-2 text-center text-sm font-bold text-ink active:bg-track sm:inline-flex"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 flex-shrink-0" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="m20 20-3.5-3.5" />
        </svg>
        Buscar vídeos de «{busqueda.texto}» en YouTube
      </a>
      <p className="mt-3 text-xs text-ink-subtle">Son resultados de búsqueda, no revisados por MIR Turel.</p>
    </section>
  );
}
