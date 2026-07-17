const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const TIMEOUT_MS = 15000;

export async function generarConGemini({ systemPrompt, userPrompt }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY no configurada");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res;
  try {
    res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 300 },
        }),
      }
    );
  } catch (err) {
    throw new Error(
      err.name === "AbortError"
        ? "Timeout llamando a Gemini"
        : `Error de red llamando a Gemini: ${err.message}`
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Gemini respondió ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!texto) {
    throw new Error("Gemini no devolvió texto en la respuesta");
  }
  return texto;
}
