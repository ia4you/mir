import { getConvocatorias, slugConvocatoria } from "../lib/convocatorias";
import { getEspecialidadesConConteo, formatearMiles } from "../lib/especialidades";
import { query } from "@/lib/db";

// Se genera en cada petición (el build de Dokploy no tiene acceso a mir-db). Todas las cifras salen de la BD.
export const dynamic = "force-dynamic";

const BASE = "https://mir.turel.es";
// Nombre completo de las especialidades que en la BD llevan sigla.
const NOMBRE_LARGO = { MFyC: "Medicina Familiar y Comunitaria", ORL: "Otorrinolaringología" };

export async function GET() {
  const [convocatorias, especialidades, imagenes] = await Promise.all([
    getConvocatorias(),
    getEspecialidadesConConteo(),
    query(
      `SELECT COUNT(*)::int AS n FROM preguntas WHERE origen = 'oficial' AND anulada = false AND imagen_path IS NOT NULL`
    ).then((r) => r.rows[0].n),
  ]);
  const porAnio = [...convocatorias].sort((a, b) => a.anio - b.anio);
  const N = formatearMiles(porAnio.reduce((s, c) => s + c.publicas, 0));
  const A = porAnio.reduce((s, c) => s + c.anuladas.length, 0);
  const C = porAnio.length;
  const anioMin = porAnio[0].anio;
  const anioMax = porAnio[C - 1].anio;
  const E = especialidades.length;
  const nombres = especialidades
    .map((e) => NOMBRE_LARGO[e.nombre] || e.nombre)
    .sort((a, b) => a.localeCompare(b, "es"));

  const texto = `# MIR Turel

> Banco de preguntas oficiales del examen MIR (Médico Interno Residente, España) con respuesta de la plantilla del Ministerio de Sanidad, explicaciones, simulacros y repaso espaciado. ${N} preguntas publicadas de las ${C} convocatorias ${anioMin}-${anioMax}, clasificadas en ${E} especialidades. Sin preguntas generadas por IA en el banco.

## Qué incluye y qué no
- Incluye: las preguntas de los cuadernillos oficiales publicadas con respuesta (${N}), con su explicación, especialidad y tema; ${formatearMiles(imagenes)} llevan imagen.
- No incluye: las ${A} preguntas anuladas por el Ministerio (no se publican individualmente; cada convocatoria cita sus números), ni convocatorias anteriores a ${anioMin}, ni preguntas generadas por IA.
- Las explicaciones se redactan con apoyo de IA y con distintos niveles de revisión; la respuesta correcta es siempre la de la plantilla oficial.
- Idioma: español. Gratuito para practicar con límite diario; plan Premium sin límite.

## Convocatorias (publicadas por examen)
${porAnio
  .map(
    (c) =>
      `- [MIR ${c.anio}](${BASE}/convocatorias/${slugConvocatoria(c.anio)}): ${formatearMiles(c.publicas)} preguntas publicadas (${c.anuladas.length} anuladas no publicadas)`
  )
  .join("\n")}
- [Todas las convocatorias](${BASE}/convocatorias): índice con el cuadernillo desglosado de cada año.

## Navegación principal
- [Inicio](${BASE}/): presentación del banco y acceso gratuito.
- [Especialidades](${BASE}/especialidades): las ${E} especialidades con su nº de preguntas (ejemplo: [Cardiología](${BASE}/especialidades/cardiologia)).
- [Temas](${BASE}/temas): temas del temario MIR por especialidad (ejemplo: [Valvulopatías](${BASE}/temas/valvulopatias)).
- [Controversias](${BASE}/controversias): preguntas cuya respuesta oficial está cuestionada y documentada.
- [Vídeos](${BASE}/videos): clases cortas en vídeo por especialidad y tema.
- [Demo](${BASE}/demo): prueba sin registro.
- [Blog](${BASE}/blog): artículos sobre preparación del MIR.
- [Premium](${BASE}/premium) · [Registro](${BASE}/registro) · [Contacto](${BASE}/contacto)
- [Aviso legal](${BASE}/aviso-legal) · [Privacidad](${BASE}/privacidad) · [Cookies](${BASE}/cookies)

## Especialidades
${nombres.join(", ")}.

## Sitemap
- [sitemap.xml](${BASE}/sitemap.xml)
`;
  return new Response(texto, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
