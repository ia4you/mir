#!/usr/bin/env node
// Comprobación semanal de la biblioteca de vídeos con la API de YouTube.
// Las políticas de la API (III.E.4) obligan a refrescar o borrar en 30 días
// como máximo los datos guardados (título, duración, si se puede insertar).
//
// Uso (en el contenedor de producción, vía scripts/comprobar_videos.sh):
//   node scripts/comprobar-videos.mjs                    comprueba y actualiza
//   node scripts/comprobar-videos.mjs --seco             comprueba sin escribir
//   node scripts/comprobar-videos.mjs --ocultar <id> [motivo]
//   node scripts/comprobar-videos.mjs --reactivar <id>
//
// Qué hace la comprobación:
// - Pide videos.list en lotes de 50 (1 unidad de cuota por lote).
// - Actualiza título, duración, si se puede insertar, disponibilidad y
//   ultima_comprobacion (esta solo cuando YouTube devuelve el vídeo).
// - Oculta los borrados, no públicos o no insertables. No reactiva nada
//   solo: si uno oculto por la comprobación vuelve, lo avisa.
// - Avisa (sin tocar nada) de títulos cambiados, vídeos que superan la
//   antigüedad de su tema, temas que ya no existen en `preguntas` y datos
//   que llevan más de 30 días sin poder refrescarse.
//
// Autocontenido (como enviar-recordatorio.mjs): el contenedor usa Node 18 y
// no puede importar los módulos ESM de la app. La clave va en la cabecera
// X-Goog-Api-Key, nunca en la URL, para que no pueda acabar en un log.

import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const API = "https://www.googleapis.com/youtube/v3/videos";
const DIAS_MAX_SIN_REFRESCAR = 30;
const REGLAS = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "datos", "videos", "antiguedad.json"), "utf8")
);

// ---------- lógica pura (con test en comprobar-videos.test.mjs) ----------

// PT1H2M3S → 3723.
export function duracionASegundos(iso) {
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(iso || "");
  if (!m) return 0;
  const [, d, h, min, s] = m.map((x) => Number(x || 0));
  return d * 86400 + h * 3600 + min * 60 + s;
}

// Disponibilidad según la respuesta de videos.list (item ausente = borrado).
export function disponibilidadDe(item) {
  if (!item) return "borrado";
  if (item.status?.privacyStatus !== "public") return "privado";
  if (item.status?.embeddable === false) return "no_insertable";
  return "disponible";
}

