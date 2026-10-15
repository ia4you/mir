"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import OptionCard from "../../../components/OptionCard";
import ImagenPregunta from "../../../components/ImagenPregunta";
import { guardarSimulacro, borrarSimulacro } from "../../../lib/simulacroLocal";

const LETRAS = ["A", "B", "C", "D", "E"];

function formatearTiempoLargo(segundos) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Simulacro MIR como el examen real: se va y se vuelve entre preguntas (con
// la rejilla o Anterior/Siguiente), la respuesta se puede cambiar o borrar
// hasta entregar, y las dudosas se marcan para volver a ellas. Nada se
// corrige hasta la entrega, que es un solo envío (el servidor corrige).
//
// Todo se guarda en este dispositivo (app/lib/simulacroLocal.js) para poder
// seguir si se cierra la pestaña; `persistente` es false si localStorage no
// estaba disponible al empezar (entonces solo dura lo que la pestaña).
export default function Simulacro({ sesionId, datos, persistente }) {
  const router = useRouter();
  const { data: session } = useSession();
  const preguntas = datos.preguntas;
  const total = preguntas.length;
  const segundosTotales = datos.segundosTotales;

  const [indice, setIndice] = useState(Math.min(datos.indice || 0, total - 1));
  // pregunta → letra; sin clave o null = en blanco
  const [respuestas, setRespuestas] = useState(datos.respuestas || {});
  const [dudosas, setDudosas] = useState(() => new Set(datos.dudosas || []));
  const [tiempoRestante, setTiempoRestante] = useState(null);
  const [filtro, setFiltro] = useState("todas"); // "todas" | "dudosas" | "sin"
  const [rejillaAbierta, setRejillaAbierta] = useState(false); // panel de móvil
  const [mostrarEntregar, setMostrarEntregar] = useState(false);
  const [mostrarSalir, setMostrarSalir] = useState(false);
  const [entrega, setEntrega] = useState(null); // null | "enviando" | "fallida"

  // Preguntas abiertas: solo sus blancos van al repaso y a /errores.
  const vistasRef = useRef(new Set(datos.vistas || []));
  const horaInicioRef = useRef(datos.inicio || Date.now());
  const respuestasRef = useRef(respuestas);
  respuestasRef.current = respuestas;
  const entregandoRef = useRef(false);
  const entregadoRef = useRef(false);

  const actual = preguntas[indice];
  const respondidas = preguntas.filter((p) => respuestas[p.id]).length;

  // Un simulacro guardado en este dispositivo por otra cuenta no se abre.
  useEffect(() => {
    if (datos.userId && session?.user?.id && String(datos.userId) !== String(session.user.id)) {
      router.replace("/inicio");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // La pregunta que se muestra pasa a "abierta".
  useEffect(() => {
    vistasRef.current.add(actual.id);
  }, [actual.id]);

  // Guardado en este dispositivo tras cada cambio.
  useEffect(() => {
    if (!persistente || entregadoRef.current) return;
    guardarSimulacro(sesionId, {
      ...datos,
      inicio: horaInicioRef.current,
      respuestas,
      dudosas: [...dudosas],
      vistas: [...vistasRef.current],
      indice,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [respuestas, dudosas, indice]);

  // Aviso del navegador al cerrar o recargar sin entregar.
  useEffect(() => {
    function avisar(e) {
      if (entregadoRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", avisar);
    return () => window.removeEventListener("beforeunload", avisar);
  }, []);

  // Temporizador global (4 h 30 min) desde la hora de inicio guardada, no
  // restando 1 en cada tick, para no desincronizarse con la pestaña en
  // segundo plano. Si al retomar ya se acabó, se entrega sin crear el intervalo.
  const entregarRef = useRef(() => {});
  useEffect(() => {
    let intervalo = null;
    function tick() {
      const transcurridos = Math.round((Date.now() - horaInicioRef.current) / 1000);
      const restante = Math.max(0, segundosTotales - transcurridos);
      setTiempoRestante(restante);
      if (restante > 0) return false;
      clearInterval(intervalo);
      entregarRef.current();
      return true;
    }
    if (tick()) return;
    intervalo = setInterval(tick, 1000);
    return () => clearInterval(intervalo);
  }, [segundosTotales]);

  // Entrega en un solo envío. Lo guardado en el dispositivo solo se borra si
  // la entrega se ha guardado (o ya lo estaba: 409); si falla, se reintenta
  // sin perder nada.
  async function entregar() {
    if (entregandoRef.current || entregadoRef.current) return;
    entregandoRef.current = true;
    setMostrarEntregar(false);
    setEntrega("enviando");
    const transcurridos = Math.round((Date.now() - horaInicioRef.current) / 1000);
    const duracionSegundos = Math.min(transcurridos, segundosTotales);
    let res = null;
    try {
      res = await fetch(`/api/sesiones/${sesionId}/entregar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respuestas: preguntas.map((p) => ({ pregunta_id: p.id, respuesta_dada: respuestasRef.current[p.id] || null })),
          vistas: [...vistasRef.current],
          duracion_segundos: duracionSegundos,
        }),
      });
    } catch {
      // sin conexión: se queda en "fallida"
    }
    if (res && (res.ok || res.status === 409)) {
      const data = res.ok ? await res.json().catch(() => null) : null;
      entregadoRef.current = true;
      if (data && typeof window.gtag === "function") {
        window.gtag("event", "test_complete", {
          modo: "simulacro",
          aciertos: data.aciertos,
          total: data.total,
          duracion_segundos: duracionSegundos,
        });
      }
      borrarSimulacro(sesionId);
      sessionStorage.removeItem(`mir_test_${sesionId}`);
      router.push(`/resultados/${sesionId}`);
      return;
    }
    entregandoRef.current = false;
    setEntrega("fallida");
  }
  entregarRef.current = entregar;

  function ir(i) {
    setIndice(Math.max(0, Math.min(total - 1, i)));
    window.scrollTo({ top: 0 });
  }

  function elegir(letra) {
    setRespuestas((r) => ({ ...r, [actual.id]: letra }));
  }

  function borrar() {
    setRespuestas((r) => {
      const { [actual.id]: _, ...resto } = r;
      return resto;
    });
  }

  function alternarDudosa() {
    setDudosas((d) => {
      const n = new Set(d);
      if (n.has(actual.id)) n.delete(actual.id);
      else n.add(actual.id);
      return n;
    });
  }

  function revisarDudosas() {
    const primera = preguntas.findIndex((p) => dudosas.has(p.id));
    setMostrarEntregar(false);
    setFiltro("dudosas");
    if (primera !== -1) ir(primera);
  }

  function salir() {
    router.push("/inicio");
  }

  function abandonar() {
    entregadoRef.current = true; // sin aviso del navegador al salir
    borrarSimulacro(sesionId);
    sessionStorage.removeItem(`mir_test_${sesionId}`);
    router.push("/inicio");
  }

  const opciones = LETRAS.map((letra) => ({ letra, texto: actual[`opcion_${letra.toLowerCase()}`] })).filter(
    (o) => o.texto
  );
  const esDudosa = dudosas.has(actual.id);
  const respuestaActual = respuestas[actual.id] || null;
  const esUltima = indice === total - 1;

  const temporizador = tiempoRestante !== null && (
    <span
      className={`flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold ${
        tiempoRestante <= 300 ? "bg-danger-bg text-danger-text" : "bg-brand-light text-ink"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
      </svg>
      <span className="sr-only">Tiempo restante:</span>
      {formatearTiempoLargo(tiempoRestante)}
    </span>
  );

  const rejilla = (
    <Rejilla
      preguntas={preguntas}
      respuestas={respuestas}
      dudosas={dudosas}
      indice={indice}
      filtro={filtro}
      onFiltro={setFiltro}
      onIr={(i) => {
        ir(i);
        setRejillaAbierta(false);
      }}
    />
  );

  return (
    <div className="ancho-app min-h-screen pb-8 lg:px-8">
      <header className="flex items-center gap-3 px-5 pt-safe lg:px-0 lg:pt-8">
        <button
          type="button"
          onClick={() => setMostrarSalir(true)}
          aria-label="Salir del simulacro"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-card shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-ink" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setRejillaAbierta(true)}
          aria-haspopup="dialog"
          className="relative h-10 flex-1 overflow-hidden rounded-full bg-track text-xs font-bold text-ink lg:hidden"
        >
          <span className="absolute inset-y-0 left-0 bg-brand-light" style={{ width: `${(respondidas / total) * 100}%` }} aria-hidden="true" />
          <span className="relative flex items-center justify-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4" aria-hidden="true">
              <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
            </svg>
            Pregunta {indice + 1} de {total}
            <span className="sr-only">. Abrir la rejilla</span>
          </span>
        </button>
        <div className="lg:hidden">{temporizador}</div>
      </header>

      <div className="lg:mt-6 lg:grid lg:grid-cols-[minmax(0,860px)_minmax(300px,1fr)] lg:items-start lg:gap-12">
        <div className="mt-5 px-5 lg:mt-0 lg:px-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block rounded-full bg-badge-bg px-3 py-1 text-sm font-bold text-badge-text">
              {actual.especialidad}
            </span>
            {esDudosa && (
              <span className="inline-flex items-center gap-1 rounded-full bg-danger-bg px-3 py-1 text-sm font-bold text-danger-text">
                ⚑ Dudosa
              </span>
            )}
          </div>

          <p className="mt-3 text-lg font-medium text-ink">{actual.pregunta}</p>

          {actual.imagen_path && <ImagenPregunta key={actual.id} src={actual.imagen_path} className="mt-4" />}

          <div className="mt-4 flex flex-col gap-3" role="group" aria-label={`Respuestas de la pregunta ${indice + 1}`}>
            {opciones.map((o) => (
              <OptionCard
                key={o.letra}
                letra={o.letra}
                texto={o.texto}
                modo="respondiendo"
                seleccionada={respuestaActual === o.letra}
                onClick={() => elegir(o.letra)}
              />
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-[auto_1fr_auto_1fr]">
            <button
              type="button"
              onClick={alternarDudosa}
              aria-pressed={esDudosa}
              className={`h-12 rounded-2xl border-2 px-4 text-sm font-bold lg:order-2 ${
                esDudosa ? "border-accent bg-brand-light text-accent" : "border-track text-ink"
              }`}
            >
              ⚑ {esDudosa ? "Dudosa" : "Marcar dudosa"}
            </button>
            <button
              type="button"
              onClick={borrar}
              disabled={!respuestaActual}
              className="h-12 rounded-2xl border-2 border-track px-4 text-sm font-bold text-ink disabled:text-ink-subtle disabled:opacity-60 lg:order-3"
            >
              Borrar respuesta
            </button>
            <button
              type="button"
              onClick={() => ir(indice - 1)}
              disabled={indice === 0}
              className="h-12 rounded-2xl border-2 border-track px-4 text-sm font-bold text-ink disabled:text-ink-subtle disabled:opacity-60 lg:order-1"
            >
              ← Anterior
            </button>
            <button
              type="button"
              onClick={() => (esUltima ? setMostrarEntregar(true) : ir(indice + 1))}
              className="h-12 rounded-2xl bg-brand px-4 text-sm font-bold text-on-brand shadow-sm active:bg-brand-dark lg:order-4"
            >
              {esUltima ? "Revisar y entregar" : "Siguiente →"}
            </button>
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            Puedes cambiar la respuesta hasta entregar el examen. No se corrige nada hasta el final.
          </p>
          <button
            type="button"
            onClick={() => setMostrarEntregar(true)}
            className="mt-4 h-12 w-full rounded-2xl border-2 border-accent text-sm font-bold text-accent lg:hidden"
          >
            Entregar examen
          </button>
        </div>

        <aside className="hidden lg:sticky lg:top-8 lg:flex lg:flex-col lg:gap-4 lg:rounded-2xl lg:border lg:border-track lg:bg-card lg:p-5">
          <p className="flex items-baseline justify-between gap-2 text-sm text-ink-muted">
            <span>
              Pregunta <span className="font-mono text-ink">{indice + 1}</span> de{" "}
              <span className="font-mono text-ink">{total}</span>
            </span>
            <span className="font-mono text-xs">
              {respondidas} respondidas · {dudosas.size} {dudosas.size === 1 ? "dudosa" : "dudosas"}
            </span>
          </p>
          <div className="-mt-2 h-1.5 overflow-hidden rounded-full bg-track" aria-hidden="true">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(respondidas / total) * 100}%` }} />
          </div>
          <div className="flex">{temporizador}</div>
          {rejilla}
          <button
            type="button"
            onClick={() => setMostrarEntregar(true)}
            className="h-12 rounded-xl bg-brand font-bold text-on-brand active:bg-brand-dark"
          >
            Entregar examen
          </button>
        </aside>
      </div>

      {rejillaAbierta && (
        <Dialogo titulo="Rejilla" onCerrar={() => setRejillaAbierta(false)} abajo>
          <p className="-mt-1 mb-3 font-mono text-xs text-ink-muted">
            {respondidas} resp. · {dudosas.size} {dudosas.size === 1 ? "dudosa" : "dudosas"} · {total - respondidas} en blanco
          </p>
          {rejilla}
          <button
            type="button"
            onClick={() => {
              setRejillaAbierta(false);
              setMostrarEntregar(true);
            }}
            className="mt-4 h-12 w-full rounded-xl bg-brand font-bold text-on-brand active:bg-brand-dark"
          >
            Entregar examen
          </button>
        </Dialogo>
      )}

      {mostrarEntregar && (
        <Dialogo titulo="¿Entregar el examen?" onCerrar={() => setMostrarEntregar(false)}>
          <p className="text-sm text-ink-muted">Después no podrás cambiar ninguna respuesta.</p>
          <dl className="mt-4 grid grid-cols-3 border-t border-track pt-3 text-center">
            <div>
              <dd className="text-xl font-extrabold text-ink">{respondidas}</dd>
              <dt className="text-xs text-ink-muted">Respondidas</dt>
            </div>
            <div>
              <dd className="text-xl font-extrabold text-ink-muted">{total - respondidas}</dd>
              <dt className="text-xs text-ink-muted">En blanco</dt>
            </div>
            <div>
              <dd className="text-xl font-extrabold text-accent">{dudosas.size}</dd>
              <dt className="text-xs text-ink-muted">Dudosas</dt>
            </div>
          </dl>
          <p className="mt-3 text-sm text-ink-muted">
            {tiempoRestante !== null && <>Quedan {formatearTiempoLargo(tiempoRestante)}. </>}Las preguntas en blanco no
            restan.
          </p>
          {dudosas.size > 0 && (
            <button
              type="button"
              onClick={revisarDudosas}
              className="mt-4 h-12 w-full rounded-xl border-2 border-track font-bold text-ink"
            >
              Revisar {dudosas.size === 1 ? "la dudosa" : `las ${dudosas.size} dudosas`}
            </button>
          )}
          <button
            type="button"
            onClick={entregar}
            className="mt-3 h-12 w-full rounded-xl bg-brand font-bold text-on-brand active:bg-brand-dark"
          >
            Entregar ahora
          </button>
          <button
            type="button"
            onClick={() => setMostrarEntregar(false)}
            className="mt-1 min-h-11 w-full text-sm font-bold text-ink-muted"
          >
            Seguir con el examen
          </button>
        </Dialogo>
      )}

      {mostrarSalir && (
        <Dialogo titulo="¿Salir del simulacro?" onCerrar={() => setMostrarSalir(false)}>
          <p className="text-sm text-ink-muted">
            Tus respuestas quedan guardadas en este dispositivo y puedes seguir desde Inicio. El tiempo sigue
            contando.
          </p>
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setMostrarSalir(false)}
              className="h-11 flex-1 rounded-xl border border-track font-bold text-ink"
            >
              Cancelar
            </button>
            <button type="button" onClick={salir} className="h-11 flex-1 rounded-xl bg-brand font-bold text-on-brand">
              Salir
            </button>
          </div>
          <button
            type="button"
            onClick={abandonar}
            className="mt-3 min-h-11 w-full text-sm font-bold text-danger-text underline-offset-2 hover:underline"
          >
            Abandonar el simulacro (se borran tus respuestas)
          </button>
        </Dialogo>
      )}

      {entrega && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div
            role={entrega === "fallida" ? "alertdialog" : "status"}
            aria-labelledby="titulo-entrega"
            className="w-full max-w-sm rounded-2xl bg-card p-5 shadow-lg"
          >
            {entrega === "enviando" ? (
              <p id="titulo-entrega" className="text-lg font-bold text-ink">
                Entregando el simulacro…
              </p>
            ) : (
              <>
                <p id="titulo-entrega" className="text-lg font-bold text-ink">
                  No se ha podido entregar
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  Revisa tu conexión. Tus respuestas siguen guardadas en este dispositivo: no se ha perdido nada.
                </p>
                <button
                  type="button"
                  autoFocus
                  onClick={entregar}
                  className="mt-5 h-12 w-full rounded-xl bg-brand font-bold text-on-brand active:bg-brand-dark"
                >
                  Reintentar la entrega
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Rejilla de números: cada casilla lleva a su pregunta. Sin responder (borde),
// respondida (dorado con borde, ≥3:1 frente a la tarjeta en los dos temas),
// dudosa (punto rojo, compatible con lo anterior) y actual (anillo). El filtro deja ver solo las dudosas o las sin responder.
function Rejilla({ preguntas, respuestas, dudosas, indice, filtro, onFiltro, onIr }) {
  const nDudosas = preguntas.filter((p) => dudosas.has(p.id)).length;
  const nSin = preguntas.filter((p) => !respuestas[p.id]).length;
  const filtros = [
    ["todas", "Todas"],
    ["dudosas", `Dudosas (${nDudosas})`],
    ["sin", `Sin responder (${nSin})`],
  ];
  const visibles = preguntas
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => filtro === "todas" || (filtro === "dudosas" ? dudosas.has(p.id) : !respuestas[p.id]));

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar la rejilla">
        {filtros.map(([valor, texto]) => (
          <button
            key={valor}
            type="button"
            onClick={() => onFiltro(valor)}
            aria-pressed={filtro === valor}
            className={`min-h-9 rounded-full px-3 text-xs font-bold ${
              filtro === valor ? "bg-ink text-surface" : "border border-track text-ink-muted"
            }`}
          >
            {texto}
          </button>
        ))}
      </div>
      {visibles.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">
          {filtro === "dudosas" ? "No has marcado ninguna dudosa." : "Has respondido todas las preguntas."}
        </p>
      ) : (
        <ol className="mt-3 grid max-h-[50vh] grid-cols-7 gap-1.5 overflow-y-auto p-0.5 font-mono text-xs lg:grid-cols-8">
          {visibles.map(({ p, i }) => {
            const respondida = Boolean(respuestas[p.id]);
            const dudosa = dudosas.has(p.id);
            const esActual = i === indice;
            const estado = [respondida ? "respondida" : "sin responder", dudosa && "dudosa", esActual && "actual"]
              .filter(Boolean)
              .join(", ");
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onIr(i)}
                  aria-label={`Pregunta ${i + 1}, ${estado}`}
                  aria-current={esActual ? "true" : undefined}
                  className={`relative flex h-9 w-full items-center justify-center rounded-md border ${
                    respondida ? "border-accent bg-brand text-on-brand" : "border-track text-ink-muted"
                  } ${esActual ? "font-bold ring-2 ring-ink ring-offset-1 ring-offset-card" : ""}`}
                >
                  {i + 1}
                  {dudosa && (
                    <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-danger ring-2 ring-card" aria-hidden="true" />
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      )}
      <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted" aria-hidden="true">
        <span>
          <span className="mr-1 inline-block h-3 w-3 rounded-sm border border-track align-[-2px]" />
          Sin responder
        </span>
        <span>
          <span className="mr-1 inline-block h-3 w-3 rounded-sm border border-accent bg-brand align-[-2px]" />
          Respondida
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-danger align-middle" />
          Dudosa
        </span>
        <span>
          <span className="mr-1 inline-block h-3 w-3 rounded-sm ring-2 ring-ink align-[-2px]" />
          Actual
        </span>
      </p>
    </div>
  );
}

// Diálogo modal accesible: foco al abrir, Esc para cerrar y el foco vuelve al
// botón que lo abrió. `abajo`: panel desde abajo en móvil (la rejilla).
function Dialogo({ titulo, onCerrar, abajo = false, children }) {
  const ref = useRef(null);
  const id = useRef(`dialogo-${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    const anterior = document.activeElement;
    ref.current?.focus();
    function teclas(e) {
      if (e.key === "Escape") onCerrar();
    }
    document.addEventListener("keydown", teclas);
    return () => {
      document.removeEventListener("keydown", teclas);
      anterior?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`fixed inset-0 z-40 flex bg-black/40 ${abajo ? "items-end lg:items-center lg:justify-center" : "items-center justify-center px-6"}`}
      onClick={onCerrar}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[90vh] overflow-y-auto bg-card p-5 shadow-lg outline-none ${
          abajo ? "w-full rounded-t-3xl pb-safe lg:max-w-md lg:rounded-2xl" : "w-full max-w-sm rounded-2xl"
        }`}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <p id={id} className="text-lg font-bold text-ink">
            {titulo}
          </p>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="-mr-2 -mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-ink-muted"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
