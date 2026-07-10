// clasificar_final.mjs
// -------------------------------
// Última pasada de clasificación automática. Aplica SOLO sobre las preguntas
// que siguen en "Sin clasificar" tras las dos rondas anteriores (contenido
// clínico + contexto transversal). Añade a las 20 especialidades: sinónimos
// y abreviaturas de términos ya usados, nombres de fármacos característicos,
// y nombres de pruebas diagnósticas específicas.
//
// Uso:
//   node --env-file=.env.local scripts/clasificar_final.mjs
//   node --env-file=.env.local scripts/clasificar_final.mjs --dry-run --list

import { Client } from "pg";

const DRY_RUN = process.argv.includes("--dry-run");
const LISTAR = process.argv.includes("--list");

const ESPECIALIDADES = {
  "Neurología": [
    "ictus", "accidente cerebrovascular", "acv", "hemorragia subaracnoidea", "hsa",
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
    "levetiracetam", "carbamazepina", "fenitoina", "acido valproico", "levodopa",
    "rivastigmina", "donepezilo", "sumatriptan", "riluzol", "natalizumab",
    "electroencefalograma", "eeg", "electromiograma", "emg", "puncion lumbar",
    "doppler transcraneal",
  ],
  "Cardiología": [
    "infarto de miocardio", "iam", "iamest", "iamsest", "sindrome coronario agudo",
    "sca", "angina de pecho", "fibrilacion auricular", "flutter auricular", "arritmia",
    "electrocardiograma", "ecg", "insuficiencia cardiaca", "soplo cardiaco", "valvulopatia",
    "estenosis aortica", "insuficiencia mitral", "insuficiencia aortica",
    "estenosis mitral", "marcapasos", "desfibrilador", " dai ", "ecocardiograma",
    "coronariografia", "cateterismo cardiaco", "pericarditis", "miocardiopatia",
    "taquicardia", "bradicardia", "bloqueo av", "fraccion de eyeccion", "troponina",
    "angioplastia", "stent coronario", "resincronizacion cardiaca",
    "endocarditis infecciosa", "soplo sistolico", "soplo diastolico",
    "revascularizacion coronaria", "antiagregacion", "dolor toracico",
    "digoxina", "amiodarona", "clopidogrel", "ticagrelor", "espironolactona",
    "sacubitrilo", "bisoprolol", "carvedilol", "ergometria", "prueba de esfuerzo",
    "holter", "resonancia cardiaca",
  ],
  "Digestivo": [
    "cirrosis hepatica", "hepatitis", "pancreatitis", "enfermedad inflamatoria intestinal",
    "eii", "colitis ulcerosa", "enfermedad de crohn", "dispepsia", "reflujo gastroesofagico",
    "ulcera peptica", "hemorragia digestiva", "varices esofagicas",
    "sindrome de intestino irritable", "enfermedad celiaca", "colangitis",
    "colecistitis", "litiasis biliar", "encefalopatia hepatica", "ascitis",
    "endoscopia digestiva", "colonoscopia", "gastroscopia", "esofago de barrett",
    "higado graso", "esteatosis hepatica", "sindrome hepatorrenal",
    "hepatocarcinoma", "asterixis", "omeprazol", "mesalazina", "infliximab",
    "azatioprina", "lactulosa", "rifaximina", "elastografia hepatica",
    "test del aliento",
  ],
  "Respiratorio": [
    "asma bronquial", "epoc", "neumonia", "disnea de esfuerzo", "derrame pleural",
    "neumotorax", "tromboembolismo pulmonar", "tep", "embolia pulmonar", "fibrosis pulmonar",
    "bronquiectasias", "apnea del sueno", "sahs", "insuficiencia respiratoria",
    "gasometria arterial", "espirometria", "oxigenoterapia", "hemoptisis",
    "dificultad respiratoria", "nodulo pulmonar", "bronquitis cronica",
    "ventilacion mecanica", "hipertension pulmonar", "saturacion de oxigeno",
    "salbutamol", "budesonida", "tiotropio", "formoterol", "montelukast",
    "polisomnografia", "broncoscopia",
  ],
  "Endocrinología": [
    "diabetes mellitus", "hipoglucemia", "hiperglucemia", "hemoglobina glucosilada",
    "hipotiroidismo", "hipertiroidismo", "nodulo tiroideo", "bocio",
    "sindrome de cushing", "enfermedad de addison", "feocromocitoma", "acromegalia",
    "osteoporosis", "hipercalcemia", "hipocalcemia", "hiperparatiroidismo",
    "sindrome metabolico", "cetoacidosis diabetica", "tiroiditis", "prolactinoma",
    "panhipopituitarismo", "diabetes insipida", "insulinoterapia",
    "levotiroxina", "insulina", "metformina", "sitagliptina", "empagliflozina",
    "liraglutide", "carbimazol", "metimazol", "gammagrafia tiroidea",
    "densitometria osea", "curva de glucemia",
  ],
  "Nefrología": [
    "insuficiencia renal cronica", "enfermedad renal cronica", "erc", "fracaso renal agudo",
    "dialisis", "hemodialisis", "glomerulonefritis", "sindrome nefrotico",
    "sindrome nefritico", "litiasis renal", "colico renal", "trasplante renal",
    "filtrado glomerular", "proteinuria", "hematuria", "hiponatremia",
    "hiperpotasemia", "acidosis metabolica", "rinon poliquistico",
    "nefropatia diabetica", "dialisis peritoneal", "eritropoyetina",
    "quelantes del fosforo", "biopsia renal", "eco doppler renal",
    "aclaramiento de creatinina",
  ],
  "Reumatología": [
    "artritis reumatoide", "lupus eritematoso sistemico", "espondiloartritis",
    "espondilitis anquilosante", "artrosis", "gota", "fibromialgia", "vasculitis",
    "arteritis de celulas gigantes", "polimialgia reumatica", "esclerodermia",
    "sindrome de sjogren", "artritis psoriasica", "factor reumatoide",
    "anticuerpos antinucleares", "sindrome antifosfolipido", "poliarteritis nodosa",
    "granulomatosis con poliangeitis", "metotrexato", "hidroxicloroquina",
    "adalimumab", "etanercept", "colchicina", "alopurinol", "anti-ccp",
    "ecografia articular", "capilaroscopia",
  ],
  "Hematología": [
    "anemia ferropenica", "leucemia", "linfoma", "mieloma multiple",
    "trombocitopenia", "purpura trombocitopenica", "hemofilia",
    "trombosis venosa profunda", "tvp", "sindrome mielodisplasico", "policitemia vera",
    "aplasia medular", "esplenomegalia", "hemograma", "frotis de sangre periferica",
    "deficit de vitamina b12", "anemia hemolitica",
    "coagulacion intravascular diseminada", "anemia megaloblastica",
    "linfoma de hodgkin", "leucemia mieloide", "leucemia linfoide",
    "heparina", "enoxaparina", "warfarina", "acido folico", "rituximab",
    "aspirado de medula osea", "biopsia de medula osea", "citometria de flujo",
    "electroforesis de proteinas",
  ],
  "Oncología": [
    "tumor maligno", "metastasis", "quimioterapia", "radioterapia",
    "estadiaje tnm", "marcador tumoral", "adenocarcinoma", "sarcoma",
    "tumor primario", "biopsia tumoral", "inmunoterapia", "antineoplasico",
    "quimioterapia adyuvante", "oncologico", "cisplatino", "paclitaxel",
    "trastuzumab", "pembrolizumab", "tamoxifeno", "pet-tc", "marcador ca 125",
    "marcador cea", "psa",
  ],
  "Infecciosas": [
    "virus de inmunodeficiencia humana", "sindrome de inmunodeficiencia adquirida",
    "tuberculosis", "sepsis", "shock septico", "bacteriemia",
    "endocarditis infecciosa", "meningitis bacteriana", "antibioterapia",
    "fiebre de origen desconocido", "malaria", "dengue", "profilaxis postexposicion",
    "infeccion urinaria", "pielonefritis", "osteomielitis", "celulitis infecciosa",
    "hepatitis viral", "covid-19", "covid", "brote epidemico", "tratamiento antirretroviral",
    "infeccion por vih", "microorganismo", "hemocultivo",
    "amoxicilina clavulanico", "ceftriaxona", "vancomicina", "meropenem",
    "aciclovir", "tenofovir", "isoniazida", "rifampicina", "serologia",
    "carga viral",
  ],
  "Psiquiatría": [
    "trastorno depresivo", "trastorno bipolar", "esquizofrenia",
    "trastorno de ansiedad", "trastorno obsesivo-compulsivo",
    "trastorno de la personalidad", "anorexia nerviosa", "bulimia nerviosa",
    "ideacion suicida", "psicosis", "trastorno delirante", "antipsicotico",
    "antidepresivo", "terapia electroconvulsiva",
    "trastorno por deficit de atencion", "insomnio cronico", "ansiolitico",
    "trastorno de panico", "episodio maniaco", "sindrome de abstinencia",
    "mecanismos de defensa", "haloperidol", "risperidona", "olanzapina",
    "quetiapina", "sertralina", "fluoxetina", "clozapina", "lorazepam",
    "escala de hamilton",
  ],
  "Ginecología": [
    "gestante", "preeclampsia", "eclampsia", "cesarea", "aborto espontaneo",
    "endometriosis", "miomas uterinos", "cancer de cervix", "cancer de endometrio",
    "cancer de ovario", "menopausia", "anticoncepcion", "ecografia obstetrica",
    "amenorrea", "dismenorrea", "virus del papiloma humano", "citologia cervical",
    "lactancia materna", "puerperio", "parto pretermino", "embarazo ectopico",
    "placenta previa", "climaterio", "trabajo de parto", "primigesta",
    "obstetricia y ginecologia", "misoprostol", "oxitocina", "sulfato de magnesio",
    "letrozol", "ecografia transvaginal", "amniocentesis", "monitorizacion fetal",
    "sobrecarga oral de glucosa",
  ],
  "Pediatría": [
    "recien nacido", "recien nacida", "lactante", "neonato", "meses de vida",
    "calendario vacunal", "bronquiolitis",
    "enfermedad de kawasaki", "displasia de cadera", "percentil de crecimiento",
    "desarrollo psicomotor", "criptorquidia", "invaginacion intestinal",
    "estenosis pilorica", "ictericia neonatal", "sindrome de down",
    "fiebre en el lactante", "vacuna infantil", "talla baja",
    "surfactante pulmonar", "vacuna hexavalente", "test del talon",
    "screening neonatal", "otoemisiones acusticas",
  ],
  "Cirugía": [
    "apendicitis aguda", "hernia inguinal", "hernia umbilical", "colecistectomia",
    "obstruccion intestinal", "abdomen agudo", "laparotomia", "laparoscopia",
    "eventracion", "isquemia mesenterica", "cirugia bariatrica",
    "hernia de spiegel", "perforacion intestinal", "volvulo",
    "indicacion quirurgica", "tratamiento quirurgico de eleccion", "se interviene",
    "se decide intervenir", "abordaje laparoscopico", "abordaje abierto",
    "via de abordaje", "postoperatorio", "posoperatorio", "cirugia electiva",
    "cirugia urgente", "cirugia programada", "intervencion quirurgica",
    "apendicectomia", "reseccion quirurgica", "tecnica quirurgica",
    "quirofano", "conversion a cirugia abierta", "profilaxis antibiotica quirurgica",
    "complicacion postquirurgica", "herida quirurgica", "hemicolectomia",
    "gastrectomia", "esplenectomia",
  ],
  "Traumatología": [
    "fractura de cadera", "fractura de femur", "luxacion", "esguince de tobillo",
    "artroscopia", "protesis de cadera", "protesis de rodilla", "hernia discal",
    "lumbalgia", "dolor lumbar", "ciatica", "escoliosis", "meniscopatia", "tendinitis",
    "sindrome del tunel carpiano", "radiografia de rodilla", "radiografia de cadera",
    "radiografia de hombro", "fractura pertrocanterea", "fractura subcapital",
    "osteosarcoma", "osteocondritis disecante", "fractura mandibular",
    "fractura de tibia", "fractura de humero", "fractura de radio",
    "fractura de escafoides", "fractura vertebral", "gammagrafia osea",
    "resonancia magnetica de rodilla",
  ],
  "Oftalmología": [
    "glaucoma", "cataratas", "desprendimiento de retina", "uveitis",
    "conjuntivitis", "degeneracion macular", "retinopatia diabetica",
    "agudeza visual", "fondo de ojo", "presion intraocular", "queratitis",
    "estrabismo", "latanoprost", "timolol", "campimetria", "tonometria",
    "angiografia con fluoresceina", "tomografia de coherencia optica", " oct ",
  ],
  "ORL": [
    "hipoacusia", "otitis media", "vertigo periferico", "amigdalitis",
    "faringitis", "laringitis", "sinusitis", "epistaxis", "disfonia",
    "cancer de laringe", "acufenos", "rinitis alergica", "sindrome de meniere",
    "otorrinolaringologia", "videofibroscopia", "senos paranasales",
    "audiometria", "timpanometria",
  ],
  "Dermatología": [
    "carcinoma basocelular", "carcinoma escamoso", "psoriasis", "eccema",
    "dermatitis atopica", "acne", "urticaria", "alopecia", "vitiligo", "nevus",
    "biopsia cutanea", "prurito generalizado", "melanoma", "lesion cutanea",
    "hemangioma infantil", "dermatologia", "isotretinoina",
    "corticoide topico", "tacrolimus topico", "dermatoscopia",
  ],
  "Urgencias": [
    "acude a urgencias", "acude al servicio de urgencias", "es traido a urgencias",
    "es traida a urgencias", "consulta en urgencias", "ingresa por urgencias",
    "servicio de urgencias", "actitud inmediata", "actitud a seguir de forma inmediata",
    "manejo inicial", "medida inicial", "primera medida", "actuacion inmediata",
    "medidas inmediatas", "en las proximas horas", "de forma urgente",
    "inestabilidad hemodinamica", "shock", "parada cardiorrespiratoria",
    "parada cardiaca", "estado de shock", "atencion urgente", "sala de urgencias",
    "codigo ictus", "codigo infarto", "actitud mas adecuada de forma inmediata",
    "cual es la actitud inicial", "traslado urgente", "politraumatizado",
    "intoxicacion aguda", "sobredosis", "reanimacion cardiopulmonar", "anafilaxia",
    "quemadura", "shock hipovolemico", "triaje", "atropina",
    "naloxona", "flumazenilo",
  ],
  "MFyC": [
    "consulta de atencion primaria", "acude a su centro de salud", "revision rutinaria",
    "medico de familia", "medico de cabecera", "seguimiento en atencion primaria",
    "medicina familiar y comunitaria", "chequeo rutinario", "control rutinario",
    "revision periodica", "consulta programada", "acude a revision",
    "control ambulatorio", "consulta de su medico de familia", "revision de salud",
    "examen periodico de salud", "consulta ambulatoria de control",
    "prevencion primaria", "prevencion secundaria", "prevencion cuaternaria",
    "cribado poblacional",
  ],
};

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

