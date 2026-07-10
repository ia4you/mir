"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "../components/BottomNav";
import ToggleSwitch from "../components/ToggleSwitch";
import FieldCard from "../components/FieldCard";
import Chip from "../components/Chip";
import { getTemporizadorDefecto } from "../lib/preferencias";

const ANIOS = ["2021", "2022", "2023", "2024", "2025"];
const OPCIONES_CANTIDAD = [
  { valor: "10", etiqueta: "10" },
  { valor: "20", etiqueta: "20" },
  { valor: "50", etiqueta: "50" },
  { valor: "simulacro", etiqueta: "Simulacro completo" },
];
const OPCIONES_SEGUNDOS = [30, 45, 60, 90];

function SelectNativo({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="h-12 w-full appearance-none rounded-xl border border-track bg-white px-4 pr-10 font-semibold text-ink focus:border-brand focus:outline-none"
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

  const [especialidades, setEspecialidades] = useState([]);
  const [especialidad, setEspecialidad] = useState("");
  const [anio, setAnio] = useState("");
  const [cantidad, setCantidad] = useState("20");
  const [temporizadorActivo, setTemporizadorActivo] = useState(
    () => getTemporizadorDefecto().activo
  );
  const [segundos, setSegundos] = useState(() => getTemporizadorDefecto().segundos);

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/especialidades")
      .then((r) => r.json())
      .then(setEspecialidades)
      .catch(() => setEspecialidades([]));
  }, []);

  const totalPreguntas = especialidades.reduce((acc, e) => acc + e.total, 0);

  async function empezarTest() {
    setError("");
    setEnviando(true);
    try {
      const params = new URLSearchParams();
      if (especialidad) params.set("especialidad", especialidad);
      if (anio) params.set("anio", anio);
      params.set("cantidad", cantidad === "simulacro" ? "210" : cantidad);

      const resPreguntas = await fetch(`/api/preguntas?${params.toString()}`);
      if (!resPreguntas.ok) throw new Error("No se pudieron cargar las preguntas");
      const preguntas = await resPreguntas.json();

      if (preguntas.length === 0) {
        setError("No hay preguntas disponibles con estos filtros. Prueba con otra combinación.");
        setEnviando(false);
        return;
      }

      const resSesion = await fetch("/api/sesiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo: "practica",
          especialidad: especialidad || null,
          total_preguntas: preguntas.length,
        }),
      });
      if (!resSesion.ok) throw new Error("No se pudo crear la sesión");
      const { id } = await resSesion.json();

      sessionStorage.setItem(
        `mir_test_${id}`,
        JSON.stringify({
          preguntas,
          segundosPorPregunta: temporizadorActivo ? segundos : null,
        })
      );

      router.push(`/test/${id}`);
    } catch (e) {
      setError("Ha ocurrido un error al preparar el test. Inténtalo de nuevo.");
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen pb-28">
      <header className="flex items-center gap-3 px-5 pt-safe">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
          aria-label="Volver al inicio"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-ink">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15 5-7 7 7 7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-extrabold text-ink">Configurar test</h1>
      </header>

      <div className="mt-5 flex flex-col gap-4 px-5">
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
            {OPCIONES_CANTIDAD.map((o) => (
              <Chip key={o.valor} activo={cantidad === o.valor} onClick={() => setCantidad(o.valor)}>
                {o.etiqueta}
              </Chip>
            ))}
          </div>
        </FieldCard>

        <FieldCard label="Temporizador">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-ink">
              {temporizadorActivo ? `${segundos} segundos por pregunta` : "Sin límite de tiempo"}
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

        {error && (
          <p className="rounded-2xl bg-danger-bg p-4 text-sm font-semibold text-danger-text">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={empezarTest}
          disabled={enviando}
          className="h-14 w-full rounded-2xl bg-brand text-lg font-bold text-white shadow-sm active:bg-brand-dark disabled:opacity-60"
        >
          {enviando ? "Preparando test…" : "Empezar test"}
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
