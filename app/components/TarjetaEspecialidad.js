import Link from "next/link";
import { fmtPorcentaje } from "@/lib/formato";
import EspecialidadIcono from "./EspecialidadIcono";

// Tarjeta de especialidad de la portada y de /especialidades: nombre, nº de
// preguntas y barra de peso (relativa a la especialidad con más preguntas;
// el % mostrado es el peso real sobre el total del banco). En la portada la
// barra solo se ve en escritorio; en /especialidades, siempre (`barraSiempre`).
// `soloEscritorio` la oculta con CSS por debajo de lg sin sacarla del HTML.
export default function TarjetaEspecialidad({ especialidad: e, maximo, total, barraSiempre = false, soloEscritorio = false }) {
  return (
    <Link
      href={`/especialidades/${e.slug}`}
      className={`${soloEscritorio ? "hidden lg:flex" : "flex"} flex-col items-center justify-between rounded-xl border border-track bg-card px-3.5 pb-3.5 pt-[18px] text-center active:bg-brand-light`}
    >
      <EspecialidadIcono nombre={e.nombre} />
      <span className="font-bold text-ink">{e.nombre}</span>
      <span className="mt-1 text-sm text-ink-muted">{e.total} preguntas</span>
      <span className={`mt-3 w-full items-center gap-3 ${barraSiempre ? "flex" : "hidden lg:flex"}`}>
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-track" aria-hidden="true">
          <span className="block h-full rounded-full bg-accent" style={{ width: `${(e.total / maximo) * 100}%` }} />
        </span>
        <span className="font-mono text-xs text-ink-muted">
          {fmtPorcentaje((e.total / total) * 100)}
        </span>
      </span>
    </Link>
  );
}
