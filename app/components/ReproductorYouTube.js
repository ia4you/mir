"use client";

import Image from "next/image";
import { formatoDuracion } from "@/lib/videos";

// Reproductor de YouTube que no carga nada de YouTube hasta pulsar play.
// Antes: miniatura servida por nuestro servidor (next/image la pide a
// i.ytimg.com, así el navegador no contacta con Google) y botón de play.
// Después: el iframe oficial de youtube-nocookie.com, sin nada encima.
// `cargado`/`onCargar` vienen de fuera para que otros botones ("Ver ahora")
// puedan cargarlo también.
export default function ReproductorYouTube({
  youtubeId,
  titulo,
  duracionSeg,
  cargado,
  onCargar,
  sizes = "(min-width: 1024px) 720px, 100vw",
}) {
  if (cargado) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-panel">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onCargar}
      aria-label={`Reproducir: ${titulo}`}
      className="group relative block aspect-video w-full overflow-hidden rounded-xl bg-panel"
    >
      <Image
        src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
        alt=""
        fill
        sizes={sizes}
        className="object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-on-brand shadow-lg transition-transform group-hover:scale-105">
          <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-6 w-6" aria-hidden="true">
            <path d="M6 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 6 4.5Z" />
          </svg>
        </span>
      </span>
      {duracionSeg > 0 && (
        <span className="absolute bottom-2 right-2 rounded-md bg-surface/90 px-1.5 py-0.5 font-mono text-xs font-semibold text-ink">
          {formatoDuracion(duracionSeg)}
        </span>
      )}
    </button>
  );
}
