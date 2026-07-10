// clasificar_especialidades.mjs
// -------------------------------
// Recorre la tabla `preguntas`, y para cada una busca en el enunciado +
// opciones términos clínicos característicos de cada una de las 20
// especialidades del proyecto. Asigna la especialidad con más términos
// distintos encontrados; si no hay ninguna coincidencia, o si hay empate
// entre dos o más especialidades, deja "Sin clasificar" en vez de forzar
// una asignación dudosa.
//
// Uso:
//   node --env-file=.env.local scripts/clasificar_especialidades.mjs
//   node --env-file=.env.local scripts/clasificar_especialidades.mjs --dry-run

import { Client } from "pg";

const DRY_RUN = process.argv.includes("--dry-run");

// Términos ya sin tildes (se comparan contra el texto normalizado). Se
// priorizan términos multi-palabra o poco ambiguos para reducir falsos
// positivos entre especialidades con clínica solapada (p.ej. "hernia
// discal" en Traumatología vs "hernia inguinal" en Cirugía).
const ESPECIALIDADES = {
  "Neurología": [
    "ictus", "accidente cerebrovascular", "hemorragia subaracnoidea",
    "hemorragia intracerebral", "epilepsia", "crisis comicial", "status epileptico",
    "convulsion", "migrana", "parkinson", "esclerosis multiple",
    "esclerosis lateral amiotrofica", "miastenia gravis", "guillain-barre",
    "guillain barre", "polineuropatia", "demencia", "alzheimer", "ataxia",
    "temblor esencial", "hidrocefalia", "glioma", "meningioma", "hemiparesia",
    "afasia", "disartria", "vertigo central", "neuralgia del trigemino",
    "resonancia magnetica cerebral", "tomografia craneal", "tac craneal",
    "rm craneal", "neuropatia periferica", "paraparesia", "tetraparesia",
    "nistagmo", "diplopia", "sindrome piramidal", "corea de huntington",
    "traumatismo craneoencefalico", "pseudotumor cerebri", "hipertension intracraneal",
  ],
  "Cardiología": [
    "infarto de miocardio", "iamest", "iamsest", "sindrome coronario agudo",
    "angina de pecho", "fibrilacion auricular", "flutter auricular", "arritmia",
    "electrocardiograma", "insuficiencia cardiaca", "soplo cardiaco", "valvulopatia",
    "estenosis aortica", "insuficiencia mitral", "insuficiencia aortica",
    "estenosis mitral", "marcapasos", "desfibrilador", " dai ", "ecocardiograma",
    "coronariografia", "cateterismo cardiaco", "pericarditis", "miocardiopatia",
    "taquicardia", "bradicardia", "bloqueo av", "fraccion de eyeccion", "troponina",
    "dolor toracico",
    "angioplastia", "stent coronario", "resincronizacion cardiaca",
    "endocarditis infecciosa", "soplo sistolico", "soplo diastolico",
    "revascularizacion coronaria", "antiagregacion",
  ],
  "Digestivo": [
    "cirrosis hepatica", "hepatitis", "pancreatitis", "enfermedad inflamatoria intestinal",
    "colitis ulcerosa", "enfermedad de crohn", "dispepsia", "reflujo gastroesofagico",
    "ulcera peptica", "hemorragia digestiva", "varices esofagicas",
    "sindrome de intestino irritable", "enfermedad celiaca", "colangitis",
    "colecistitis", "litiasis biliar", "encefalopatia hepatica", "ascitis",
    "endoscopia digestiva", "colonoscopia", "gastroscopia", "esofago de barrett",
    "higado graso", "esteatosis hepatica", "sindrome hepatorrenal",
    "hepatocarcinoma", "asterixis",
  ],
  "Respiratorio": [
    "asma bronquial", "epoc", "neumonia", "disnea de esfuerzo", "derrame pleural",
    "neumotorax", "tromboembolismo pulmonar", "embolia pulmonar", "fibrosis pulmonar",
    "bronquiectasias", "apnea del sueno", "insuficiencia respiratoria",
    "gasometria arterial", "espirometria", "oxigenoterapia", "hemoptisis",
    "dificultad respiratoria",
    "nodulo pulmonar", "bronquitis cronica", "ventilacion mecanica",
    "hipertension pulmonar", "saturacion de oxigeno",
  ],
  "Endocrinología": [
    "diabetes mellitus", "hipoglucemia", "hiperglucemia", "hemoglobina glucosilada",
    "hipotiroidismo", "hipertiroidismo", "nodulo tiroideo", "bocio",
    "sindrome de cushing", "enfermedad de addison", "feocromocitoma", "acromegalia",
    "osteoporosis", "hipercalcemia", "hipocalcemia", "hiperparatiroidismo",
    "sindrome metabolico", "cetoacidosis diabetica", "tiroiditis", "prolactinoma",
    "panhipopituitarismo", "diabetes insipida", "insulinoterapia",
  ],
  "Nefrología": [
    "insuficiencia renal cronica", "enfermedad renal cronica", "fracaso renal agudo",
    "dialisis", "hemodialisis", "glomerulonefritis", "sindrome nefrotico",
    "sindrome nefritico", "litiasis renal", "colico renal", "trasplante renal",
    "filtrado glomerular", "proteinuria", "hematuria", "hiponatremia",
    "hiperpotasemia", "acidosis metabolica", "rinon poliquistico",
    "nefropatia diabetica", "dialisis peritoneal",
  ],
  "Reumatología": [
    "artritis reumatoide", "lupus eritematoso sistemico", "espondiloartritis",
    "espondilitis anquilosante", "artrosis", "gota", "fibromialgia", "vasculitis",
    "arteritis de celulas gigantes", "polimialgia reumatica", "esclerodermia",
    "sindrome de sjogren", "artritis psoriasica", "factor reumatoide",
    "anticuerpos antinucleares", "sindrome antifosfolipido", "poliarteritis nodosa",
    "granulomatosis con poliangeitis",
  ],
  "Hematología": [
    "anemia ferropenica", "leucemia", "linfoma", "mieloma multiple",
    "trombocitopenia", "purpura trombocitopenica", "hemofilia",
    "trombosis venosa profunda", "sindrome mielodisplasico", "policitemia vera",
    "aplasia medular", "esplenomegalia", "hemograma", "frotis de sangre periferica",
    "deficit de vitamina b12", "anemia hemolitica",
    "coagulacion intravascular diseminada", "anemia megaloblastica",
    "linfoma de hodgkin", "leucemia mieloide", "leucemia linfoide",
  ],
  "Oncología": [
    "tumor maligno", "metastasis", "quimioterapia", "radioterapia",
    "estadiaje tnm", "marcador tumoral", "adenocarcinoma", "sarcoma",
    "tumor primario", "biopsia tumoral", "inmunoterapia", "antineoplasico",
    "quimioterapia adyuvante", "oncologico",
  ],
  "Infecciosas": [
    "virus de inmunodeficiencia humana", "sindrome de inmunodeficiencia adquirida",
    "tuberculosis", "sepsis", "shock septico", "bacteriemia",
    "endocarditis infecciosa", "meningitis bacteriana", "antibioterapia",
    "fiebre de origen desconocido", "malaria", "dengue", "profilaxis postexposicion",
    "infeccion urinaria", "pielonefritis", "osteomielitis", "celulitis infecciosa",
    "hepatitis viral", "covid-19", "covid", "brote epidemico", "tratamiento antirretroviral",
    "infeccion por vih", "microorganismo", "hemocultivo",
  ],
  "Psiquiatría": [
    "trastorno depresivo", "trastorno bipolar", "esquizofrenia",
    "trastorno de ansiedad", "trastorno obsesivo-compulsivo",
    "trastorno de la personalidad", "anorexia nerviosa", "bulimia nerviosa",
    "ideacion suicida", "psicosis", "trastorno delirante", "antipsicotico",
    "antidepresivo", "terapia electroconvulsiva",
    "trastorno por deficit de atencion", "insomnio cronico", "ansiolitico",
    "trastorno de panico", "episodio maniaco", "sindrome de abstinencia",
    "mecanismos de defensa",
  ],
  "Ginecología": [
    "gestante", "preeclampsia", "eclampsia", "cesarea", "aborto espontaneo",
    "endometriosis", "miomas uterinos", "cancer de cervix", "cancer de endometrio",
    "cancer de ovario", "menopausia", "anticoncepcion", "ecografia obstetrica",
    "amenorrea", "dismenorrea", "virus del papiloma humano", "citologia cervical",
    "lactancia materna", "puerperio", "parto pretermino", "embarazo ectopico",
    "placenta previa", "climaterio", "trabajo de parto", "primigesta",
    "obstetricia y ginecologia",
  ],
  "Pediatría": [
    "recien nacido", "recien nacida", "lactante", "neonato", "meses de vida",
    "calendario vacunal", "bronquiolitis",
    "enfermedad de kawasaki", "displasia de cadera", "percentil de crecimiento",
    "desarrollo psicomotor", "criptorquidia", "invaginacion intestinal",
    "estenosis pilorica", "ictericia neonatal", "sindrome de down",
    "fiebre en el lactante", "vacuna infantil", "talla baja",
  ],
  "Cirugía": [
    "apendicitis aguda", "hernia inguinal", "hernia umbilical", "colecistectomia",
    "obstruccion intestinal", "abdomen agudo", "laparotomia", "laparoscopia",
    "eventracion", "isquemia mesenterica", "cirugia bariatrica",
    "hernia de spiegel", "perforacion intestinal", "volvulo",
  ],
  "Traumatología": [
    "fractura de cadera", "fractura de femur", "luxacion", "esguince de tobillo",
    "artroscopia", "protesis de cadera", "protesis de rodilla", "hernia discal",
    "lumbalgia", "dolor lumbar", "ciatica", "escoliosis", "meniscopatia", "tendinitis",
    "sindrome del tunel carpiano", "radiografia de rodilla", "radiografia de cadera",
    "radiografia de hombro", "fractura pertrocanterea", "fractura subcapital",
    "osteosarcoma", "osteocondritis disecante", "fractura mandibular",
  ],
  "Oftalmología": [
    "glaucoma", "cataratas", "desprendimiento de retina", "uveitis",
    "conjuntivitis", "degeneracion macular", "retinopatia diabetica",
    "agudeza visual", "fondo de ojo", "presion intraocular", "queratitis",
    "estrabismo",
  ],
  "ORL": [
    "hipoacusia", "otitis media", "vertigo periferico", "amigdalitis",
    "faringitis", "laringitis", "sinusitis", "epistaxis", "disfonia",
    "cancer de laringe", "acufenos", "rinitis alergica", "sindrome de meniere",
    "otorrinolaringologia", "videofibroscopia", "senos paranasales",
  ],
  "Dermatología": [
    "carcinoma basocelular", "carcinoma escamoso", "psoriasis", "eccema",
    "dermatitis atopica", "acne", "urticaria", "alopecia", "vitiligo", "nevus",
    "biopsia cutanea", "prurito generalizado", "melanoma", "lesion cutanea",
    "hemangioma infantil", "dermatologia",
  ],
  "Urgencias": [
    "parada cardiorrespiratoria", "politraumatizado", "intoxicacion aguda",
    "sobredosis", "reanimacion cardiopulmonar", "anafilaxia", "quemadura",
    "shock hipovolemico", "triaje",
  ],
  "MFyC": [
    "medico de atencion primaria", "medicina familiar y comunitaria",
    "consulta de atencion primaria", "cribado poblacional",
    "prevencion cuaternaria", "promocion de la salud",
    "seguimiento en atencion primaria", "vacunacion del adulto",
    "factores de riesgo cardiovascular",
  ],
};

