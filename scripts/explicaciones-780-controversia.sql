-- 780 (revisión 2026-10): explicación nueva que descarta todas las opciones. Conserva la marca 'controversia'.
BEGIN;
CREATE TEMP TABLE h0 ON COMMIT DROP AS SELECT count(*) n FROM explicaciones_historial;
SET LOCAL mir.motivo = 'Endocrinología 780 2026-10';
DO $$ DECLARE n int; h int; BEGIN
  UPDATE preguntas SET explicacion = 'La respuesta correcta es D) Pioglitazona. Las glitazonas aumentan el peso, por retención de líquidos y por aumento del tejido adiposo subcutáneo, así que conviene evitarlas en pacientes con diabetes y obesidad. La metformina (A) tiene un efecto neutro sobre el peso o lo reduce ligeramente, y es el tratamiento de primera línea. La sitagliptina (B), como los demás inhibidores de la DPP-4, tiene un efecto neutro sobre el peso. La semaglutida (C), un agonista del receptor de GLP-1, produce una pérdida de peso importante y está especialmente indicada en estos pacientes.'
    WHERE id = 780 AND md5(explicacion) = 'fb795192c106e97b2e16f62d15cd29f4' AND explicacion_calidad = 'controversia';
  GET DIAGNOSTICS n = ROW_COUNT;
  SELECT (SELECT count(*) FROM explicaciones_historial) - h0.n INTO h FROM h0;
  IF n <> 1 OR h <> 1 THEN RAISE EXCEPTION 'actualizadas %, historial +% (esperado 1): ROLLBACK', n, h; END IF;
  RAISE NOTICE 'actualizadas %, historial +%', n, h;
END $$;
COMMIT;
