"use client";

import { useState } from "react";
import ReproductorYouTube from "./ReproductorYouTube";
import { formatoDuracion } from "@/lib/videos";

// Tarjeta de /videos: miniatura (el reproductor se carga en la propia
// tarjeta al pulsar play), especialidad, tema, título, canal y año.
export default function TarjetaVideo({ video: v }) {
  const [cargado, setCargado] = useState(false);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-track bg-card">
      <ReproductorYouTube
        youtubeId={v.youtube_id}
        titulo={v.titulo}
        duracionSeg={v.duracion_seg}
        cargado={cargado}
        onCargar={() => setCargado(true)}
        sizes="(min-width: 1280px) 400px, (min-width: 640px) 50vw, 100vw"
      />
      <div className="flex flex-1 flex-col p-4">
        <p className="font-mono text-xs uppercase tracking-wide text-accent">{v.especialidad}</p>
        <p className="mt-1 text-sm text-ink-muted">{v.tema}</p>
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
      </div>
    </article>
  );
}
