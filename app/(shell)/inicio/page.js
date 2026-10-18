"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";
import BloqueRepaso from "../../components/BloqueRepaso";
import BloqueSimulacroPendiente from "../../components/BloqueSimulacroPendiente";
import CarruselReforzar from "../../components/CarruselReforzar";
import { getMetaDiaria, getTemporizadorDefecto, META_DIARIA_POR_DEFECTO } from "../../lib/preferencias";
import { iniciarPractica, LIMITE_DIARIO_FREE, SEGUNDOS_POR_PREGUNTA } from "../../lib/iniciarTest";
import { fmtNumero, fmtPorcentaje } from "@/lib/formato";

// Carga diferida: evita enviar @capacitor/core en el JS inicial de /inicio
// para los visitantes web (el banner es solo para PWA/navegador, ver PushBanner.js).
const PushBanner = dynamic(() => import("../../components/PushBanner"), { ssr: false });
// import AndroidPushRegister from "../../components/AndroidPushRegister"; // deshabilitado temporalmente: falta google-services.json, causaba crash en Android tras login

// Con menos respuestas, el % de acierto de una especialidad no es fiable para
// recomendarla.
const MIN_RESPUESTAS_ESPECIALIDAD = 5;
// Ventana de especialidades para reforzar: más exigente, porque se abre sola.
const MIN_RESPUESTAS_REFORZAR = 20;
const MAX_PCT_REFORZAR = 60;
const MAX_REFORZAR = 6;
const INICIALES_DIA = ["L", "M", "X", "J", "V", "S", "D"];

const MENSAJES_ERROR = {
  sesion_no_encontrada: "No se ha encontrado esa sesión de test. Puede que ya no exista.",
};

function AvisoDesdeUrl() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [avisoUrl, setAvisoUrl] = useState(null);

  useEffect(() => {
    const codigo = searchParams.get("error");
    if (codigo && MENSAJES_ERROR[codigo]) {
      setAvisoUrl(MENSAJES_ERROR[codigo]);
      router.replace("/");
    }
  }, [searchParams, router]);

  if (!avisoUrl) return null;

  return (
    <div className="mx-5 mt-4 flex items-start justify-between gap-3 rounded-2xl bg-badge-bg p-3 text-sm text-badge-text lg:mx-0">
      <span>{avisoUrl}</span>
      <button
        type="button"
        onClick={() => setAvisoUrl(null)}
        aria-label="Cerrar aviso"
        className="flex-shrink-0 font-bold"
      >
        ×
      </button>
    </div>
  );
}

// Una cifra decimal fija; con signo, "+" en los positivos (el menos es −).
function fmt1(n, conSigno = false) {
  return fmtNumero(n, { fijos: true, signo: conSigno });
}

