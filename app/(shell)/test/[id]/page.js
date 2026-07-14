"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import OptionCard from "../../../components/OptionCard";

const LETRAS = ["A", "B", "C", "D", "E"];

function formatearTiempo(segundos) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TestPregunta({ params }) {
  const router = useRouter();
  const sesionId = params.id;

  const [preguntas, setPreguntas] = useState(null);
  const [segundosPorPregunta, setSegundosPorPregunta] = useState(null);
  const [indice, setIndice] = useState(0);
  const [seleccionada, setSeleccionada] = useState(null);
  const [estado, setEstado] = useState("respondiendo"); // "respondiendo" | "corregido"
  const [resultado, setResultado] = useState(null);
  const [aciertos, setAciertos] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mostrarSalir, setMostrarSalir] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState(false);
  const [mostrarExplicacion, setMostrarExplicacion] = useState(true);
  const [cerrandoTarjeta, setCerrandoTarjeta] = useState(false);

  const horaInicioRef = useRef(null);
  const mostrarSalirRef = useRef(false);
  useEffect(() => {
    mostrarSalirRef.current = mostrarSalir;
  }, [mostrarSalir]);

  useEffect(() => {
    if (!imagenAmpliada) return;
    function onKeyDown(e) {
      if (e.key === "Escape") setImagenAmpliada(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [imagenAmpliada]);

  useEffect(() => {
    const guardado = sessionStorage.getItem(`mir_test_${sesionId}`);
    if (!guardado) {
      router.replace("/configuracion");
      return;
    }
    const datos = JSON.parse(guardado);
    setPreguntas(datos.preguntas);
    setSegundosPorPregunta(datos.segundosPorPregunta);
    horaInicioRef.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesionId]);

  const preguntaActual = preguntas ? preguntas[indice] : null;

  const confirmarRespuesta = useCallback(
    async (respuestaForzada) => {
      if (!preguntaActual || enviando) return;
      setEnviando(true);
      const respuestaFinal = respuestaForzada !== undefined ? respuestaForzada : seleccionada;
      try {
        const res = await fetch(`/api/sesiones/${sesionId}/respuestas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pregunta_id: preguntaActual.id, respuesta_dada: respuestaFinal }),
        });
        const data = await res.json();
        setResultado(data);
        if (data.correcta) setAciertos((a) => a + 1);
        setEstado("corregido");
        setMostrarExplicacion(true);
      } catch (e) {
        setResultado({ correcta: false, respuesta_correcta: "-", explicacion: null });
        setEstado("corregido");
        setMostrarExplicacion(true);
      } finally {
        setEnviando(false);
      }
    },
    [preguntaActual, seleccionada, sesionId, enviando]
  );

  // Temporizador por pregunta
  useEffect(() => {
    if (!preguntaActual || estado !== "respondiendo" || !segundosPorPregunta) {
      setTiempoRestante(null);
      return;
    }
    setTiempoRestante(segundosPorPregunta);
    const intervalo = setInterval(() => {
      if (mostrarSalirRef.current) return; // pausado mientras se confirma la salida
      setTiempoRestante((t) => (t === null ? null : Math.max(0, t - 1)));
    }, 1000);
    return () => clearInterval(intervalo);
  }, [indice, estado, segundosPorPregunta, preguntaActual]);

  useEffect(() => {
    if (tiempoRestante === 0 && estado === "respondiendo") {
      confirmarRespuesta(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiempoRestante]);

  async function siguientePregunta() {
    if (indice + 1 < preguntas.length) {
      setIndice((i) => i + 1);
      setSeleccionada(null);
      setEstado("respondiendo");
      setResultado(null);
      setImagenAmpliada(false);
      setMostrarExplicacion(true);
      setCerrandoTarjeta(false);
      return;
    }

    const duracionSegundos = Math.round((Date.now() - horaInicioRef.current) / 1000);
    await fetch(`/api/sesiones/${sesionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aciertos, duracion_segundos: duracionSegundos }),
    }).catch(() => {});
    sessionStorage.removeItem(`mir_test_${sesionId}`);
    router.push(`/resultados/${sesionId}`);
  }

  function salir() {
    sessionStorage.removeItem(`mir_test_${sesionId}`);
    router.push("/inicio");
  }

  function cerrarExplicacion() {
    setCerrandoTarjeta(true);
  }

  function abrirExplicacion() {
    setMostrarExplicacion(true);
  }

  if (!preguntas || !preguntaActual) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-ink-muted">Cargando test…</p>
      </div>
    );
  }

  const opciones = LETRAS.map((letra) => ({
    letra,
    texto: preguntaActual[`opcion_${letra.toLowerCase()}`],
  })).filter((o) => o.texto);

  const progreso = ((estado === "corregido" ? indice + 1 : indice) / preguntas.length) * 100;

  return (
    <div className="min-h-screen pb-8">
      <header className="flex items-center gap-3 px-5 pt-safe">
        <button
          type="button"
          onClick={() => setMostrarSalir(true)}
          aria-label="Salir del test"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-ink">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        {/* Barra de progreso de preguntas: gruesa y con el texto integrado, para
            que no se confunda visualmente con el chip del temporizador. */}
        <div className="relative h-8 flex-1 overflow-hidden rounded-full bg-track">
          <div
            className="h-full rounded-full bg-brand-light transition-all"
            style={{ width: `${progreso}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-ink">
            Pregunta {indice + 1} de {preguntas.length}
          </span>
        </div>
        {estado === "respondiendo" && segundosPorPregunta && tiempoRestante !== null && (
          <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-brand-light px-3 py-1.5 text-sm font-bold text-brand">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
            </svg>
            {formatearTiempo(tiempoRestante)}
          </span>
        )}
      </header>

      <main
        className={`mt-5 px-5 ${
          estado === "corregido" && !mostrarExplicacion ? "pb-32" : ""
        }`}
      >
        <span className="inline-block rounded-full bg-badge-bg px-3 py-1 text-sm font-bold text-badge-text">
          {preguntaActual.especialidad}
        </span>

        <p className="mt-3 text-lg font-medium text-ink">{preguntaActual.pregunta}</p>

        {preguntaActual.imagen_path && (
          <button
            type="button"
            onClick={() => setImagenAmpliada(true)}
            aria-label="Ampliar imagen de la pregunta"
            className="relative mt-4 block w-full"
          >
            <Image
              src={preguntaActual.imagen_path}
              alt="Imagen clínica de la pregunta MIR"
              width={600}
              height={400}
              className="h-auto w-full rounded-lg bg-panel object-contain"
            />
            <span className="pointer-events-none absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink/60 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="m21 21-4.3-4.3" />
              </svg>
            </span>
          </button>
        )}

        <div className="mt-4 flex flex-col gap-3">
          {opciones.map((o) => (
            <OptionCard
              key={o.letra}
              letra={o.letra}
              texto={o.texto}
              modo={estado}
              seleccionada={seleccionada === o.letra}
              esCorrecta={estado === "corregido" && resultado.respuesta_correcta === o.letra}
              esRespuestaUsuario={estado === "corregido" && seleccionada === o.letra}
              onClick={() => estado === "respondiendo" && setSeleccionada(o.letra)}
            />
          ))}
        </div>

        {estado === "respondiendo" && (
          <div className="mt-6">
            <button
              type="button"
              disabled={!seleccionada || enviando}
              onClick={() => confirmarRespuesta()}
              className="h-14 w-full rounded-2xl bg-brand text-lg font-bold text-white shadow-sm active:bg-brand-dark disabled:bg-track disabled:text-ink-muted"
            >
              {enviando ? "Enviando…" : "Confirmar respuesta"}
            </button>
          </div>
        )}
      </main>

      {estado === "corregido" && !mostrarExplicacion && (
        <div className="fixed inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 border-t border-track bg-surface px-5 py-4 pb-safe">
          <button
            type="button"
            onClick={abrirExplicacion}
            className="text-sm font-bold text-ink-muted underline-offset-2 hover:underline"
          >
            Ver explicación
          </button>
          <button
            type="button"
            onClick={siguientePregunta}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-lg font-bold text-white shadow-sm active:bg-brand-dark"
          >
            {indice + 1 < preguntas.length ? "Siguiente pregunta" : "Ver resultados"}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      )}

      {estado === "corregido" && mostrarExplicacion && (
        <div
          key={preguntaActual.id}
          className={`fixed inset-0 z-20 flex flex-col bg-surface ${
            cerrandoTarjeta ? "animate-slide-out-left" : "animate-slide-in-left"
          }`}
          onAnimationEnd={() => {
            if (cerrandoTarjeta) {
              setMostrarExplicacion(false);
              setCerrandoTarjeta(false);
            }
          }}
        >
          <div className="flex-1 overflow-y-auto px-5 pb-6 pt-safe">
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-white ${
                    resultado.correcta ? "bg-success" : "bg-danger"
                  }`}
                >
                  {resultado.correcta ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4 10-10" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
                    </svg>
                  )}
                </span>
                <p
                  className={`text-2xl font-extrabold ${
                    resultado.correcta ? "text-success-text" : "text-danger-text"
                  }`}
                >
                  {resultado.correcta ? "CORRECTO" : "INCORRECTO"}
                </p>
              </div>
              <button
                type="button"
                onClick={cerrarExplicacion}
                aria-label="Cerrar explicación"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-ink">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="mt-5 flex flex-col gap-2 text-ink">
              <p>
                <span className="font-bold">Respondiste: </span>
                {seleccionada
                  ? `${seleccionada} — ${preguntaActual[`opcion_${seleccionada.toLowerCase()}`]}`
                  : "(sin responder — se agotó el tiempo)"}
              </p>
              {!resultado.correcta && (
                <p>
                  <span className="font-bold">Respuesta correcta: </span>
                  {resultado.respuesta_correcta} —{" "}
                  {preguntaActual[`opcion_${String(resultado.respuesta_correcta).toLowerCase()}`]}
                </p>
              )}
            </div>

            <hr className="my-5 border-track" />

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">
                Explicación
              </p>
              {resultado.explicacion ? (
                <div className="flex flex-col items-start gap-2">
                  {resultado.explicacion_calidad === "orientativa" && (
                    <span className="rounded-full bg-warning-bg px-3 py-1 text-xs font-bold text-warning-text">
                      💡 Explicación orientativa — contrasta con tu manual
                    </span>
                  )}
                  {resultado.explicacion_calidad === "controversia" && (
                    <span className="rounded-full bg-danger-bg px-3 py-1 text-xs font-bold text-danger-text">
                      ⚠️ Respuesta oficial cuestionada
                    </span>
                  )}
                  <p className="text-sm leading-relaxed text-ink">{resultado.explicacion}</p>
                  {resultado.explicacion_calidad === "controversia" && (
                    <Link href="/controversias" target="_blank" className="text-sm font-bold text-brand">
                      Ver /controversias →
                    </Link>
                  )}
                </div>
              ) : resultado.explicacion_calidad === "sin_imagen" ? (
                <div className="flex flex-col items-start gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-track px-3 py-1 text-xs font-bold text-ink-muted">
                    🖼️ Sin imagen disponible
                  </span>
                  <p className="text-sm leading-relaxed text-ink-muted">
                    Esta pregunta hace referencia a una imagen clínica del examen original.
                    Explicación no disponible.
                  </p>
                </div>
              ) : resultado.explicacion_calidad === "controversia" ? (
                <div className="flex flex-col items-start gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-danger-bg px-3 py-1 text-xs font-bold text-danger-text">
                    ⚠️ Respuesta cuestionada
                  </span>
                  <p className="text-sm leading-relaxed text-ink-muted">
                    La respuesta oficial de esta pregunta ha sido cuestionada.{" "}
                    <Link href="/controversias" target="_blank" className="font-bold text-brand">
                      Ver /controversias
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-start gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-track px-3 py-1 text-xs font-bold text-ink-muted">
                    📚 No disponible
                  </span>
                  <p className="text-sm leading-relaxed text-ink-muted">
                    Explicación no disponible para esta pregunta.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-track px-5 py-4 pb-safe">
            <button
              type="button"
              onClick={siguientePregunta}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-lg font-bold text-white shadow-sm active:bg-brand-dark"
            >
              {indice + 1 < preguntas.length ? "Siguiente pregunta" : "Ver resultados"}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {imagenAmpliada && preguntaActual.imagen_path && (
        <div
          className="fixed inset-0 z-40 bg-black/90"
          onClick={() => setImagenAmpliada(false)}
        >
          <button
            type="button"
            onClick={() => setImagenAmpliada(false)}
            aria-label="Cerrar imagen"
            className="absolute right-4 top-safe z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
          <div
            className="absolute inset-6"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={preguntaActual.imagen_path}
              alt="Imagen clínica de la pregunta MIR"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}

      {mostrarSalir && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink/40 px-6">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-lg">
            <p className="text-lg font-bold text-ink">¿Salir del test?</p>
            <p className="mt-1 text-sm text-ink-muted">
              Perderás el progreso de esta sesión y no se guardará el resultado.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setMostrarSalir(false)}
                className="h-11 flex-1 rounded-xl border border-track font-bold text-ink"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salir}
                className="h-11 flex-1 rounded-xl bg-danger font-bold text-white"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
