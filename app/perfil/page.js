"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import BottomNav from "../components/BottomNav";
import FieldCard from "../components/FieldCard";
import Chip from "../components/Chip";
import ToggleSwitch from "../components/ToggleSwitch";
import {
  getMetaDiaria,
  setMetaDiaria,
  getTemporizadorDefecto,
  setTemporizadorDefecto,
} from "../lib/preferencias";

const OPCIONES_SEGUNDOS = [30, 45, 60, 90];

const FUENTES = [
  {
    anio: "2021",
    preguntas: 183,
    nota: "185 preguntas totales en el examen (edición COVID reducida: 175 base + 10 reserva); 2 anuladas oficialmente.",
  },
  { anio: "2022", preguntas: 207, nota: "3 preguntas anuladas oficialmente." },
  { anio: "2023", preguntas: 206, nota: "4 preguntas anuladas oficialmente." },
  { anio: "2024", preguntas: 205, nota: "5 preguntas anuladas oficialmente." },
  {
    anio: "2025",
    preguntas: 203,
    nota: "6 anuladas oficialmente + 1 excluida manualmente por una discrepancia de contenido sin resolver con certeza.",
  },
];

export default function Perfil() {
  const { data: session } = useSession();
  const [meta, setMeta] = useState(20);
  const [temporizadorActivo, setTemporizadorActivoState] = useState(false);
  const [segundos, setSegundosState] = useState(60);
  const [confirmandoReset, setConfirmandoReset] = useState(false);
  const [reseteando, setReseteando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    setMeta(getMetaDiaria());
    const t = getTemporizadorDefecto();
    setTemporizadorActivoState(t.activo);
    setSegundosState(t.segundos);
  }, []);

  function cambiarMeta(delta) {
    const nuevo = Math.min(100, Math.max(5, meta + delta));
    setMeta(nuevo);
    setMetaDiaria(nuevo);
  }

  function cambiarTemporizadorActivo(activo) {
    setTemporizadorActivoState(activo);
    setTemporizadorDefecto({ activo, segundos });
  }

  function cambiarSegundos(s) {
    setSegundosState(s);
    setTemporizadorDefecto({ activo: temporizadorActivo, segundos: s });
  }

  async function resetearHistorial() {
    setReseteando(true);
    try {
      const res = await fetch("/api/sesiones/all", { method: "DELETE" });
      if (!res.ok) throw new Error();
      setMensaje("Historial borrado correctamente.");
    } catch {
      setMensaje("No se ha podido borrar el historial. Inténtalo de nuevo.");
    } finally {
      setReseteando(false);
      setConfirmandoReset(false);
    }
  }

  return (
    <div className="min-h-screen pb-28">
      <header className="px-5 pt-safe">
        <h1 className="text-2xl font-extrabold text-ink">Perfil</h1>
      </header>

      <div className="mt-5 flex flex-col gap-4 px-5">
        <FieldCard label="Cuenta">
          <p className="text-lg font-bold text-ink">{session?.user?.name}</p>
          <p className="text-sm text-ink-muted">{session?.user?.email}</p>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
              session?.user?.plan === "premium"
                ? "bg-brand-light text-brand"
                : "bg-track text-ink-muted"
            }`}
          >
            Plan {session?.user?.plan === "premium" ? "Premium" : "Free"}
          </span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-4 h-11 w-full rounded-xl border border-track font-bold text-ink"
          >
            Cerrar sesión
          </button>
        </FieldCard>

        <FieldCard label="Meta diaria de preguntas">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => cambiarMeta(-5)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-track text-xl font-bold text-ink"
              aria-label="Reducir meta diaria"
            >
              −
            </button>
            <span className="text-2xl font-extrabold text-ink">{meta}</span>
            <button
              type="button"
              onClick={() => cambiarMeta(5)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-track text-xl font-bold text-ink"
              aria-label="Aumentar meta diaria"
            >
              +
            </button>
          </div>
        </FieldCard>

        <FieldCard label="Temporizador por defecto">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-ink">
              {temporizadorActivo ? `${segundos} segundos por pregunta` : "Sin límite de tiempo"}
            </span>
            <ToggleSwitch activo={temporizadorActivo} onChange={cambiarTemporizadorActivo} />
          </div>
          {temporizadorActivo && (
            <div className="mt-3 flex gap-2">
              {OPCIONES_SEGUNDOS.map((s) => (
                <Chip key={s} activo={segundos === s} onClick={() => cambiarSegundos(s)}>
                  {s}s
                </Chip>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-ink-muted">
            Se usará como valor inicial al abrir la pantalla de Configuración — podrás
            cambiarlo test a test si quieres.
          </p>
        </FieldCard>

        <FieldCard label="Historial">
          {mensaje && <p className="mb-3 text-sm text-ink-muted">{mensaje}</p>}
          <button
            type="button"
            onClick={() => setConfirmandoReset(true)}
            className="h-12 w-full rounded-xl border-2 border-danger font-bold text-danger"
          >
            Resetear historial
          </button>
          <p className="mt-2 text-xs text-ink-muted">
            Borra todas las sesiones y respuestas guardadas. No se puede deshacer.
          </p>
        </FieldCard>

        <FieldCard label="Fuentes del banco de preguntas">
          <p className="text-sm text-ink">
            1004 preguntas de los exámenes MIR oficiales de Medicina, convocatorias
            2021-2025. Cuadernillos oficiales del Ministerio de Sanidad (vía Mirial.es) y
            respuestas correctas de las plantillas definitivas del Ministerio de Sanidad
            tras el periodo de impugnaciones (vía ConSalud.es / isanidad.com).
          </p>
          <div className="mt-3 flex flex-col divide-y divide-track">
            {FUENTES.map((f) => (
              <div key={f.anio} className="py-2">
                <p className="text-sm font-bold text-ink">
                  MIR {f.anio} · {f.preguntas} preguntas
                </p>
                <p className="text-xs text-ink-muted">{f.nota}</p>
              </div>
            ))}
          </div>
        </FieldCard>
      </div>

      {confirmandoReset && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/40 px-6">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-lg">
            <p className="text-lg font-bold text-ink">¿Resetear historial?</p>
            <p className="mt-1 text-sm text-ink-muted">
              Se borrarán todas las sesiones y respuestas guardadas. Esta acción no se
              puede deshacer.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmandoReset(false)}
                className="h-11 flex-1 rounded-xl border border-track font-bold text-ink"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={resetearHistorial}
                disabled={reseteando}
                className="h-11 flex-1 rounded-xl bg-danger font-bold text-white disabled:opacity-60"
              >
                {reseteando ? "Borrando…" : "Resetear"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