// Los términos cortos tipo abreviatura (sin espacios, <=5 caracteres) se
// buscan con límites de palabra para no disparar por ser substring de otra
// palabra (p.ej. "iam" dentro de una palabra que no tenga nada que ver).
function contieneTermino(textoNormalizado, termino) {
  const t = termino.trim();
  if (t.includes(" ") || t.length > 5) {
    return textoNormalizado.includes(termino);
  }
  const patron = new RegExp("\\b" + t + "\\b");
  return patron.test(textoNormalizado);
}

function clasificar(textoNormalizado) {
  let mejorScore = 0;
  let mejores = [];
  for (const [especialidad, terminos] of Object.entries(ESPECIALIDADES)) {
    let score = 0;
    for (const termino of terminos) {
      if (contieneTermino(textoNormalizado, termino)) score++;
    }
    if (score > mejorScore) {
      mejorScore = score;
      mejores = [especialidad];
    } else if (score === mejorScore && score > 0) {
      mejores.push(especialidad);
    }
  }
  if (mejorScore === 0 || mejores.length > 1) return null;
  return mejores[0];
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows } = await client.query(
    `SELECT id, pregunta, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e
     FROM preguntas WHERE especialidad = 'Sin clasificar'`
  );

  const ids = [];
  const asignadas = [];
  const movidas = {};
  const detalle = {};

  for (const row of rows) {
    const textoCompleto = [
      row.pregunta, row.opcion_a, row.opcion_b, row.opcion_c, row.opcion_d, row.opcion_e,
    ].filter(Boolean).join(" ");
    const especialidad = clasificar(normalizar(textoCompleto));
    if (especialidad) {
      ids.push(row.id);
      asignadas.push(especialidad);
      movidas[especialidad] = (movidas[especialidad] || 0) + 1;
      (detalle[especialidad] ??= []).push({ id: row.id, snippet: row.pregunta.slice(0, 120) });
    }
  }

  console.log(`Preguntas "Sin clasificar" evaluadas: ${rows.length}`);
  console.log(`Reclasificadas: ${ids.length}`);
  for (const [esp, n] of Object.entries(movidas).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${esp}: ${n}`);
  }

  if (LISTAR) {
    for (const esp of Object.keys(detalle)) {
      console.log(`\n--- ${esp} ---`);
      for (const item of detalle[esp]) console.log(`  #${item.id}: ${item.snippet}`);
    }
  }

  if (DRY_RUN) {
    console.log("\n--dry-run: no se ha escrito nada en la base de datos.");
    await client.end();
    return;
  }

  if (ids.length > 0) {
    await client.query(
      `UPDATE preguntas AS p
       SET especialidad = c.especialidad
       FROM (SELECT * FROM UNNEST($1::int[], $2::text[]) AS t(id, especialidad)) AS c
       WHERE p.id = c.id AND p.especialidad = 'Sin clasificar'`,
      [ids, asignadas]
    );
    console.log("\nUPDATE aplicado.");
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
