-- Exclusiones de vídeo de MIR 2017: 105 preguntas cuyo vídeo de tema no encaja (primera ronda y repetición con título primero) o encaja en parte siendo antiguo (>5 años) y sensible a guías; 3 con otro vídeo y 102 sin vídeo.
-- Solo INSERTA en video_exclusiones (PK pregunta_id: ON CONFLICT DO NOTHING lo hace idempotente). Sin BEGIN/COMMIT: lo decide quien lo invoca.
-- Una exclusión solo se aplica mientras el tema siga mostrando video_excluido_id. Si algo no cuadra, RAISE EXCEPTION (aborta la transacción).
-- Ensayo: bash import2017/simular_video_exclusiones_2017.sh (termina en ROLLBACK). Reversión: import2017/revertir_video_exclusiones_2017.sql.
CREATE TEMP TABLE IF NOT EXISTS ve_antes AS SELECT pregunta_id, video_id FROM pregunta_video;
CREATE TEMP TABLE IF NOT EXISTS ve_previas AS SELECT md5(coalesce(string_agg(e::text, '|' ORDER BY pregunta_id), '')) AS hprev, count(*) AS nprev FROM video_exclusiones e WHERE pregunta_id NOT IN (2235,2110,2263,2143,2254,2068,2051,2067,2105,2241,2201,2117,2036,2214,2133,2040,2046,2193,2065,2123,2066,2248,2207,2054,2100,2232,2090,2149,2174,2211,2185,2076,2059,2172,2136,2223,2097,2229,2094,2144,2180,2037,2091,2189,2220,2239,2256,2183,2106,2151,2148,2127,2079,2228,2146,2112,2187,2243,2230,2170,2159,2055,2126,2041,2199,2095,2070,2205,2048,2251,2032,2109,2096,2247,2168,2246,2129,2194,2060,2245,2153,2080,2124,2107,2197,2249,2147,2145,2158,2098,2132,2186,2169,2165,2039,2034,2139,2233,2115,2258,2173,2225,2104,2198,2128);
CREATE TEMP TABLE IF NOT EXISTS ve_antes2017 AS SELECT count(*) FILTER (WHERE pv.video_id IS NOT NULL) AS con_video FROM pregunta_video pv JOIN preguntas p ON p.id = pv.pregunta_id WHERE p."año" = 2017 AND NOT p.anulada;
CREATE TEMP TABLE IF NOT EXISTS ve_log (n int);

