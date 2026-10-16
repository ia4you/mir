-- 882 (revisión 2026-10): explicación nueva que descarta todas las opciones. Conserva la marca 'controversia'.
BEGIN;
CREATE TEMP TABLE h0 ON COMMIT DROP AS SELECT count(*) n FROM explicaciones_historial;
SET LOCAL mir.motivo = 'Oncología 882 2026-10';
DO $$ DECLARE n int; h int; BEGIN
  UPDATE preguntas SET explicacion = 'La respuesta correcta es D) Antiandrógenos inicialmente junto a análogos de LHRH y enzalutamida (nuevos antiandrógenos) y docetaxel. Es un cáncer de próstata metastásico hormonosensible de alto volumen, con más de 8 metástasis óseas en el esqueleto axial y metástasis viscerales hepáticas, en un paciente de 57 años sin comorbilidades. El tratamiento indicado es sistémico e intensificado: privación androgénica con análogos de la LHRH, un antiandrógeno de nueva generación y docetaxel. El antiandrógeno clásico al principio sirve para evitar el brote de testosterona que producen los análogos de la LHRH en las primeras semanas. La prostatectomía radical con resección de las metástasis (A) no está indicada en la enfermedad metastásica. La radioterapia de la próstata solo aporta beneficio en la enfermedad de bajo volumen, y la radioterapia estereotáxica de las metástasis se reserva para pacientes oligometastásicos (B). La braquiterapia (C) es un tratamiento de la enfermedad localizada.'
    WHERE id = 882 AND md5(explicacion) = '6171d6c3427e480f4cdbfa573157e23b' AND explicacion_calidad = 'controversia';
  GET DIAGNOSTICS n = ROW_COUNT;
  SELECT (SELECT count(*) FROM explicaciones_historial) - h0.n INTO h FROM h0;
  IF n <> 1 OR h <> 1 THEN RAISE EXCEPTION 'actualizadas %, historial +% (esperado 1): ROLLBACK', n, h; END IF;
  RAISE NOTICE 'actualizadas %, historial +%', n, h;
END $$;
COMMIT;
