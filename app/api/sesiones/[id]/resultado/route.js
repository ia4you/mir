import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { netas } from "@/lib/notas";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const sesionId = parseInt(params.id, 10);
  if (!Number.isInteger(sesionId)) {
    return NextResponse.json({ error: "id de sesión inválido" }, { status: 400 });
  }

  try {
    const sesionRes = await query(
      `SELECT id, modo, especialidad, total_preguntas, aciertos, duracion_segundos, user_id
       FROM sesiones WHERE id = $1`,
      [sesionId]
    );
    if (sesionRes.rows.length === 0) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }
    const sesion = sesionRes.rows[0];
    if (sesion.user_id !== Number(session.user.id)) {
      return NextResponse.json({ error: "No tienes acceso a esta sesión" }, { status: 403 });
    }

    const desgloseRes = await query(
      `SELECT p.especialidad,
              COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE rs.correcta)::int AS aciertos
       FROM respuestas_sesion rs
       JOIN preguntas p ON p.id = rs.pregunta_id
       WHERE rs.sesion_id = $1
       GROUP BY p.especialidad
       ORDER BY p.especialidad`,
      [sesionId]
    );

    const falladasRes = await query(
      `SELECT rs.pregunta_id AS id
       FROM respuestas_sesion rs
       WHERE rs.sesion_id = $1 AND rs.correcta = false`,
      [sesionId]
    );

    const porcentajeAciertos =
      sesion.total_preguntas > 0
        ? Math.round((sesion.aciertos / sesion.total_preguntas) * 1000) / 10
        : 0;

    let simulacro = null;
    if (sesion.modo === "simulacro") {
      // fallos_respondidos excluye las dejadas en blanco (respuesta_dada
      // NULL): la fórmula oficial del MIR solo penaliza fallos "reales".
      const conteoRes = await query(
        `SELECT COUNT(*) FILTER (WHERE rs.correcta = false AND rs.respuesta_dada IS NOT NULL)::int AS fallos_respondidos,
                COUNT(*) FILTER (WHERE rs.respuesta_dada IS NULL)::int AS en_blanco
         FROM respuestas_sesion rs
         WHERE rs.sesion_id = $1`,
        [sesionId]
      );
      const { fallos_respondidos, en_blanco } = conteoRes.rows[0];
      const puntuacion = Math.round(netas(sesion.aciertos, fallos_respondidos) * 100) / 100;
      const porcentajeEstimado =
        sesion.total_preguntas > 0
          ? Math.round((puntuacion / sesion.total_preguntas) * 1000) / 10
          : 0;

      // Comparativa con los simulacros anteriores del usuario, por fecha.
      // Un simulacro mezcla preguntas de todas las convocatorias
      // (generarSimulacro en api/preguntas), así que no tiene "año" propio.
      const historicoRes = await query(
        `SELECT s.id, s.fecha, s.aciertos, s.total_preguntas,
                COUNT(rs.id) FILTER (WHERE rs.correcta = false AND rs.respuesta_dada IS NOT NULL)::int AS fallos_respondidos
         FROM sesiones s
         LEFT JOIN respuestas_sesion rs ON rs.sesion_id = s.id
         WHERE s.user_id = $1 AND s.modo = 'simulacro' AND s.duracion_segundos IS NOT NULL
           AND s.id <> $2 AND s.fecha <= (SELECT fecha FROM sesiones WHERE id = $2)
         GROUP BY s.id
         ORDER BY s.fecha DESC
         LIMIT 5`,
        [sesion.user_id, sesion.id]
      );

      const comparativa = historicoRes.rows.map((r) => {
        const puntuacionPrevia = Math.round(netas(r.aciertos, r.fallos_respondidos) * 100) / 100;
        return {
          id: r.id,
          fecha: r.fecha,
          puntuacion: puntuacionPrevia,
          porcentaje_estimado:
            r.total_preguntas > 0
              ? Math.round((puntuacionPrevia / r.total_preguntas) * 1000) / 10
              : 0,
        };
      });

      simulacro = {
        fallos_respondidos,
        en_blanco,
        puntuacion,
        porcentaje_estimado: porcentajeEstimado,
        comparativa,
      };
    }

    return NextResponse.json({
      sesion_id: sesion.id,
      modo: sesion.modo,
      especialidad: sesion.especialidad,
      total_preguntas: sesion.total_preguntas,
      aciertos: sesion.aciertos,
      fallos: sesion.total_preguntas - sesion.aciertos,
      porcentaje_aciertos: porcentajeAciertos,
      duracion_segundos: sesion.duracion_segundos,
      desglose_especialidad: desgloseRes.rows.map((r) => ({
        especialidad: r.especialidad,
        total: r.total,
        aciertos: r.aciertos,
        porcentaje: r.total > 0 ? Math.round((r.aciertos / r.total) * 1000) / 10 : 0,
      })),
      preguntas_falladas: falladasRes.rows.map((r) => r.id),
      simulacro,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error al calcular el resultado" }, { status: 500 });
  }
}
