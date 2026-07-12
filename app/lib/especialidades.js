import { query } from "../../lib/db";

// Casos donde la transliteración automática del nombre no da una URL clara
// para SEO (siglas, abreviaturas); el resto se genera con slugify().
const SLUG_OVERRIDES = {
  MFyC: "medicina-familiar",
  ORL: "otorrinolaringologia",
};

export function slugify(nombre) {
  if (SLUG_OVERRIDES[nombre]) return SLUG_OVERRIDES[nombre];
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const DESCRIPCIONES = {
  Cardiología:
    "La cardiología es una de las especialidades con mayor peso en el examen MIR, con preguntas centradas en cardiopatía isquémica, arritmias, insuficiencia cardiaca y valvulopatías. Es habitual que combine electrocardiogramas con casos clínicos que exigen dominar los algoritmos diagnósticos y terapéuticos actuales.",
  Neurología:
    "La neurología aporta un bloque extenso de preguntas sobre ictus, epilepsia, enfermedades neurodegenerativas y neuropatías periféricas. Muchas preguntas se apoyan en la correlación clínico-anatómica, por lo que exige un razonamiento topográfico preciso.",
  Respiratorio:
    "Neumología cubre desde el asma y la EPOC hasta el tromboembolismo pulmonar y las neoplasias pulmonares. El MIR suele plantear casos clínicos que combinan pruebas funcionales respiratorias con decisiones terapéuticas basadas en guías actuales.",
  Urgencias:
    "El bloque de Urgencias reúne situaciones de manejo inicial y estabilización del paciente crítico, desde el shock hasta las intoxicaciones agudas. Prioriza el razonamiento rápido y la aplicación de protocolos estandarizados.",
  Oncología:
    "Oncología médica evalúa el conocimiento sobre los tumores más prevalentes, sus tratamientos sistémicos y las urgencias oncológicas. El MIR incide especialmente en el enfoque multidisciplinar y en las indicaciones de quimioterapia, inmunoterapia y terapias dirigidas.",
  Endocrinología:
    "Endocrinología y Nutrición se centra en diabetes mellitus, patología tiroidea y trastornos del eje hipotálamo-hipofisario. Es frecuente encontrar casos clínicos que requieren interpretar analíticas hormonales complejas.",
  Digestivo:
    "Aparato Digestivo abarca desde la enfermedad inflamatoria intestinal hasta la patología hepatobiliar y pancreática. El MIR combina preguntas de fisiopatología con el manejo endoscópico y farmacológico actual.",
  Infecciosas:
    "Enfermedades Infecciosas incluye microbiología clínica, VIH, tuberculosis y el uso racional de antimicrobianos. Es una especialidad transversal que conecta con casi todas las demás áreas del examen.",
  Nefrología:
    "Nefrología se centra en la enfermedad renal crónica, los trastornos hidroelectrolíticos y el manejo del paciente en diálisis. Requiere un dominio sólido del equilibrio ácido-base y la interpretación analítica.",
  Ginecología:
    "Ginecología y Obstetricia cubre el seguimiento del embarazo, la patología ginecológica benigna y maligna, y la anticoncepción. El MIR suele plantear casos clínicos evolutivos que exigen conocer los protocolos obstétricos vigentes.",
  Hematología:
    "Hematología abarca anemias, leucemias, linfomas y trastornos de la coagulación. Las preguntas combinan con frecuencia hallazgos de laboratorio y frotis de sangre periférica con el diagnóstico diferencial.",
  Reumatología:
    "Reumatología se centra en artritis, conectivopatías y vasculitis, con especial atención a los criterios diagnósticos y al perfil de autoanticuerpos de cada enfermedad. Es una especialidad muy protocolizada en el examen.",
  Psiquiatría:
    "Psiquiatría evalúa los trastornos del estado de ánimo, psicóticos y de ansiedad, junto con el manejo psicofarmacológico. El MIR incide en el reconocimiento de síntomas y en la elección del tratamiento de primera línea.",
  Traumatología:
    "Traumatología y Cirugía Ortopédica cubre fracturas, patología de columna y lesiones articulares frecuentes. Las preguntas suelen apoyarse en pruebas de imagen y en el razonamiento biomecánico.",
  Cirugía:
    "Cirugía General incluye patología de la pared abdominal, vía biliar y el manejo del abdomen agudo. El MIR pone el foco en la indicación quirúrgica y en el diagnóstico diferencial urgente.",
  Pediatría:
    "Pediatría abarca el desarrollo infantil, las infecciones propias de la infancia y la patología neonatal. Muchas preguntas exigen adaptar el razonamiento clínico general a las particularidades del paciente pediátrico.",
  ORL: "Otorrinolaringología cubre la patología del oído, la nariz y la vía aérea superior, con especial peso de la hipoacusia y el vértigo. El MIR suele plantear casos clínicos breves centrados en el diagnóstico diferencial.",
  Oftalmología:
    "Oftalmología se centra en la pérdida de visión aguda y crónica, el glaucoma y la patología retiniana. Las preguntas requieren relacionar los signos exploratorios con el diagnóstico topográfico del globo ocular.",
  MFyC:
    "Medicina Familiar y Comunitaria integra el abordaje del paciente crónico, la prevención y la atención continuada. En el MIR conecta contenidos de múltiples especialidades desde una perspectiva de atención primaria.",
  Dermatología:
    "Dermatología cubre las lesiones cutáneas más prevalentes, desde el melanoma hasta las dermatosis inflamatorias. El reconocimiento de patrones visuales es clave para resolver sus preguntas.",
  Miscelánea:
    "Miscelánea agrupa preguntas de bioestadística, epidemiología, salud pública, ética médica y otras áreas transversales del MIR. Es el bloque más heterogéneo del examen y exige una preparación específica más allá de las especialidades clínicas clásicas.",
};

export async function getEspecialidadesConConteo() {
  const { rows } = await query(
    `SELECT especialidad, COUNT(*)::int AS total,
            MIN(año)::int AS anio_min, MAX(año)::int AS anio_max
     FROM preguntas
     GROUP BY especialidad
     ORDER BY total DESC`
  );
  return rows.map((r) => ({
    nombre: r.especialidad,
    slug: slugify(r.especialidad),
    total: r.total,
    anioMin: r.anio_min,
    anioMax: r.anio_max,
    descripcion: DESCRIPCIONES[r.especialidad] || "",
  }));
}

export async function getEspecialidadPorSlug(slug) {
  const especialidades = await getEspecialidadesConConteo();
  return especialidades.find((e) => e.slug === slug) || null;
}

export async function getPreguntasMuestra(nombreEspecialidad, limite = 3) {
  const { rows } = await query(
    `SELECT id, pregunta, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e
     FROM preguntas
     WHERE especialidad = $1
       AND pregunta !~* '\\y(imagen|imágen|figura|radiografía)\\y'
     ORDER BY id
     LIMIT $2`,
    [nombreEspecialidad, limite]
  );
  return rows;
}
