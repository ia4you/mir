"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import SpecialtyProgressRow from "../../../components/SpecialtyProgressRow";
import { fmtNumero, fmtPorcentaje } from "@/lib/formato";
import { iniciarConIds } from "../../../lib/iniciarTest";

export default function Resultados({ params }) {
  const router = useRouter();
  const sesionId = params.id;
  const { data: session } = useSession();
  const esPremium = session?.user?.plan === "premium";

  const [datos, setDatos] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [repasando, setRepasando] = useState(false);
  const [resumen, setResumen] = useState(null);
  const [resumenCargando, setResumenCargando] = useState(true);

  useEffect(() => {
    fetch(`/api/sesiones/${sesionId}/resultado`)
      .then((r) => {
        if (!r.ok) throw new Error("no encontrada");
        return r.json();
      })
      .then(setDatos)
      .catch(() => setNotFound(true));
  }, [sesionId]);

  useEffect(() => {
    if (notFound) {
      router.replace("/?error=sesion_no_encontrada");
    }
  }, [notFound, router]);

  // Se pide solo cuando /resultado ya confirmó que la sesión existe y es
  // accesible, para no gastar una llamada de IA en sesiones inválidas.
  // Si falla por cualquier motivo (red, 401/403/404/500), resumen se queda
  // en null y la pantalla sigue funcionando solo con los datos de `datos`.
  useEffect(() => {
    if (!datos) return;
    fetch(`/api/sesiones/${sesionId}/resumen-test`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setResumen)
      .catch(() => setResumen(null))
      .finally(() => setResumenCargando(false));
  }, [datos, sesionId]);

  async function repasarFallos() {
    if (!datos || datos.preguntas_falladas.length === 0 || repasando) return;
    setRepasando(true);
    try {
      const idsParam = datos.preguntas_falladas.join(",");
      const resPreguntas = await fetch(`/api/preguntas?ids=${idsParam}`);
      const preguntas = await resPreguntas.json();

      const resSesion = await fetch("/api/sesiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo: "repaso",
          especialidad: null,
          total_preguntas: preguntas.length,
        }),
      });
      const { id: nuevoId } = await resSesion.json();

      sessionStorage.setItem(
        `mir_test_${nuevoId}`,
        JSON.stringify({ preguntas, segundosPorPregunta: null })
      );
      router.push(`/test/${nuevoId}`);
    } catch (e) {
      setRepasando(false);
    }
  }

  if (notFound) return null;

  if (!datos) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-ink-muted">Cargando resultados…</p>
      </div>
    );
  }

  const tiempoMedio =
    datos.duracion_segundos != null && datos.total_preguntas > 0
      ? Math.round(datos.duracion_segundos / datos.total_preguntas)
      : null;

  const sinFallos = datos.preguntas_falladas.length === 0;

  const tieneContenidoResumen =
    resumen &&
    ((resumen.iaDisponible && resumen.analisisNarrativo) ||
      resumen.etiquetas.fuertes.length > 0 ||
      resumen.etiquetas.debiles.length > 0 ||
      resumen.etiquetas.posibleDesactualizacion ||
      Boolean(resumen.desgloseFallos));

  return (
    // Escritorio: la nota a la izquierda y, a su lado, el resumen, el simulacro
    // y Premium; debajo, especialidades y botones a todo el ancho. En móvil la
    // columna derecha es `contents` y `order-*` mantiene el orden de siempre
    // (Premium, simulacro, especialidades, resumen, botones).
    <div className="ancho-app flex min-h-screen flex-col pb-10 lg:grid lg:grid-cols-2 lg:content-start lg:items-start lg:gap-x-6 lg:px-8 lg:pt-8">
      <div>
        <header className="rounded-b-3xl bg-brand px-5 pb-6 pt-safe text-center text-on-brand lg:rounded-3xl lg:pt-6">
          <p className="mt-2 text-sm">Resultados de la sesión</p>
          <p className="mt-2 text-5xl font-extrabold">
            {datos.aciertos}/{datos.total_preguntas}
          </p>
          <p className="mt-2 text-lg">{fmtPorcentaje(datos.porcentaje_aciertos)} de aciertos</p>
        </header>

        <section className="mt-4 px-5 lg:px-0">
          <div className="grid grid-cols-3 divide-x divide-track rounded-2xl bg-card py-4 shadow-sm">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-success">{datos.aciertos}</p>
              <p className="text-sm text-ink-muted">Aciertos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-danger">{datos.fallos}</p>
              <p className="text-sm text-ink-muted">Fallos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-ink">
                {tiempoMedio !== null ? `${tiempoMedio}s` : "—"}
              </p>
              <p className="text-sm text-ink-muted">T. medio</p>
            </div>
          </div>
        </section>
      </div>

      <div className="contents lg:flex lg:flex-col lg:gap-6">
        {resumenCargando && (
          <section className="order-4 mt-6 px-5 lg:order-none lg:mt-0 lg:px-0">
            <div className="rounded-2xl bg-card p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted">
                Resumen de la sesión
              </h2>
              <p className="text-sm text-ink-muted">Analizando tu rendimiento…</p>
            </div>
          </section>
        )}

        {!resumenCargando && tieneContenidoResumen && (
          <section className="order-4 mt-6 px-5 lg:order-none lg:mt-0 lg:px-0">
            <div className="rounded-2xl bg-card p-4 shadow-sm">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted">
                Resumen de la sesión
              </h2>
              {resumen.iaDisponible && resumen.analisisNarrativo && (
                <p className="whitespace-pre-line texto-lectura text-ink">
                  {resumen.analisisNarrativo}
                </p>
              )}

              {(resumen.etiquetas.fuertes.length > 0 || resumen.etiquetas.debiles.length > 0) && (
                <div
                  className={`flex flex-wrap gap-2 ${
                    resumen.iaDisponible && resumen.analisisNarrativo ? "mt-3" : ""
                  }`}
                >
                  {resumen.etiquetas.fuertes.map((tema) => (
                    <span
                      key={`fuerte-${tema}`}
                      className="rounded-full bg-success-bg px-3 py-1 text-xs font-bold text-success-text"
                    >
                      {tema}
                    </span>
                  ))}
                  {resumen.etiquetas.debiles.map((tema) => (
                    <span
                      key={`debil-${tema}`}
                      className="rounded-full bg-danger-bg px-3 py-1 text-xs font-bold text-danger-text"
                    >
                      {tema}
                    </span>
                  ))}
                </div>
              )}

              {resumen.etiquetas.posibleDesactualizacion && (
                <p className="mt-3 rounded-xl bg-warning-bg p-2 text-xs font-semibold text-warning-text">
                  Puede que tus fallos se concentren en contenido más reciente: revisa las guías
                  actualizadas de tus temas débiles.
                </p>
              )}

              {resumen.desgloseFallos && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-track pt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 text-xs font-semibold text-success-text">
                    <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" />
                    {resumen.desgloseFallos.aciertos} correctas
                  </span>
                  {resumen.desgloseFallos.controvertidos > 0 && (
                    <Link
                      href="/controversias"
                      className="inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-3 py-1 text-xs font-semibold text-warning-text"
                    >
                      <span className="h-2 w-2 rounded-full bg-warning" aria-hidden="true" />
                      {resumen.desgloseFallos.controvertidos} con respuesta oficial cuestionada
                    </Link>
                  )}
                  {resumen.desgloseFallos.dificiles > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-track px-3 py-1 text-xs font-semibold text-ink-muted">
                      <span className="h-2 w-2 rounded-full bg-ink-subtle" aria-hidden="true" />
                      {resumen.desgloseFallos.dificiles} de alta dificultad
                    </span>
                  )}
                  {resumen.desgloseFallos.normales > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-bg px-3 py-1 text-xs font-semibold text-danger-text">
                      <span className="h-2 w-2 rounded-full bg-danger" aria-hidden="true" />
                      {resumen.desgloseFallos.normales} a repasar
                    </span>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {datos.modo === "simulacro" && datos.simulacro && (
          <section className="order-2 mt-6 px-5 lg:order-none lg:mt-0 lg:px-0">
            <div className="rounded-2xl bg-card p-4 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wide text-ink-muted">
                Netas (corrección del MIR)
              </p>
              <p className="mt-1 text-4xl font-extrabold text-ink">{fmtNumero(datos.simulacro.netas, { decimales: 2, fijos: true })}</p>
              {datos.simulacro.nota !== null && (
                <p className="text-sm text-ink-muted">
                  Nota sobre 200:{" "}
                  <span className="font-bold text-ink">{fmtNumero(datos.simulacro.nota, { decimales: 1, fijos: true })}</span>
                </p>
              )}

              <div className="mt-3 grid grid-cols-4 divide-x divide-track border-t border-track pt-3">
                <div className="text-center">
                  <p className="text-lg font-extrabold text-success">{datos.simulacro.aciertos}</p>
                  <p className="text-xs text-ink-muted">Aciertos</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold text-danger">{datos.simulacro.fallos}</p>
                  <p className="text-xs text-ink-muted">Fallos</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold text-ink-muted">{datos.simulacro.en_blanco}</p>
                  <p className="text-xs text-ink-muted">En blanco</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-extrabold text-ink">{fmtNumero(datos.simulacro.netas, { decimales: 2, fijos: true })}</p>
                  <p className="text-xs text-ink-muted">Netas</p>
                </div>
              </div>

              <p className="mt-3 rounded-xl bg-panel p-3 font-mono text-xs text-ink-muted">
                {datos.simulacro.aciertos} − {datos.simulacro.fallos} ÷ 3 ={" "}
                {fmtNumero(datos.simulacro.netas, { decimales: 2, fijos: true })} netas
                <br />
                <span className="font-sans">Cada fallo resta ⅓ de acierto. En blanco: 0.</span>
              </p>

              {datos.simulacro.comparativa.length > 0 && (
                <div className="mt-4 border-t border-track pt-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">
                    Simulacros anteriores
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {datos.simulacro.comparativa.map((c) => (
                      <div key={c.id} className="flex items-center justify-between text-sm">
                        <span className="text-ink">
                          {new Date(c.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className="font-bold text-ink">
                          {fmtNumero(c.netas, { decimales: 2, fijos: true })} netas
                          {c.nota !== null && <> · {fmtNumero(c.nota, { decimales: 1, fijos: true })}/200</>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {datos.simulacro.dudosas?.total > 0 && <TusDudosas dudosas={datos.simulacro.dudosas} />}
          </section>
        )}
        {!esPremium && (
          <section className="order-1 mt-6 px-5 lg:order-none lg:mt-0 lg:px-0">
            <div className="rounded-2xl border border-warning-border bg-warning-bg p-4">
              <p className="text-sm font-bold text-warning-text">
                ★ {datos.fallos > 0
                  ? `Repasa tus ${datos.fallos} fallos con simulacros de examen real`
                  : "Sigue mejorando con el plan Premium"}
              </p>
              <p className="mt-1 text-sm text-warning-text">
                Preguntas ilimitadas cada día, simulacros de examen real cronometrados y
                seguimiento de tu evolución por asignatura.
              </p>
              <Link
                href="/premium"
                className="mt-3 inline-block rounded-xl bg-warning px-4 py-2 text-sm font-bold text-on-status active:opacity-90"
              >
                Ver plan Premium →
              </Link>
            </div>
          </section>
        )}
      </div>

      {datos.desglose_especialidad.length > 0 && (
        <section className="order-3 mt-6 px-5 lg:order-none lg:col-span-2 lg:mt-8 lg:px-0">
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-ink-muted">
            Por especialidad
          </h2>
          <div className="divide-y divide-track lg:grid lg:grid-cols-2 lg:gap-x-10 lg:divide-y-0">
            {datos.desglose_especialidad.map((e) => (
              <SpecialtyProgressRow
                key={e.especialidad}
                nombre={e.especialidad}
                porcentaje={e.porcentaje}
                variante="plain"
              />
            ))}
          </div>
          {datos.sin_abrir > 0 && (
            <p className="mt-3 text-xs text-ink-muted">
              {datos.sin_abrir} {datos.sin_abrir === 1 ? "pregunta sin abrir no cuenta" : "preguntas sin abrir no cuentan"}{" "}
              en esta tabla (sí en la nota).
            </p>
          )}
        </section>
      )}

      <section className="order-5 mt-8 flex gap-3 px-5 lg:order-none lg:col-span-2 lg:px-0">
        <button
          type="button"
          onClick={repasarFallos}
          disabled={sinFallos || repasando}
          className="h-14 flex-1 rounded-2xl border-2 border-accent font-bold text-accent disabled:border-track disabled:text-ink-muted"
        >
          {repasando ? "Preparando…" : "Repasar fallos"}
        </button>
        <Link
          href="/inicio"
          className="flex h-14 flex-1 items-center justify-center rounded-2xl bg-brand font-bold text-on-brand active:bg-brand-dark"
        >
          Volver al inicio
        </Link>
      </section>
    </div>
  );
}

// Simulacro: cómo salieron las preguntas marcadas como dudosas y un test con
// ellas (modo "dudosas", con corrección y explicación como en la práctica).
function TusDudosas({ dudosas: d }) {
  const router = useRouter();
  const [preparando, setPreparando] = useState(false);
  const [aviso, setAviso] = useState("");

  async function repasar() {
    setPreparando(true);
    setAviso("");
    try {
      const r = await iniciarConIds(d.ids, { modo: "dudosas" });
      if (!r.error) return router.push(`/test/${r.id}`);
      setAviso(r.message || "No se ha podido preparar el repaso. Inténtalo de nuevo.");
    } catch {
      setAviso("No se ha podido preparar el repaso. Inténtalo de nuevo.");
    }
    setPreparando(false);
  }

  const partes = [
    `acertaste ${d.aciertos}`,
    `fallaste ${d.fallos}`,
    d.en_blanco > 0 && `dejaste ${d.en_blanco} en blanco`,
  ].filter(Boolean);
  const texto = partes.length > 2 ? `${partes.slice(0, -1).join(", ")} y ${partes.at(-1)}` : partes.join(" y ");

  return (
    <div className="mt-4 rounded-2xl bg-card p-4 shadow-sm">
      <p className="text-sm font-bold uppercase tracking-wide text-ink-muted">Tus dudosas</p>
      <p className="mt-2 text-sm text-ink">
        Marcaste <span className="font-bold">{d.total}</span>: {texto}.
      </p>
      <div className="mt-3 grid grid-cols-3 divide-x divide-track border-t border-track pt-3 text-center">
        <div>
          <p className="text-lg font-extrabold text-success">{d.aciertos}</p>
          <p className="text-xs text-ink-muted">Acertadas</p>
        </div>
        <div>
          <p className="text-lg font-extrabold text-danger">{d.fallos}</p>
          <p className="text-xs text-ink-muted">Falladas</p>
        </div>
        <div>
          <p className="text-lg font-extrabold text-ink-muted">{d.en_blanco}</p>
          <p className="text-xs text-ink-muted">En blanco</p>
        </div>
      </div>
      {aviso && <p className="mt-3 rounded-xl bg-danger-bg p-2 text-xs font-semibold text-danger-text">{aviso}</p>}
      <button
        type="button"
        onClick={repasar}
        disabled={preparando}
        className="mt-3 h-11 w-full rounded-xl border-2 border-accent text-sm font-bold text-accent disabled:opacity-60"
      >
        {preparando ? "Preparando…" : `Repasar ${d.total === 1 ? "la dudosa" : `las ${d.total} dudosas`} →`}
      </button>
    </div>
  );
}