WITH ins AS (
  INSERT INTO video_exclusiones (pregunta_id, video_excluido_id, video_alternativo_id, motivo)
  VALUES
  (2235, 58, NULL, 'MIR 2017: Los videos tratan patologías digestivas, no tamponamiento cardíaco ni pericardiocentesis. El #58 no encaja y no hay otro en la biblioteca.'),
  (2110, 35, NULL, 'MIR 2017: El video trata trastornos motores, no eosinofilia ni biopsias esofágicas. El #35 no encaja y no hay otro en la biblioteca.'),
  (2263, 16, NULL, 'MIR 2017: El video aborda vesícula y vías biliares, no la indicación de resonancia magnética para lesión incidental. El #16 no encaja y no hay otro en la biblioteca.'),
  (2143, 49, NULL, 'MIR 2017: El video trata algoritmos de bocio, no la tiroiditis subaguda ni su gammagrafía. El #49 no encaja y no hay otro en la biblioteca.'),
  (2254, 2, NULL, 'MIR 2017: Los videos tratan hemorragias y otras patologías, no la datación gestacional por CRL. El #2 no encaja y no hay otro en la biblioteca.'),
  (2068, 62, NULL, 'MIR 2017: Trata hemólisis inmunitaria, no microangiopática. El #62 no encaja y no hay otro en la biblioteca.'),
  (2051, 26, NULL, 'MIR 2017: El video aborda diagnóstico de mieloma múltiple, incluyendo pruebas de proteinograma y Bence Jones. El #26 no encaja y no hay otro en la biblioteca.'),
  (2067, 88, NULL, 'MIR 2017: El video aborda tumores intracraneales, no abscesos cerebrales. El #88 no encaja y no hay otro en la biblioteca.'),
  (2105, 1, NULL, 'MIR 2017: Título general de valvulopatías, no indica diagnóstico de endocarditis. El #1 no encaja y no hay otro en la biblioteca.'),
  (2241, 82, NULL, 'MIR 2017: Encaja en parte (Trata hiperpotasemia pero no cubre la administración de calcio como medida inmediata) y es de 2020, antiguo para una pregunta sensible a guías o tratamiento. El #82 no encaja y no hay otro en la biblioteca.'),
  (2201, 19, NULL, 'MIR 2017: Encaja en parte (El video trata neumonías pero no cubre el tratamiento empírico con cobertura anaerobia necesario para la respuesta) y es de 2020, antiguo para una pregunta sensible a guías o tratamiento. El #19 no encaja y no hay otro en la biblioteca.'),
  (2117, 21, NULL, 'MIR 2017: Encaja en parte (El video trata ictus pero no cubre criterios de fibrinolisis ni la ventana temporal requerida) y es de 2020, antiguo para una pregunta sensible a guías o tratamiento. El #21 no encaja y no hay otro en la biblioteca.'),
  (2036, 56, NULL, 'MIR 2017: Los videos abordan otros diagnósticos cutáneos, no mastocitoma ni su manejo. El #56 no encaja y no hay otro en la biblioteca.'),
  (2214, 28, NULL, 'MIR 2017: Ninguno aborda la fractura de rótula. El #28 no encaja y no hay otro en la biblioteca.'),
  (2133, 10, NULL, 'MIR 2017: Los videos tratan de RCP y cardiología, no de cateterismo venoso central ni ecografía. El #10 no encaja y no hay otro en la biblioteca.'),
  (2040, 25, NULL, 'MIR 2017: El video aborda diagnóstico diferencial, no tratamientos ni ustekinumab. El #25 no encaja y no hay otro en la biblioteca.'),
  (2046, 56, NULL, 'MIR 2017: Los videos abordan otras patologías, no queratoacantoma ni efectos de vemurafenib. El #56 no encaja y no hay otro en la biblioteca.'),
  (2193, 94, NULL, 'MIR 2017: Los videos listados no tratan papiledema ni hipertensión intracraneal idiopática. El #94 no encaja y no hay otro en la biblioteca.'),
  (2065, 6, 39, 'MIR 2017: El video aborda fibrilación auricular, no la administración de adenosina para detener una taquicardia supraventricular. El #6 no encaja; #39 encaja en parte.'),
  (2123, 15, NULL, 'MIR 2017: El video aborda semiología, no la identificación anatómica de la arteria vertebral en imágenes. El #15 no encaja y no hay otro en la biblioteca.'),
  (2066, 85, NULL, 'MIR 2017: Los videos son de diagnósticos diferenciales, no explican la anatomía del proceso odontoides. El #85 no encaja y no hay otro en la biblioteca.'),
  (2248, 26, NULL, 'MIR 2017: Los videos abordan linfoma, no la tuberculosis ganglionar. El #26 no encaja y no hay otro en la biblioteca.'),
  (2207, 106, NULL, 'MIR 2017: Los videos tratan diagnósticos de enfermedades, no la anatomía de la vena porta ni la ausencia de válvulas. El #106 no encaja y no hay otro en la biblioteca.'),
  (2054, 16, NULL, 'MIR 2017: El video trata de vesícula y vías biliares, no de pancreatitis autoinmune ni IgG4. El #16 no encaja y no hay otro en la biblioteca.'),
  (2100, 35, NULL, 'MIR 2017: El video trata trastornos motores, no la histología del esófago de Barrett. El #35 no encaja y no hay otro en la biblioteca.'),
  (2232, 86, NULL, 'MIR 2017: El video aborda el ciclo celular, no el metabolismo de fármacos ni CYP2D6. El #86 no encaja y no hay otro en la biblioteca.'),
  (2090, 86, NULL, 'MIR 2017: El video aborda el ciclo celular, no la conversión de ácidos grasos en carbohidratos. El #86 no encaja y no hay otro en la biblioteca.'),
  (2149, 57, NULL, 'MIR 2017: Los videos son diagnósticos diferenciales, no abordan la fisiología de la Angiotensina II. El #57 no encaja y no hay otro en la biblioteca.'),
  (2174, 55, NULL, 'MIR 2017: Los videos abordan diagnósticos diferenciales de anemias, no la fisiología de la hepcidina. El #55 no encaja y no hay otro en la biblioteca.'),
  (2211, 13, NULL, 'MIR 2017: Los videos tratan diagnósticos diferenciales, no la genética de la distrofia miotónica tipo 1. El #13 no encaja y no hay otro en la biblioteca.'),
  (2185, 81, NULL, 'MIR 2017: El video trata urgencias, no mecanismos fisiopatológicos de la urticaria inducida por fármacos. El #81 no encaja y no hay otro en la biblioteca.'),
  (2076, 4, NULL, 'MIR 2017: El video trata exantemas, no neumonía ni su etiología bacteriana. El #4 no encaja y no hay otro en la biblioteca.'),
  (2059, 6, NULL, 'MIR 2017: El video trata fibrilación auricular, no la taquicardia por reentrada intranodal ni su ablación. El #6 no encaja y no hay otro en la biblioteca.'),
  (2172, 3, NULL, 'MIR 2017: El video aborda insuficiencia con FEVI reducida, no la miocardiopatía restrictiva ni su diagnóstico. El #3 no encaja y no hay otro en la biblioteca.'),
  (2136, 30, NULL, 'MIR 2017: El video trata conceptos generales de infarto, no aborda la ruptura del tabique interventricular. El #30 no encaja y no hay otro en la biblioteca.'),
  (2223, 3, NULL, 'MIR 2017: El video se centra en tratamientos, no en el mecanismo fisiopatológico de la vasopresina. El #3 no encaja y no hay otro en la biblioteca.'),
  (2097, 8, NULL, 'MIR 2017: Los videos abordan síndromes aórticos y de extremidades, no hipertensión pulmonar ni su clasificación. El #8 no encaja y no hay otro en la biblioteca.'),
  (2229, 24, NULL, 'MIR 2017: Los videos tratan diagnósticos diferenciales de otras patologías, no cirugía de cabeza pancreática. El #24 no encaja y no hay otro en la biblioteca.'),
  (2094, 60, NULL, 'MIR 2017: El video trata malabsorción, no diverticulitis ni su manejo. El #60 no encaja y no hay otro en la biblioteca.'),
  (2144, 35, NULL, 'MIR 2017: El video aborda trastornos motores del esófago, no el tratamiento quirúrgico del adenocarcinoma distal. El #35 no encaja y no hay otro en la biblioteca.'),
  (2180, 60, NULL, 'MIR 2017: El título no indica estudio de vaciamiento gástrico ni gastroparesia. El #60 no encaja y no hay otro en la biblioteca.'),
  (2037, 65, NULL, 'MIR 2017: El video trata hemorragia digestiva alta, no aborda la cápsula endoscópica para sangrado oculto del intestino delgado. El #65 no encaja y no hay otro en la biblioteca.'),
  (2091, 2, NULL, 'MIR 2017: Los videos abordan hemorragias y otras patologías, no la colestasis intrahepática del embarazo. El #2 no encaja y no hay otro en la biblioteca.'),
  (2189, 106, NULL, 'MIR 2017: Ningún video aborda resección de hepatocarcinoma ni criterios de tratamiento. El #106 no encaja y no hay otro en la biblioteca.'),
  (2220, 60, NULL, 'MIR 2017: Encaja en parte (El video trata malabsorción general, no aborda el algoritmo diagnóstico específico del colon irritable con diarrea) y es de 2021, antiguo para una pregunta sensible a guías o tratamiento. El #60 no encaja y no hay otro en la biblioteca.'),
  (2239, 16, NULL, 'MIR 2017: El video aborda vesícula y vías biliares, no cáncer de páncreas ni la deleción de p16. El #16 no encaja y no hay otro en la biblioteca.'),
  (2256, 41, NULL, 'MIR 2017: Encaja en parte (El video trata Cushing pero solo diagnóstico, no aborda la resección quirúrgica recomendada) y es de 2020, antiguo para una pregunta sensible a guías o tratamiento. El #41 no encaja y no hay otro en la biblioteca.'),
  (2183, 106, NULL, 'MIR 2017: Los videos tratan diagnósticos diferenciales hepáticos, sin abordar tratamiento de la esteatohepatitis ni pioglitazona. El #106 no encaja y no hay otro en la biblioteca.'),
  (2106, 41, NULL, 'MIR 2017: Los videos abordan otras endocrinologías, no la medición basal de FSH ni amenorrea secundaria. El #41 no encaja y no hay otro en la biblioteca.'),
  (2151, 21, NULL, 'MIR 2017: Los videos abordan diagnósticos diferenciales, no la nutrición enteral ni gastrostomía. El #21 no encaja y no hay otro en la biblioteca.'),
  (2148, 33, NULL, 'MIR 2017: El título no sugiere contenido sobre incontinencia ni frecuencia urinaria. El #33 no encaja y no hay otro en la biblioteca.'),
  (2127, 47, NULL, 'MIR 2017: El video aborda cáncer de tiroides, ovárico y mamario, no carcinoma cervical ni su tratamiento. El #47 no encaja y no hay otro en la biblioteca.'),
  (2079, 2, NULL, 'MIR 2017: Los videos abordan hemorragias y otras patologías, no la evaluación de abortos recurrentes. El #2 no encaja y no hay otro en la biblioteca.'),
  (2228, 2, NULL, 'MIR 2017: el video trata diagnóstico de hemorragias del tercer trimestre, no manejo del posparto. El #2 no encaja y no hay otro en la biblioteca.'),
  (2146, 26, NULL, 'MIR 2017: Los videos no abordan amiloidosis AL ni la biopsia de grasa abdominal. El #26 no encaja y no hay otro en la biblioteca.'),
  (2112, 9, NULL, 'MIR 2017: Los videos abordan trombopatías y otras patologías, no la pseudotrombocitopenia por EDTA. El #9 no encaja y no hay otro en la biblioteca.'),
  (2187, 59, NULL, 'MIR 2017: El video aborda rickettsias, no malaria ni su tratamiento. El #59 no encaja y no hay otro en la biblioteca.'),
  (2243, 19, NULL, 'MIR 2017: Encaja en parte (El video aborda neumonías pero no especifica tratamiento empírico) y es de 2020, antiguo para una pregunta sensible a guías o tratamiento. El #19 no encaja y no hay otro en la biblioteca.'),
  (2230, 38, NULL, 'MIR 2017: El video aborda tumores de glándulas salivales, no mixoma odontogénico ni su resección. El #38 no encaja y no hay otro en la biblioteca.'),
  (2170, 38, NULL, 'MIR 2017: Los videos tratan tumores y vértigo, no abordan el síndrome de Frey ni su tratamiento. El #38 no encaja y no hay otro en la biblioteca.'),
  (2159, 89, NULL, 'MIR 2017: Los videos tratan diagnóstico diferencial, no maniobras de reposición. El #89 no encaja y no hay otro en la biblioteca.'),
  (2055, 14, NULL, 'MIR 2017: Título general, no indica MPGN ni glomerulopatía específica. El #14 no encaja y no hay otro en la biblioteca.'),
  (2126, 20, NULL, 'MIR 2017: El título indica diagnóstico diferencial de insuficiencia renal aguda, pero no menciona ecografía Doppler ni trasplante. El #20 no encaja y no hay otro en la biblioteca.'),
  (2041, 29, NULL, 'MIR 2017: El video aborda cólico nefrítico, no prostatitis aguda ni su manejo. El #29 no encaja y no hay otro en la biblioteca.'),
  (2199, 29, NULL, 'MIR 2017: Encaja en parte (El video trata colico nefrítico general, pero no aborda la necesidad de drenaje urgente en infección obstructiva post-litotricia) y es de 2020, antiguo para una pregunta sensible a guías o tratamiento. El #29 no encaja y no hay otro en la biblioteca.'),
  (2095, 22, NULL, 'MIR 2017: El video aborda síndrome de aplastamiento y compartimental, no rotura aórtica ni hallazgos radiológicos asociados. El #22 no encaja y no hay otro en la biblioteca.'),
  (2070, 19, NULL, 'MIR 2017: Los videos no abordan los signos físicos de derrame pleural en neumonía. El #19 no encaja y no hay otro en la biblioteca.'),
  (2205, 76, 48, 'MIR 2017: El video trata manejo de coma, no características de cefalea por masa intracraneal. El #76 no encaja; #48 encaja en parte.'),
  (2048, 34, NULL, 'MIR 2017: El título habla de convulsiones y estatus, no de crisis parciales temporales. El #34 no encaja y no hay otro en la biblioteca.'),
  (2251, 31, NULL, 'MIR 2017: Ningún video trata diagnóstico de enfermedad de Wilson ni cobre en orina. El #31 no encaja y no hay otro en la biblioteca.'),
  (2032, 88, NULL, 'MIR 2017: Título genérico no indica cobertura del tumor pineal germinal. El #88 no encaja y no hay otro en la biblioteca.'),
  (2109, 12, NULL, 'MIR 2017: El video aborda diagnóstico de demencia, pero no trata trastornos del sueño REM. El #12 no encaja y no hay otro en la biblioteca.'),
  (2096, 13, NULL, 'MIR 2017: El video trata MG vs Lambert‑Eaton, no EMG para confirmar enfermedad motoneuronal. El #13 no encaja y no hay otro en la biblioteca.'),
  (2247, 15, NULL, 'MIR 2017: Título genérico no indica cobertura del síndrome hemimedular. El #15 no encaja y no hay otro en la biblioteca.'),
  (2168, 49, NULL, 'MIR 2017: El título indica diagnóstico de bocio, no aborda la asociación Hirschsprung‑RET‑tiroides. El #49 no encaja y no hay otro en la biblioteca.'),
  (2246, 92, NULL, 'MIR 2017: Los videos tratan diagnósticos diferenciales, no alimentación complementaria ni introducción de alimentos. El #92 no encaja y no hay otro en la biblioteca.'),
  (2129, 44, NULL, 'MIR 2017: El título es genérico y no indica que cubra la estenosis pilórica, por lo que no se ajusta a la pregunta. El #44 no encaja y no hay otro en la biblioteca.'),
  (2194, 92, NULL, 'MIR 2017: Los videos tratan diagnósticos distintos y no cubren el perfil bioquímico de raquitismo por deficiencia de vitamina D. El #92 no encaja y no hay otro en la biblioteca.'),
  (2060, 34, NULL, 'MIR 2017: El video aborda convulsiones generales, sin centrarse en esclerosis tuberosa. El #34 no encaja y no hay otro en la biblioteca.'),
  (2245, 11, NULL, 'MIR 2017: Título no menciona hernia diafragmática ni hipoplasia pulmonar. El #11 no encaja y no hay otro en la biblioteca.'),
  (2153, 29, NULL, 'MIR 2017: El título se refiere a cólico nefrítico, sin relación con torsión testicular. El #29 no encaja y no hay otro en la biblioteca.'),
  (2080, 44, 92, 'MIR 2017: El video trata diagnóstico de dolor abdominal agudo general, no aborda enterocolitis alérgica neonatal. El #44 no encaja; #92 encaja en parte.'),
  (2124, 11, NULL, 'MIR 2017: Ningún video aborda la puntuación Apgar del recién nacido. El #11 no encaja y no hay otro en la biblioteca.'),
  (2107, 50, NULL, 'MIR 2017: Los videos abordan diagnósticos diferenciales pediátricos, no fracturas del antebrazo ni lesiones óseas infantiles. El #50 no encaja y no hay otro en la biblioteca.'),
  (2197, 70, NULL, 'MIR 2017: Encaja en parte (El video trata artropatías cristalinas pero no aborda el tratamiento con febuxostat) y es de 2020, antiguo para una pregunta sensible a guías o tratamiento. El #70 no encaja y no hay otro en la biblioteca.'),
  (2249, 28, NULL, 'MIR 2017: Los videos tratan cadera, hombro, rodilla y columna, no manejo de fractura tibial abierta. El #28 no encaja y no hay otro en la biblioteca.'),
  (2147, 13, NULL, 'MIR 2017: El título indica miastenia gravis vs Eaton‑Lambert, sin relación con hernia discal L5/S1. El #13 no encaja y no hay otro en la biblioteca.'),
  (2145, 22, NULL, 'MIR 2017: El video trata síndromes de aplastamiento, no triage ni identificación de pacientes verdes. El #22 no encaja y no hay otro en la biblioteca.'),
  (2158, 74, NULL, 'MIR 2017: El título indica acciones en coma, sin mencionar la escala de Glasgow ni sus componentes. El #74 no encaja y no hay otro en la biblioteca.'),
  (2098, 33, NULL, 'MIR 2017: El video no aborda la fisiopatología cardíaca ni la insuficiencia diastólica. El #33 no encaja y no hay otro en la biblioteca.'),
  (2132, 31, NULL, 'MIR 2017: Los videos tratan diagnóstico diferencial de otras patologías, no tratamiento del síndrome de piernas inquietas. El #31 no encaja y no hay otro en la biblioteca.'),
  (2186, 22, NULL, 'MIR 2017: El video aborda síndromes de aplastamiento, no la prioridad de señalizar y proteger en un accidente de tráfico. El #22 no encaja y no hay otro en la biblioteca.'),
  (2169, 72, NULL, 'MIR 2017: El video trata solo sensibilidad y especificidad, no aborda sobrediagnóstico ni PSA. El #72 no encaja y no hay otro en la biblioteca.'),
  (2165, 56, NULL, 'MIR 2017: Los videos abordan diagnóstico diferencial de otras afecciones, no márgenes quirúrgicos de melanoma. El #56 no encaja y no hay otro en la biblioteca.'),
  (2039, 23, NULL, 'MIR 2017: El vídeo trata de cohortes, no de estudios descriptivos. El #23 no encaja y no hay otro en la biblioteca.'),
  (2034, 23, NULL, 'MIR 2017: El título indica solo estudio de cohortes, no Kaplan‑Meier. El #23 no encaja y no hay otro en la biblioteca.'),
  (2139, 98, NULL, 'MIR 2017: El video parece centrarse en diagnóstico diferencial, no en análisis de sensibilidad farmacoeconómica. El #98 no encaja y no hay otro en la biblioteca.'),
  (2233, 92, NULL, 'MIR 2017: Los videos tratan diagnósticos, no el sitio intramuscular en lactantes. El #92 no encaja y no hay otro en la biblioteca.'),
  (2115, 4, NULL, 'MIR 2017: El video aborda diagnóstico de exantemas, no el calendario de vacunación infantil. El #4 no encaja y no hay otro en la biblioteca.'),
  (2258, 59, NULL, 'MIR 2017: Los videos abordan rickettsias y otras infecciones, no la transmisión ni manejo de Trypanosoma cruzi. El #59 no encaja y no hay otro en la biblioteca.'),
  (2173, 23, NULL, 'MIR 2017: El video trata de cohortes, no de estudios de casos y controles. El #23 no encaja y no hay otro en la biblioteca.'),
  (2225, 23, NULL, 'MIR 2017: El vídeo trata de cohortes, no de la justificación del problema en el protocolo. El #23 no encaja y no hay otro en la biblioteca.'),
  (2104, 51, NULL, 'MIR 2017: El video trata urgencias de cirugía plástica, no aborda abscesos perianales. El #51 no encaja y no hay otro en la biblioteca.'),
  (2198, 30, NULL, 'MIR 2017: El video solo describe el infarto, no trata prevención secundaria ni antagonistas de calcio. El #30 no encaja y no hay otro en la biblioteca.'),
  (2128, 71, NULL, 'MIR 2017: El título indica diagnóstico diferencial entre espondilitis y Forestier, sin mencionar pruebas de laboratorio como VSG. El #71 no encaja y no hay otro en la biblioteca.')
  ON CONFLICT (pregunta_id) DO NOTHING RETURNING 1
)
INSERT INTO ve_log SELECT count(*) FROM ins;

