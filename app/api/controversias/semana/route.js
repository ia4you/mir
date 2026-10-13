import { NextResponse } from "next/server";
import { getControversias, REFIERE_IMAGEN } from "@/app/lib/controversias";
import { slugify } from "@/app/lib/especialidades";

export const dynamic = "force-dynamic";

// Controversia de la semana: rota por semanas (de lunes a domingo, UTC) entre
// las controversias documentadas cuyo enunciado no depende de una imagen.
export async function GET() {
  try {
    const elegibles = (await getControversias()).filter((c) => !REFIERE_IMAGEN.test(c.pregunta));
    if (elegibles.length === 0) return NextResponse.json(null);

    // 1970-01-01 fue jueves: +3 días alinea el corte de semana con el lunes.
    const semana = Math.floor((Date.now() / 864e5 + 3) / 7);
    const c = elegibles[semana % elegibles.length];
    return NextResponse.json({
      id: c.id,
      año: c.año,
      numero: c.numero,
      especialidad: c.especialidad,
      pregunta: c.pregunta,
      href: `/preguntas/${slugify(c.especialidad)}/${c.id}`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al consultar controversias" }, { status: 500 });
  }
}
