-- 291 (revisión 2026-10): explicación nueva; pasa a la marca 'controversia' (pregunta discutible: cuadro de raíz L4).
BEGIN;
CREATE TEMP TABLE h0 ON COMMIT DROP AS SELECT count(*) n FROM explicaciones_historial;
SET LOCAL mir.motivo = 'Traumatología 291 controversia 2026-10';
DO $$ DECLARE n int; h int; BEGIN
  UPDATE preguntas SET explicacion = 'La respuesta correcta es C) Hernia discal L4-L5 derecha. Un dolor lumbar tras un esfuerzo con irradiación radicular y Lasègue positivo indica una hernia discal. Una hernia L4-L5 foraminal o extraforaminal comprime la raíz L4, la que sale por ese nivel, y produce dolor en la cara anterior del muslo y la rodilla con reflejo rotuliano disminuido. La dificultad para caminar de talones refleja debilidad de la flexión dorsal del pie, que depende de L4 y L5, y puede indicar que también está afectada la raíz L5. Aun así, el cuadro es el típico de la raíz L4, que en la hernia posterolateral habitual corresponde al nivel L3-L4 (B); por eso la pregunta es discutible. Una hernia L2-L3 (A) afectaría a la raíz L3, con dolor en el muslo y debilidad del cuádriceps, pero sin afectación de la flexión dorsal del pie. Una hernia L5-S1 (D) afectaría a la raíz S1, con dolor en la cara posterior de la pierna, reflejo aquíleo abolido y dificultad para caminar de puntillas.', explicacion_calidad = 'controversia'
    WHERE id = 291 AND md5(explicacion) = '052d65cc7171b5b780ee2f51cf23fd99' AND explicacion_calidad = 'orientativa';
  GET DIAGNOSTICS n = ROW_COUNT;
  SELECT (SELECT count(*) FROM explicaciones_historial) - h0.n INTO h FROM h0;
  IF n <> 1 OR h <> 1 THEN RAISE EXCEPTION 'actualizadas %, historial +% (esperado 1): ROLLBACK', n, h; END IF;
  RAISE NOTICE 'actualizadas %, historial +%', n, h;
END $$;
COMMIT;
