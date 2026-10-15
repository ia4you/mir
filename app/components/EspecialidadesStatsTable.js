import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { fmtPorcentaje } from "@/lib/formato";

// Con menos respuestas la API no calcula tendencia (MIN_RESPUESTAS_TENDENCIA).
const MIN_RESPUESTAS_TENDENCIA = 4;

// Nivel por % de acierto: ≥80 dominado, 65-79 en progreso, <65 reforzar.
function nivel(porcentaje, total) {
  if (total === 0) return { texto: "Sin empezar", claseTexto: "text-ink-muted", barra: "bg-track" };
  if (porcentaje >= 80) return { texto: "Dominado", claseTexto: "text-success-text", barra: "bg-success" };
  if (porcentaje >= 65) return { texto: "En progreso", claseTexto: "text-warning-text", barra: "bg-warning" };
  return { texto: "Reforzar", claseTexto: "text-danger-text", barra: "bg-danger-bar" };
}

const TENDENCIA = {
  up: { Icono: TrendingUp, texto: "Sube", clase: "text-success-text" },
  down: { Icono: TrendingDown, texto: "Baja", clase: "text-danger-text" },
  flat: { Icono: Minus, texto: "Estable", clase: "text-ink-muted" },
};

export default function EspecialidadesStatsTable({ especialidades }) {
  if (!especialidades || especialidades.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-track bg-card">
      <table className="w-full border-collapse text-left text-sm sm:min-w-[600px]">
        <thead>
          <tr className="border-b border-track text-xs font-bold uppercase tracking-wide text-ink-muted">
            <th className="px-3 py-3 sm:px-4">Especialidad</th>
            <th className="px-3 py-3 text-right sm:px-4">
              <span className="sm:hidden">Resp.</span>
              <span className="hidden sm:inline">Respondidas</span>
            </th>
            <th className="px-3 py-3 sm:w-[32%] sm:px-4">% Acierto</th>
            <th className="px-3 py-3 sm:px-4">
              <span className="sr-only sm:not-sr-only">Tendencia</span>
            </th>
            <th className="hidden px-3 py-3 sm:table-cell sm:px-4">Nivel</th>
          </tr>
        </thead>
        <tbody>
          {especialidades.map((e) => {
            const n = nivel(e.porcentaje, e.total);
            const t = e.total >= MIN_RESPUESTAS_TENDENCIA ? TENDENCIA[e.tendencia] : null;
            return (
              <tr key={e.especialidad} className="border-b border-track last:border-0">
                <td className="px-3 py-3 sm:px-4">
                  <span className="font-semibold text-ink">{e.especialidad}</span>
                  <span className={`block text-xs font-semibold sm:hidden ${n.claseTexto}`}>{n.texto}</span>
                </td>
                <td className="px-3 py-3 text-right font-mono text-ink sm:px-4">{e.total}</td>
                <td className="px-3 py-3 sm:px-4">
                  {e.total > 0 ? (
                    <div className="flex items-center gap-3">
                      <div className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-track sm:block" aria-hidden="true">
                        <div className={`h-full rounded-full ${n.barra}`} style={{ width: `${e.porcentaje}%` }} />
                      </div>
                      <span className="whitespace-nowrap text-right font-mono text-ink sm:w-12">{fmtPorcentaje(e.porcentaje)}</span>
                    </div>
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                </td>
                <td className="px-3 py-3 sm:px-4">
                  {t ? (
                    <span className={`flex items-center gap-1.5 font-semibold ${t.clase}`}>
                      <t.Icono className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only sm:not-sr-only">{t.texto}</span>
                    </span>
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                </td>
                <td className={`hidden whitespace-nowrap px-3 py-3 font-semibold sm:table-cell sm:px-4 ${n.claseTexto}`}>{n.texto}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
