"use client";

import Image from "next/image";
import { formatoDuracion } from "@/lib/videos";

// Miniatura de un vídeo con botón de play. Pulsarla abre el vídeo en
// ModalVideo (quien la usa decide). La imagen la sirve nuestro servidor
// (next/image la pide a i.ytimg.com), así el navegador no contacta con
// Google hasta que se pulsa play.
export default function MiniaturaVideo({
  youtubeId,
  titulo,
  duracionSeg,
  onAbrir,
  sizes = "(min-width: 1024px) 720px, 100vw",
}) {
  return (
    <button
      type="button"
      onClick={onAbrir}
      aria-label={`Reproducir: ${titulo}`}
      aria-haspopup="dialog"
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
