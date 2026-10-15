-- Historial de explicaciones (revisión 2026-10). Aprobado el 2026-10-15.
-- Cualquier UPDATE que cambie explicacion o explicacion_calidad guarda antes la
-- versión anterior. El motivo se pasa con:  SET LOCAL mir.motivo = '...';
-- Uso:  psql -v ON_ERROR_STOP=1 -f scripts/explicaciones-historial.sql
BEGIN;

CREATE TABLE explicaciones_historial (
  id                  serial PRIMARY KEY,
  pregunta_id         integer NOT NULL REFERENCES preguntas(id),
  explicacion         text,
  explicacion_calidad text,
  guardado_en         timestamp NOT NULL DEFAULT now(),
  motivo              text NOT NULL
);
CREATE INDEX explicaciones_historial_pregunta ON explicaciones_historial (pregunta_id, guardado_en DESC);

CREATE FUNCTION guardar_explicacion_anterior() RETURNS trigger AS $$
BEGIN
  IF NEW.explicacion IS DISTINCT FROM OLD.explicacion
     OR NEW.explicacion_calidad IS DISTINCT FROM OLD.explicacion_calidad THEN
    INSERT INTO explicaciones_historial (pregunta_id, explicacion, explicacion_calidad, motivo)
    VALUES (OLD.id, OLD.explicacion, OLD.explicacion_calidad,
            coalesce(nullif(current_setting('mir.motivo', true), ''), 'sin motivo'));
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER preguntas_explicacion_historial
  BEFORE UPDATE OF explicacion, explicacion_calidad ON preguntas
  FOR EACH ROW EXECUTE FUNCTION guardar_explicacion_anterior();

-- Copia inicial de todas las oficiales
INSERT INTO explicaciones_historial (pregunta_id, explicacion, explicacion_calidad, motivo)
SELECT id, explicacion, explicacion_calidad, 'copia inicial antes de la revisión 2026-10'
FROM preguntas WHERE origen = 'oficial';

-- Comprobación: copiadas = oficiales; si no cuadra, aborta
DO $$
DECLARE copiadas int; oficiales int;
BEGIN
  SELECT count(*) INTO copiadas FROM explicaciones_historial;
  SELECT count(*) INTO oficiales FROM preguntas WHERE origen = 'oficial';
  IF copiadas <> oficiales THEN
    RAISE EXCEPTION 'copiadas % <> oficiales %', copiadas, oficiales;
  END IF;
  RAISE NOTICE 'copiadas % = oficiales %', copiadas, oficiales;
END $$;

COMMIT;
