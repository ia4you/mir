#!/usr/bin/env node
// Carga los vídeos aprobados (scripts/datos/videos/videos-aprobados.csv) y sus
// canales (canales.csv) en las tablas de scripts/videos-esquema.sql.
//
// Uso:
//   DATABASE_URL=... node scripts/cargar-videos.mjs             (prueba en seco)
//   DATABASE_URL=... node scripts/cargar-videos.mjs --aplicar   (escribe)
//
// Por defecto es una prueba en seco: abre una transacción READ ONLY, comprueba
// cada par especialidad + tema contra las preguntas válidas y resume lo que se
// insertaría, sin escribir nada. Si algún par no existe tal cual en
// `preguntas` o se incumple una regla de canal, no carga nada, ni siquiera
// con --aplicar. Con --aplicar todo va en una transacción y se puede repetir:
// ON CONFLICT actualiza en vez de duplicar.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const DIR_DATOS = join(dirname(fileURLToPath(import.meta.url)), "datos", "videos");
// Fecha en que se leyeron de la API los datos del CSV (título, duración…).
// La comprobación semanal (fase 4) los refresca antes de 30 días.
const FECHA_DATOS = "2026-10-13";

// Canales limitados a ciertas especialidades/temas (mismas reglas que
// config.json de recoger-videos.mjs). Clave: youtube_channel_id.
const RESTRICCIONES = {
  // Medicina con Cabeza: residente de Cardiología.
  UCFvJ84YCcz1o9am7DrI7QUw: { solo_especialidades: ["Cardiología"], temas_extra: ["Sepsis y shock"] },
};

// CSV con comillas dobles ("" escapa una comilla). Copiado de recoger-videos.mjs.
function parseCSV(texto) {
  const filas = [];
  let fila = [];
  let campo = "";
  let comillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') comillas = false;
      else campo += c;
    } else if (c === '"') comillas = true;
    else if (c === ",") { fila.push(campo); campo = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      fila.push(campo); filas.push(fila); fila = []; campo = "";
    } else campo += c;
  }
  if (campo !== "" || fila.length) { fila.push(campo); filas.push(fila); }
  const [cab, ...resto] = filas.filter((f) => f.some((x) => x.trim() !== ""));
  return resto.map((f) => Object.fromEntries(cab.map((k, i) => [k.trim(), (f[i] ?? "").trim()])));
}

// "5:44" → 344; "1:02:03" → 3723.
function duracionCSVASegundos(texto) {
  if (!/^\d+(:\d{2}){1,2}$/.test(texto)) return NaN;
  return texto.split(":").map(Number).reduce((acc, p) => acc * 60 + p, 0);
}

const clavePar = (especialidad, tema) => `${especialidad}\u0000${tema}`;

