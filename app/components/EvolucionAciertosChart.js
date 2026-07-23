"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Paleta tomada de tailwind.config.js (brand/success/warning/danger/badge) —
// nada de colores inventados fuera de la paleta de la app.
const COLORES = ["#00878E", "#218A45", "#C58D04", "#CB4644", "#124A7B", "#006166"];

const TODAS = "Todas las especialidades";

function formatearFechaCorta(iso) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function TooltipPersonalizado({ active, payload }) {
  if (!active || !payload || payload.length === 0) return null;
  // En cada sesión solo hay una especialidad con valor real; el resto de
  // series quedan sin dato en ese punto y no deben aparecer en el tooltip.
  const punto = payload.find((p) => typeof p.value === "number");
  if (!punto) return null;

  return (
    <div className="rounded-xl bg-ink px-3 py-2 text-xs font-semibold text-white shadow-lg">
      <p>{punto.payload.fechaCompleta}</p>
      <p className="mt-0.5" style={{ color: punto.color }}>
        {punto.dataKey}: {punto.value}%
      </p>
    </div>
  );
}

export default function EvolucionAciertosChart({ sesiones }) {
  if (!sesiones || sesiones.length === 0) return null;

  // sesiones llega ordenado por fecha DESC (más reciente primero); para el
  // eje X se quiere orden cronológico ascendente con las últimas 10.
  const ultimas10 = [...sesiones].slice(0, 10).reverse();

  const especialidades = [...new Set(ultimas10.map((s) => s.especialidad || TODAS))];

  const datos = ultimas10.map((s) => {
    const especialidad = s.especialidad || TODAS;
    return {
      fecha: formatearFechaCorta(s.fecha),
      fechaCompleta: `${formatearFechaCorta(s.fecha)} · ${especialidad}`,
      [especialidad]: s.porcentaje,
    };
  });

  return (
    <section className="px-5">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-muted">
        Evolución de aciertos
      </h2>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
          {especialidades.map((esp, i) => (
            <span key={esp} className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: COLORES[i % COLORES.length] }}
              />
              {esp}
            </span>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={datos} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#DEE5EA" vertical={false} />
            <XAxis
              dataKey="fecha"
              tick={{ fontSize: 11, fill: "#5F6B74" }}
              tickLine={false}
              axisLine={{ stroke: "#DEE5EA" }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: "#5F6B74" }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip content={<TooltipPersonalizado />} />
            {especialidades.map((esp, i) => (
              <Line
                key={esp}
                type="monotone"
                dataKey={esp}
                stroke={COLORES[i % COLORES.length]}
                strokeWidth={2}
                dot={{ r: 4, fill: COLORES[i % COLORES.length] }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
