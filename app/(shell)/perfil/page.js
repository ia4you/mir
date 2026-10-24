"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import AvatarUploader from "../../components/AvatarUploader";
import FieldCard from "../../components/FieldCard";
import Chip from "../../components/Chip";
import ToggleSwitch from "../../components/ToggleSwitch";
import ThemeToggle from "../../components/ThemeToggle";
import EnlaceConfigurarCookies from "../../components/EnlaceConfigurarCookies";
import { olvidarCarruselReforzar } from "../../components/CarruselReforzar";
import {
  getMetaDiaria,
  setMetaDiaria,
  getTemporizadorDefecto,
  setTemporizadorDefecto,
} from "../../lib/preferencias";

const OPCIONES_SEGUNDOS = [30, 45, 60, 90];

const FUENTES = [
  { anio: "2016", preguntas: 232, nota: "Cuadernillo y plantilla oficiales del Ministerio de Sanidad; 3 preguntas anuladas." },
  { anio: "2017", preguntas: 231, nota: "Cuadernillo y plantilla oficiales del Ministerio de Sanidad; 4 preguntas anuladas." },
  { anio: "2018", preguntas: 229, nota: "Cuadernillo y plantilla oficiales del Ministerio de Sanidad; 5 preguntas anuladas." },
  {
    anio: "2022",
    preguntas: 207,
    nota: "Examen de 210 preguntas (200 más 10 de reserva); 3 anuladas oficialmente.",
  },
  { anio: "2023", preguntas: 206, nota: "4 preguntas anuladas oficialmente." },
  { anio: "2024", preguntas: 205, nota: "5 preguntas anuladas oficialmente." },
  { anio: "2025", preguntas: 204, nota: "6 preguntas anuladas oficialmente." },
  {
    anio: "2026",
    preguntas: 203,
    nota: "7 preguntas anuladas oficialmente (una de ellas, de reserva, no llegó a sustituir a ninguna y no forma parte del banco).",
  },
];

