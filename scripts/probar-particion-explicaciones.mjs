// Pasa partirExplicacion por todas las explicaciones oficiales no anuladas y da el % por año y los casos dudosos.
// Solo lectura (un SELECT). Uso: DATABASE_URL=postgresql://... node scripts/probar-particion-explicaciones.mjs
import pg from "pg";
import { partirExplicacion, casosDudosos } from "../lib/explicacion.js";

const cliente = new pg.Client({ connectionString: process.env.DATABASE_URL });
await cliente.connect();
const { rows } = await cliente.query(
  `SELECT "año" AS anio, numero, explicacion FROM preguntas
   WHERE origen = 'oficial' AND NOT anulada AND explicacion IS NOT NULL ORDER BY "año", numero`
);
await cliente.end();

const porAnio = {};
const dudosos = [];
for (const r of rows) {
  const p = partirExplicacion(r.explicacion);
  const idem = p.join(" ").replace(/\s+/g, " ").trim() === r.explicacion.replace(/\s+/g, " ").trim();
  const dudas = casosDudosos(r.explicacion, p);
  const d = (porAnio[r.anio] ||= { n: 0, partidas: 0, sinPerdida: 0, exactas: 0 });
  d.n++;
  d.sinPerdida += idem;
  d.partidas += p.length >= 2;
  d.exactas += p.length === 4 && dudas.length === 0;
  if (p.length >= 2 && dudas.length) dudosos.push({ anio: r.anio, numero: r.numero, dudas });
}
console.log("año | n | texto idéntico | partidas (≥2 párrafos) | exactas (1 + 3, sin dudas)");
for (const [a, d] of Object.entries(porAnio)) {
  const pc = (x) => `${x} (${Math.round((100 * x) / d.n)} %)`;
  console.log(`${a} | ${d.n} | ${pc(d.sinPerdida)} | ${pc(d.partidas)} | ${pc(d.exactas)}`);
}
const t = Object.values(porAnio).reduce((a, d) => ({ n: a.n + d.n, s: a.s + d.sinPerdida, p: a.p + d.partidas, e: a.e + d.exactas }), { n: 0, s: 0, p: 0, e: 0 });
console.log(`TOTAL ${t.n} | idénticas ${t.s} | partidas ${t.p} | exactas ${t.e}`);
console.log(`Casos dudosos (partidas con avisos): ${dudosos.length}`);
const tipos = {};
for (const d of dudosos) for (const x of d.dudas) { const k = x.replace(/\d+/g, "N").replace(/[A-D]/g, "X"); tipos[k] = (tipos[k] || 0) + 1; }
console.log("Tipos de aviso:", JSON.stringify(tipos));
for (const d of dudosos.slice(0, Number(process.env.MUESTRA || 8))) console.log(`  ${d.anio}/${d.numero}: ${d.dudas.join("; ")}`);