export function normalizar(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Años máximos para un tema (null = sin límite), con las mismas reglas que
// recoger-videos.mjs: básico, tratamiento o el resto.
export function limiteAnos(especialidad, tema, reglas = REGLAS) {
  const n = normalizar(tema);
  const encaja = (g) =>
    (g.especialidades || []).includes(especialidad) ||
    (g.palabras_en_tema || []).some((p) => n.includes(normalizar(p)));
  if (encaja(reglas.temas_basicos)) return null;
  if (encaja(reglas.temas_tratamiento)) return reglas.tratamiento_anos;
  return reglas.por_defecto_anos;
}

export function demasiadoAntiguo(fechaPublicacion, anos, ahora = new Date()) {
  if (anos === null || anos === undefined) return false;
  const limite = new Date(ahora);
  limite.setFullYear(limite.getFullYear() - anos);
  return new Date(fechaPublicacion) < limite;
}

// ---------- API de YouTube ----------

async function pedirLote(ids) {
  const url = new URL(API);
  url.searchParams.set("part", "snippet,contentDetails,status");
  url.searchParams.set("id", ids.join(","));
  url.searchParams.set("maxResults", "50");
  let res;
  try {
    res = await fetch(url, { headers: { "X-Goog-Api-Key": process.env.YOUTUBE_API_KEY } });
  } catch (e) {
    throw new Error(`No se pudo contactar con la API de YouTube (${e.cause?.code || "error de red"}).`);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const motivo = json?.error?.errors?.[0]?.reason || res.status;
    if (motivo === "quotaExceeded") throw new Error("Cuota diaria de la API agotada.");
    if (motivo === "keyInvalid" || motivo === "API_KEY_INVALID") throw new Error("YOUTUBE_API_KEY no es válida.");
    throw new Error(`La API de YouTube respondió con error (${motivo}).`);
  }
  return json.items || [];
}

// ---------- programa ----------

const ahoraISO = () => new Date().toISOString().slice(0, 19).replace("T", " ");

async function ocultar(client, youtubeId, motivo) {
  const { rows } = await client.query(
    `UPDATE videos SET estado = 'oculto', motivo_oculto = $2 WHERE youtube_id = $1 RETURNING titulo`,
    [youtubeId, motivo]
  );
  if (!rows.length) throw new Error(`No existe ningún vídeo con youtube_id ${youtubeId}.`);
  console.log(`${ahoraISO()} Ocultado ${youtubeId} ("${rows[0].titulo}"): ${motivo}`);
}

async function reactivar(client, youtubeId) {
  const { rows } = await client.query(
    `UPDATE videos SET estado = 'activo', motivo_oculto = NULL WHERE youtube_id = $1 RETURNING titulo, disponibilidad`,
    [youtubeId]
  );
  if (!rows.length) throw new Error(`No existe ningún vídeo con youtube_id ${youtubeId}.`);
  console.log(`${ahoraISO()} Reactivado ${youtubeId} ("${rows[0].titulo}").`);
  if (rows[0].disponibilidad !== "disponible") {
    console.log(`  Aviso: su disponibilidad es "${rows[0].disponibilidad}", así que no se mostrará hasta que la comprobación lo vea disponible.`);
  }
}

async function comprobar(client, seco) {
  if (!process.env.YOUTUBE_API_KEY) throw new Error("Falta la variable de entorno YOUTUBE_API_KEY.");

  const { rows: videos } = await client.query(
    `SELECT v.id, v.youtube_id, v.titulo, v.estado, v.motivo_oculto, v.disponibilidad,
            v.fecha_publicacion, v.ultima_comprobacion,
            COALESCE(json_agg(json_build_object('especialidad', vt.especialidad, 'tema', vt.tema))
                     FILTER (WHERE vt.id IS NOT NULL), '[]') AS temas
     FROM videos v LEFT JOIN video_temas vt ON vt.video_id = v.id
     GROUP BY v.id ORDER BY v.id`
  );

  const items = new Map();
  let lotes = 0;
  for (let i = 0; i < videos.length; i += 50) {
    for (const it of await pedirLote(videos.slice(i, i + 50).map((v) => v.youtube_id))) items.set(it.id, it);
    lotes++;
  }

  const avisos = [];
  const cambios = { actualizados: 0, ocultados: 0 };
  const ahora = new Date();
  await client.query(seco ? "BEGIN READ ONLY" : "BEGIN");
  try {
    for (const v of videos) {
      const it = items.get(v.youtube_id);
      const disp = disponibilidadDe(it);
      const etiqueta = `${v.youtube_id} ("${v.titulo}")`;

      if (it && it.snippet.title !== v.titulo) {
        avisos.push(`Título cambiado en ${v.youtube_id}: "${v.titulo}" → "${it.snippet.title}"`);
      }
      const ocultarAhora = disp !== "disponible" && v.estado === "activo";
      if (ocultarAhora) {
        avisos.push(`OCULTADO ${etiqueta}: ${disp}`);
        cambios.ocultados++;
      }
      if (disp === "disponible" && v.estado === "oculto" && (v.motivo_oculto || "").startsWith("comprobación")) {
        avisos.push(`${etiqueta} vuelve a estar disponible; sigue oculto. Para mostrarlo: --reactivar ${v.youtube_id}`);
      }
      if (!it && v.ultima_comprobacion && ahora - new Date(v.ultima_comprobacion) > DIAS_MAX_SIN_REFRESCAR * 86400000) {
        avisos.push(`${etiqueta} lleva más de ${DIAS_MAX_SIN_REFRESCAR} días sin poder refrescarse: hay que borrar sus datos.`);
      }
      if (v.estado === "activo" && disp === "disponible" && !REGLAS.excepciones_youtube_id?.[v.youtube_id]) {
        for (const t of v.temas) {
          const anos = limiteAnos(t.especialidad, t.tema || "");
          if (demasiadoAntiguo(v.fecha_publicacion, anos, ahora)) {
            avisos.push(`${etiqueta} supera la antigüedad de ${anos} años para ${t.especialidad} / ${t.tema}`);
          }
        }
      }

      if (seco) continue;
      if (it) {
        await client.query(
          `UPDATE videos SET titulo = $2, duracion_seg = $3, insertable = $4, disponibilidad = $5,
                  ultima_comprobacion = now()
           WHERE id = $1`,
          [v.id, it.snippet.title, duracionASegundos(it.contentDetails?.duration) || 1, it.status?.embeddable !== false, disp]
        );
      } else {
        await client.query(`UPDATE videos SET disponibilidad = 'borrado' WHERE id = $1`, [v.id]);
      }
      if (ocultarAhora) {
        await client.query(`UPDATE videos SET estado = 'oculto', motivo_oculto = $2 WHERE id = $1`, [v.id, `comprobación: ${disp}`]);
      }
      cambios.actualizados++;
    }

    const { rows: huerfanos } = await client.query(
      `SELECT DISTINCT vt.especialidad, vt.tema FROM video_temas vt
       WHERE NOT EXISTS (
         SELECT 1 FROM preguntas p
         WHERE p.especialidad = vt.especialidad AND NULLIF(p.tema, '') IS NOT DISTINCT FROM vt.tema
           AND p.origen = 'oficial' AND p.anulada = false
       )`
    );
    for (const h of huerfanos) avisos.push(`Tema sin preguntas válidas (ya no se mostrará su vídeo tras fallar): ${h.especialidad} / ${h.tema}`);

    await client.query(seco ? "ROLLBACK" : "COMMIT");
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  }

  console.log(
    `${ahoraISO()} ${seco ? "[PRUEBA EN SECO, sin escribir] " : ""}Comprobados ${videos.length} vídeos ` +
      `(${items.size} devueltos por YouTube, ${lotes} unidades de cuota). ` +
      `Actualizados: ${cambios.actualizados}. Ocultados: ${cambios.ocultados}. Avisos: ${avisos.length}.`
  );
  for (const a of avisos) console.log(`  · ${a}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (!process.env.DATABASE_URL) throw new Error("Falta la variable de entorno DATABASE_URL.");
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const i = args.findIndex((a) => a === "--ocultar" || a === "--reactivar");
    if (i >= 0) {
      const id = args[i + 1];
      if (!/^[A-Za-z0-9_-]{11}$/.test(id || "")) throw new Error("Indica un youtube_id válido (11 caracteres).");
      if (args[i] === "--ocultar") await ocultar(client, id, args.slice(i + 2).join(" ") || "retirada a petición del autor");
      else await reactivar(client, id);
    } else {
      await comprobar(client, args.includes("--seco"));
    }
  } finally {
    await client.end();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(`${ahoraISO()} Error: ${e.message}`);
    process.exit(1);
  });
}