function Tarjeta({ titulo, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-track bg-card p-5 ${className}`}>
      {titulo && (
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-ink-muted">{titulo}</h2>
      )}
      {children}
    </section>
  );
}

function Esqueleto({ alto }) {
  return <div className={`${alto} animate-pulse rounded-2xl bg-card`} />;
}

// Línea de la nota al final de cada sesión, con la nota del primer y del
// último punto en los extremos para dar escala. La línea es decorativa (la
// cifra y la variación ya van en texto); las dos etiquetas sí se leen.
function GraficoNotas({ serie }) {
  const puntos = serie.filter((p) => p.nota !== null);
  if (puntos.length < 2) return null;
  const W = 300;
  const H = 72;
  const notas = puntos.map((p) => p.nota);
  const min = Math.min(...notas);
  const max = Math.max(...notas);
  const rango = max - min || 1;
  const xy = puntos.map((p, i) => [
    (i / (puntos.length - 1)) * (W - 8) + 4,
    H - 6 - ((p.nota - min) / rango) * (H - 12),
  ]);
  const extremos = [
    { x: xy[0][0], y: xy[0][1], nota: puntos[0].nota, lado: { left: 0 } },
    { x: xy[xy.length - 1][0], y: xy[xy.length - 1][1], nota: puntos[puntos.length - 1].nota, lado: { right: 0 } },
  ];
  // Puntos y etiquetas en HTML: dentro del SVG se deformarían con
  // preserveAspectRatio="none".
  return (
    <div className="relative mt-7">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[72px] w-full" preserveAspectRatio="none" aria-hidden="true">
        <polyline
          points={xy.map(([x, y]) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {extremos.map((e) => (
        <span key={e.lado.left === 0 ? "primero" : "ultimo"}>
          <span
            className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
            style={{ left: `${(e.x / W) * 100}%`, top: `${(e.y / H) * 100}%` }}
            aria-hidden="true"
          />
          <span
            className="absolute -translate-y-[160%] font-mono text-[11px] leading-none text-ink-muted"
            style={{ ...e.lado, top: `${(e.y / H) * 100}%` }}
          >
            {fmt1(e.nota)}
          </span>
        </span>
      ))}
    </div>
  );
}

function TarjetaNota({ notas }) {
  if (!notas) return <Esqueleto alto="h-48" />;
  const { evolucion: e, serie, variacion } = notas;

  if (e.nota === null) {
    return (
      <Tarjeta titulo="Nota estimada">
        <p className="text-sm text-ink-muted">
          Necesitas {e.minimo} respuestas para estimar tu nota. Llevas{" "}
          <span className="font-mono text-ink">{e.respondidas}</span>.
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-track" aria-hidden="true">
          <div className="h-full rounded-full bg-accent" style={{ width: `${(e.respondidas / e.minimo) * 100}%` }} />
        </div>
      </Tarjeta>
    );
  }

  const sesiones = serie.filter((p) => p.nota !== null).length;
  const sube = variacion > 0;
  const baja = variacion < 0;
  return (
    <Tarjeta titulo="Nota estimada">
      <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="flex items-baseline gap-x-1.5">
          <span className="text-4xl font-extrabold tabular-nums text-ink">{fmt1(e.nota)}</span>
          <span className="font-mono text-sm text-ink-muted">/ 200</span>
        </span>
        {variacion !== null && (
          <span
            className={`font-mono text-sm font-semibold ${sube ? "text-success" : baja ? "text-danger" : "text-ink-muted"}`}
          >
            <span aria-hidden="true">{sube ? "▲ " : baja ? "▼ " : "– "}</span>
            <span className="sr-only">{sube ? "Sube " : baja ? "Baja " : "Sin cambios "}</span>
            {fmt1(variacion, true)}
          </span>
        )}
      </p>
      <p className="mt-1 text-xs text-ink-muted">
        {variacion !== null
          ? `Variación en tus últimas ${sesiones} sesiones con nota`
          : "Aún no hay sesiones suficientes para ver la variación"}
      </p>
      <GraficoNotas serie={serie} />
    </Tarjeta>
  );
}

function TarjetaRacha({ datos }) {
  if (!datos) return <Esqueleto alto="h-40" />;
  return (
    <Tarjeta titulo="Racha">
      <p className="flex items-baseline gap-2">
        <span className="font-mono text-4xl font-semibold text-accent">{datos.racha_dias}</span>
        <span className="text-sm text-ink-muted">{datos.racha_dias === 1 ? "día seguido" : "días seguidos"}</span>
      </p>
      <ol className="mt-4 grid grid-cols-7 gap-1.5" aria-label="Días practicados esta semana">
        {datos.semana.map((d, i) => {
          const nombre = new Date(`${d.fecha}T12:00:00Z`).toLocaleDateString("es-ES", {
            weekday: "long",
            day: "numeric",
            timeZone: "UTC",
          });
          return (
            <li key={d.fecha} className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                  d.activo
                    ? "bg-brand text-on-brand"
                    : d.futuro
                      ? "border border-dashed border-track text-ink-subtle"
                      : "border border-track text-ink-muted"
                } ${d.hoy ? "ring-2 ring-accent ring-offset-2 ring-offset-card" : ""}`}
              >
                <span aria-hidden="true">{INICIALES_DIA[i]}</span>
                <span className="sr-only">
                  {nombre}
                  {d.hoy ? " (hoy)" : ""}: {d.activo ? "practicado" : d.futuro ? "por llegar" : "sin práctica"}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </Tarjeta>
  );
}

