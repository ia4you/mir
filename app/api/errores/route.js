import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { HOY_CANARIAS } from "@/lib/racha";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    // Una fila por pregunta fallada al menos una vez, con el número total de
    // veces que se ha fallado (puede haberse respondido en varias sesiones).
    const { rows } = await query(
      `SELECT p.id, p.especialidad, p.pregunta, p.año, p.numero, p.origen,
              COUNT(*)::int AS veces_fallada,
              -- Cuántas de esas veces fue en blanco (no contestada): si todas,
              -- /errores la muestra como "En blanco" en vez de "Fallada".
              COUNT(*) FILTER (WHERE rs.respuesta_dada IS NULL)::int AS veces_en_blanco,
              -- Estado en el repaso espaciado: días hasta que toca (0 o menos = hoy)
              -- o dominada. NULL si no está en repaso (p. ej. banco IA).
              (r.proxima - ${HOY_CANARIAS}) AS repaso_dias,
              (r.dominada_en IS NOT NULL) AS repaso_dominada
       FROM respuestas_sesion rs
       JOIN preguntas p ON p.id = rs.pregunta_id
       LEFT JOIN repaso_espaciado r ON r.user_id = rs.user_id AND r.pregunta_id = p.id
       WHERE rs.user_id = $1 AND rs.correcta = false AND rs.vista -- no vista: simulacro sin abrir
       GROUP BY p.id, p.especialidad, p.pregunta, p.año, p.numero, p.origen, r.proxima, r.dominada_en
       ORDER BY p.especialidad ASC NULLS LAST, veces_fallada DESC, p.id ASC`,
      [userId]
    );

    const gruposPorEspecialidad = new Map();
    for (const r of rows) {
      const clave = r.especialidad || "Sin especialidad";
      if (!gruposPorEspecialidad.has(clave)) {
        gruposPorEspecialidad.set(clave, []);
      }
      gruposPorEspecialidad.get(clave).push({
        id: r.id,
        pregunta: r.pregunta,
        anio: r.año,
        numero: r.numero,
        origen: r.origen,
        veces_fallada: r.veces_fallada,
        solo_en_blanco: r.veces_en_blanco === r.veces_fallada,
        recurrente: r.veces_fallada >= 2,
        repaso: r.repaso_dominada ? { dominada: true } : r.repaso_dias === null ? null : { dias: r.repaso_dias },
      });
    }

    const grupos = [...gruposPorEspecialidad.entries()]
      .map(([especialidad, preguntas]) => ({
        especialidad,
        total_preguntas: preguntas.length,
        total_fallos: preguntas.reduce((acc, p) => acc + p.veces_fallada, 0),
        preguntas,
      }))
      .sort(
        (a, b) =>
          b.total_fallos - a.total_fallos ||
          a.especialidad.localeCompare(b.especialidad, "es")
      );

    return NextResponse.json({
      total_preguntas_falladas: rows.length,
      grupos,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al consultar tus errores" }, { status: 500 });
  }
}
