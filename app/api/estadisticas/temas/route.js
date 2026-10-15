import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAciertosPorTema } from "@/lib/estadisticasDb";

export const dynamic = "force-dynamic";

// Con menos respuestas que esto en un tema, el porcentaje no es fiable
// (una sola respuesta ya da 0% o 100%).
const MIN_RESPUESTAS_FIABLE = 5;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const temas = await getAciertosPorTema(userId);

    return NextResponse.json({
      temas: temas.map((r) => ({
        especialidad: r.especialidad,
        tema: r.tema,
        total: r.total,
        aciertos: r.aciertos,
        porcentaje: r.total > 0 ? Math.round((r.aciertos / r.total) * 100) : 0,
        fiable: r.total >= MIN_RESPUESTAS_FIABLE,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al calcular estadísticas por tema" }, { status: 500 });
  }
}
