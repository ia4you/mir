import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const [totalesRes, topPaginasRes, porDiaRes] = await Promise.all([
    query(
      `SELECT
         COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)::int AS hoy,
         COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE))::int AS semana,
         COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE))::int AS mes,
         COUNT(*)::int AS historico
       FROM visitas`
    ),
    query(
      `SELECT pagina, COUNT(*)::int AS total
       FROM visitas
       GROUP BY pagina
       ORDER BY total DESC
       LIMIT 5`
    ),
    query(
      `SELECT gs.dia::date AS fecha, COALESCE(v.total, 0)::int AS total
       FROM generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, INTERVAL '1 day') AS gs(dia)
       LEFT JOIN (
         SELECT DATE(created_at) AS dia, COUNT(*) AS total
         FROM visitas
         WHERE created_at >= CURRENT_DATE - INTERVAL '29 days'
         GROUP BY DATE(created_at)
       ) v ON v.dia = gs.dia::date
       ORDER BY gs.dia`
    ),
  ]);

  return NextResponse.json({
    totales: totalesRes.rows[0],
    top_paginas: topPaginasRes.rows,
    por_dia: porDiaRes.rows.map((r) => ({
      fecha: r.fecha.toISOString().slice(0, 10),
      total: r.total,
    })),
  });
}
