import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
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

  const paginaFinal = pagina.slice(0, 200);
  const ipHashFinal = typeof ipHash === "string" ? ipHash.slice(0, 64) : null;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // pg_advisory_xact_lock serializa por (ip_hash, pagina): si dos
    // peticiones para el mismo visitante+página llegan casi a la vez, la
    // segunda espera aquí hasta que la primera confirme, así el NOT EXISTS
    // de abajo ve ya la fila insertada en vez de correr en paralelo con ella
    // (un simple SELECT-luego-INSERT sin este lock no evita esa carrera).
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      `${ipHashFinal}:${paginaFinal}`,
    ]);
    await client.query(
      `INSERT INTO visitas (pagina, ip_hash)
       SELECT $1, $2
       WHERE NOT EXISTS (
         SELECT 1 FROM visitas
         WHERE ip_hash = $2
           AND pagina = $1
           AND created_at > NOW() - INTERVAL '5 seconds'
       )`,
      [paginaFinal, ipHashFinal]
    );
    await client.query("COMMIT");
    return NextResponse.json({ ok: true });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(err);
    return NextResponse.json({ error: "No se ha podido registrar la visita" }, { status: 500 });
  } finally {
    client.release();
  }
}
