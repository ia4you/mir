// Arranque de una sesión de práctica, compartido por /configuracion e /inicio.

export const LIMITE_DIARIO_FREE = 15;
// Ritmo de referencia para estimar la duración de una sesión sin temporizador.
export const SEGUNDOS_POR_PREGUNTA = 77;

// Pide las preguntas (una petición por lote: { especialidad?, anio?, cantidad }),
// crea la sesión y deja el test en sessionStorage para /test/[id].
// Devuelve { id } o { error: "sin_preguntas" | "limite_diario" }; lanza si
// falla la red o la API.
export async function iniciarPractica(lotes, { especialidad = null, segundosPorPregunta = null } = {}) {
  const respuestas = await Promise.all(
    lotes.map((lote) => {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(lote)) if (v) params.set(k, String(v));
      return fetch(`/api/preguntas?${params.toString()}`).then((r) => {
        if (!r.ok) throw new Error("No se pudieron cargar las preguntas");
        return r.json();
      });
    })
  );
  const preguntas = respuestas.flat();
  if (preguntas.length === 0) return { error: "sin_preguntas" };

  const resSesion = await fetch("/api/sesiones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modo: "practica", especialidad, total_preguntas: preguntas.length }),
  });
  if (resSesion.status === 403) {
    const data = await resSesion.json().catch(() => null);
    if (data?.error === "limite_diario") return { error: "limite_diario" };
  }
  if (!resSesion.ok) throw new Error("No se pudo crear la sesión");
  const { id } = await resSesion.json();

  sessionStorage.setItem(
    `mir_test_${id}`,
    JSON.stringify({ preguntas, segundosPorPregunta, modoExamen: "practica" })
  );
  return { id };
}

// Preguntas que caben en una sesión hoy: la meta diaria, recortada en el plan
// gratuito a lo que queda del límite (0 = límite agotado).
export async function cantidadParaHoy(esPremium, meta) {
  if (esPremium) return meta;
  const r = await fetch("/api/estadisticas");
  if (!r.ok) throw new Error("No se pudo consultar el límite diario");
  const datos = await r.json();
  return Math.min(meta, Math.max(0, LIMITE_DIARIO_FREE - datos.meta_diaria.respondidas_hoy));
}

// Test con una lista exacta de preguntas (repaso de /errores y repaso
// espaciado): mismas preguntas en el mismo orden, sin temporizador.
// Devuelve { id } o { error: "sin_preguntas" | "limite_diario", message };
// lanza si falla la red o la API.
export async function iniciarConIds(ids, { modo, especialidad = null }) {
  const resPreguntas = await fetch(`/api/preguntas?ids=${ids.join(",")}`);
  if (!resPreguntas.ok) throw new Error("No se pudieron cargar las preguntas");
  const porId = new Map((await resPreguntas.json()).map((p) => [p.id, p]));
  const preguntas = ids.map((id) => porId.get(id)).filter(Boolean);
  if (preguntas.length === 0) return { error: "sin_preguntas" };

  const resSesion = await fetch("/api/sesiones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ modo, especialidad, total_preguntas: preguntas.length }),
  });
  if (resSesion.status === 403) {
    const data = await resSesion.json().catch(() => null);
    return { error: "limite_diario", message: data?.message };
  }
  if (!resSesion.ok) throw new Error("No se pudo crear la sesión");
  const { id } = await resSesion.json();

  sessionStorage.setItem(`mir_test_${id}`, JSON.stringify({ preguntas, segundosPorPregunta: null }));
  return { id };
}
