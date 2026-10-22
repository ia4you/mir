import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getConvocatorias } from "@/app/lib/convocatorias";

export const dynamic = "force-dynamic";

// Años con preguntas oficiales servibles (al menos una no anulada), del más
// reciente al más antiguo. Mismo criterio que /api/preguntas, así el selector
// de práctica nunca ofrece un año que devuelva 0 preguntas.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const convocatorias = await getConvocatorias();
    return NextResponse.json(convocatorias.filter((c) => c.publicas > 0).map((c) => String(c.anio)));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al consultar los años" }, { status: 500 });
  }
}
