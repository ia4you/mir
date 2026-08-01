import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { esRutaTrackeada } from "@/lib/visitas";

export const dynamic = "force-dynamic";

// Endpoint interno: no lo llama el navegador, solo middleware.js (que corre
// en el runtime edge y no puede usar el driver `pg`, así que delega aquí el
// INSERT). Protegido con un secreto compartido en vez de sesión, porque el
// visitante no está autenticado.
export async function POST(request) {
  const secreto = request.headers.get("x-track-secret");
  if (!secreto || secreto !== process.env.TRACK_SECRET) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const pagina = body?.pagina;
  const ipHash = body?.ipHash;

  if (typeof pagina !== "string" || !esRutaTrackeada(pagina)) {
    return NextResponse.json({ error: "Página no válida" }, { status: 400 });
  }

  try {
    await query(`INSERT INTO visitas (pagina, ip_hash) VALUES ($1, $2)`, [
      pagina.slice(0, 200),
      typeof ipHash === "string" ? ipHash.slice(0, 64) : null,
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "No se ha podido registrar la visita" }, { status: 500 });
  }
}
