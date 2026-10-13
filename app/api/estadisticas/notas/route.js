import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { evolucion, notaSimulacro, comparar, serieNotas } from "@/lib/notas";
import { getPesosEspecialidad, getPrimerasRespuestas, getUltimosSimulacros } from "@/lib/notasDb";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const [pesos, primeras, simulacros, usuario] = await Promise.all([
      getPesosEspecialidad(),
      getPrimerasRespuestas(userId),
      getUltimosSimulacros(userId),
      // plan real de la BD (el del JWT puede ir desfasado tras un pago)
      query(`SELECT plan FROM usuarios WHERE id = $1`, [userId]),
    ]);

    let simulacro = null;
    if (simulacros.length > 0) {
      const [ultimo, previo] = simulacros;
      const nota = notaSimulacro(ultimo.aciertos, ultimo.errores, ultimo.total_preguntas);
      const anterior = previo
        ? notaSimulacro(previo.aciertos, previo.errores, previo.total_preguntas)
        : null;
      simulacro = { nota, fecha: ultimo.fecha, anterior, ...comparar(nota, anterior) };
    }

    // Nota al final de cada una de las últimas 10 sesiones; la variación va
    // del primer al último punto con nota.
    const serie = serieNotas(primeras, pesos, 10);
    const conNota = serie.filter((p) => p.nota !== null);
    const variacion =
      conNota.length >= 2 ? comparar(conNota[conNota.length - 1].nota, conNota[0].nota).diferencia : null;

    return NextResponse.json({
      evolucion: evolucion(primeras, pesos),
      serie,
      variacion,
      simulacro,
      plan: usuario.rows[0]?.plan ?? session.user.plan,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al calcular las notas" }, { status: 500 });
  }
}