export default function Perfil() {
  const { data: session } = useSession();
  // Recuento real del banco (mismo que la portada y /configuracion).
  const [totalBanco, setTotalBanco] = useState(null);

  useEffect(() => {
    fetch("/api/especialidades")
      .then((r) => (r.ok ? r.json() : []))
      .then((filas) => setTotalBanco(filas.reduce((suma, e) => suma + e.total, 0)))
      .catch(() => {});
  }, []);

  const [meta, setMeta] = useState(20);
  const [temporizadorActivo, setTemporizadorActivoState] = useState(false);
  const [segundos, setSegundosState] = useState(60);
  const [confirmandoReset, setConfirmandoReset] = useState(false);
  const [reseteando, setReseteando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState("");

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

  async function eliminarCuenta() {
    setEliminando(true);
    setErrorEliminar("");
    try {
      const res = await fetch("/api/perfil/cuenta", { method: "DELETE" });
      if (!res.ok) throw new Error();
      olvidarCarruselReforzar();
      await signOut({ callbackUrl: "/" });
    } catch {
      setErrorEliminar("No se ha podido eliminar la cuenta. Inténtalo de nuevo.");
      setEliminando(false);
      setConfirmandoEliminar(false);
    }
  }

  return (
    <div className="ancho-app min-h-screen pb-nav lg:px-8">
      <header className="flex flex-col items-center px-5 pt-5 text-center lg:flex-row lg:gap-5 lg:px-0 lg:pt-10 lg:text-left">
        <AvatarUploader />
        <div>
          <p className="mt-3 text-ink-muted lg:mt-0">Hola,</p>
          <h1 className="text-3xl font-extrabold text-ink">{session?.user?.name || "…"}</h1>
        </div>
      </header>

      {/* Escritorio: datos del usuario a la izquierda y ajustes a la derecha.
          En móvil las dos columnas son `contents` y `order-1` devuelve
          Fuentes, Ayuda y Eliminar cuenta al final, como antes. */}
      <div className="mt-5 flex flex-col gap-4 px-5 lg:mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6 lg:px-0">
        <div className="contents lg:flex lg:flex-col lg:gap-4">
          <FieldCard label="Cuenta">
            <p className="text-lg font-bold text-ink">{session?.user?.name}</p>
            <p className="text-sm text-ink-muted">{session?.user?.email}</p>

            <button
              type="button"
              onClick={() => {
                olvidarCarruselReforzar();
                signOut({ callbackUrl: "/login" });
              }}
              className="mt-4 h-11 w-full rounded-xl border border-track font-bold text-ink"
            >
              Cerrar sesión
            </button>
          </FieldCard>

          <FieldCard label="Mi plan">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                  session?.user?.plan === "premium"
                    ? "bg-brand text-on-brand"
                    : "bg-track text-ink-muted"
                }`}
              >
                {session?.user?.plan === "premium" ? "PREMIUM" : "GRATUITO"}
              </span>
              <span className="text-sm text-ink-muted">
                {session?.user?.plan === "premium" ? "Preguntas ilimitadas" : "15 preguntas/día"}
              </span>
            </div>

            {session?.user?.plan === "premium" ? (
              <p className="mt-3 text-sm font-semibold text-ink">
                Gracias por ser usuario premium ❤️
              </p>
            ) : (
              <Link
                href="/premium"
                className="mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-brand font-bold text-on-brand"
              >
                Hazte Premium →
              </Link>
            )}
          </FieldCard>

          <FieldCard label="Fuentes del banco de preguntas" className="order-1 lg:order-none">
            <p className="text-sm text-ink">
              {totalBanco ? String(totalBanco).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "…"} preguntas de
              los exámenes MIR oficiales de Medicina, convocatorias 2016-2018 y 2022-2026:
              cuadernillos y plantillas oficiales del Ministerio de Sanidad. Los cuadernillos de
              2022-2026 llegan vía Mirial.es y sus respuestas correctas son las de las plantillas
              definitivas tras el periodo de impugnaciones (vía ConSalud.es / isanidad.com).
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
            <Link
              href="/controversias"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-sm font-bold text-accent"
            >
              Ver preguntas con respuesta oficial cuestionada →
            </Link>
          </FieldCard>

          <FieldCard label="Ayuda" className="order-1 lg:order-none">
            <Link href="/contacto" className="block text-sm font-bold text-accent">
              Contacto y soporte →
            </Link>
            <EnlaceConfigurarCookies className="mt-3 block text-left text-sm font-bold text-accent">
              Configurar cookies →
            </EnlaceConfigurarCookies>
          </FieldCard>

          <div className="order-1 mt-2 flex flex-col items-center gap-2 lg:order-none lg:items-start">
            {errorEliminar && <p className="text-xs text-danger-text">{errorEliminar}</p>}
            <button
              type="button"
              onClick={() => setConfirmandoEliminar(true)}
              className="text-xs font-semibold text-danger underline-offset-2 hover:underline"
            >
              Eliminar mi cuenta
            </button>
          </div>
        </div>

        <div className="contents lg:flex lg:flex-col lg:gap-4">
          <FieldCard label="Apariencia">
            <ThemeToggle />
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
        </div>
      </div>

      {confirmandoReset && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-xs rounded-2xl bg-card p-5 shadow-lg">
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
                className="h-11 flex-1 rounded-xl bg-danger font-bold text-on-status disabled:opacity-60"
              >
                {reseteando ? "Borrando…" : "Resetear"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmandoEliminar && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-xs rounded-2xl bg-card p-5 shadow-lg">
            <p className="text-lg font-bold text-ink">¿Eliminar tu cuenta?</p>
            <p className="mt-1 text-sm text-ink-muted">
              Se borrará tu cuenta, tu historial de tests y tus respuestas de forma permanente.
              Esta acción no se puede deshacer.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmandoEliminar(false)}
                disabled={eliminando}
                className="h-11 flex-1 rounded-xl border border-track font-bold text-ink disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={eliminarCuenta}
                disabled={eliminando}
                className="h-11 flex-1 rounded-xl bg-danger font-bold text-on-status disabled:opacity-60"
              >
                {eliminando ? "Eliminando…" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