function TarjetaControversia({ controversia }) {
  if (controversia === undefined) return <Esqueleto alto="h-44" />;
  if (!controversia) return null;
  return (
    <Tarjeta titulo="Controversia de la semana">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-badge-bg px-3 py-1 text-xs font-bold text-badge-text">
          {controversia.especialidad}
        </span>
        <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
          MIR {controversia.año} · Pregunta {controversia.numero}
        </span>
      </div>
      <p className="mt-3 line-clamp-3 text-sm text-ink">{controversia.pregunta}</p>
      <Link
        href={controversia.href}
        className="mt-3 inline-flex min-h-[44px] items-center text-sm font-bold text-accent"
      >
        Ver la controversia →
      </Link>
    </Tarjeta>
  );
}

export default function Inicio() {
  const router = useRouter();
  const { data: session } = useSession();
  const [datos, setDatos] = useState(null);
  const [notas, setNotas] = useState(null);
  const [controversia, setControversia] = useState(undefined);
  const [error, setError] = useState(false);
  const [fecha, setFecha] = useState("");
  const [meta, setMeta] = useState(META_DIARIA_POR_DEFECTO);
  // Clave del botón que está arrancando una sesión ("plan", "primera" o una
  // especialidad), para deshabilitarlos todos y marcar ese.
  const [enviando, setEnviando] = useState(null);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    const m = getMetaDiaria();
    setMeta(m);
    // La fecha del saludo, en el calendario del navegador.
    setFecha(new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }));
    fetch(`/api/estadisticas?meta=${m}`)
      .then((r) => {
        if (!r.ok) throw new Error("fallo");
        return r.json();
      })
      .then(setDatos)
      .catch(() => setError(true));
    fetch("/api/estadisticas/notas")
      .then((r) => (r.ok ? r.json() : null))
      .then(setNotas)
      .catch(() => {});
    fetch("/api/controversias/semana")
      .then((r) => (r.ok ? r.json() : null))
      .then(setControversia)
      .catch(() => setControversia(null));
  }, []);

  const esPremium = session?.user?.plan === "premium";
  const respondidasHoy = datos?.meta_diaria.respondidas_hoy ?? 0;
  const restanteHoy = esPremium ? Infinity : Math.max(0, LIMITE_DIARIO_FREE - respondidasHoy);
  const cantidad = Math.min(meta, restanteHoy);
  const minutos = Math.max(1, Math.round((cantidad * SEGUNDOS_POR_PREGUNTA) / 60));

  const sinActividad = datos && datos.especialidades.every((e) => e.total === 0);
  const masFlojas = (datos?.especialidades ?? [])
    .filter((e) => e.total >= MIN_RESPUESTAS_ESPECIALIDAD)
    .sort((a, b) => a.porcentaje - b.porcentaje || b.total - a.total);
  const planHoy = masFlojas.slice(0, 2);
  const dondeGanar = masFlojas.slice(0, 3);
  const paraReforzar = masFlojas
    .filter((e) => e.total >= MIN_RESPUESTAS_REFORZAR && e.porcentaje < MAX_PCT_REFORZAR)
    .slice(0, MAX_REFORZAR);

  // Reparte `cantidad` entre las especialidades (o todo el banco si no hay
  // ninguna) y arranca la sesión.
  async function empezar(especialidades, clave) {
    setEnviando(clave);
    setAviso("");
    try {
      const n = especialidades.length;
      const lotes = n
        ? especialidades.map((especialidad, i) => ({
            especialidad,
            cantidad: Math.floor(cantidad / n) + (i < cantidad % n ? 1 : 0),
          }))
        : [{ cantidad }];
      const temporizador = getTemporizadorDefecto();
      const r = await iniciarPractica(lotes, {
        especialidad: n === 1 ? especialidades[0] : null,
        segundosPorPregunta: temporizador.activo ? temporizador.segundos : null,
      });
      if (r.id) {
        router.push(`/test/${r.id}`);
        return;
      }
      setAviso(
        r.error === "limite_diario"
          ? `Has llegado al límite de ${LIMITE_DIARIO_FREE} preguntas de hoy del plan gratuito.`
          : "No hay preguntas disponibles para esta sesión."
      );
    } catch {
      setAviso("No se ha podido preparar la sesión. Inténtalo de nuevo.");
    }
    setEnviando(null);
  }

  const limiteAgotado = !esPremium && datos && restanteHoy === 0;
  const botonPrincipal =
    "flex h-12 items-center justify-center rounded-xl bg-brand px-5 font-bold text-on-brand hover:bg-brand-dark disabled:opacity-60";
  const botonSecundario =
    "flex h-12 items-center justify-center gap-2 rounded-xl border border-track px-5 font-bold text-ink hover:border-accent";

  const avisoSesion = aviso && (
    <p role="alert" className="mt-3 rounded-xl bg-danger-bg p-3 text-sm font-semibold text-danger-text">
      {aviso}{" "}
      {!esPremium && aviso.startsWith("Has llegado") && (
        <Link href="/premium" className="underline">
          Hazte premium
        </Link>
      )}
    </p>
  );

  return (
    <div className="ancho-app min-h-screen pb-nav lg:px-8">
      <header className="px-5 pt-5 lg:px-0 lg:pt-10">
        <p className="min-h-[1.25rem] text-sm text-ink-muted first-letter:uppercase">{fecha}</p>
        <h1 className="mt-1 font-serif text-4xl font-normal text-ink lg:text-5xl">
          Hola, {session?.user?.name || "…"}.
        </h1>
      </header>

      <Suspense fallback={null}>
        <AvisoDesdeUrl />
      </Suspense>

      {session && !esPremium && (
        <div className="mx-5 mt-4 rounded-2xl border border-accent bg-card p-4 lg:hidden">
          <p className="text-sm font-semibold text-ink">
            Estás en el plan gratuito — puedes responder hasta 15 preguntas al día.
          </p>
          <Link
            href="/premium"
            className="mt-3 flex h-11 items-center justify-center rounded-xl bg-brand px-4 text-sm font-bold text-on-brand hover:bg-brand-dark"
          >
            ¿Quieres acceso ilimitado? Hazte premium →
          </Link>
        </div>
      )}

      {/* En Free, con el cupo del día gastado no se abre: no podría practicar. */}
      {session && datos && !limiteAgotado && paraReforzar.length > 0 && (
        <CarruselReforzar
          especialidades={paraReforzar}
          onPracticar={(e) => empezar([e], e)}
          enviando={enviando}
          aviso={aviso}
        />
      )}

      <PushBanner />
      {/* <AndroidPushRegister /> deshabilitado temporalmente: falta google-services.json */}

      {error && (
        <p className="mx-5 mt-4 rounded-2xl bg-card p-4 text-sm text-ink-muted lg:mx-0">
          No se ha podido cargar tu progreso. Inténtalo de nuevo más tarde.
        </p>
      )}

      {/* Simulacro empezado en este dispositivo y sin entregar. */}
      <div className="mx-5 mt-5 empty:hidden lg:mx-0 lg:mt-8">
        <BloqueSimulacroPendiente />
      </div>

      {/* Repaso espaciado: solo aparece si el usuario tiene preguntas en repaso. */}
      <div className="mx-5 mt-5 empty:hidden lg:mx-0 lg:mt-8">
        <BloqueRepaso />
      </div>

      <div className="mt-5 grid gap-4 px-5 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6 lg:px-0">
        <div className="flex flex-col gap-4 lg:gap-6">
          {!datos && !error && <Esqueleto alto="h-56" />}

          {sinActividad && (
            <Tarjeta titulo="Empieza por aquí">
              <p className="font-serif text-2xl text-ink">Tu primera sesión</p>
              <p className="mt-2 text-sm text-ink-muted">
                Aún no has respondido ninguna pregunta. Empieza con{" "}
                <span className="font-mono text-ink">{cantidad}</span> preguntas oficiales de todas las
                especialidades (unos <span className="font-mono text-ink">{minutos}</span> min). Con tus
                respuestas prepararemos tu plan de cada día y tu nota estimada.
              </p>
              <button
                type="button"
                onClick={() => empezar([], "primera")}
                disabled={enviando !== null || limiteAgotado}
                className={`mt-4 w-full sm:w-auto ${botonPrincipal}`}
              >
                {enviando === "primera" ? "Preparando…" : "Empezar sesión"}
              </button>
              {avisoSesion}
            </Tarjeta>
          )}

          {datos && !sinActividad && (
            <Tarjeta titulo="Plan de hoy">
              <p className="font-serif text-2xl leading-snug text-ink">
                {planHoy.length > 0 ? planHoy.map((e) => e.especialidad).join(" y ") : "Repaso de todas las especialidades"}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {planHoy.length > 0
                  ? planHoy.length === 1
                    ? "Tu especialidad con menos acierto."
                    : "Tus dos especialidades con menos acierto."
                  : `Responde al menos ${MIN_RESPUESTAS_ESPECIALIDAD} preguntas de una especialidad para personalizar el plan.`}
              </p>

              <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-track pt-4">
                <div>
                  <dt className="text-xs text-ink-muted">Preguntas</dt>
                  <dd className="font-mono text-xl text-ink">{cantidad}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">Tiempo</dt>
                  <dd className="font-mono text-xl text-ink">~{minutos} min</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-muted">Meta diaria</dt>
                  <dd className="font-mono text-xl text-ink">
                    {respondidasHoy}/{meta}
                  </dd>
                </div>
              </dl>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-track" aria-hidden="true">
                <div className="h-full rounded-full bg-accent" style={{ width: `${datos.meta_diaria.porcentaje}%` }} />
              </div>

              {limiteAgotado && (
                <p className="mt-4 text-sm text-ink-muted">
                  Has llegado al límite de {LIMITE_DIARIO_FREE} preguntas de hoy del plan gratuito.{" "}
                  <Link href="/premium" className="font-bold text-accent">
                    Hazte premium
                  </Link>
                </p>
              )}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => empezar(planHoy.map((e) => e.especialidad), "plan")}
                  disabled={enviando !== null || limiteAgotado}
                  className={`sm:flex-1 ${botonPrincipal}`}
                >
                  {enviando === "plan" ? "Preparando…" : "Empezar sesión"}
                </button>
                {esPremium ? (
                  <Link href="/configuracion?modo=simulacro" className={`sm:flex-1 ${botonSecundario}`}>
                    Hacer simulacro
                  </Link>
                ) : (
                  <Link href="/premium" className={`sm:flex-1 ${botonSecundario}`}>
                    <Lock className="h-4 w-4 text-accent" aria-hidden="true" />
                    Hacer simulacro
                    <span className="text-xs font-semibold text-ink-muted">· Premium</span>
                  </Link>
                )}
              </div>
              {avisoSesion}
            </Tarjeta>
          )}

          {datos && !sinActividad && <TarjetaNota notas={notas} />}

          {datos && !sinActividad && (
            <Tarjeta titulo="Dónde ganar netas">
              {dondeGanar.length === 0 ? (
                <p className="text-sm text-ink-muted">
                  Responde al menos {MIN_RESPUESTAS_ESPECIALIDAD} preguntas de una especialidad para ver dónde
                  puedes mejorar.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-track">
                  {dondeGanar.map((e) => (
                    <li key={e.especialidad} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="truncate font-semibold text-ink">{e.especialidad}</span>
                          <span className="font-mono text-sm text-danger-text">{fmtPorcentaje(e.porcentaje)}</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-track" aria-hidden="true">
                          <div className="h-full rounded-full bg-danger-bar" style={{ width: `${e.porcentaje}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-ink-muted">
                          <span className="font-mono">{e.total}</span> respuestas
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => empezar([e.especialidad], e.especialidad)}
                        disabled={enviando !== null || limiteAgotado}
                        aria-label={`Practicar ${e.especialidad}`}
                        className="flex h-11 flex-shrink-0 items-center rounded-xl border border-track px-4 text-sm font-bold text-ink hover:border-accent disabled:opacity-60"
                      >
                        {enviando === e.especialidad ? "…" : "Practicar"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Tarjeta>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:gap-6">
          <TarjetaRacha datos={datos} />
          <TarjetaControversia controversia={controversia} />
        </div>
      </div>
    </div>
  );
}
