-- Exclusiones de vídeo por pregunta (revisión 2026-10). Crea la tabla video_exclusiones, la vista pregunta_video
-- (el vídeo que se muestra de verdad tras fallar) y carga 229 exclusiones: 59 con otro vídeo y 170 sin vídeo.
-- Una exclusión solo se aplica mientras el tema de la pregunta siga mostrando video_excluido_id; si el tema cambia
-- de vídeo, la pregunta recoge el nuevo. Si el alternativo deja de estar visible, la pregunta se queda sin vídeo.
-- Comprobaciones al final: si algo no cuadra, ROLLBACK de todo.
BEGIN;

CREATE TABLE video_exclusiones (
  pregunta_id          integer PRIMARY KEY REFERENCES preguntas(id) ON DELETE CASCADE,
  video_excluido_id    integer NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  video_alternativo_id integer REFERENCES videos(id) ON DELETE SET NULL,  -- NULL = sin vídeo (búsqueda de YouTube)
  motivo               text NOT NULL,
  creado_en            timestamp NOT NULL DEFAULT now(),
  CHECK (video_alternativo_id IS DISTINCT FROM video_excluido_id)
);

-- Para cada pregunta oficial con tema (no «Otros…»): el vídeo del tema (principal activo y disponible, el más
-- reciente si hay varios) y el que se muestra tras aplicar la exclusión, con la especialidad y el tema de su
-- tarjeta en /videos (los de la pregunta o, si es un alternativo, los de su fila principal).
CREATE VIEW pregunta_video AS
WITH tema AS (
  SELECT p.id AS pregunta_id, p.especialidad, btrim(p.tema) AS tema,
    (SELECT v.id FROM video_temas vt JOIN videos v ON v.id = vt.video_id
     WHERE vt.especialidad = p.especialidad AND vt.tema = btrim(p.tema)
       AND v.estado = 'activo' AND v.disponibilidad = 'disponible'
     ORDER BY vt.principal DESC, v.fecha_publicacion DESC, v.id LIMIT 1) AS video_tema_id
  FROM preguntas p
  WHERE p.origen = 'oficial' AND NULLIF(btrim(p.tema), '') IS NOT NULL AND btrim(p.tema) !~* '^otros\M'
), elegido AS (
  SELECT t.*, e.pregunta_id IS NOT NULL AND e.video_excluido_id = t.video_tema_id AS excluida,
         CASE WHEN e.pregunta_id IS NULL OR e.video_excluido_id IS DISTINCT FROM t.video_tema_id THEN t.video_tema_id
              ELSE a.id END AS video_id
  FROM tema t
  LEFT JOIN video_exclusiones e ON e.pregunta_id = t.pregunta_id
  LEFT JOIN videos a ON a.id = e.video_alternativo_id AND a.estado = 'activo' AND a.disponibilidad = 'disponible'
)
SELECT el.pregunta_id, el.video_id, el.video_tema_id, el.excluida,
       CASE WHEN el.video_id = el.video_tema_id THEN el.especialidad ELSE vt.especialidad END AS especialidad,
       CASE WHEN el.video_id = el.video_tema_id THEN el.tema ELSE vt.tema END AS tema
FROM elegido el
LEFT JOIN LATERAL (
  SELECT especialidad, tema FROM video_temas
  WHERE video_id = el.video_id AND el.video_id IS DISTINCT FROM el.video_tema_id
  ORDER BY principal DESC, id LIMIT 1
) vt ON true;

CREATE TEMP TABLE antes ON COMMIT DROP AS SELECT pregunta_id, video_id FROM pregunta_video;

