"use client";

// "Marcar como visto" / "✓ Visto" (solo Premium). El estado lo lleva quien lo
// usa; aria-pressed para lectores de pantalla.
export default function BotonVisto({ visto, onCambiar, ocupado = false, className = "" }) {
  return (
    <button
      type="button"
      onClick={onCambiar}
      disabled={ocupado}
      aria-pressed={visto}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold disabled:opacity-60 ${
        visto ? "bg-success-bg text-success-text" : "border-2 border-track text-ink active:bg-track"
      } ${className}`}
    >
      {visto ? "✓ Visto" : "Marcar como visto"}
    </button>
  );
}
