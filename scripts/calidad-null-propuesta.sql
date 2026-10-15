-- Aprobado el 15-10-2026: explicación de la 1101, retoque de la 1075 y marca de
-- calidad de las 44 oficiales con explicacion_calidad NULL, más 979 y 538
-- (sin_imagen → verificada). Cada paso comprueba cuántas filas toca y, si no
-- es lo esperado, aborta la transacción entera.
BEGIN;

DO $do$
DECLARE n int;
BEGIN
  -- 1101: no tenía explicación.
  UPDATE preguntas
  SET explicacion = $exp$La respuesta correcta es B) Eventración abdominal. La TC muestra asas intestinales que protruyen a través de un defecto de la pared abdominal anterior y quedan alojadas en el tejido subcutáneo, en una paciente con una laparotomía previa (pancreatectomía distal) y varios factores de riesgo de eventración: obesidad, diabetes, tabaquismo y EPOC, que aumenta la presión abdominal con la tos. El dolor abdominal, la distensión, los vómitos y el estreñimiento corresponden a una obstrucción intestinal por la eventración. Ni el enunciado ni la imagen orientan a una neoplasia de colon (A), a una perforación de víscera hueca, que se manifestaría con neumoperitoneo libre (C), ni a una isquemia mesentérica (D).$exp$,
      explicacion_calidad = 'verificada'
  WHERE id = 1101 AND explicacion IS NULL AND explicacion_calidad IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; IF n <> 1 THEN RAISE EXCEPTION '1101: % filas (esperaba 1)', n; END IF;

  -- 1075: "dolor neuropático oncológico" → "dolor neuropático"; queda verificada.
  UPDATE preguntas
  SET explicacion = replace(explicacion, 'en dolor neuropático oncológico', 'en dolor neuropático'),
      explicacion_calidad = 'verificada'
  WHERE id = 1075 AND explicacion_calidad IS NULL AND explicacion LIKE '%en dolor neuropático oncológico%';
  GET DIAGNOSTICS n = ROW_COUNT; IF n <> 1 THEN RAISE EXCEPTION '1075: % filas (esperaba 1)', n; END IF;

  -- 1087: CPAP en un paciente hipotenso; explicación coherente pero discutible.
  UPDATE preguntas SET explicacion_calidad = 'orientativa' WHERE id = 1087 AND explicacion_calidad IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; IF n <> 1 THEN RAISE EXCEPTION '1087: % filas (esperaba 1)', n; END IF;

  -- Explicación coherente con la respuesta oficial y sin dudas.
  UPDATE preguntas SET explicacion_calidad = 'verificada'
  WHERE id IN (1072, 1073, 1074, 1076, 1077, 1078, 1079, 1080, 1081, 1082, 1083, 1084, 1085, 1086,
               1088, 1089, 1090, 1091, 1092, 1093, 1094, 1095, 1096, 1097, 1098, 1099, 1100,
               1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109, 1110, 1111, 1112, 1113, 1114, 1115)
    AND explicacion_calidad IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT; IF n <> 41 THEN RAISE EXCEPTION 'verificadas: % filas (esperaba 41)', n; END IF;

  -- 979 y 538: no citan imagen y tienen explicación correcta.
  UPDATE preguntas SET explicacion_calidad = 'verificada' WHERE id IN (979, 538) AND explicacion_calidad = 'sin_imagen';
  GET DIAGNOSTICS n = ROW_COUNT; IF n <> 2 THEN RAISE EXCEPTION '979/538: % filas (esperaba 2)', n; END IF;
END
$do$;

-- Comprobaciones: deben dar 0 y 0.
SELECT count(*) AS oficiales_sin_marca FROM preguntas WHERE origen = 'oficial' AND explicacion_calidad IS NULL;
SELECT count(*) AS sin_imagen FROM preguntas WHERE explicacion_calidad = 'sin_imagen';

COMMIT;
