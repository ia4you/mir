import { generarConGroq } from "./groq";

const SYSTEM_PROMPT = `Eres un asistente educativo para un opositor al examen MIR.
Recibes las etiquetas de temas fuertes y débiles ya calculadas, junto con
estadísticas del test. Genera un análisis narrativo breve (3-5 frases),
en español, con tono motivador pero honesto, mencionando:
- En qué temas domina el usuario
- En qué temas falla más
- Si hay indicios de que el fallo se concentra en contenido reciente
  (posible desactualización) o en contenido antiguo (posible olvido)

No repitas números exactos de forma mecánica, integra el dato en una frase natural.`;

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
    : "- (ninguna especialidad cae por debajo del umbral de debilidad en este test)";

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
