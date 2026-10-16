// Genera los iconos de la web (propuesta C: «m» oscura sobre dorado, en la
// Instrument Serif del logo). Sin dependencias nuevas: rasteriza con Playwright y
// monta el ICO con un Buffer.
//
// Necesita un `npm run build` previo: la fuente se toma de .next/static/media
// (next/font la descarga ahí al compilar).
//
// Uso: node scripts/generar-iconos.mjs
// Salida: app/favicon.ico (16, 32, 48), public/icons/apple-touch-icon.png (180,
// opaco), icon-192.png, icon-512.png e icon-maskable-512.png.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const ORO = "#E3B95C"; // --brand
const TINTA = "#17130A"; // --on-brand

// Busca en el CSS compilado la Instrument Serif normal, subconjunto latino básico.
function fuenteLogo() {
  const dirCss = path.join(RAIZ, ".next/static/css");
  for (const f of fs.readdirSync(dirCss)) {
    const css = fs.readFileSync(path.join(dirCss, f), "utf8");
    for (const m of css.matchAll(/@font-face\{([^}]*)\}/g)) {
      const b = m[1];
      if (b.includes("Instrument_Serif") && b.includes("font-style:normal") && b.includes("u+00??")) {
        const url = b.match(/url\(\/_next\/static\/media\/([^)]+)\)/)[1];
        return fs.readFileSync(path.join(RAIZ, ".next/static/media", url)).toString("base64");
      }
    }
  }
  throw new Error("No encuentro la Instrument Serif en .next: ejecuta antes npm run build");
}

// viewBox 100. rx = radio de esquina (0 = cuadrado opaco). escala < 1 deja margen
// para la zona segura de los iconos maskable (círculo central del 80 %).
const svg = (lado, rx, escala = 1) => `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="${rx}" fill="${ORO}"/>
  <g transform="translate(50 50) scale(${escala}) translate(-50 -50)">
    <text x="50" y="72" text-anchor="middle" font-family="IS" font-size="90" fill="${TINTA}">m</text>
  </g></svg>`;

const salidas = [
  { lado: 16, rx: 18, ico: true },
  { lado: 32, rx: 18, ico: true },
  { lado: 48, rx: 18, ico: true },
  { lado: 180, rx: 0, archivo: "public/icons/apple-touch-icon.png" }, // iOS redondea solo
  { lado: 192, rx: 22, archivo: "public/icons/icon-192.png" },
  { lado: 512, rx: 22, archivo: "public/icons/icon-512.png" },
  { lado: 512, rx: 0, escala: 0.72, archivo: "public/icons/icon-maskable-512.png" },
];

const css = `@font-face{font-family:IS;src:url(data:font/woff2;base64,${fuenteLogo()})}html,body{margin:0;background:transparent}`;
const navegador = await chromium.launch();
const pagina = await navegador.newPage();
const pngsIco = [];
for (const s of salidas) {
  await pagina.setViewportSize({ width: s.lado, height: s.lado });
  await pagina.setContent(`<style>${css}</style>${svg(s.lado, s.rx, s.escala)}`);
  await pagina.evaluate(() => document.fonts.ready);
  const png = await pagina.screenshot({ omitBackground: s.rx > 0 });
  if (s.ico) pngsIco.push({ lado: s.lado, png });
  else fs.writeFileSync(path.join(RAIZ, s.archivo), png);
}
await navegador.close();

// ICO con PNG embebidos: cabecera de 6 bytes + 16 bytes por imagen + los PNG.
const cabecera = Buffer.alloc(6 + 16 * pngsIco.length);
cabecera.writeUInt16LE(0, 0);
cabecera.writeUInt16LE(1, 2); // tipo icono
cabecera.writeUInt16LE(pngsIco.length, 4);
let desplazamiento = cabecera.length;
pngsIco.forEach(({ lado, png }, i) => {
  const o = 6 + 16 * i;
  cabecera.writeUInt8(lado, o);
  cabecera.writeUInt8(lado, o + 1);
  cabecera.writeUInt16LE(1, o + 4); // planos
  cabecera.writeUInt16LE(32, o + 6); // bits por píxel
  cabecera.writeUInt32LE(png.length, o + 8);
  cabecera.writeUInt32LE(desplazamiento, o + 12);
  desplazamiento += png.length;
});
fs.writeFileSync(path.join(RAIZ, "app/favicon.ico"), Buffer.concat([cabecera, ...pngsIco.map((p) => p.png)]));
console.log("Iconos generados:", salidas.map((s) => s.archivo || `favicon ${s.lado}`).join(", "));
