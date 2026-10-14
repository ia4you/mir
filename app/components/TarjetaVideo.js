"use client";

import { useState } from "react";
import MiniaturaVideo from "./MiniaturaVideo";
import ModalVideo from "./ModalVideo";
import BotonVisto from "./BotonVisto";
import { formatoDuracion } from "@/lib/videos";

// Tarjeta de /videos: miniatura (al pulsar play el vídeo se abre en grande,
// en ModalVideo), especialidad, tema, título, canal y año. Con
// sesión, `fallos` añade la marca "Has fallado…"; con Premium, `onVisto`
// añade el botón "Marcar como visto".
export default function TarjetaVideo({ video: v, fallos = 0, visto = false, onVisto }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-track bg-card">
      <MiniaturaVideo
        youtubeId={v.youtube_id}
        titulo={v.titulo}
        duracionSeg={v.duracion_seg}
        onAbrir={() => setAbierto(true)}
        sizes="(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw"
      />
      {abierto && (
        <ModalVideo
          video={v}
          onCerrar={() => setAbierto(false)}
          accion={onVisto ? <BotonVisto visto={visto} onCambiar={onVisto} /> : null}
        />
      )}
      <div className="flex flex-1 flex-col p-4">
        <p className="font-mono text-xs uppercase tracking-wide text-accent">{v.especialidad}</p>
        <p className="mt-1 text-sm text-ink-muted">{v.tema}</p>
        {fallos > 0 && (
          <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-danger-bg px-2.5 py-1 text-xs font-semibold text-danger-text">
            <span aria-hidden="true">●</span> Has fallado {fallos} {fallos === 1 ? "pregunta" : "preguntas"} de este tema
          </p>
        )}
        <h3 className="mt-2 font-bold leading-snug text-ink">{v.titulo}</h3>
        <p className="mt-auto pt-3 text-sm text-ink-muted">
          Vídeo de{" "}
          <a href={v.canal_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline-offset-2 hover:underline">
            {v.canal}
          </a>
        </p>
        <p className="mt-1 flex items-center justify-between gap-3 font-mono text-xs text-ink-subtle">
          <span>
            {formatoDuracion(v.duracion_seg)} · {v.anio}
          </span>
          <a
            href={`https://www.youtube.com/watch?v=${v.youtube_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center font-sans text-sm font-semibold text-ink-muted hover:text-ink"
          >
            Abrir en YouTube ↗
          </a>
        </p>
        {onVisto && <BotonVisto visto={visto} onCambiar={onVisto} className="mt-3" />}
      </div>
    </article>
  );
}
