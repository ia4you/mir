-- Anuladas (revisión 2026-10): 5 explicaciones -> se quitan las notas internas; correcta y explicacion_calidad no cambian.
-- Guarda md5 por fila sobre el texto anterior; si no cuadran 5 actualizadas = 5 en el historial, ROLLBACK de todo.
BEGIN;
CREATE TEMP TABLE tc (id int, antes_md5 text, despues text) ON COMMIT DROP;
INSERT INTO tc VALUES
(452, '9be1d7f85f4dd49650ca2c1149560469', 'La respuesta correcta es A) Mujer de 32 años con estudio ecográfico normal, episodios de dismenorrea grave y esterilidad primaria. La combinación de dismenorrea grave, esterilidad y un estudio ecográfico normal orienta hacia una causa extrauterina, típicamente endometriosis peritoneal, que no se diagnostica mediante histeroscopia (una técnica que solo explora la cavidad uterina) sino mediante laparoscopia; por ello, la histeroscopia diagnóstica no está indicada como primera línea de estudio en este caso. En cambio, la hemorragia uterina anormal cíclica en una mujer de 45 años (opción C), la metrorragia postmenopáusica (B) y la sospecha ecográfica de mioma submucoso tipo 2 de la FIGO (D) sí son indicaciones reconocidas de histeroscopia diagnóstica de primera línea, al explorar directamente posible patología intracavitaria.'),
(456, 'de6aa03f02659fe600b33b633ee18aa5', 'Esta pregunta fue anulada. La opción guardada (A) no es la que recomiendan las guías: en una gestante con un parto prematuro previo y una longitud cervical de 28 mm en el segundo trimestre, la intervención con más evidencia para prevenir la recurrencia es la progesterona natural micronizada por vía vaginal (B). El reposo, los antibióticos y el nifedipino (A) no han demostrado prevenir el parto prematuro. El cerclaje (C) se plantea con antecedente de parto prematuro si el cuello mide menos de 25 mm, o ante una historia de insuficiencia cervical. El pesario (D) tiene una evidencia menos consistente.'),
(501, '6b61a510096f27ae9f08666a20d1aeb9', 'Esta pregunta fue ANULADA OFICIALMENTE por el tribunal del examen MIR. Ninguna de las 4 opciones es correcta tal como está formulada:

A) "El tratamiento del síncope reflejo es fundamentalmente farmacológico" — FALSA. El tratamiento del síncope reflejo es fundamentalmente NO farmacológico (educación del paciente, evitar desencadenantes, maniobras de contrapresión física); el tratamiento farmacológico tiene eficacia limitada y no es la base del manejo.

B) "La estimulación con marcapasos en el síncope recurrente asociado a un mecanismo hipotensor ha demostrado ser eficaz" — IMPRECISA. El marcapasos solo ha demostrado utilidad en el síncope reflejo de mecanismo CARDIOINHIBIDOR (asistolia documentada), no en el mecanismo hipotensor/vasodepresor que menciona esta opción, donde no ha demostrado eficacia.

C) "Los fármacos betabloqueantes reducen la mortalidad de los síncopes reflejos" — FALSA. Los betabloqueantes no han demostrado reducir la mortalidad del síncope reflejo y no están recomendados en su tratamiento.

D) "Las contracciones musculares isotónicas son útiles en pacientes jóvenes con síncope reflejo y pródromos" — CONTIENE UNA ERRATA DEL ENUNCIADO ORIGINAL. Las maniobras de contrapresión realmente útiles en el síncope reflejo con pródromos son las contracciones ISOMÉTRICAS (no isotónicas); el enunciado original del examen contenía este error.'),
(566, '829904445ee217d0f5cd83c2128967f6', 'La respuesta correcta es B) Si se logra la remisión, el único tratamiento curativo es el trasplante autólogo de células madre hematopoyéticas — esta es la afirmación INCORRECTA que pedía el enunciado. En primer lugar, el trasplante que se emplea con intención curativa en la linfohistiocitosis hemofagocítica (HLH) refractaria o recidivante es el ALOGÉNICO, no el autólogo: reinfundir las propias células madre del paciente no corregiría la disfunción inmunológica subyacente que causa la activación macrofágica descontrolada. Además, en este caso concreto —un síndrome de activación macrofágica secundario a una infección aguda por virus de Epstein-Barr en una paciente adulta, es decir, una forma adquirida/reactiva y no una HLH primaria de base genética— la remisión suele alcanzarse con tratamiento inmunosupresor e inmunomodulador (etopósido e inmunoglobulina intravenosa, protocolo HLH-94/2004) sin necesidad de trasplante alguno, por lo que calificar el trasplante autólogo como "el único tratamiento curativo" es doblemente incorrecto. Las demás opciones son correctas: el SAM puede asociarse a síndromes linfoproliferativos ligados al X como el XLP-2 (A); existe una activación mantenida de linfocitos CD8+ y macrófagos como mecanismo fisiopatológico central (C); y los anticuerpos monoclonales anti-IL6 (tocilizumab) y anti-TNF se han empleado como coadyuvantes en casos refractarios (D), aunque el tratamiento de primera línea estándar siga siendo etopósido + inmunoglobulina intravenosa.'),
(778, '92466f50fd4873ebe8f064e2d48550a0', 'Esta pregunta fue ANULADA POR AMBIGÜEDAD en la convocatoria original (MIR 2025, pregunta 186) y no se muestra por ese motivo.');
CREATE TEMP TABLE h0 ON COMMIT DROP AS SELECT count(*) n FROM explicaciones_historial;
SET LOCAL mir.motivo = 'Anuladas: quitar notas internas 2026-10';
DO $$ DECLARE n int; h int; BEGIN
  WITH u AS (UPDATE preguntas p SET explicacion = tc.despues
    FROM tc WHERE p.id = tc.id AND p.anulada AND md5(p.explicacion) = tc.antes_md5 RETURNING 1)
  SELECT count(*) INTO n FROM u;
  SELECT (SELECT count(*) FROM explicaciones_historial) - h0.n INTO h FROM h0;
  IF n <> 5 OR h <> 5 THEN RAISE EXCEPTION 'actualizadas %, historial +% (esperado 5): ROLLBACK de todo', n, h; END IF;
  RAISE NOTICE 'actualizadas %, historial +%', n, h;
END $$;
COMMIT;