async function main() {
  const aplicar = process.argv.includes("--aplicar");
  if (!process.env.DATABASE_URL) throw new Error("Falta la variable de entorno DATABASE_URL.");

  const canales = parseCSV(readFileSync(join(DIR_DATOS, "canales.csv"), "utf8"));
  const filas = parseCSV(readFileSync(join(DIR_DATOS, "videos-aprobados.csv"), "utf8"));
  const canalPorNombre = new Map(canales.map((c) => [c.nombre, c]));

  // ---- comprobaciones que no necesitan la BD ----
  const errores = [];
  for (const c of canales) {
    if (!/^UC[A-Za-z0-9_-]{22}$/.test(c.youtube_channel_id)) errores.push(`Canal "${c.nombre}" sin youtube_channel_id válido`);
  }
  const vistosPar = new Set();
  for (const [i, f] of filas.entries()) {
    const linea = `línea ${i + 2}`;
    const canal = canalPorNombre.get(f.canal);
    if (!canal) errores.push(`${linea}: canal "${f.canal}" no está en canales.csv`);
    if (!/^[A-Za-z0-9_-]{11}$/.test(f.youtube_id)) errores.push(`${linea}: youtube_id no válido (${f.youtube_id})`);
    if (!f.especialidad || f.especialidad.startsWith("z-")) errores.push(`${linea}: especialidad no válida (${f.especialidad})`);
    if (!f.tema) errores.push(`${linea}: tema vacío`);
    if (!Number.isFinite(duracionCSVASegundos(f.duracion))) errores.push(`${linea}: duración no válida (${f.duracion})`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.fecha_publicacion)) errores.push(`${linea}: fecha no válida (${f.fecha_publicacion})`);
    const par = clavePar(f.especialidad, f.tema);
    if (vistosPar.has(par)) errores.push(`${linea}: par especialidad + tema repetido`);
    vistosPar.add(par);
    const r = canal && RESTRICCIONES[canal.youtube_channel_id];
    if (r && !r.solo_especialidades.includes(f.especialidad) && !r.temas_extra.includes(f.tema)) {
      errores.push(`${linea}: ${f.canal} solo puede usarse en ${r.solo_especialidades.join(", ")} o ${r.temas_extra.join(", ")} (aquí: ${f.especialidad} / ${f.tema})`);
    }
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(aplicar ? "BEGIN" : "BEGIN READ ONLY");

    // ---- pares contra las preguntas válidas de hoy ----
    const { rows } = await client.query(
      `SELECT especialidad, tema, COUNT(*)::int AS n
       FROM preguntas
       WHERE origen = 'oficial' AND anulada = false AND NULLIF(tema, '') IS NOT NULL
       GROUP BY especialidad, tema`
    );
    const enBD = new Map(rows.map((r) => [clavePar(r.especialidad, r.tema), r.n]));
    const sinCoincidencia = filas.filter((f) => !enBD.has(clavePar(f.especialidad, f.tema)));
    const diferencias = filas
      .filter((f) => enBD.has(clavePar(f.especialidad, f.tema)))
      .map((f) => ({ f, csv: Number(f.preguntas), hoy: enBD.get(clavePar(f.especialidad, f.tema)) }))
      .filter((d) => d.csv !== d.hoy);

    // ---- informe ----
    const idsDistintos = new Set(filas.map((f) => f.youtube_id));
    const porCanal = {};
    for (const f of filas) porCanal[f.canal] = (porCanal[f.canal] || 0) + 1;
    const especialidades = new Set(filas.map((f) => f.especialidad));
    const totalCSV = filas.reduce((a, f) => a + Number(f.preguntas), 0);
    const totalHoy = filas.reduce((a, f) => a + (enBD.get(clavePar(f.especialidad, f.tema)) || 0), 0);

    console.log(aplicar ? "== CARGA (--aplicar) ==" : "== PRUEBA EN SECO (solo lectura, no se escribe nada) ==");
    console.log(`Filas del CSV: ${filas.length} · vídeos distintos: ${idsDistintos.size} · especialidades: ${especialidades.size}`);
    console.log(`Por canal (filas): ${Object.entries(porCanal).map(([k, v]) => `${k} ${v}`).join(", ")}`);
    console.log(`Preguntas cubiertas: ${totalCSV} según el CSV · ${totalHoy} hoy en la BD`);
    console.log(`\nPares sin coincidencia en preguntas: ${sinCoincidencia.length}`);
    for (const f of sinCoincidencia) console.log(`  ✖ ${f.especialidad} / ${f.tema}`);
    console.log(`\nPares con distinto nº de preguntas (CSV → hoy): ${diferencias.length}`);
    for (const d of diferencias) console.log(`  · ${d.f.especialidad} / ${d.f.tema}: ${d.csv} → ${d.hoy}`);
    console.log(`\nErrores de formato o de reglas de canal: ${errores.length}`);
    for (const e of errores) console.log(`  ✖ ${e}`);
    console.log(`\nSe insertarían: ${canales.length} canales en video_canales, ${idsDistintos.size} vídeos en videos, ${filas.length} filas en video_temas (todas principal = true).`);

    if (sinCoincidencia.length || errores.length) {
      console.log("\nNo se carga nada hasta resolver lo anterior.");
      process.exitCode = 1;
      await client.query("ROLLBACK");
      return;
    }
    if (!aplicar) {
      await client.query("ROLLBACK");
      console.log("\nPrueba en seco correcta. Para cargar: --aplicar");
      return;
    }

    // ---- escritura (solo con --aplicar) ----
    const { rows: tablas } = await client.query(
      `SELECT to_regclass('public.video_canales') AS a, to_regclass('public.videos') AS b, to_regclass('public.video_temas') AS c`
    );
    if (!tablas[0].a || !tablas[0].b || !tablas[0].c) throw new Error("Faltan las tablas: ejecuta antes scripts/videos-esquema.sql.");

    const idCanal = new Map();
    for (const c of canales) {
      const r = RESTRICCIONES[c.youtube_channel_id];
      const { rows: [fila] } = await client.query(
        `INSERT INTO video_canales (youtube_channel_id, nombre, handle, url, solo_especialidades, temas_extra)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (youtube_channel_id) DO UPDATE
           SET nombre = EXCLUDED.nombre, handle = EXCLUDED.handle, url = EXCLUDED.url,
               solo_especialidades = EXCLUDED.solo_especialidades, temas_extra = EXCLUDED.temas_extra
         RETURNING id`,
        [c.youtube_channel_id, c.nombre, c.handle || null, c.url, r?.solo_especialidades ?? null, r?.temas_extra ?? null]
      );
      idCanal.set(c.nombre, fila.id);
    }

    const idVideo = new Map();
    for (const f of filas) {
      if (idVideo.has(f.youtube_id)) continue;
      const { rows: [fila] } = await client.query(
        `INSERT INTO videos (youtube_id, canal_id, titulo, fecha_publicacion, duracion_seg, ultima_comprobacion, anadido_por)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (youtube_id) DO UPDATE
           SET canal_id = EXCLUDED.canal_id, titulo = EXCLUDED.titulo,
               fecha_publicacion = EXCLUDED.fecha_publicacion, duracion_seg = EXCLUDED.duracion_seg
         RETURNING id`,
        [f.youtube_id, idCanal.get(f.canal), f.titulo, f.fecha_publicacion, duracionCSVASegundos(f.duracion), FECHA_DATOS, `csv-${FECHA_DATOS}`]
      );
      idVideo.set(f.youtube_id, fila.id);
    }

    for (const f of filas) {
      await client.query(
        `INSERT INTO video_temas (video_id, especialidad, tema, principal, nota)
         VALUES ($1, $2, $3, true, $4)
         ON CONFLICT (video_id, especialidad, COALESCE(tema, '')) DO UPDATE SET nota = EXCLUDED.nota`,
        [idVideo.get(f.youtube_id), f.especialidad, f.tema, f.nota || null]
      );
    }

    await client.query("COMMIT");
    console.log(`\nCargado: ${idCanal.size} canales, ${idVideo.size} vídeos, ${filas.length} filas en video_temas.`);
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
