"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ToggleSwitch from "../../components/ToggleSwitch";
import FieldCard from "../../components/FieldCard";
import Chip from "../../components/Chip";
import { getTemporizadorDefecto } from "../../lib/preferencias";
import { iniciarPractica, LIMITE_DIARIO_FREE, SEGUNDOS_POR_PREGUNTA } from "../../lib/iniciarTest";
import { guardarSimulacro } from "../../lib/simulacroLocal";

const ANIOS = ["2022", "2023", "2024", "2025", "2026"];
// Examen real (MIR 2027): 4 h 30 min para todo el simulacro (no por pregunta).
const SEGUNDOS_SIMULACRO = 4.5 * 60 * 60;
const OPCIONES_CANTIDAD = [
  { valor: "5", etiqueta: "5", numero: 5 },
  { valor: "10", etiqueta: "10", numero: 10 },
  { valor: "20", etiqueta: "20", numero: 20 },
  { valor: "50", etiqueta: "50", numero: 50 },
  { valor: "simulacro", etiqueta: "Simulacro completo", numero: 210 },
];
const OPCIONES_SEGUNDOS = [30, 45, 60, 90];

function SelectNativo({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="h-12 w-full appearance-none rounded-xl border border-track bg-card px-4 pr-10 font-semibold text-ink focus:border-accent"
      >
        {children}
      </select>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}


export default function Configuracion() {
  const router = useRouter();
  const { data: session } = useSession();

  const esPremium = session?.user?.plan === "premium";

  const [modoTest, setModoTest] = useState("practica"); // "practica" | "simulacro"
  const [especialidades, setEspecialidades] = useState([]);
  const [especialidad, setEspecialidad] = useState("");
  const [anio, setAnio] = useState("");
  const [cantidad, setCantidad] = useState("20");
  const [temporizadorActivo, setTemporizadorActivo] = useState(
    () => getTemporizadorDefecto().activo
  );
  const [segundos, setSegundos] = useState(() => getTemporizadorDefecto().segundos);
  const [restanteHoy, setRestanteHoy] = useState(null); // null = aún no se sabe

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(false);

  useEffect(() => {
    fetch("/api/especialidades")
      .then((r) => r.json())
      .then(setEspecialidades)
      .catch(() => setEspecialidades([]));
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    if (session.user.plan === "premium") {
      setRestanteHoy(Infinity);
      return;
    }
    fetch("/api/estadisticas")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((datos) => {
        setRestanteHoy(Math.max(0, LIMITE_DIARIO_FREE - datos.meta_diaria.respondidas_hoy));
      })
      .catch(() => setRestanteHoy(LIMITE_DIARIO_FREE));
  }, [session]);

  // "Hacer simulacro" desde Inicio llega con ?modo=simulacro.
  useEffect(() => {
    if (esPremium && new URLSearchParams(window.location.search).get("modo") === "simulacro") {
      setModoTest("simulacro");
    }
  }, [esPremium]);

  // si la opción seleccionada deja de caber en lo que queda del día, bajamos
  // automáticamente a la mayor que sí quepa
  useEffect(() => {
    if (restanteHoy === null) return;
    const actual = OPCIONES_CANTIDAD.find((o) => o.valor === cantidad);
    if (actual && actual.numero > restanteHoy) {
      const alternativa = [...OPCIONES_CANTIDAD].reverse().find((o) => o.numero <= restanteHoy);
      setCantidad(alternativa ? alternativa.valor : OPCIONES_CANTIDAD[0].valor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restanteHoy]);

  const totalPreguntas = especialidades.reduce((acc, e) => acc + e.total, 0);

  // Resumen (columna derecha en escritorio).
  const numeroPreguntas =
    modoTest === "simulacro" ? 210 : OPCIONES_CANTIDAD.find((o) => o.valor === cantidad)?.numero;
  const minutosEstimados =
    modoTest === "simulacro"
      ? SEGUNDOS_SIMULACRO / 60
      : Math.max(1, Math.round((numeroPreguntas * (temporizadorActivo ? segundos : SEGUNDOS_POR_PREGUNTA)) / 60));
  const resumen = [
    ["Preguntas", numeroPreguntas],
    ["Modo", modoTest === "simulacro" ? "Simulacro MIR" : "Práctica"],
    ...(modoTest === "practica"
      ? [
          ["Especialidad", especialidad || "Todas"],
          ["Año", anio || "Todos"],
        ]
      : []),
    [
      "Tiempo estimado",
      modoTest === "simulacro"
        ? "4 h 30 min"
        : `${temporizadorActivo ? "" : "~"}${minutosEstimados} min`,
    ],
  ];

  async function empezarSimulacro() {
    if (!esPremium) {
      setError("El simulacro MIR completo es una función premium.");
      return;
    }
    setError("");
    setEnviando(true);
    try {
      const params = new URLSearchParams({ modo: "simulacro" });
      const resPreguntas = await fetch(`/api/preguntas?${params.toString()}`);
      if (!resPreguntas.ok) throw new Error("No se pudieron cargar las preguntas");
      const preguntas = await resPreguntas.json();

      if (preguntas.length === 0) {
        setError("No hay preguntas disponibles para el simulacro.");
        setEnviando(false);
        return;
      }

      const resSesion = await fetch("/api/sesiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo: "simulacro",
          especialidad: null,
          total_preguntas: preguntas.length,
        }),
      });

      if (resSesion.status === 403) {
        const data = await resSesion.json().catch(() => null);
        if (data?.error === "limite_diario") {
          setLimiteAlcanzado(true);
          setEnviando(false);
          return;
        }
      }
      if (!resSesion.ok) throw new Error("No se pudo crear la sesión");
      const { id } = await resSesion.json();

      // En localStorage (no sessionStorage), para poder seguir el simulacro si
      // se cierra la pestaña; si no se puede, al menos en esta pestaña.
      const datos = {
        preguntas,
        segundosPorPregunta: null,
        modoExamen: "simulacro",
        segundosTotales: SEGUNDOS_SIMULACRO,
      };
      const guardado = guardarSimulacro(id, {
        ...datos,
        userId: session.user.id,
        inicio: Date.now(),
        respuestas: {},
        indice: 0,
      });
      if (!guardado) sessionStorage.setItem(`mir_test_${id}`, JSON.stringify(datos));

      router.push(`/test/${id}`);
    } catch (e) {
      setError("Ha ocurrido un error al preparar el simulacro. Inténtalo de nuevo.");
      setEnviando(false);
    }
  }

  async function empezarTest() {
    if (modoTest === "simulacro") {
      await empezarSimulacro();
      return;
    }

    setError("");
    setEnviando(true);
    try {
      const opcionCantidad = OPCIONES_CANTIDAD.find((o) => o.valor === cantidad);
      const resultado = await iniciarPractica(
        [{ especialidad, anio, cantidad: opcionCantidad ? opcionCantidad.numero : cantidad }],
        { especialidad: especialidad || null, segundosPorPregunta: temporizadorActivo ? segundos : null }
      );

      if (resultado.error === "sin_preguntas") {
        setError("No hay preguntas disponibles con estos filtros. Prueba con otra combinación.");
        setEnviando(false);
        return;
      }
      if (resultado.error === "limite_diario") {
        setLimiteAlcanzado(true);
        setEnviando(false);
        return;
      }
      const { id } = resultado;

      router.push(`/test/${id}`);
    } catch (e) {
      setError("Ha ocurrido un error al preparar el test. Inténtalo de nuevo.");
      setEnviando(false);
    }
  }

  return (
    <div className="ancho-app min-h-screen pb-nav lg:px-8">
      <header className="flex items-center gap-3 px-5 pt-5 lg:px-0 lg:pt-10">
        <Link
          href="/inicio"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm"
          aria-label="Volver al inicio"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-ink">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15 5-7 7 7 7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-extrabold text-ink">Configurar test</h1>
      </header>

      <div className="mt-5 grid gap-4 px-5 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6 lg:px-0">
        <div className="flex flex-col gap-4">
          <FieldCard label="Modo de test">
            <div className="flex gap-2">
              <Chip activo={modoTest === "practica"} onClick={() => setModoTest("practica")}>
                Práctica
              </Chip>
              <Chip
                activo={modoTest === "simulacro"}
                disabled={!esPremium}
                onClick={() => setModoTest("simulacro")}
                title={!esPremium ? "Función premium — hazte premium para desbloquearla" : undefined}
              >
                {!esPremium && "🔒 "}Simulacro MIR
              </Chip>
            </div>
            {!esPremium && (
              <p className="mt-3 text-xs text-ink-muted">
                El simulacro MIR completo (examen real cronometrado) es una función premium.{" "}
                <Link href="/premium" className="font-bold text-accent">
                  Hazte premium
                </Link>{" "}
                para desbloquearlo.
              </p>
            )}
          </FieldCard>

          {modoTest === "practica" && (
            <>
              <FieldCard label="Especialidad">
                <SelectNativo value={especialidad} onChange={(e) => setEspecialidad(e.target.value)}>
                  <option value="">Todas ({totalPreguntas || "…"})</option>
                  {especialidades.map((e) => (
                    <option key={e.especialidad} value={e.especialidad}>
                      {e.especialidad} ({e.total})
                    </option>
                  ))}
                </SelectNativo>
              </FieldCard>

              <FieldCard label="Año">
                <SelectNativo value={anio} onChange={(e) => setAnio(e.target.value)}>
                  <option value="">Todos los años</option>
                  {ANIOS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </SelectNativo>
              </FieldCard>

              <FieldCard label="Número de preguntas">
                <div className="flex gap-2">
                  {OPCIONES_CANTIDAD.map((o) => {
                    const superaLimite = restanteHoy !== null && o.numero > restanteHoy;
                    return (
                      <Chip
                        key={o.valor}
                        activo={cantidad === o.valor}
                        disabled={superaLimite}
                        onClick={() => setCantidad(o.valor)}
                        title={
                          superaLimite && restanteHoy > 0
                            ? `Límite diario: te quedan ${restanteHoy} preguntas hoy`
                            : undefined
                        }
                      >
                        {superaLimite && "🔒 "}
                        {o.etiqueta}
                      </Chip>
                    );
                  })}
                </div>
                {restanteHoy !== null && restanteHoy < Infinity && (
                  <>
                    {restanteHoy > 0 ? (
                      <p className="mt-3 text-xs text-ink-muted">
                        Con tu plan gratuito puedes responder {restanteHoy} preguntas más hoy.{" "}
                        <Link href="/premium" className="font-bold text-accent">
                          Hazte premium
                        </Link>{" "}
                        para acceso ilimitado.
                      </p>
                    ) : (
                      <p className="mt-3 rounded-xl bg-danger-bg p-3 text-xs font-semibold text-danger-text">
                        Has alcanzado tu límite diario. Vuelve mañana o{" "}
                        <Link href="/premium" className="font-bold underline">
                          hazte premium
                        </Link>
                        .
                      </p>
                    )}
                  </>
                )}
              </FieldCard>

              <FieldCard label="Temporizador">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">
                    {temporizadorActivo
                      ? `Con temporizador — ${segundos} segundos por pregunta`
                      : "Sin temporizador"}
                  </span>
                  <ToggleSwitch activo={temporizadorActivo} onChange={setTemporizadorActivo} />
                </div>

                {temporizadorActivo && (
                  <div className="mt-3 flex gap-2">
                    {OPCIONES_SEGUNDOS.map((s) => (
                      <Chip key={s} activo={segundos === s} onClick={() => setSegundos(s)}>
                        {s}s
                      </Chip>
                    ))}
                  </div>
                )}
              </FieldCard>
            </>
          )}

          {modoTest === "simulacro" && (
            <FieldCard label="Cómo funciona el simulacro">
              <ul className="flex flex-col gap-2 text-sm text-ink">
                <li>
                  📝 Examen de 210 preguntas, combinando los 5 años disponibles (2022-2026) y
                  repartidas por especialidad según su peso histórico real en las convocatorias
                  oficiales.
                </li>
                <li>⏱️ Temporizador real de 4 h 30 min (270 minutos) para todo el examen.</li>
                <li>🚫 Sin corrección ni interrupciones durante el test — solo al terminar.</li>
                <li>🎯 Puntuación final con la fórmula oficial: aciertos − 1/3 de fallos.</li>
              </ul>
            </FieldCard>
          )}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          <section className="hidden rounded-2xl border border-track bg-card p-5 lg:block">
            <h2 className="text-xs font-bold uppercase tracking-wide text-ink-muted">Resumen</h2>
            <dl className="mt-3 flex flex-col divide-y divide-track">
              {resumen.map(([etiqueta, valor]) => (
                <div key={etiqueta} className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-sm text-ink-muted">{etiqueta}</dt>
                  <dd className="text-right font-semibold text-ink">{valor}</dd>
                </div>
              ))}
            </dl>
          </section>

          {error && (
            <p className="rounded-2xl bg-danger-bg p-4 text-sm font-semibold text-danger-text">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={empezarTest}
            disabled={
              enviando ||
              (modoTest === "practica" && restanteHoy === 0) ||
              (modoTest === "simulacro" && !esPremium)
            }
            className="h-14 w-full rounded-2xl bg-brand text-lg font-bold text-on-brand shadow-sm active:bg-brand-dark disabled:opacity-60"
          >
            {enviando
              ? "Preparando test…"
              : modoTest === "simulacro"
                ? "Empezar simulacro"
                : "Empezar test"}
          </button>
        </aside>
      </div>

      {limiteAlcanzado && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-xs rounded-2xl bg-card p-6 text-center shadow-lg">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-3xl">
              🌙
            </div>
            <p className="mt-3 text-lg font-extrabold text-ink">Has alcanzado tu límite diario</p>
            <p className="mt-2 text-sm text-ink-muted">
              Hoy ya has respondido 15 preguntas. Vuelve mañana para seguir practicando, o
              hazte premium para practicar sin límites.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                href="/premium"
                className="flex h-12 w-full items-center justify-center rounded-xl bg-brand font-bold text-on-brand shadow-sm active:bg-brand-dark"
              >
                Hazte Premium por 9,99€/mes →
              </Link>
              <Link
                href="/inicio"
                className="flex h-12 w-full items-center justify-center rounded-xl border border-track font-bold text-ink"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
