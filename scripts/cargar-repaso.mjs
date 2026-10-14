#!/usr/bin/env node
// Carga inicial del repaso espaciado con los fallos que ya existen.
//
// Uso (desde el host, con el proxy a mir-db, igual que cargar-videos.mjs):
//   DATABASE_URL=... node scripts/cargar-repaso.mjs             (prueba en seco)
//   DATABASE_URL=... node scripts/cargar-repaso.mjs --aplicar   (escribe)
//
// Entran todas las preguntas oficiales no anuladas que cada usuario ha fallado
// alguna vez, aunque luego las acertara, en el nivel 0. Para no ahogar a nadie
// el primer día, cada usuario recibe como mucho CARGA_POR_DIA por día, desde
// mañana, empezando por las falladas más recientemente. Las que ya estén en
// repaso_espaciado (por respuestas posteriores al despliegue) no se tocan.
// Por defecto, transacción READ ONLY: no escribe nada.

import pg from "pg";
import { repartirCarga, CARGA_POR_DIA } from "../lib/repaso.js";

const ZONA = "Atlantic/Canary"; // misma zona que lib/racha.js

async function main() {
  const aplicar = process.argv.includes("--aplicar");
  if (!process.env.DATABASE_URL) throw new Error("Falta la variable de entorno DATABASE_URL.");
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(aplicar ? "BEGIN" : "BEGIN READ ONLY");
    const {
      rows: [{ hoy }],
    } = await client.query(`SELECT to_char((now() AT TIME ZONE '${ZONA}')::date, 'YYYY-MM-DD') AS hoy`);

    // Un registro por usuario y pregunta fallada, con cuándo la falló por
    // última vez (fecha de la sesión; a igualdad, la respuesta más reciente).
    const { rows } = await client.query(
      `SELECT rs.user_id, rs.pregunta_id, COUNT(*)::int AS veces,
              MAX(s.fecha) AS ultimo_fallo, MAX(rs.id) AS ultima_respuesta
       FROM respuestas_sesion rs
       JOIN preguntas p ON p.id = rs.pregunta_id
       JOIN sesiones s ON s.id = rs.sesion_id
       WHERE rs.correcta = false AND p.origen = 'oficial' AND p.anulada = false
         AND NOT EXISTS (
           SELECT 1 FROM repaso_espaciado r WHERE r.user_id = rs.user_id AND r.pregunta_id = rs.pregunta_id
         )
       GROUP BY rs.user_id, rs.pregunta_id
       ORDER BY rs.user_id, MAX(s.fecha) DESC, MAX(rs.id) DESC`
    );

    const porUsuario = new Map();
    for (const r of rows) {
      if (!porUsuario.has(r.user_id)) porUsuario.set(r.user_id, []);
      porUsuario.get(r.user_id).push(r);
    }

    const filas = [];
    for (const [userId, lista] of porUsuario) {
      const veces = new Map(lista.map((r) => [r.pregunta_id, r.veces]));
      for (const { pregunta_id, proxima } of repartirCarga(lista.map((r) => r.pregunta_id), hoy, CARGA_POR_DIA)) {
        filas.push({ user_id: userId, pregunta_id, proxima, veces: veces.get(pregunta_id) });
      }
    }

    // ---- informe ----
    const porDia = {};
    for (const f of filas) porDia[f.proxima] = (porDia[f.proxima] || 0) + 1;
    const tamanos = [...porUsuario.values()].map((l) => l.length).sort((a, b) => b - a);
    const [maxUserId, maxLista] = [...porUsuario].sort((a, b) => b[1].length - a[1].length)[0] || [null, []];
    const diasMax = Math.ceil(maxLista.length / CARGA_POR_DIA);
    const reparto = {};
    for (const n of tamanos) {
      const d = Math.ceil(n / CARGA_POR_DIA);
      reparto[d] = (reparto[d] || 0) + 1;
    }

    console.log(aplicar ? "== CARGA (--aplicar) ==" : "== PRUEBA EN SECO (solo lectura, no se escribe nada) ==");
    console.log(`Hoy (Canarias): ${hoy}. Máximo ${CARGA_POR_DIA} por usuario y día, desde mañana.`);
    console.log(`Usuarios: ${porUsuario.size} · preguntas (filas) que entrarían: ${filas.length}`);
    console.log(`Preguntas por usuario: máx. ${tamanos[0] ?? 0}, mediana ${tamanos[Math.floor(tamanos.length / 2)] ?? 0}, mín. ${tamanos[tamanos.length - 1] ?? 0}`);
    console.log(`Usuario con más fallos: id ${maxUserId}, ${maxLista.length} preguntas → repartidas en ${diasMax} días (del ${filas.find((f) => f.user_id === maxUserId)?.proxima} al ${[...filas].reverse().find((f) => f.user_id === maxUserId)?.proxima})`);
    console.log(`Usuarios según los días que ocupa su carga: ${Object.entries(reparto).map(([d, n]) => `${d} día${d === "1" ? "" : "s"}: ${n}`).join(" · ")}`);
    console.log("Preguntas que entran cada día (todos los usuarios):");
    for (const [dia, n] of Object.entries(porDia).sort()) console.log(`  ${dia}: ${n}`);

    if (!aplicar) {
      await client.query("ROLLBACK");
      console.log("\nPrueba en seco: no se ha escrito nada. Para cargar: --aplicar");
      return;
    }

    for (const f of filas) {
      await client.query(
        `INSERT INTO repaso_espaciado (user_id, pregunta_id, nivel, proxima, veces_fallada)
         VALUES ($1, $2, 0, $3, $4)
         ON CONFLICT (user_id, pregunta_id) DO NOTHING`,
        [f.user_id, f.pregunta_id, f.proxima, f.veces]
      );
    }
    await client.query("COMMIT");
    console.log(`\nCargado: ${filas.length} filas en repaso_espaciado.`);
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(`\nError: ${e.message}`);
  process.exit(1);
});