INSERT INTO video_exclusiones (pregunta_id, video_excluido_id, video_alternativo_id, motivo) VALUES
(3, 24, NULL, 'cáncer de cabeza de páncreas: el #24 no encaja y no hay otro en la biblioteca'),
(12, 38, NULL, 'carcinoma de orofaringe con adenopatía cervical: el #38 no encaja y no hay otro en la biblioteca'),
(13, 8, NULL, 'dolor torácico con imagen radiológica: el #8 no encaja y no hay otro en la biblioteca'),
(21, 25, NULL, 'pápulas de Gottron (dermatomiositis): el #25 no encaja y no hay otro en la biblioteca'),
(22, 3, 30, 'IAM de ventrículo derecho: el #3 no encaja; #30 encaja'),
(23, 3, NULL, 'miocardiopatía hipertrófica: el #3 no encaja y no hay otro en la biblioteca'),
(29, 57, NULL, 'regulación del filtrado glomerular: el #57 no encaja y no hay otro en la biblioteca'),
(30, 60, NULL, 'actividad eléctrica del músculo liso intestinal: el #60 no encaja y no hay otro en la biblioteca'),
(31, 46, NULL, 'fisiología del flujo pulmonar: el #46 no encaja y no hay otro en la biblioteca'),
(32, 15, NULL, 'potencial de acción del músculo esquelético: el #15 no encaja y no hay otro en la biblioteca'),
(39, 60, NULL, 'alergia a Anisakis: el #60 no encaja y no hay otro en la biblioteca'),
(43, 27, NULL, 'metaanálisis: el #27 no encaja y no hay otro en la biblioteca'),
(46, 30, 27, 'NNT en un ensayo clínico: el #30 no encaja; #27 encaja en parte'),
(47, 45, NULL, 'aislamiento de contacto y gotas: el #45 no encaja y no hay otro en la biblioteca'),
(57, 10, NULL, 'diagnóstico de muerte encefálica: el #10 no encaja y no hay otro en la biblioteca'),
(69, 2, NULL, 'cribado de preeclampsia del primer trimestre: el #2 no encaja y no hay otro en la biblioteca'),
(70, 63, NULL, 'síntomas vasomotores del climaterio: el #63 no encaja y no hay otro en la biblioteca'),
(74, 2, NULL, 'síndrome HELLP: el #2 no encaja y no hay otro en la biblioteca'),
(77, 47, NULL, 'cribado de cáncer de cérvix: el #47 no encaja y no hay otro en la biblioteca'),
(80, 19, NULL, 'bronquiolitis en un lactante: el #19 no encaja y no hay otro en la biblioteca'),
(81, 11, 69, 'comunicación interventricular: el #11 no encaja; #69 encaja'),
(82, 7, NULL, 'distrés respiratorio neonatal: el #7 no encaja y no hay otro en la biblioteca'),
(83, 11, NULL, 'fenilcetonuria: el #11 no encaja y no hay otro en la biblioteca'),
(84, 13, 40, 'fenómeno de anticipación genética: el #13 no encaja; #40 encaja'),
(85, 88, NULL, 'neuroblastoma: el #88 no encaja y no hay otro en la biblioteca'),
(86, 11, NULL, 'profilaxis con palivizumab: el #11 no encaja y no hay otro en la biblioteca'),
(89, 69, 4, 'enfermedad de Kawasaki: el #69 no encaja; #4 encaja'),
(104, 13, NULL, 'parálisis facial periférica: el #13 no encaja y no hay otro en la biblioteca'),
(109, 7, NULL, 'sedación en ventilación mecánica: el #7 no encaja y no hay otro en la biblioteca'),
(112, 13, 79, 'lumbociatalgia: el #13 no encaja; #79 encaja'),
(113, 74, NULL, 'cervicobraquialgia: el #74 no encaja y no hay otro en la biblioteca'),
(117, 50, NULL, 'fractura de epitróclea en niños: el #50 no encaja y no hay otro en la biblioteca'),
(119, 50, NULL, 'escoliosis idiopática: el #50 no encaja y no hay otro en la biblioteca'),
(123, 6, 39, 'síndrome de QT largo: el #6 no encaja; #39 encaja en parte'),
(129, 29, 8, 'aneurisma de aorta torácica con ateroembolia: el #29 no encaja; #8 encaja en parte'),
(130, 8, NULL, 'isquemia arterial aguda de una extremidad: el #8 no encaja y no hay otro en la biblioteca'),
(141, 58, NULL, 'absceso tras apendicectomía: el #58 no encaja y no hay otro en la biblioteca'),
(152, 10, NULL, 'síndrome hemolítico urémico: el #10 no encaja y no hay otro en la biblioteca'),
(158, 9, NULL, 'trombopenia inducida por heparina: el #9 no encaja y no hay otro en la biblioteca'),
(159, 9, NULL, 'púrpura trombótica trombocitopénica: el #9 no encaja y no hay otro en la biblioteca'),
(163, 33, 99, 'incontinencia de urgencia en un anciano: el #33 no encaja; #99 encaja'),
(164, 74, 84, 'delirium en una anciana: el #74 no encaja; #84 encaja'),
(167, 5, NULL, 'diagnóstico de diabetes: el #5 no encaja y no hay otro en la biblioteca'),
(168, 41, 104, 'MEN 1: el #41 no encaja; #104 encaja'),
(171, 63, 52, 'síndrome de Klinefelter: el #63 no encaja; #52 encaja'),
(179, 14, 42, 'granulomatosis con poliangeítis: el #14 no encaja; #42 encaja'),
(180, 42, NULL, 'pronóstico del síndrome de Sjögren: el #42 no encaja y no hay otro en la biblioteca'),
(181, 9, NULL, 'tromboembolismo pulmonar: el #9 no encaja y no hay otro en la biblioteca'),
(186, 28, NULL, 'fractura-luxación de húmero proximal: el #28 no encaja y no hay otro en la biblioteca'),
(192, 47, NULL, 'patología ginecológica de la imagen: el #47 no encaja y no hay otro en la biblioteca'),
(193, 62, NULL, 'drepanocitosis / paludismo en el frotis: el #62 no encaja y no hay otro en la biblioteca'),
(196, 7, NULL, 'reanimación de un prematuro extremo: el #7 no encaja y no hay otro en la biblioteca'),
(205, 16, NULL, 'cáncer gástrico / masa abdominal: el #16 no encaja y no hay otro en la biblioteca'),
(213, 8, NULL, 'fisiología del flujo turbulento: el #8 no encaja y no hay otro en la biblioteca'),
(214, 57, NULL, 'equilibrio osmótico: el #57 no encaja y no hay otro en la biblioteca'),
(225, 86, 40, 'regiones del gen (genética molecular): el #86 no encaja; #40 encaja en parte'),
(230, 45, NULL, 'aislamiento de contacto y aéreo: el #45 no encaja y no hay otro en la biblioteca'),
(238, 6, NULL, 'mecanismo de la ivabradina: el #6 no encaja y no hay otro en la biblioteca'),
(242, 38, NULL, 'cáncer de lengua: el #38 no encaja y no hay otro en la biblioteca'),
(250, 60, 35, 'disfagia orofaríngea: el #60 no encaja; #35 encaja en parte'),
(255, 2, NULL, 'cribado de diabetes gestacional (O''Sullivan): el #2 no encaja y no hay otro en la biblioteca'),
(256, 2, NULL, 'prevención de preeclampsia en una gestante de riesgo: el #2 no encaja y no hay otro en la biblioteca'),
(258, 2, NULL, 'restricción del crecimiento fetal a término: el #2 no encaja y no hay otro en la biblioteca'),
(260, 4, NULL, 'vacunas en una inmunodeficiencia combinada: el #4 no encaja y no hay otro en la biblioteca'),
(266, 69, 4, 'enfermedad de Kawasaki: el #69 no encaja; #4 encaja'),
(286, 13, 48, 'neuralgia del trigémino: el #13 no encaja; #48 encaja'),
(288, 7, NULL, 'intoxicación y ventilación mecánica: el #7 no encaja y no hay otro en la biblioteca'),
(290, 7, NULL, 'destete de la ventilación mecánica: el #7 no encaja y no hay otro en la biblioteca'),
(293, 28, NULL, 'fractura de muñeca estable: el #28 no encaja y no hay otro en la biblioteca'),
(300, 22, NULL, 'dolor agudo en una asmática con corticoides (rotura tendinosa / fractura): el #22 no encaja y no hay otro en la biblioteca'),
(302, 39, NULL, 'estratificación del riesgo del síncope: el #39 no encaja y no hay otro en la biblioteca'),
(320, 29, NULL, 'dolor lumbar con fiebre (espondilodiscitis / absceso): el #29 no encaja y no hay otro en la biblioteca'),
(327, 103, NULL, 'radioterapia en el cáncer de mama: el #103 no encaja y no hay otro en la biblioteca'),
(329, 9, NULL, 'hemofilia A tras trasplante hepático: el #9 no encaja y no hay otro en la biblioteca'),
(331, 19, NULL, 'complicaciones del paciente crítico en la UCI: el #19 no encaja y no hay otro en la biblioteca'),
(338, 63, 52, 'síndrome de Klinefelter: el #63 no encaja; #52 encaja'),
(339, 41, NULL, 'hiperprolactinemia: el #41 no encaja y no hay otro en la biblioteca'),
(343, 49, 104, 'carcinoma medular de tiroides (MEN 2): el #49 no encaja; #104 encaja'),
(373, 5, NULL, 'objetivos glucémicos con insulina: el #5 no encaja y no hay otro en la biblioteca'),
(377, 10, NULL, 'golpe de calor: el #10 no encaja y no hay otro en la biblioteca'),
(379, 7, NULL, 'intoxicación por humo (cianuro / CO): el #7 no encaja y no hay otro en la biblioteca'),
(383, 54, 104, 'MEN 1 (gastrinoma e hiperparatiroidismo): el #54 no encaja; #104 encaja'),
(392, 28, NULL, 'fractura de mandíbula: el #28 no encaja y no hay otro en la biblioteca'),
(393, 25, 56, 'carcinoma cutáneo en un agricultor: el #25 no encaja; #56 encaja'),
(396, 76, 48, 'hipertensión intracraneal idiopática (oscurecimientos visuales): el #76 no encaja; #48 encaja en parte'),
(397, 38, 90, 'schwannoma vestibular: el #38 no encaja; #90 encaja'),
(404, 24, 16, 'pólipo de vesícula: el #24 no encaja; #16 encaja en parte'),
(405, 87, NULL, 'dacriocitos en la mielofibrosis: el #87 no encaja y no hay otro en la biblioteca'),
(411, 32, 28, 'fractura de cadera: el #32 no encaja; #28 encaja'),
(413, 38, NULL, 'adenopatías cervicales bilaterales (linfoma / cáncer de cavum): el #38 no encaja y no hay otro en la biblioteca'),
(416, 5, NULL, 'alteraciones metabólicas de la diabetes: el #5 no encaja y no hay otro en la biblioteca'),
(417, 57, NULL, 'sistema renina-angiotensina en la deshidratación: el #57 no encaja y no hay otro en la biblioteca'),
(419, 1, NULL, 'anatomía del esófago y ecocardiografía transesofágica: el #1 no encaja y no hay otro en la biblioteca'),
(420, 8, NULL, 'distribución del flujo pulmonar: el #8 no encaja y no hay otro en la biblioteca'),
(421, 6, NULL, 'potencial de acción cardiaco: el #6 no encaja y no hay otro en la biblioteca'),
(422, 15, 40, 'síndrome X frágil (expansión de tripletes): el #15 no encaja; #40 encaja'),
(433, 23, NULL, 'tamaño muestral: el #23 no encaja y no hay otro en la biblioteca'),
(444, 38, NULL, 'cáncer de lengua: el #38 no encaja y no hay otro en la biblioteca'),
(458, 47, NULL, 'mastitis puerperal: el #47 no encaja y no hay otro en la biblioteca'),
(460, 2, NULL, 'CIR precoz con Doppler alterado: el #2 no encaja y no hay otro en la biblioteca'),
(461, 4, NULL, 'tos ferina: el #4 no encaja y no hay otro en la biblioteca'),
(463, 4, NULL, 'bronquiolitis aguda: el #4 no encaja y no hay otro en la biblioteca'),
(467, 11, NULL, 'test de Apgar: el #11 no encaja y no hay otro en la biblioteca'),
(469, 62, NULL, 'síndrome hemolítico urémico: el #62 no encaja y no hay otro en la biblioteca'),
(474, 33, 84, 'delirium en una paciente con Alzheimer: el #33 no encaja; #84 encaja'),
(482, 41, NULL, 'apoplejía hipofisaria: el #41 no encaja y no hay otro en la biblioteca'),
(484, 10, NULL, 'prevención del delirium en la UCI: el #10 no encaja y no hay otro en la biblioteca'),
(491, 28, 22, 'síndrome compartimental tras un yeso: el #28 no encaja; #22 encaja'),
(494, 11, NULL, 'fractura de clavícula obstétrica: el #11 no encaja y no hay otro en la biblioteca'),
(495, 74, 79, 'lumbociatalgia sin signos de alarma: el #74 no encaja; #79 encaja en parte'),
(506, 6, 10, 'taquicardia ventricular inestable: el #6 no encaja; #10 encaja en parte'),
(507, 11, 91, 'tetralogía de Fallot: el #11 no encaja; #91 encaja'),
(514, 46, 7, 'causas de hipoxemia (V/Q): el #46 no encaja; #7 encaja en parte'),
(519, 24, 16, 'tumor maligno de colédoco distal: el #24 no encaja; #16 encaja'),
(522, 24, NULL, 'cáncer de páncreas: el #24 no encaja y no hay otro en la biblioteca'),
(531, 10, NULL, 'debilidad aguda (botulismo / trastorno neuromuscular): el #10 no encaja y no hay otro en la biblioteca'),
(534, 29, NULL, 'torsión testicular: el #29 no encaja y no hay otro en la biblioteca'),
(536, 103, NULL, 'irradiación parcial de la mama: el #103 no encaja y no hay otro en la biblioteca'),
(546, 54, NULL, 'osteoporosis en un anciano: el #54 no encaja y no hay otro en la biblioteca'),
(549, 104, 47, 'yodo radiactivo en el cáncer de tiroides: el #104 no encaja; #47 encaja en parte'),
(563, 29, NULL, 'trombosis venosa profunda: el #29 no encaja y no hay otro en la biblioteca'),
(565, 42, 75, 'arteritis de Takayasu: el #42 no encaja; #75 encaja'),
(570, 33, NULL, 'cuidados paliativos y polifarmacia: el #33 no encaja y no hay otro en la biblioteca'),
(575, 8, NULL, 'índice tobillo-brazo: el #8 no encaja y no hay otro en la biblioteca'),
(579, 15, 84, 'diagnóstico diferencial del delirium: el #15 no encaja; #84 encaja'),
(582, 20, 105, 'síndrome de lisis tumoral: el #20 no encaja; #105 encaja'),
(587, 41, NULL, 'respuesta hormonal a la hipoglucemia: el #41 no encaja y no hay otro en la biblioteca'),
(588, 8, NULL, 'estratificación del riesgo en la embolia pulmonar: el #8 no encaja y no hay otro en la biblioteca'),
(597, 52, 40, 'síndrome de Lynch: el #52 no encaja; #40 encaja en parte'),
(599, 38, NULL, 'cáncer de hipofaringe/laringe: el #38 no encaja y no hay otro en la biblioteca'),
(601, 2, NULL, 'embarazo ectópico: el #2 no encaja y no hay otro en la biblioteca'),
(604, 50, NULL, 'escoliosis idiopática: el #50 no encaja y no hay otro en la biblioteca'),
(607, 32, 88, 'osteocondroma: el #32 no encaja; #88 encaja'),
(608, 6, 39, 'bloqueo auriculoventricular en el ECG: el #6 no encaja; #39 encaja'),
(618, 29, NULL, 'isquemia digital: el #29 no encaja y no hay otro en la biblioteca'),
(625, 33, NULL, 'cambios del envejecimiento: el #33 no encaja y no hay otro en la biblioteca'),
(626, 86, NULL, 'metabolismo del músculo liso: el #86 no encaja y no hay otro en la biblioteca'),
(627, 46, NULL, 'control químico de la respiración: el #46 no encaja y no hay otro en la biblioteca'),
(628, 38, NULL, 'cáncer de nasofaringe con afectación de pares craneales: el #38 no encaja y no hay otro en la biblioteca'),
(629, 55, NULL, 'anemia de Fanconi: el #55 no encaja y no hay otro en la biblioteca'),
(630, 52, 40, 'osteogénesis imperfecta (genética): el #52 no encaja; #40 encaja en parte'),
(632, 11, NULL, 'enfermedades autoinmunes neonatales por anticuerpos maternos: el #11 no encaja y no hay otro en la biblioteca'),
(640, 2, NULL, 'varicela en una gestante: el #2 no encaja y no hay otro en la biblioteca'),
(643, 3, NULL, 'fármacos que exigen ecocardiograma previo: el #3 no encaja y no hay otro en la biblioteca'),
(654, 2, NULL, 'discordancia biométrica en la ecografía de 22 semanas: el #2 no encaja y no hay otro en la biblioteca'),
(656, 2, NULL, 'transfusión feto-fetal: el #2 no encaja y no hay otro en la biblioteca'),
(657, 2, NULL, 'preeclampsia posparto: el #2 no encaja y no hay otro en la biblioteca'),
(659, 47, NULL, 'adyuvancia del cáncer de endometrio: el #47 no encaja y no hay otro en la biblioteca'),
(661, 13, NULL, 'síndrome de Guillain-Barré: el #13 no encaja y no hay otro en la biblioteca'),
(663, 4, NULL, 'contactos de tos ferina: el #4 no encaja y no hay otro en la biblioteca'),
(680, 10, NULL, 'escala APACHE II: el #10 no encaja y no hay otro en la biblioteca'),
(684, 13, NULL, 'neuropatía del peroneo en la UCI: el #13 no encaja y no hay otro en la biblioteca'),
(687, 32, NULL, 'gonartrosis: el #32 no encaja y no hay otro en la biblioteca'),
(692, 1, NULL, 'síncope en un joven deportista: el #1 no encaja y no hay otro en la biblioteca'),
(699, 11, 91, 'cardiopatía congénita ductus-dependiente: el #11 no encaja; #91 encaja'),
(701, 58, 22, 'síndrome de revascularización: el #58 no encaja; #22 encaja'),
(703, 46, NULL, 'inmunidad innata pulmonar: el #46 no encaja y no hay otro en la biblioteca'),
(725, 82, 41, 'SIADH: el #82 no encaja; #41 encaja'),
(730, 29, NULL, 'lesión peneana (fractura / priapismo): el #29 no encaja y no hay otro en la biblioteca'),
(738, 9, NULL, 'hemofilia A con inhibidor: el #9 no encaja y no hay otro en la biblioteca'),
(745, 33, NULL, 'criterios STOPP/START: el #33 no encaja y no hay otro en la biblioteca'),
(746, 5, NULL, 'estadios de la diabetes tipo 1: el #5 no encaja y no hay otro en la biblioteca'),
(747, 41, NULL, 'estudio de la hiperprolactinemia: el #41 no encaja y no hay otro en la biblioteca'),
(748, 52, NULL, 'cribado de diabetes gestacional en un paso: el #52 no encaja y no hay otro en la biblioteca'),
(759, 10, NULL, 'gastroenteritis grave en una anciana: el #10 no encaja y no hay otro en la biblioteca'),
(761, 59, NULL, 'histoplasmosis: el #59 no encaja y no hay otro en la biblioteca'),
(763, 16, 60, 'pancreatitis crónica: el #16 no encaja; #60 encaja en parte'),
(767, 42, 75, 'arteritis de células gigantes: el #42 no encaja; #75 encaja'),
(771, 10, NULL, 'debilidad adquirida en la UCI: el #10 no encaja y no hay otro en la biblioteca'),
(773, 22, NULL, 'lesiones por electricidad: el #22 no encaja y no hay otro en la biblioteca'),
(782, 58, NULL, 'embolia grasa: el #58 no encaja y no hay otro en la biblioteca'),
(785, 22, NULL, 'politraumatizado tras accidente de tráfico: el #22 no encaja y no hay otro en la biblioteca'),
(794, 13, NULL, 'dolor de codo (epicondilitis / atrapamiento radial): el #13 no encaja y no hay otro en la biblioteca'),
(796, 2, NULL, 'rotura prematura de membranas pretérmino: el #2 no encaja y no hay otro en la biblioteca'),
(798, 27, NULL, 'criterios de causalidad de Bradford Hill: el #27 no encaja y no hay otro en la biblioteca'),
(799, 17, 30, 'antiagregación tras un IAMSEST: el #17 no encaja; #30 encaja'),
(802, 32, 88, 'tumor óseo en un adolescente: el #32 no encaja; #88 encaja'),
(804, 58, NULL, 'riesgo quirúrgico en un aneurisma de aorta: el #58 no encaja y no hay otro en la biblioteca'),
(806, 24, 16, 'coledocolitiasis: el #24 no encaja; #16 encaja'),
(807, 9, 40, 'patrones de herencia en genealogías: el #9 no encaja; #40 encaja'),
(808, 83, NULL, 'mancha rojo cereza: el #83 no encaja y no hay otro en la biblioteca'),
(810, 25, NULL, 'lesiones en las manos de un adolescente: el #25 no encaja y no hay otro en la biblioteca'),
(824, 87, NULL, 'mielofibrosis / síndrome mieloproliferativo: el #87 no encaja y no hay otro en la biblioteca'),
(825, 6, 10, 'parada por fibrilación ventricular: el #6 no encaja; #10 encaja'),
(827, 23, NULL, 'falacia ecológica: el #23 no encaja y no hay otro en la biblioteca'),
(832, 45, NULL, 'aislamiento por gotas: el #45 no encaja y no hay otro en la biblioteca'),
(840, 69, 4, 'enfermedad de Kawasaki: el #69 no encaja; #4 encaja'),
(842, 4, NULL, 'vacunas vivas atenuadas: el #4 no encaja y no hay otro en la biblioteca'),
(845, 7, NULL, 'distrés respiratorio del prematuro: el #7 no encaja y no hay otro en la biblioteca'),
(846, 4, NULL, 'tratamiento de la bronquiolitis: el #4 no encaja y no hay otro en la biblioteca'),
(852, 2, NULL, 'rotura prematura de membranas a las 32 semanas: el #2 no encaja y no hay otro en la biblioteca'),
(853, 2, NULL, 'cribado de preeclampsia del primer trimestre: el #2 no encaja y no hay otro en la biblioteca'),
(854, 2, NULL, 'indicación de tocólisis: el #2 no encaja y no hay otro en la biblioteca'),
(865, 54, NULL, 'regulación intracelular del calcio: el #54 no encaja y no hay otro en la biblioteca'),
(867, 15, NULL, 'placa motora: el #15 no encaja y no hay otro en la biblioteca'),
(873, 22, NULL, 'quemaduras de espesor parcial profundo: el #22 no encaja y no hay otro en la biblioteca'),
(879, 8, NULL, 'embolia y trombosis de miembros inferiores: el #8 no encaja y no hay otro en la biblioteca'),
(889, 28, NULL, 'fractura de Monteggia: el #28 no encaja y no hay otro en la biblioteca'),
(892, 24, NULL, 'complicaciones de la duodenopancreatectomía: el #24 no encaja y no hay otro en la biblioteca'),
(893, 22, NULL, 'cirugía de control de daños: el #22 no encaja y no hay otro en la biblioteca'),
(899, 38, NULL, 'papiloma invertido de senos paranasales: el #38 no encaja y no hay otro en la biblioteca'),
(901, 11, NULL, 'síndrome de Beckwith-Wiedemann: el #11 no encaja y no hay otro en la biblioteca'),
(913, 6, NULL, 'indicaciones de DAI: el #6 no encaja y no hay otro en la biblioteca'),
(914, 17, 6, 'anticoagulantes orales directos: el #17 no encaja; #6 encaja'),
(916, 6, NULL, 'estudio del síncope: el #6 no encaja y no hay otro en la biblioteca'),
(920, 10, NULL, 'taponamiento cardiaco: el #10 no encaja y no hay otro en la biblioteca'),
(921, 3, NULL, 'miocardiopatía hipertrófica: el #3 no encaja y no hay otro en la biblioteca'),
(934, 10, 20, 'necrosis tubular aguda: el #10 no encaja; #20 encaja'),
(941, 16, 60, 'insuficiencia pancreática exocrina: el #16 no encaja; #60 encaja'),
(943, 33, NULL, 'músculos de la marcha y ayudas técnicas: el #33 no encaja y no hay otro en la biblioteca'),
(945, 35, NULL, 'esófago de Barrett: el #35 no encaja y no hay otro en la biblioteca'),
(946, 35, NULL, 'esofagitis erosiva: el #35 no encaja y no hay otro en la biblioteca'),
(953, 8, NULL, 'definición de hipertensión pulmonar: el #8 no encaja y no hay otro en la biblioteca'),
(967, 24, NULL, 'isquemia intestinal por vólvulo: el #24 no encaja y no hay otro en la biblioteca'),
(968, 11, NULL, 'síndrome de Beckwith-Wiedemann: el #11 no encaja y no hay otro en la biblioteca'),
(970, 19, 93, 'agammaglobulinemia de Bruton: el #19 no encaja; #93 encaja'),
(972, 9, NULL, 'hemartros en un lactante (hemofilia): el #9 no encaja y no hay otro en la biblioteca'),
(973, 20, NULL, 'indicaciones de la exanguinotransfusión: el #20 no encaja y no hay otro en la biblioteca'),
(981, 104, 66, 'incidentaloma suprarrenal: el #104 no encaja; #66 encaja'),
(983, 5, NULL, 'tiempo en rango en el embarazo: el #5 no encaja y no hay otro en la biblioteca'),
(984, 5, NULL, 'cribado de diabetes tipo 1 en familiares: el #5 no encaja y no hay otro en la biblioteca'),
(987, 97, NULL, 'marcador de función renal (creatinina): el #97 no encaja y no hay otro en la biblioteca'),
(988, 2, NULL, 'definición de preeclampsia: el #2 no encaja y no hay otro en la biblioteca'),
(992, 10, 3, 'insuficiencia cardiaca descompensada: el #10 no encaja; #3 encaja'),
(993, 22, NULL, 'evaluación primaria del politrauma (ABCDE): el #22 no encaja y no hay otro en la biblioteca'),
(994, 22, NULL, 'traumatismo craneal y cervical en un anciano: el #22 no encaja y no hay otro en la biblioteca'),
(997, 9, NULL, 'trombosis venosa profunda: el #9 no encaja y no hay otro en la biblioteca'),
(1003, 31, NULL, 'tratamiento de la espasticidad: el #31 no encaja y no hay otro en la biblioteca'),
(1004, 76, 48, 'hipertensión intracraneal idiopática: el #76 no encaja; #48 encaja en parte');

