import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getEspecialidadesConConteo } from "@/app/lib/especialidades";

export const dynamic = "force-dynamic";

// Mismo recuento que la portada (oficiales sin anuladas, que son las que
// sirve /api/preguntas), para que app y portada no den cifras distintas.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const filas = await getEspecialidadesConConteo();
    return NextResponse.json(
      filas
        .map((e) => ({ especialidad: e.nombre, total: e.total }))
        .sort((a, b) => a.especialidad.localeCompare(b.especialidad, "es"))
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al consultar especialidades" }, { status: 500 });
  }
}
