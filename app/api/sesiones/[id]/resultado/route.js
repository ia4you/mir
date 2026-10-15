import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { netas, notaSimulacro } from "@/lib/notas";
import { getSimulacros } from "@/lib/notasDb";

const redondear2 = (n) => Math.round(n * 100) / 100;

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

    // Simulacro: corrección del MIR (cada fallo resta 1/3 de acierto, los
    // blancos no restan) y la nota sobre 200 de /estadisticas, con el mismo
    // conteo (getSimulacros) para que las dos pantallas coincidan. Se compara
    // con los 5 simulacros anteriores; un simulacro mezcla convocatorias, así
    // que no tiene "año" propio.
    let simulacro = null;
    let aciertos = sesion.aciertos;
    let fallos = sesion.total_preguntas - sesion.aciertos;
    if (sesion.modo === "simulacro") {
      const filas = await getSimulacros(sesion.user_id, { limite: 7, hastaSesion: sesion.id });
      const i = filas.findIndex((r) => r.id === sesion.id);
      const resumen = (r) => ({
        aciertos: r.aciertos,
        fallos: r.errores,
        en_blanco: r.en_blanco,
        netas: redondear2(netas(r.aciertos, r.errores)),
        nota: notaSimulacro(r.aciertos, r.errores, r.total_preguntas),
      });
      if (i !== -1) {
        simulacro = {
          ...resumen(filas[i]),
          comparativa: filas.slice(i + 1, i + 6).map((r) => ({ id: r.id, fecha: r.fecha, ...resumen(r) })),
        };
        aciertos = filas[i].aciertos;
        fallos = filas[i].errores;
      }
    }

    const porcentajeAciertos =
      sesion.total_preguntas > 0 ? Math.round((aciertos / sesion.total_preguntas) * 1000) / 10 : 0;

    return NextResponse.json({
      sesion_id: sesion.id,
      modo: sesion.modo,
      especialidad: sesion.especialidad,
      total_preguntas: sesion.total_preguntas,
      aciertos,
      fallos,
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