DO $$
DECLARE n int; mal int; alt int; sin int; resto int;
BEGIN
  SELECT count(*) INTO n FROM video_exclusiones;
  IF n <> 229 THEN RAISE EXCEPTION 'exclusiones % de 229', n; END IF;
  -- Cada exclusión apunta al vídeo que la pregunta muestra hoy.
  SELECT count(*) INTO mal FROM video_exclusiones e JOIN antes a USING (pregunta_id)
   WHERE a.video_id IS DISTINCT FROM e.video_excluido_id;
  IF mal <> 0 THEN RAISE EXCEPTION '% exclusiones no coinciden con el vídeo actual', mal; END IF;
  SELECT count(*) INTO alt FROM video_exclusiones e JOIN pregunta_video pv USING (pregunta_id)
   WHERE e.video_alternativo_id IS NOT NULL AND pv.video_id = e.video_alternativo_id;
  SELECT count(*) INTO sin FROM video_exclusiones e JOIN pregunta_video pv USING (pregunta_id)
   WHERE e.video_alternativo_id IS NULL AND pv.video_id IS NULL;
  IF alt <> 59 OR sin <> 170 THEN RAISE EXCEPTION 'alternativos % de 59, sin vídeo % de 170', alt, sin; END IF;
  -- El resto de preguntas, exactamente igual que antes.
  SELECT count(*) INTO resto FROM antes a JOIN pregunta_video pv USING (pregunta_id)
   WHERE a.pregunta_id NOT IN (SELECT pregunta_id FROM video_exclusiones) AND a.video_id IS DISTINCT FROM pv.video_id;
  IF resto <> 0 THEN RAISE EXCEPTION '% preguntas sin exclusión cambian de vídeo', resto; END IF;
  RAISE NOTICE 'exclusiones %, con alternativo %, sin vídeo %, resto sin cambios', n, alt, sin;
END $$;
COMMIT;
