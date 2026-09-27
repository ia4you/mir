-- 4 casos de palabras partidas que requerian ademas corregir una errata de
-- letra o decidir como unir un compuesto (326, 567, 593, 608), aprobados por
-- el usuario tras revisar el contexto completo. Log: log_palabras_partidas_4casos_20260927.csv
BEGIN;

DO $$
DECLARE n int;
BEGIN
  UPDATE preguntas SET pregunta = replace(pregunta, 'metil guanina', 'metilguanina') WHERE id = 326;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 326 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'metil transferasa', 'metiltransferasa') WHERE id = 326;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 326 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_c = replace(opcion_c, 'p roteonamida', 'protionamida') WHERE id = 567;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 567 campo opcion_c: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET pregunta = replace(pregunta, 'hemo globlina', 'hemoglobina') WHERE id = 593;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 593 campo pregunta: % filas afectadas (se esperaba 1)', n; END IF;

  UPDATE preguntas SET opcion_b = replace(opcion_b, 'aurículo ventricular', 'auriculoventricular') WHERE id = 608;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'id 608 campo opcion_b: % filas afectadas (se esperaba 1)', n; END IF;

END $$;

COMMIT;
