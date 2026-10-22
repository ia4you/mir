-- Cuerpo de la reversión de 2017 (sin BEGIN/COMMIT). Lo usan revertir.sh y aplicar.sh --dry-run.
DO $$ DECLARE d int; BEGIN
  SELECT (SELECT count(*) FROM respuestas_sesion WHERE pregunta_id IN (SELECT id FROM preguntas WHERE "año"=2017))
       + (SELECT count(*) FROM repaso_espaciado WHERE pregunta_id IN (SELECT id FROM preguntas WHERE "año"=2017))
       + (SELECT count(*) FROM video_exclusiones WHERE pregunta_id IN (SELECT id FROM preguntas WHERE "año"=2017))
       + (SELECT count(*) FROM explicaciones_historial WHERE pregunta_id IN (SELECT id FROM preguntas WHERE "año"=2017)) INTO d;
  IF d > 0 THEN RAISE EXCEPTION 'Hay % filas de usuarios/historial ligadas a 2017: no se borra. Alternativa: UPDATE preguntas SET anulada=true WHERE "año"=2017', d; END IF;
END $$;
DELETE FROM preguntas WHERE "año"=2017 AND origen='oficial';
DO $$ BEGIN IF (SELECT count(*) FROM preguntas WHERE "año"=2017) <> 0 THEN RAISE EXCEPTION 'Quedan filas de 2017'; END IF; END $$;