DO $$
DECLARE hechas int; n int; mal int; alt int; sin int; resto int; c17 int; v_prev int; v_hprev text;
BEGIN
  SELECT coalesce(sum(ve_log.n), 0) INTO hechas FROM ve_log;
  IF hechas NOT IN (0, 105) THEN RAISE EXCEPTION 'se han insertado % filas (esperadas 0 o 105)', hechas; END IF;
  SELECT count(*) INTO n FROM video_exclusiones e JOIN preguntas p ON p.id = e.pregunta_id WHERE e.pregunta_id IN (2235,2110,2263,2143,2254,2068,2051,2067,2105,2241,2201,2117,2036,2214,2133,2040,2046,2193,2065,2123,2066,2248,2207,2054,2100,2232,2090,2149,2174,2211,2185,2076,2059,2172,2136,2223,2097,2229,2094,2144,2180,2037,2091,2189,2220,2239,2256,2183,2106,2151,2148,2127,2079,2228,2146,2112,2187,2243,2230,2170,2159,2055,2126,2041,2199,2095,2070,2205,2048,2251,2032,2109,2096,2247,2168,2246,2129,2194,2060,2245,2153,2080,2124,2107,2197,2249,2147,2145,2158,2098,2132,2186,2169,2165,2039,2034,2139,2233,2115,2258,2173,2225,2104,2198,2128) AND p."año" = 2017 AND NOT p.anulada;
  IF n <> 105 THEN RAISE EXCEPTION 'no son 105 preguntas de 2017 visibles con exclusión (%)', n; END IF;
  SELECT count(*), md5(coalesce(string_agg(e::text, '|' ORDER BY pregunta_id), '')) INTO v_prev, v_hprev FROM video_exclusiones e WHERE pregunta_id NOT IN (2235,2110,2263,2143,2254,2068,2051,2067,2105,2241,2201,2117,2036,2214,2133,2040,2046,2193,2065,2123,2066,2248,2207,2054,2100,2232,2090,2149,2174,2211,2185,2076,2059,2172,2136,2223,2097,2229,2094,2144,2180,2037,2091,2189,2220,2239,2256,2183,2106,2151,2148,2127,2079,2228,2146,2112,2187,2243,2230,2170,2159,2055,2126,2041,2199,2095,2070,2205,2048,2251,2032,2109,2096,2247,2168,2246,2129,2194,2060,2245,2153,2080,2124,2107,2197,2249,2147,2145,2158,2098,2132,2186,2169,2165,2039,2034,2139,2233,2115,2258,2173,2225,2104,2198,2128);
  IF v_prev <> 305 OR v_prev <> (SELECT nprev FROM ve_previas) OR v_hprev <> (SELECT hprev FROM ve_previas) THEN RAISE EXCEPTION 'han cambiado las exclusiones existentes (deben ser 305, iguales)'; END IF;
  SELECT count(*) INTO mal FROM video_exclusiones e JOIN ve_antes a USING (pregunta_id) WHERE e.pregunta_id IN (2235,2110,2263,2143,2254,2068,2051,2067,2105,2241,2201,2117,2036,2214,2133,2040,2046,2193,2065,2123,2066,2248,2207,2054,2100,2232,2090,2149,2174,2211,2185,2076,2059,2172,2136,2223,2097,2229,2094,2144,2180,2037,2091,2189,2220,2239,2256,2183,2106,2151,2148,2127,2079,2228,2146,2112,2187,2243,2230,2170,2159,2055,2126,2041,2199,2095,2070,2205,2048,2251,2032,2109,2096,2247,2168,2246,2129,2194,2060,2245,2153,2080,2124,2107,2197,2249,2147,2145,2158,2098,2132,2186,2169,2165,2039,2034,2139,2233,2115,2258,2173,2225,2104,2198,2128) AND a.video_id IS DISTINCT FROM e.video_excluido_id;
  IF mal <> 0 THEN RAISE EXCEPTION '% exclusiones no coinciden con el vídeo que mostraba la pregunta', mal; END IF;
  SELECT count(*) INTO alt FROM video_exclusiones e JOIN pregunta_video pv USING (pregunta_id) WHERE e.pregunta_id IN (2235,2110,2263,2143,2254,2068,2051,2067,2105,2241,2201,2117,2036,2214,2133,2040,2046,2193,2065,2123,2066,2248,2207,2054,2100,2232,2090,2149,2174,2211,2185,2076,2059,2172,2136,2223,2097,2229,2094,2144,2180,2037,2091,2189,2220,2239,2256,2183,2106,2151,2148,2127,2079,2228,2146,2112,2187,2243,2230,2170,2159,2055,2126,2041,2199,2095,2070,2205,2048,2251,2032,2109,2096,2247,2168,2246,2129,2194,2060,2245,2153,2080,2124,2107,2197,2249,2147,2145,2158,2098,2132,2186,2169,2165,2039,2034,2139,2233,2115,2258,2173,2225,2104,2198,2128) AND e.video_alternativo_id IS NOT NULL AND pv.video_id = e.video_alternativo_id;
  SELECT count(*) INTO sin FROM video_exclusiones e JOIN pregunta_video pv USING (pregunta_id) WHERE e.pregunta_id IN (2235,2110,2263,2143,2254,2068,2051,2067,2105,2241,2201,2117,2036,2214,2133,2040,2046,2193,2065,2123,2066,2248,2207,2054,2100,2232,2090,2149,2174,2211,2185,2076,2059,2172,2136,2223,2097,2229,2094,2144,2180,2037,2091,2189,2220,2239,2256,2183,2106,2151,2148,2127,2079,2228,2146,2112,2187,2243,2230,2170,2159,2055,2126,2041,2199,2095,2070,2205,2048,2251,2032,2109,2096,2247,2168,2246,2129,2194,2060,2245,2153,2080,2124,2107,2197,2249,2147,2145,2158,2098,2132,2186,2169,2165,2039,2034,2139,2233,2115,2258,2173,2225,2104,2198,2128) AND e.video_alternativo_id IS NULL AND pv.video_id IS NULL;
  IF alt <> 3 OR sin <> 102 THEN RAISE EXCEPTION 'con alternativo % de 3, sin vídeo % de 102', alt, sin; END IF;
  SELECT count(*) INTO resto FROM ve_antes a JOIN pregunta_video pv USING (pregunta_id) WHERE a.pregunta_id NOT IN (2235,2110,2263,2143,2254,2068,2051,2067,2105,2241,2201,2117,2036,2214,2133,2040,2046,2193,2065,2123,2066,2248,2207,2054,2100,2232,2090,2149,2174,2211,2185,2076,2059,2172,2136,2223,2097,2229,2094,2144,2180,2037,2091,2189,2220,2239,2256,2183,2106,2151,2148,2127,2079,2228,2146,2112,2187,2243,2230,2170,2159,2055,2126,2041,2199,2095,2070,2205,2048,2251,2032,2109,2096,2247,2168,2246,2129,2194,2060,2245,2153,2080,2124,2107,2197,2249,2147,2145,2158,2098,2132,2186,2169,2165,2039,2034,2139,2233,2115,2258,2173,2225,2104,2198,2128) AND a.video_id IS DISTINCT FROM pv.video_id;
  IF resto <> 0 OR (SELECT count(*) FROM ve_antes) <> (SELECT count(*) FROM pregunta_video) THEN RAISE EXCEPTION '% preguntas sin exclusión cambian de vídeo', resto; END IF;
  SELECT count(*) FILTER (WHERE pv.video_id IS NOT NULL) INTO c17 FROM pregunta_video pv JOIN preguntas p ON p.id = pv.pregunta_id WHERE p."año" = 2017 AND NOT p.anulada;
  IF c17 <> (SELECT con_video FROM ve_antes2017) - 102 THEN RAISE EXCEPTION 'preguntas de 2017 con vídeo % (esperadas % - 102)', c17, (SELECT con_video FROM ve_antes2017); END IF;
  RAISE NOTICE 'exclusiones de 2017: 105 (con alternativo %, sin vídeo %), preguntas de 2017 con vídeo % (antes %), el resto sin cambios, insertadas en esta sesión %', alt, sin, c17, (SELECT con_video FROM ve_antes2017), hechas;
END $$;