// Rango de marcas diacríticas combinantes (U+0300 - U+036F) construido con
// String.fromCharCode en vez de escribir el carácter literal en el código
// fuente, para evitar ambigüedad de codificación.
const RANGO_DIACRITICOS = new RegExp(
  "[" + String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f) + "]",
  "g"
);

function normalizar(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(RANGO_DIACRITICOS, "");
}

function clasificar(textoNormalizado) {
  let mejorScore = 0;
  let mejores = [];
  for (const [especialidad, terminos] of Object.entries(ESPECIALIDADES)) {
    let score = 0;
    for (const termino of terminos) {
      if (textoNormalizado.includes(termino)) score++;
    }
    if (score > mejorScore) {
      mejorScore = score;
      mejores = [especialidad];
    } else if (score === mejorScore && score > 0) {
      mejores.push(especialidad);
    }
  }
  if (mejorScore === 0 || mejores.length > 1) return "Sin clasificar";
  return mejores[0];
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows } = await client.query(
    `SELECT id, pregunta, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e FROM preguntas`
  );

  const ids = [];
  const asignadas = [];
  const conteoPrevio = {};

  for (const row of rows) {
    const textoCompleto = [
      row.pregunta,
      row.opcion_a,
      row.opcion_b,
      row.opcion_c,
      row.opcion_d,
      row.opcion_e,
    ]
      .filter(Boolean)
      .join(" ");
    const especialidad = clasificar(normalizar(textoCompleto));
    ids.push(row.id);
    asignadas.push(especialidad);
    conteoPrevio[especialidad] = (conteoPrevio[especialidad] || 0) + 1;
  }

  console.log(`Preguntas procesadas: ${rows.length}`);
  console.log("Distribución calculada (antes de escribir en la BD):");
  for (const [esp, n] of Object.entries(conteoPrevio).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${esp}: ${n}`);
  }

  if (DRY_RUN) {
    console.log("\n--dry-run: no se ha escrito nada en la base de datos.");
    await client.end();
    return;
  }

  await client.query(
    `UPDATE preguntas AS p
     SET especialidad = c.especialidad
     FROM (SELECT * FROM UNNEST($1::int[], $2::text[]) AS t(id, especialidad)) AS c
     WHERE p.id = c.id`,
    [ids, asignadas]
  );

  console.log("\nUPDATE aplicado.");

  const final = await client.query(
    `SELECT especialidad, COUNT(*)::int AS total
     FROM preguntas
     GROUP BY especialidad
     ORDER BY total DESC`
  );
  console.log("\nDistribución final en la base de datos:");
  for (const r of final.rows) {
    console.log(`  ${r.especialidad}: ${r.total}`);
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
