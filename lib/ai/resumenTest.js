import { generarConGroq } from "./groq";

const SYSTEM_PROMPT = `Eres un asistente educativo para un opositor al examen MIR.
Recibes las especialidades fuertes y débiles ya calculadas (no las calcules
tú, ya vienen dadas), junto con estadísticas del test. Genera un análisis
narrativo en español para mostrar en móvil, siguiendo estas reglas:

1. Si hay especialidades fuertes (≥80% de aciertos), menciónalas siempre
   explícitamente por su nombre como fortalezas del usuario. No las omitas.
2. Si hay especialidades débiles, indícalas con tono constructivo: usa
   expresiones como "área de mejora", "te recomendamos reforzar" o "dedica
   más tiempo a...". No uses nunca palabras como "preocupante", "urgente"
   o "necesidad urgente".
3. Si NO hay ninguna especialidad débil, no inventes ni busques puntos
   flacos: el mensaje debe ser enteramente positivo y de refuerzo.
4. Si hay señal de posible desactualización, menciónala con el mismo tono
   constructivo (p.ej. "conviene repasar las guías más recientes").
5. Máximo 4-5 frases cortas en total.
6. Formato: separa cada frase o idea en su propia línea, con un salto de
   línea "\\n" entre frases. No devuelvas el texto como un único bloque
   continuo pegado.
7. No repitas los porcentajes de forma mecánica en cada frase; intégralos
   de forma natural solo donde aporten.`;

function construirPromptUsuario({
  totalPreguntas,
  aciertos,
  fallos,
  fuertes,
  debiles,
  posibleDesactualizacion,
}) {
  const lineasFuertes = fuertes.length
    ? fuertes.map((f) => `- ${f.especialidad}: ${f.porcentaje}% de aciertos`).join("\n")
    : "- (ninguna especialidad alcanza el umbral de dominio en este test)";
  const lineasDebiles = debiles.length
    ? debiles.map((d) => `- ${d.especialidad}: ${d.porcentaje}% de aciertos`).join("\n")
    : "- (ninguna: no busques ni inventes debilidades, el mensaje debe ser totalmente positivo)";

  return `Estadísticas del test:
- Total de preguntas: ${totalPreguntas}
- Aciertos: ${aciertos}
- Fallos: ${fallos}

Especialidades fuertes:
${lineasFuertes}

Especialidades débiles:
${lineasDebiles}

Señal de posible desactualización (más fallos en preguntas de exámenes
recientes que en antiguos, dentro de esta misma sesión): ${
    posibleDesactualizacion ? "sí" : "no"
  }`;
}

// Una única llamada de IA por test, solo Groq (sin fallback a Gemini). Si
// falla por cualquier motivo, la pantalla de resultados debe seguir
// funcionando solo con los datos calculados por código, así que aquí nunca
// se relanza el error: se devuelve texto null.
export async function generarAnalisisNarrativo(datos) {
  const userPrompt = construirPromptUsuario(datos);

  try {
    const texto = await generarConGroq({ systemPrompt: SYSTEM_PROMPT, userPrompt });
    return { texto, proveedor: "groq" };
  } catch (errGroq) {
    console.error("resumen-test: fallo Groq, sin análisis narrativo:", errGroq.message);
    return { texto: null, proveedor: null };
  }
}
