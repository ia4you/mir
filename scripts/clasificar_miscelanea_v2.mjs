// clasificar_miscelanea_v2.mjs
// -------------------------------
// Segunda pasada de clasificación, esta vez SOLO sobre las preguntas que
// están en 'Miscelánea' (no toca ninguna que ya tenga otra especialidad).
// Diccionario ampliado a partir de la lectura manual de las 361 preguntas
// reales: añade dos especialidades nuevas (Bioestadística, Ética médica) y
// amplía las 20 existentes con términos de fármacos, fisiología por sistema
// y anatomía que faltaban.
//
// Criterio de asignación: hace falta 2+ términos de la MISMA especialidad.
// Si hay empate entre dos o más especialidades con el mismo score máximo,
// se deja en Miscelánea. Un solo término nunca es suficiente.
//
// Uso:
//   node --env-file=.env.local scripts/clasificar_miscelanea_v2.mjs --dry-run --list
//   node --env-file=.env.local scripts/clasificar_miscelanea_v2.mjs   (aplica UPDATE)

import { Client } from "pg";

const DRY_RUN = process.argv.includes("--dry-run");
const LISTAR = process.argv.includes("--list");
const DEBUG = process.argv.includes("--debug");
const UMBRAL_MINIMO = 2;

// ---- diccionario base (20 especialidades ya existentes, igual que en
// clasificar_final.mjs) ampliado con los términos nuevos identificados ----
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
    // ampliación
    "afasia de broca", "afasia de wernicke", "afasia de conduccion", "jergafasia",
    "paralisis de bell", "paralisis facial periferica", "esclerosis tuberosa",
    "mononeuropatia", "crisis focales", "crisis postraumaticas", "narcolepsia",
    "cataplejia", "hipocretina", "orexina", "cefalea tensional", "hipertonia espastica",
    "via corticoespinal", "signo de babinski", "reflejo de babinski",
    "encefalitis anti-nmdar", "encefalitis autoinmune", "astereognosia",
    "sindrome del tunel carpiano", "mielosis funicular", "amaurosis", "afasia transcortical",
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
    // ampliación
    "ivabradina", "nodo sinoauricular", "sincope", "bloqueo auriculoventricular",
    "mobitz", "tetralogia de fallot", "comunicacion interventricular", " civ ",
    "corazon de deportista", "tavi", "prolapso de la valvula mitral", "mixoma",
    "peptido natriuretico", "score2", "potencial de accion cardiaco",
    "sindrome del qt largo", "qt largo", "profilaxis de endocarditis",
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
    // ampliación
    "acalasia", "manometria esofagica", "espasmo esofagico", "esofagitis eosinofilica",
    "fisura anal", "diverticulo de zenker", "gastroparesia", "esofagitis erosiva",
    "duodenopancreatectomia", "neoplasia mucinosa papilar intraductal",
    "helicobacter pylori", "elastasa fecal", "insuficiencia pancreatica exocrina",
    "proctalgia", "sindrome del elevador del ano",
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
    // ampliación
    "presion pleural", "presion alveolar", "presion transpulmonar", "hipoxemia",
    "sdra", "distres respiratorio agudo", "fibrosis quistica", " cftr ",
    "apnea obstructiva del sueno", "cpap", "poligrafia respiratoria",
    "indice de apneas-hipopneas", " iah ", "crepitantes", "nodulo pulmonar solitario",
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
    // ampliación
    "hiperprolactinemia", "hipogonadismo", "glucogenosis", "insulinoma", "vipoma",
    "glucagonoma", "tumor neuroendocrino pancreatico", "incidentaloma suprarrenal",
    "klinefelter", "carcinoma medular de tiroides", "hepcidina", "hemocromatosis",
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
    // ampliación
    "reabsorcion de sodio", "tubulo proximal", "asa de henle", "tubulo colector",
    "glomeruloesclerosis", "glomerulonefritis membranosa",
    "glomerulonefritis de cambios minimos", "nefroesclerosis",
    "enfermedad renal diabetica", "nefritis intersticial", " siadh ",
    "hipopotasemia", "sindrome de bartter",
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
    // ampliación
    "dermatomiositis", "fiebre mediterranea familiar", "sindrome autoinflamatorio",
    "criopirina", "livedo reticularis", "mononeuritis multiple",
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
    // ampliación
    "factor viii", "factor de von willebrand", "trombosis venosa",
    "tiempo de tromboplastina", "mielofibrosis", "dacriocitos",
    "linfoma b difuso", "linfoma no hodgkin", "hemofagocitosis",
  ],
  "Oncología": [
    "tumor maligno", "metastasis", "quimioterapia", "radioterapia",
    "estadiaje tnm", "marcador tumoral", "adenocarcinoma", "sarcoma",
    "tumor primario", "biopsia tumoral", "inmunoterapia", "antineoplasico",
    "quimioterapia adyuvante", "oncologico", "cisplatino", "paclitaxel",
    "trastuzumab", "pembrolizumab", "tamoxifeno", "pet-tc", "marcador ca 125",
    "marcador cea", "psa",
    // ampliación
    "ganglio centinela", "ipilimumab", "nivolumab", "dabrafenib", "trametinib",
    "braf", "kras", "nras", "egfr", "sindrome de stauffer", "tratamiento neoadyuvante",
    "hepatitis inmunomediada", "necrosis tumoral en pieza", "osteosarcoma",
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
    // ampliación
    "clostridioides difficile", "fidaxomicina", "histoplasmosis", "esporotricosis",
    "criptococosis", "epstein-barr", "mononucleosis", "escarlatina",
    "enfermedad de declaracion obligatoria", "candidemia", "streptococcus pyogenes",
    "fiebre reumatica",
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
    // ampliación
    "depresion mayor", "discinesia tardia", "acatisia", "agorafobia",
    "trastorno de ansiedad generalizada", "carbonato de litio", "conductas autolesivas",
    "conducta suicida", "episodio depresivo",
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
    // ampliación
    "vaginosis bacteriana", "vulvovaginitis candidiasica", "cistocele",
    "birads", "mamografia", "reserva ovarica", "hormona antimulleriana",
    "sindrome de asherman", "fallo ovarico prematuro", "biopsia endometrial",
    "histeroscopia", "leiomioma", "ventosa obstetrica", "atrofia vaginal",
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
    // ampliación
    "exantema subito", "roseola infantil", "quinta enfermedad", "sexta enfermedad",
    "eritema infeccioso", "sindrome de beckwith-wiedemann", "macrosomia",
    "x fragil", "discapacidad intelectual", "gastroenteritis aguda en pediatria",
    "rotavirus", "raquitismo", "anemia de fanconi", "adoptada",
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
    // ampliación
    "injerto cutaneo", "injerto de piel", "ulcera por presion", "colgajo",
    "cistectomia radical", "hernia inguinoescrotal", "antisepsia del campo quirurgico",
    "clasificacion de heridas quirurgicas",
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
    // ampliación
    "ligamento cruzado anterior", "maniobra de lachman", "sindrome compartimental",
    "test de thessaly", "lumbociatalgia", "epicondilopatia", "manguito rotador",
    "manguito de los rotadores", "triangulo de codman", "osteonecrosis",
    "gibosidad", "test de adams", "corse de milwaukee", "corse de boston",
  ],
  "Oftalmología": [
    "glaucoma", "cataratas", "desprendimiento de retina", "uveitis",
    "conjuntivitis", "degeneracion macular", "retinopatia diabetica",
    "agudeza visual", "fondo de ojo", "presion intraocular", "queratitis",
    "estrabismo", "latanoprost", "timolol", "campimetria", "tonometria",
    "angiografia con fluoresceina", "tomografia de coherencia optica", " oct ",
    // ampliación
    "desprendimiento de vitreo", "miodesopsias", "fosfenos", "parsplanitis",
    "hemianopsia", "cuadrantanopsia", "signo pupilar de marcus gunn",
  ],
  "ORL": [
    "hipoacusia", "otitis media", "vertigo periferico", "amigdalitis",
    "faringitis", "laringitis", "sinusitis", "epistaxis", "disfonia",
    "cancer de laringe", "acufenos", "rinitis alergica", "sindrome de meniere",
    "otorrinolaringologia", "videofibroscopia", "senos paranasales",
    "audiometria", "timpanometria",
    // ampliación
    "absceso periamigdalino", "angina de plaut-vincent", "colesteatoma",
    "schwannoma vestibular", "neuronitis vestibular", "vertigo posicional paroxistico",
  ],
  "Dermatología": [
    "carcinoma basocelular", "carcinoma escamoso", "psoriasis", "eccema",
    "dermatitis atopica", "acne", "urticaria", "alopecia", "vitiligo", "nevus",
    "biopsia cutanea", "prurito generalizado", "melanoma", "lesion cutanea",
    "hemangioma infantil", "dermatologia", "isotretinoina",
    "corticoide topico", "tacrolimus topico", "dermatoscopia",
    // ampliación
    "eritema pernio", "porfiria cutanea tarda", "porfiria variegata",
    "onicomicosis", "escara", "fitofotodermatitis",
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
    // ampliación
    "golpe de calor", "hipotermia accidental", "intoxicacion por monoxido de carbono",
    "sindrome de reperfusion", "n-acetilcisteina", "manejo de la via aerea",
    "traccion mandibular", "collarin cervical",
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
  // ------------------------------------------------------------------
  // ESPECIALIDADES NUEVAS
  // ------------------------------------------------------------------
  "Bioestadística": [
    "sensibilidad", "especificidad", "valor predictivo", "odds ratio", "razon de momios",
    "riesgo relativo", " nnt ", " nnh ", "intervalo de confianza", "valor p", "significacion estadistica",
    "sesgo", "tamano muestral", "prevalencia", "incidencia", "estudio de cohortes",
    "casos y controles", "ensayo clinico", "aleatoriza", "doble ciego", "ciego simple",
    "metaanalisis", "meta-analisis", "revision sistematica", "curva roc",
    "estudio ecologico", "estudio transversal", "forest plot", "indice de kappa",
    "correlacion intraclase", "grado de recomendacion", "guia de practica clinica",
    "farmacovigilancia", "coste-efectividad", "coste-beneficio", "coste-utilidad",
    "años de vida ajustados", "ensayo clinico fase", "estudio preclinico",
    "bradford hill", "sesgo de seleccion", "falacia ecologica", "sesgo ecologico",
    "densidad de incidencia", "validez interna", "tasa de incidencia",
    "reacciones adversas a medicamentos", "notificaciones espontaneas",
    "carga global de enfermedad", "diseño epidemiologico", "estudio de correlacion",
    "efecto hawthorne", "regresion a la media", "epidemiologico",
  ],
  "Ética médica": [
    "consentimiento informado", "capacidad para decidir", "autonomia del paciente",
    "testamento vital", "voluntades anticipadas", "limitacion del esfuerzo terapeutico",
    "eutanasia", "sedacion paliativa", "secreto profesional", "menor maduro",
    "tutela", "beneficencia", "no maleficencia", "justicia distributiva",
    "deliberacion", "objecion de conciencia", "parte de lesiones",
    "planificacion anticipada de decisiones", "regulacion de la eutanasia",
    "donante de organos", "donacion de organos", "tutores legales",
    "consentimiento por representacion", "futilidad", "medios de soporte vital",
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
    .replace(RANGO_DIACRITICOS, "")
    // el pipeline de extraccion de texto a veces deja espacios sueltos dentro
    // de una palabra (ver limpieza de texto anterior); colapsamos espacios
    // multiples para que el matching de substring no se vea afectado por eso
    .replace(/\s+/g, " ");
}

function contieneTermino(textoNormalizado, termino) {
  const t = termino.trim();
  if (t.includes(" ") || t.length > 5) {
    return textoNormalizado.includes(t);
  }
  const patron = new RegExp("\\b" + t + "\\b");
  return patron.test(textoNormalizado);
}

function clasificar(textoNormalizado) {
  let mejorScore = 0;
  let mejores = [];
  const scoresPorEspecialidad = {};
  for (const [especialidad, terminos] of Object.entries(ESPECIALIDADES)) {
    let score = 0;
    const encontrados = [];
    for (const termino of terminos) {
      if (contieneTermino(textoNormalizado, termino)) {
        score++;
        encontrados.push(termino.trim());
      }
    }
    if (score > 0) scoresPorEspecialidad[especialidad] = encontrados;
    if (score > mejorScore) {
      mejorScore = score;
      mejores = [especialidad];
    } else if (score === mejorScore && score > 0) {
      mejores.push(especialidad);
    }
  }
  if (mejorScore < UMBRAL_MINIMO || mejores.length > 1) {
    return { especialidad: null, mejorScore, mejores, scoresPorEspecialidad };
  }
  return {
    especialidad: mejores[0],
    mejorScore,
    mejores,
    terminos: scoresPorEspecialidad[mejores[0]],
    scoresPorEspecialidad,
  };
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows } = await client.query(
    `SELECT id, pregunta, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e
     FROM preguntas WHERE especialidad = 'Miscelánea'`
  );

  const ids = [];
  const asignadas = [];
  const movidas = {};
  const detalle = {};
  const empates = [];

  for (const row of rows) {
    const textoCompleto = [
      row.pregunta, row.opcion_a, row.opcion_b, row.opcion_c, row.opcion_d, row.opcion_e,
    ].filter(Boolean).join(" ");
    const resultado = clasificar(normalizar(textoCompleto));
    if (resultado.especialidad) {
      ids.push(row.id);
      asignadas.push(resultado.especialidad);
      movidas[resultado.especialidad] = (movidas[resultado.especialidad] || 0) + 1;
      (detalle[resultado.especialidad] ??= []).push({
        id: row.id,
        snippet: row.pregunta.slice(0, 140),
        terminos: resultado.terminos,
      });
    } else if (resultado.mejores.length > 1) {
      empates.push({ id: row.id, empatan: resultado.mejores, snippet: row.pregunta.slice(0, 100) });
    } else if (DEBUG) {
      const top = Object.entries(resultado.scoresPorEspecialidad)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 2)
        .map(([esp, terms]) => `${esp}(${terms.join(",")})`)
        .join(" | ");
      console.log(`SINMATCH #${row.id} [${top || "sin terminos"}]: ${row.pregunta.slice(0, 110)}`);
    }
  }

  const totalReclasificadas = ids.length;
  const restantes = rows.length - totalReclasificadas;

  console.log(`Preguntas en Miscelánea evaluadas: ${rows.length}`);
  console.log(`Reclasificadas: ${totalReclasificadas}`);
  console.log(`Quedan en Miscelánea: ${restantes}`);
  console.log("\nDistribución de lo reclasificado:");
  for (const [esp, n] of Object.entries(movidas).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${esp}: ${n}`);
  }
  console.log(`\nEmpates detectados (se quedan en Miscelánea): ${empates.length}`);

  if (LISTAR) {
    for (const esp of Object.keys(detalle)) {
      console.log(`\n--- ${esp} (${detalle[esp].length}) ---`);
      for (const item of detalle[esp]) {
        console.log(`  #${item.id} [${item.terminos.join(", ")}]: ${item.snippet}`);
      }
    }
    if (empates.length) {
      console.log(`\n--- EMPATES ---`);
      for (const e of empates) {
        console.log(`  #${e.id} [${e.empatan.join(" = ")}]: ${e.snippet}`);
      }
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
       WHERE p.id = c.id AND p.especialidad = 'Miscelánea'`,
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
