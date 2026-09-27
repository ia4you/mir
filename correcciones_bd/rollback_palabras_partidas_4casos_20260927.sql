-- Rollback de los 4 casos del 2026-09-27 (326, 567, 593, 608)
BEGIN;

DO $$
DECLARE n int;
BEGIN
  UPDATE preguntas SET pregunta = 'Paciente con diagnóstico de glioblastoma multiforme. El informe de anatomía patológica refiere la presencia de metilación del promotor del gen MGMT (metil guanina metil transferasa). Con respecto al tratamiento de este paciente:' WHERE id = 326;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'rollback id 326 campo pregunta: % filas afectadas', n; END IF;

  UPDATE preguntas SET opcion_c = 'Rifampicina, bedaquilina y p roteonamida durante 12 meses.' WHERE id = 567;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'rollback id 567 campo opcion_c: % filas afectadas', n; END IF;

  UPDATE preguntas SET pregunta = 'Mujer de 67 años exfumadora con antecedentes de hipertensión arterial, diabetes mellitus tipo 2 de 10 años de evolución con microalbuminuria y obesidad es enviada a su consulta. Aporta un análisis con una hemo globlina glicada de 10 %, colesterol total de 210 mg/dL, colesterol LDL no calculable, colesterol HDL de 30 mg/dL y unos triglicéridos de 496 mg/dL. Función renal normal. Respecto a la hipertrigliceridemia, señale la respuesta correcta:' WHERE id = 593;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'rollback id 593 campo pregunta: % filas afectadas', n; END IF;

  UPDATE preguntas SET opcion_b = 'Bloqueo aurículo ventricular (AV) de primer grado.' WHERE id = 608;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'rollback id 608 campo opcion_b: % filas afectadas', n; END IF;

END $$;

COMMIT;
