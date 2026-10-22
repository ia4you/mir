// Fase 4b de vídeos de MIR 2017 (repetición de los 51 que se mantienen, reasoning high, título primero): veredicto pregunta vs vídeo con Groq (gpt-oss-120b, temp 0). NO toca la BD.
// Paso 1: veredicto para las 126. Paso 2 (PASO=2): alternativo de la biblioteca para cada "no encaja".
// Reanudable: trabajo_videos/veredictos.json y alternativos.json.
import fs from "node:fs";
const T = "import2017/trabajo/";
const mantener = new Set(JSON.parse(fs.readFileSync("import2017/videos_2017.json", "utf8")).filter((x) => x.accion === "mantener").map((x) => x.numero));
const entrada = JSON.parse(fs.readFileSync(T + "entrada_videos.json", "utf8")).filter((q) => mantener.has(Number(q.numero)));
const biblio = JSON.parse(fs.readFileSync(T + "biblioteca.json", "utf8"));
const PASO = process.env.PASO || "1";
const F = T + (PASO === "1" ? "veredictos_videos_b.json" : "alternativos_videos_b.json");
const out = fs.existsSync(F) ? JSON.parse(fs.readFileSync(F, "utf8")) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function groq(prompt, intento = 1) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({ model: "openai/gpt-oss-120b", temperature: 0, max_tokens: 16000, reasoning_effort: "high", response_format: { type: "json_object" }, messages: [{ role: "user", content: prompt }] }),
  });
  if ((res.status === 429 || res.status >= 500) && intento <= 6) {
    const m = (await res.text().catch(() => "")).match(/try again in ([\d.]+)s/i);
    await sleep(m ? Math.ceil(parseFloat(m[1]) * 1000) + 1000 : 10000);
    return groq(prompt, intento + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const r = JSON.parse((await res.json()).choices[0].message.content);
  return Array.isArray(r) ? r[0] : r; // a veces devuelve una lista con un único objeto
}
async function pedir(prompt, valida) {
  for (let i = 0; i < 3; i++) { try { const r = await groq(prompt); if (valida(r)) return r; } catch {} }
  return null;
}
const enun = (q) => `${q.pregunta}\nA) ${q.opcion_a}\nB) ${q.opcion_b}\nC) ${q.opcion_c}\nD) ${q.opcion_d}\nRespuesta correcta: ${q.correcta}`;

function promptVeredicto(q) {
  return `Eres un médico que revisa si un vídeo de YouTube sirve de refuerzo a un opositor MIR que ha FALLADO una pregunta concreta.

PREGUNTA (MIR ${2017}, n.º ${q.numero}, ${q.especialidad} / ${q.tema}):
${enun(q)}
Explicación: ${q.explicacion || "(sin explicación)"}

VÍDEO: «${q.titulo}» (${q.canal}, ${q.fecha.slice(0, 4)})
Descripción: ${q.descripcion || "(sin descripción)"}

Criterio:
- "encaja": el vídeo trata justo el concepto que decide la respuesta (diagnóstico, mecanismo, tratamiento...) y ayudaría a no volver a fallarla.
- "en parte": mismo tema general, pero el vídeo no cubre el punto concreto de la pregunta.
- "no encaja": el vídeo trata otra cosa o un aspecto sin relación con lo que se pregunta.
Basa tu juicio PRIMERO en el título del vídeo. Usa la descripción solo si habla del mismo tema que el título. Muchas descripciones son un índice con enlaces y títulos de OTROS vídeos de la misma serie: esos títulos no cuentan, no los uses para decidir qué trata este vídeo. Si por el título no se puede saber, no supongas: "en parte".
Además "sensible_a_guias": true si la respuesta depende de tratamiento, guías clínicas, puntos de corte, fármacos o clasificaciones que cambian con los años; false si es fisiopatología, anatomía o concepto estable.
Responde solo JSON: {"veredicto": "encaja|en parte|no encaja", "motivo": "una frase de máximo 25 palabras", "sensible_a_guias": true|false}`;
}
function promptAlt(q, v) {
  const lista = biblio.filter((b) => b.especialidad === q.especialidad && b.vid !== q.vid)
    .map((b) => `#${b.vid} «${b.titulo}» (${b.fecha.slice(0, 4)}; tema: ${b.tema})`).join("\n");
  return `Pregunta MIR de ${q.especialidad}:\n${enun(q)}\n\nEl vídeo actual «${q.titulo}» NO encaja (${v.motivo}).\n\nVídeos de la biblioteca de la misma especialidad:\n${lista}\n\nSi alguno trata el concepto concreto que decide esta pregunta, elige el mejor; si ninguno lo trata, null (mejor null que forzar).\nResponde solo JSON: {"alternativo": <número del #id> o null, "motivo": "una frase de máximo 25 palabras"}`;
}

let n = 0;
for (const q of entrada) {
  const k = String(q.numero);
  if (out[k]) continue;
  if (PASO === "1") {
    const r = await pedir(promptVeredicto(q), (r) => ["encaja", "en parte", "no encaja"].includes(r.veredicto) && typeof r.motivo === "string" && typeof r.sensible_a_guias === "boolean");
    out[k] = r || { fallo: true };
  } else {
    const v = JSON.parse(fs.readFileSync(T + "veredictos_videos_b.json", "utf8"))[k];
    if (v.veredicto !== "no encaja") continue;
    const ids = new Set(biblio.filter((b) => b.especialidad === q.especialidad && b.vid !== q.vid).map((b) => b.vid));
    const r = await pedir(promptAlt(q, v), (r) => r.alternativo === null || ids.has(Number(r.alternativo)));
    out[k] = r ? { alternativo: r.alternativo === null ? null : Number(r.alternativo), motivo: r.motivo } : { fallo: true };
  }
  fs.writeFileSync(F, JSON.stringify(out, null, 1));
  if (++n % 20 === 0) console.log(`${n} hechas (última: ${k})`);
}
const v = Object.values(out);
console.log(`Paso ${PASO}: ${v.length}; fallos ${v.filter((x) => x.fallo).length}`);
