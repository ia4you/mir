import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { evolucion, notaSimulacro, comparar } from "@/lib/notas";
import { getPesosEspecialidad, getPrimerasRespuestas, getUltimosSimulacros } from "@/lib/notasDb";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const [pesos, primeras, simulacros] = await Promise.all([
      getPesosEspecialidad(),
      getPrimerasRespuestas(userId),
      getUltimosSimulacros(userId),
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

    return NextResponse.json({
      evolucion: evolucion(primeras, pesos),
      simulacro,
      plan: session.user.plan,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al calcular las notas" }, { status: 500 });
  }
}
