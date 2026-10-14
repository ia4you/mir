import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { diaCanarias, HOY_CANARIAS } from "@/lib/racha";
import { seleccionarHoy, sumarDias, INTERVALOS, TOPE_PREMIUM, TOPE_FREE } from "@/lib/repaso";
import { LIMITE_DIARIO_FREE } from "@/app/lib/iniciarTest";

export const dynamic = "force-dynamic";

// Repaso de hoy del usuario: qué preguntas tocan (con el tope diario), cuántas
// hay en cada intervalo, dominadas y, si hoy no toca nada, cuándo es el
// próximo. En Free el repaso cuenta dentro del límite diario: el tope es el
// menor entre TOPE_FREE y lo que le queda hoy. Plan leído de la BD.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const userId = session.user.id;

  try {
    const [{ rows: [ctx] }, { rows: filas }] = await Promise.all([
      query(
        `SELECT to_char(${HOY_CANARIAS}, 'YYYY-MM-DD') AS hoy,
                (SELECT plan FROM usuarios WHERE id = $1) AS plan,
                (SELECT COALESCE(SUM(total_preguntas), 0)::int FROM sesiones
                 WHERE user_id = $1 AND duracion_segundos IS NOT NULL AND ${diaCanarias()} = ${HOY_CANARIAS}) AS respondidas_hoy`,
        [userId]
      ),
      query(
        `SELECT pregunta_id, nivel, to_char(proxima, 'YYYY-MM-DD') AS proxima
         FROM repaso_espaciado r
         JOIN preguntas p ON p.id = r.pregunta_id AND p.anulada = false
         WHERE r.user_id = $1`,
        [userId]
      ),
    ]);

    const premium = ctx.plan === "premium";
    const restanteHoy = premium ? null : Math.max(0, LIMITE_DIARIO_FREE - ctx.respondidas_hoy);
    const tope = premium ? TOPE_PREMIUM : Math.min(TOPE_FREE, restanteHoy);
    const { ids, pendientes } = seleccionarHoy(filas, ctx.hoy, tope);

    const enRepaso = filas.filter((f) => f.nivel !== null);
    const porNivel = INTERVALOS.map((_, i) => enRepaso.filter((f) => f.nivel === i).length);
    const manana = sumarDias(ctx.hoy, 1);
    const futuras = enRepaso.filter((f) => f.proxima > ctx.hoy).map((f) => f.proxima).sort();
    const proximoDia = futuras[0] || null;

    return NextResponse.json(
      {
        premium,
        restanteHoy,
        ids,
        pendientes,
        // Las que tocan hoy pero no caben por el tope (o por el límite de Free).
        atrasadas: pendientes - ids.length,
        manana: enRepaso.filter((f) => f.proxima === manana).length,
        porNivel,
        enRepaso: enRepaso.length,
        dominadas: filas.length - enRepaso.length,
        proximo: proximoDia ? { fecha: proximoDia, preguntas: futuras.filter((d) => d === proximoDia).length, esManana: proximoDia === manana } : null,
      },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Error en /api/repaso/hoy:", error);
    return NextResponse.json({ error: "Error al cargar el repaso" }, { status: 500 });
  }
}
