"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import OptionCard from "../../../components/OptionCard";
import TestFeedback from "../../../components/TestFeedback";
import VideoTrasFallo from "../../../components/VideoTrasFallo";
import { leerSimulacro } from "../../../lib/simulacroLocal";
import Simulacro from "./Simulacro";

const LETRAS = ["A", "B", "C", "D", "E"];

function formatearTiempo(segundos) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TestPregunta({ params }) {
  const router = useRouter();
  const sesionId = params.id;
  const { data: session } = useSession();
  const esPremium = session?.user?.plan === "premium";

  const [preguntas, setPreguntas] = useState(null);
  const [segundosPorPregunta, setSegundosPorPregunta] = useState(null);
  // Simulacro: { datos, persistente } — lo lleva el componente Simulacro.
  const [simulacro, setSimulacro] = useState(null);
  const [indice, setIndice] = useState(0);
  const [seleccionada, setSeleccionada] = useState(null);
  const [estado, setEstado] = useState("respondiendo"); // "respondiendo" | "corregido"
  const [resultado, setResultado] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [tutorFallo, setTutorFallo] = useState(null);
  const [tutorFalloCargando, setTutorFalloCargando] = useState(false);
  const [tutorFalloError, setTutorFalloError] = useState("");
  const [mostrarSalir, setMostrarSalir] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState(false);
  const [mostrarExplicacion, setMostrarExplicacion] = useState(true);
  const [cerrandoTarjeta, setCerrandoTarjeta] = useState(false);
  // Para pintar la rejilla y volver a ver preguntas ya respondidas: id de
  // pregunta → { correcta, respuesta, resultado } (lo que devolvió el servidor
  // al responder). Revisar no vuelve a llamar a la API: nota y estadísticas no cambian.
  const [respondidas, setRespondidas] = useState({});
  const [revisando, setRevisando] = useState(null); // id de la pregunta en revisión
  const [hojaAbierta, setHojaAbierta] = useState(false); // rejilla en móvil

  const horaInicioRef = useRef(null);
  const mostrarSalirRef = useRef(false);
  const revisandoRef = useRef(null);
  useEffect(() => {
    mostrarSalirRef.current = mostrarSalir;
  }, [mostrarSalir]);
  useEffect(() => {
    revisandoRef.current = revisando;
  }, [revisando]);

  // Escape cierra la hoja de la rejilla y, si no está abierta, sale de la revisión
  // (salvo con la imagen ampliada, que se cierra con su propio Escape).
  useEffect(() => {
    if (!hojaAbierta && revisando === null) return;
    function onKeyDown(e) {
      if (e.key !== "Escape" || imagenAmpliada) return;
      if (hojaAbierta) setHojaAbierta(false);
      else setRevisando(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hojaAbierta, revisando, imagenAmpliada]);

  // Contador de aciertos en un ref (no en estado): se necesita su valor
  // actualizado en la misma pasada async en la que se registra la última
  // respuesta, antes de que React vuelva a renderizar.
  const aciertosRef = useRef(0);

  useEffect(() => {
    if (!imagenAmpliada) return;
    function onKeyDown(e) {
      if (e.key === "Escape") setImagenAmpliada(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [imagenAmpliada]);

  useEffect(() => {
    // Un simulacro se recupera de localStorage aunque se cerrara la pestaña
    // (si no se pudo guardar ahí, está en sessionStorage, como los tests).
    const local = leerSimulacro(sesionId);
    const guardado = local ? null : sessionStorage.getItem(`mir_test_${sesionId}`);
    if (!local && !guardado) {
      router.replace("/configuracion");
      return;
    }
    const datos = local || JSON.parse(guardado);
    const retomado = local && (local.indice > 0 || Object.keys(local.respuestas || {}).length > 0);
    if (datos.modoExamen === "simulacro") setSimulacro({ datos, persistente: Boolean(local) });
    setPreguntas(datos.preguntas);
    setSegundosPorPregunta(datos.segundosPorPregunta);
    horaInicioRef.current = Date.now();
    if (!retomado && typeof window.gtag === "function") {
      window.gtag("event", "test_start", {
        modo: datos.modoExamen || "practica",
        num_preguntas: datos.preguntas.length,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesionId]);

  const preguntaActual = preguntas ? preguntas[indice] : null;

  // Sin useCallback a propósito: necesita cerrar siempre sobre el
  // indice/preguntas/seleccionada MÁS RECIENTES (memoizarla con dependencias
  // parciales arriesgaría capturar un indice desactualizado).
  async function confirmarRespuesta(respuestaForzada) {
    if (!preguntaActual || enviando) return;
    const respuestaFinal = respuestaForzada !== undefined ? respuestaForzada : seleccionada;
    setEnviando(true);
    let data;
    try {
      const res = await fetch(`/api/sesiones/${sesionId}/respuestas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta_id: preguntaActual.id, respuesta_dada: respuestaFinal }),
      });
      data = await res.json();
    } catch (e) {
      data = { correcta: false, respuesta_correcta: "-", explicacion: null };
    }
    if (data.correcta) aciertosRef.current += 1;
    setRespondidas((r) => ({
      ...r,
      [preguntaActual.id]: { correcta: !!data.correcta, respuesta: respuestaFinal, resultado: data },
    }));
    setEnviando(false);

    setResultado(data);
    setEstado("corregido");
    setMostrarExplicacion(true);
  }

  // Temporizador por pregunta
  useEffect(() => {
    if (!preguntaActual || estado !== "respondiendo" || !segundosPorPregunta) {
      setTiempoRestante(null);
      return;
    }
    setTiempoRestante(segundosPorPregunta);
    const intervalo = setInterval(() => {
      // Pausado mientras se confirma la salida o se revisa otra pregunta.
      if (mostrarSalirRef.current || revisandoRef.current !== null) return;
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

  async function finalizarSesion() {
    const duracionSegundos = Math.round((Date.now() - horaInicioRef.current) / 1000);
    if (typeof window.gtag === "function") {
      window.gtag("event", "test_complete", {
        modo: "practica",
        aciertos: aciertosRef.current,
        total: preguntas.length,
        duracion_segundos: duracionSegundos,
      });
    }
    await fetch(`/api/sesiones/${sesionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aciertos: aciertosRef.current, duracion_segundos: duracionSegundos }),
    }).catch(() => {});
    sessionStorage.removeItem(`mir_test_${sesionId}`);
    router.push(`/resultados/${sesionId}`);
  }

  async function siguientePregunta() {
    if (indice + 1 < preguntas.length) {
      setIndice(indice + 1); // no (i) => i + 1: un doble clic no salta dos preguntas
      setSeleccionada(null);
      setEstado("respondiendo");
      setResultado(null);
      setImagenAmpliada(false);
      setMostrarExplicacion(true);
      setCerrandoTarjeta(false);
      setTutorFallo(null);
      setTutorFalloError("");
      return;
    }
    await finalizarSesion();
  }

  // Solo Premium: manda la pregunta actual al final de la cola de pendientes
  // sin tocar indice ni aciertosRef — como esa posición pasa a apuntar a la
  // que antes era la siguiente pregunta, el efecto es "avanzar" sin más.
  function saltarPregunta() {
    if (!esPremium) return;
    const [actual, ...resto] = preguntas.slice(indice);
    const nuevas = [...preguntas.slice(0, indice), ...resto, actual];
    setPreguntas(nuevas);
    setSeleccionada(null);
  }

  async function pedirTutorFallo() {
    if (tutorFalloCargando || !preguntaActual) return;
    setTutorFalloError("");
    setTutorFalloCargando(true);
    try {
      const res = await fetch(`/api/preguntas/${preguntaActual.id}/tutor-fallo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respuesta_dada: seleccionada }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTutorFallo(data.analisis);
    } catch (e) {
      setTutorFalloError("No se ha podido generar la explicación. Inténtalo de nuevo.");
    } finally {
      setTutorFalloCargando(false);
    }
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

  // Solo lectura: muestra una pregunta ya respondida sin tocar la pregunta en curso.
  function revisar(id) {
    setHojaAbierta(false);
    setImagenAmpliada(false);
    setRevisando(id);
    window.scrollTo(0, 0);
  }

  function volver() {
    setImagenAmpliada(false);
    setRevisando(null);
  }

  if (simulacro) return <Simulacro sesionId={sesionId} {...simulacro} />;

  if (!preguntas || !preguntaActual) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-ink-muted">Cargando test…</p>
      </div>
    );
  }

  // Lo que se pinta en la columna: la pregunta en curso o, en revisión, la
  // respondida que se está viendo (siempre corregida y sin poder responder).
  const revision = revisando !== null ? respondidas[revisando] : null;
  const numRevision = revision ? preguntas.findIndex((p) => p.id === revisando) + 1 : null;
  const preguntaVista = revision ? preguntas[numRevision - 1] : preguntaActual;
  const estadoVista = revision ? "corregido" : estado;
  const seleccionadaVista = revision ? revision.respuesta : seleccionada;
  const resultadoVista = revision ? revision.resultado : resultado;

  const opciones = LETRAS.map((letra) => ({
    letra,
    texto: preguntaVista[`opcion_${letra.toLowerCase()}`],
  })).filter((o) => o.texto);

  const progreso = ((estado === "corregido" ? indice + 1 : indice) / preguntas.length) * 100;
  const numRespondidas = preguntas.filter((p) => p.id in respondidas).length;

  const temporizadores = (
    <>
      {estado === "respondiendo" && segundosPorPregunta && tiempoRestante !== null && (
        <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-brand-light px-3 py-1.5 text-sm font-bold text-ink">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
          </svg>
          {formatearTiempo(tiempoRestante)}
        </span>
      )}
    </>
  );

  // Color de cada número de la rejilla.
  function claseCasilla(p, i) {
    if (i === indice) return "border-2 border-accent text-ink";
    const r = respondidas[p.id];
    if (!r) return "border border-track text-ink-subtle";
    const color = r.correcta ? "bg-success-bg text-success-text" : "bg-danger-bg text-danger-text";
    return p.id === revisando ? `${color} ring-2 ring-ink` : color;
  }

  // Rejilla del panel (escritorio) y de la hoja (móvil): las respondidas,
  // salvo la actual, son botones que abren su revisión; el resto, solo el número.
  function rejilla(alto) {
    return preguntas.map((p, i) => {
      const r = respondidas[p.id];
      const clase = `flex ${alto} w-full items-center justify-center rounded-md ${claseCasilla(p, i)}`;
      return (
        <li key={p.id} className="flex">
          {r && i !== indice ? (
            <button
              type="button"
              onClick={() => revisar(p.id)}
              aria-label={`Ver la pregunta ${i + 1}, ${r.correcta ? "acertada" : "fallada"}`}
              aria-current={p.id === revisando ? "true" : undefined}
              className={`${clase} cursor-pointer hover:ring-2 hover:ring-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`}
            >
              {i + 1}
            </button>
          ) : (
            <span className={clase} aria-current={i === indice ? "step" : undefined}>
              {i + 1}
            </span>
          )}
        </li>
      );
    });
  }

  const leyenda = "Verde: acierto. Rojo: fallo. Recuadro: pregunta actual. Pulsa una respondida para volver a verla.";

  // Tarjeta de corrección: la de la pregunta en curso (a pantalla completa) y
  // la de la revisión (en la columna). En revisión no hay «¿Por qué he
  // fallado?» y el botón de avanzar vuelve a la pregunta en curso.
  function tarjetaCorreccion(pregunta, res, sel, enRevision) {
    const avanzar = enRevision ? volver : siguientePregunta;
    const avanzarLabel = enRevision
      ? `Volver a la pregunta ${indice + 1}`
      : indice + 1 < preguntas.length
        ? "Siguiente pregunta"
        : "Ver resultados";
    const botonCerrar = !enRevision && (
      <button
        type="button"
        onClick={cerrarExplicacion}
        aria-label="Cerrar explicación"
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-card shadow-sm"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 text-ink">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    );
    const video = (
      <VideoTrasFallo key={pregunta.id} preguntaId={pregunta.id} mostrarPremium={!esPremium} esPremium={esPremium} />
    );
    return !res.controversia && res.explicacion ? (
      // Caso normal: tarjeta rediseñada (TestFeedback). Controversia y
      // sin_imagen/no-disponible siguen con el markup de siempre, sin tocar.
      <>
        {botonCerrar && <div className="flex justify-end pt-2">{botonCerrar}</div>}
        <div className="mt-2 flex justify-center">
          <TestFeedback
            isCorrect={res.correcta}
            userLetter={sel || "-"}
            userText={sel ? pregunta[`opcion_${sel.toLowerCase()}`] : "(sin responder — se agotó el tiempo)"}
            correctLetter={res.respuesta_correcta}
            correctText={pregunta[`opcion_${String(res.respuesta_correcta).toLowerCase()}`]}
            explicacion={res.explicacion}
            onPorQueFalle={!enRevision && !tutorFallo && !tutorFalloCargando ? pedirTutorFallo : undefined}
            porQueFalleExtra={
              enRevision ? undefined : (
                <>
                  {tutorFalloCargando && <p className="mt-3 text-sm text-ink-muted">Analizando tu fallo…</p>}
                  {tutorFalloError && !tutorFalloCargando && (
                    <div className="mt-3 flex flex-col items-start gap-2">
                      <p className="text-sm text-danger-text">{tutorFalloError}</p>
                      <button type="button" onClick={pedirTutorFallo} className="text-sm font-bold text-accent">
                        Reintentar
                      </button>
                    </div>
                  )}
                  {tutorFallo && (
                    <div className="mt-3 rounded-xl bg-brand-light p-3">
                      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-accent">
                        🎓 Tutor IA — ¿por qué he fallado esto?
                      </p>
                      <p className="text-sm leading-relaxed text-ink">{tutorFallo}</p>
                    </div>
                  )}
                </>
              )
            }
            bloqueVideo={video}
            onSiguiente={avanzar}
            siguienteLabel={avanzarLabel}
          />
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-on-status ${
                res.correcta ? "bg-success" : "bg-danger"
              }`}
            >
              {res.correcta ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4 10-10" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
                </svg>
              )}
            </span>
            <p className={`text-2xl font-extrabold ${res.correcta ? "text-success-text" : "text-danger-text"}`}>
              {res.correcta ? "CORRECTO" : "INCORRECTO"}
            </p>
          </div>
          {botonCerrar}
        </div>

        <div className="mt-5 flex flex-col gap-2 text-ink">
          <p>
            <span className="font-bold">Respondiste: </span>
            {sel ? `${sel} — ${pregunta[`opcion_${sel.toLowerCase()}`]}` : "(sin responder — se agotó el tiempo)"}
          </p>
          {!res.correcta && (
            <p>
              <span className="font-bold">Respuesta correcta: </span>
              {res.respuesta_correcta} — {pregunta[`opcion_${String(res.respuesta_correcta).toLowerCase()}`]}
            </p>
          )}
        </div>

        <hr className="my-5 border-track" />

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">
            {res.controversia ? "Respuesta cuestionada" : "Explicación"}
          </p>
          {res.controversia ? (
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-warning-border bg-warning-bg p-3 text-xs text-warning-text">
                ⚠️ Las explicaciones de esta sección reflejan análisis clínico basado en literatura médica. La
                respuesta válida en el examen MIR es siempre la de la plantilla oficial del Ministerio de Sanidad.
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-danger-text">🔴 Respuesta oficial Ministerio</p>
                <p className="mt-1 text-sm text-ink">
                  {res.controversia.respuesta_oficial.letra} — {res.controversia.respuesta_oficial.texto}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-warning-text">
                  🟡 Respuesta alternativa defendible
                </p>
                <p className="mt-1 text-sm text-ink">
                  {res.controversia.respuesta_recomendada
                    ? `${res.controversia.respuesta_recomendada.letra} — ${res.controversia.respuesta_recomendada.texto}`
                    : "No se identifica una única alternativa clara — ver motivo de la discrepancia."}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">📚 Motivo de la discrepancia</p>
                <p className="mt-1 text-sm text-ink-muted">
                  {res.controversia.motivo || "Respuesta cuestionada — sin detalle documentado."}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">🎯 Consejo para el examen</p>
                <p className="mt-1 text-sm text-ink-muted">
                  En el MIR debes marcar la respuesta oficial aunque la evidencia clínica pueda apuntar a otra
                  dirección.
                </p>
              </div>

              <Link href="/controversias" target="_blank" className="text-sm font-bold text-accent">
                Ver todas las controversias →
              </Link>
            </div>
          ) : res.explicacion_calidad === "sin_imagen" ? (
            <div className="flex flex-col items-start gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-track px-3 py-1 text-xs font-bold text-ink-muted">
                🖼️ Sin imagen disponible
              </span>
              <p className="text-sm leading-relaxed text-ink-muted">
                Esta pregunta hace referencia a una imagen clínica del examen original. Explicación no disponible.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-start gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-track px-3 py-1 text-xs font-bold text-ink-muted">
                📚 No disponible
              </span>
              <p className="text-sm leading-relaxed text-ink-muted">Explicación no disponible para esta pregunta.</p>
            </div>
          )}
        </div>

        {!res.correcta && !res.controversia && (
          <div className="mt-5 border-t border-track pt-4">
            {!enRevision && !tutorFallo && !tutorFalloCargando && (
              <button
                type="button"
                onClick={pedirTutorFallo}
                className="flex items-center gap-1.5 text-sm font-bold text-accent"
              >
                🤔 ¿Por qué he fallado esto?
              </button>
            )}

            {!enRevision && tutorFalloCargando && <p className="text-sm text-ink-muted">Analizando tu fallo…</p>}

            {!enRevision && tutorFalloError && !tutorFalloCargando && (
              <div className="flex flex-col items-start gap-2">
                <p className="text-sm text-danger-text">{tutorFalloError}</p>
                <button type="button" onClick={pedirTutorFallo} className="text-sm font-bold text-accent">
                  Reintentar
                </button>
              </div>
            )}

            {!enRevision && tutorFallo && (
              <div className="rounded-xl bg-brand-light p-3">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-accent">
                  🎓 Tutor IA — ¿por qué he fallado esto?
                </p>
                <p className="text-sm leading-relaxed text-ink">{tutorFallo}</p>
              </div>
            )}

            {video}
          </div>
        )}
      </>
    );
  }

  // Botón de avanzar del markup antiguo (controversia y sin explicación); el
  // caso normal lo trae TestFeedback.
  function botonAvanzar(res, enRevision) {
    if (!(res.controversia || !res.explicacion)) return null;
    return (
      <button
        type="button"
        onClick={enRevision ? volver : siguientePregunta}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-lg font-bold text-on-brand shadow-sm active:bg-brand-dark lg:mx-auto lg:max-w-[720px]"
      >
        {enRevision
          ? `Volver a la pregunta ${indice + 1}`
          : indice + 1 < preguntas.length
            ? "Siguiente pregunta"
            : "Ver resultados"}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    );
  }

  return (
    <div className="ancho-app min-h-screen pb-8 lg:px-8">
      <header className="flex items-center gap-3 px-5 pt-safe lg:px-0 lg:pt-8">
        <button
          type="button"
          onClick={() => setMostrarSalir(true)}
          aria-label="Salir del test"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-card shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-ink">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        {/* Barra de progreso de preguntas: gruesa y con el texto integrado, para
            que no se confunda visualmente con el chip del temporizador. En
            móvil abre la hoja con la rejilla (en escritorio está en el panel). */}
        <button
          type="button"
          onClick={() => setHojaAbierta(true)}
          aria-haspopup="dialog"
          aria-expanded={hojaAbierta}
          aria-label={`Pregunta ${indice + 1} de ${preguntas.length}. Ver el panel de preguntas`}
          className="relative h-8 flex-1 cursor-pointer overflow-hidden rounded-full bg-track focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
        >
          <span
            className="block h-full rounded-full bg-brand-light transition-all"
            style={{ width: `${progreso}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center gap-1 text-xs font-bold text-ink">
            Pregunta {indice + 1} de {preguntas.length}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-3.5 w-3.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
        <div className="flex gap-3 empty:hidden lg:hidden">{temporizadores}</div>
      </header>

      {/* Escritorio: pregunta (hasta 860 px) y, a 48 px, el panel con progreso,
          temporizador y rejilla, que se queda el resto (mín. 300 px): entre los
          dos llenan el contenedor (860 + 48 + 332 = 1240 px). */}
      <div className="lg:mt-6 lg:grid lg:grid-cols-[minmax(0,860px)_minmax(300px,1fr)] lg:items-start lg:gap-12">
        <div
          className={`mt-5 px-5 lg:mt-0 lg:px-0 ${
            estado === "corregido" && !mostrarExplicacion && !revision ? "pb-32 lg:pb-0" : ""
          }`}
        >
          {revision && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-accent bg-card px-4 py-3">
              <p className="text-sm font-bold text-ink" role="status">
                Revisando la pregunta {numRevision} · solo lectura
              </p>
              <button
                type="button"
                onClick={volver}
                className="h-10 rounded-xl bg-brand px-4 text-sm font-bold text-on-brand shadow-sm active:bg-brand-dark"
              >
                Volver a la pregunta {indice + 1}
              </button>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block rounded-full bg-badge-bg px-3 py-1 text-sm font-bold text-badge-text">
              {preguntaVista.especialidad}
            </span>
            {preguntaVista.origen === "ia_generada" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-warning-border bg-warning-bg px-3 py-1 text-sm font-bold text-warning-text">
                ✨ Generada con IA
              </span>
            )}
          </div>

          <p className="mt-3 text-lg font-medium text-ink">{preguntaVista.pregunta}</p>

          {preguntaVista.imagen_path && (
            <button
              type="button"
              onClick={() => setImagenAmpliada(true)}
              aria-label="Ampliar imagen de la pregunta"
              className="relative mt-4 block w-full"
            >
              <Image
                src={preguntaVista.imagen_path}
                alt="Imagen clínica de la pregunta MIR"
                width={600}
                height={400}
                className="h-auto w-full rounded-lg bg-panel object-contain"
              />
              <span className="pointer-events-none absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white">
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
                modo={estadoVista}
                seleccionada={seleccionadaVista === o.letra}
                esCorrecta={estadoVista === "corregido" && resultadoVista.respuesta_correcta === o.letra}
                esRespuestaUsuario={estadoVista === "corregido" && seleccionadaVista === o.letra}
                onClick={() => estadoVista === "respondiendo" && setSeleccionada(o.letra)}
              />
            ))}
          </div>

          {revision && (
            <div className="mt-6">
              {tarjetaCorreccion(preguntaVista, resultadoVista, seleccionadaVista, true)}
              {botonAvanzar(resultadoVista, true) && <div className="mt-6">{botonAvanzar(resultadoVista, true)}</div>}
            </div>
          )}

          {estado === "respondiendo" && !revision && (
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                disabled={!seleccionada || enviando}
                onClick={() => confirmarRespuesta()}
                className="h-14 w-full rounded-2xl bg-brand text-lg font-bold text-on-brand shadow-sm active:bg-brand-dark disabled:bg-track disabled:text-ink-muted"
              >
                {enviando ? "Enviando…" : "Confirmar respuesta"}
              </button>
              {esPremium && (
                <button
                  type="button"
                  disabled={enviando}
                  onClick={saltarPregunta}
                  className="h-12 w-full rounded-2xl border-2 border-track text-sm font-bold text-ink-muted active:bg-track disabled:opacity-60"
                >
                  Saltar pregunta
                </button>
              )}
            </div>
          )}

          {estado === "corregido" && !mostrarExplicacion && !revision && (
            <div className="fixed inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 border-t border-track bg-surface px-5 py-4 pb-safe lg:static lg:mt-6 lg:border-0 lg:bg-transparent lg:p-0">
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
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand text-lg font-bold text-on-brand shadow-sm active:bg-brand-dark"
              >
                {indice + 1 < preguntas.length ? "Siguiente pregunta" : "Ver resultados"}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <aside className="hidden lg:sticky lg:top-8 lg:flex lg:flex-col lg:gap-4 lg:rounded-2xl lg:border lg:border-track lg:bg-card lg:p-5">
          <div>
            <p className="flex items-baseline justify-between text-sm text-ink-muted">
              <span>
                Pregunta <span className="font-mono text-ink">{indice + 1}</span> de{" "}
                <span className="font-mono text-ink">{preguntas.length}</span>
              </span>
              <span className="font-mono text-xs">{numRespondidas} respondidas</span>
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-track" aria-hidden="true">
              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progreso}%` }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 empty:hidden">{temporizadores}</div>
          <ol
            aria-label="Preguntas del test"
            className="grid max-h-[50vh] grid-cols-8 gap-1.5 overflow-y-auto p-1 font-mono text-xs"
          >
            {rejilla("h-8")}
          </ol>
          <p className="text-xs text-ink-muted">{leyenda}</p>
        </aside>
      </div>

      {hojaAbierta && (
        <div className="fixed inset-0 z-30 flex items-end bg-black/50 lg:hidden" onClick={() => setHojaAbierta(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-hoja-preguntas"
            className="w-full rounded-t-2xl bg-card px-5 pb-safe pt-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <p id="titulo-hoja-preguntas" className="font-bold text-ink">
                Preguntas · <span className="font-mono text-sm font-normal text-ink-muted">{numRespondidas} respondidas</span>
              </p>
              <button
                type="button"
                autoFocus
                onClick={() => setHojaAbierta(false)}
                className="h-10 rounded-xl border border-track px-4 text-sm font-bold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Cerrar
              </button>
            </div>
            <ol
              aria-label="Preguntas del test"
              className="mt-4 grid max-h-[50vh] grid-cols-6 gap-2 overflow-y-auto p-1 font-mono text-sm"
            >
              {rejilla("h-11")}
            </ol>
            <p className="mb-4 mt-3 text-xs text-ink-muted">{leyenda}</p>
          </div>
        </div>
      )}

      {estado === "corregido" && mostrarExplicacion && !revision && (
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
          <div className="flex-1 overflow-y-auto px-5 pb-6 pt-safe lg:pt-8">
            <div className="lg:mx-auto lg:max-w-[720px]">
              {tarjetaCorreccion(preguntaActual, resultado, seleccionada, false)}
            </div>
          </div>

          {(resultado.controversia || !resultado.explicacion) && (
            <div className="border-t border-track px-5 py-4 pb-safe">{botonAvanzar(resultado, false)}</div>
          )}
        </div>
      )}

      {imagenAmpliada && preguntaVista.imagen_path && (
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
              src={preguntaVista.imagen_path}
              alt="Imagen clínica de la pregunta MIR"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}

      {mostrarSalir && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-xs rounded-2xl bg-card p-5 shadow-lg">
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
                className="h-11 flex-1 rounded-xl bg-danger font-bold text-on-status"
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
