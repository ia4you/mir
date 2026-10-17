-- Contadores de /temas tras especialidades-mal-asignadas.sql: 10 temas a su número real de preguntas oficiales.
-- Cada fila exige el número anterior y que el nuevo coincida con el recuento real; si no son 10, ROLLBACK de todo.
BEGIN;
CREATE TEMP TABLE c (slug text, antes int, despues int) ON COMMIT DROP;
INSERT INTO c VALUES
('amenorrea-fallo-ovarico-y-trastornos-del-eje-hipotalamo-hipofisis-ovario', 6, 5),
('complicaciones-cronicas-de-la-diabetes', 7, 6),
('enfermedad-renal-cronica-y-manejo-terapeutico', 9, 7),
('farmacologia-oncologica', 15, 16),
('fracaso-renal-agudo-causas-y-manejo', 9, 8),
('fracturas-y-traumatismos-agudos', 7, 8),
('insuficiencia-cardiaca', 13, 12),
('insuficiencia-respiratoria-aguda-y-sdra', 11, 12),
('patologia-obstetrica-y-complicaciones-del-embarazo', 16, 18),
('urgencias-urologicas-y-vasculares-perifericas', 7, 9);

DO $$
DECLARE n int;
BEGIN
  UPDATE temas t SET num_preguntas = c.despues
  FROM c
  WHERE t.slug = c.slug AND t.num_preguntas = c.antes
    AND c.despues = (SELECT count(*) FROM preguntas p WHERE p.tema = t.tema AND p.origen = 'oficial');
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 10 THEN RAISE EXCEPTION 'actualizados % de 10', n; END IF;
  RAISE NOTICE 'actualizados %', n;
END $$;

-- Los 101 deben coincidir con el recuento real (0 filas).
SELECT t.slug, t.num_preguntas, count(p.id) AS real
FROM temas t LEFT JOIN preguntas p ON p.tema = t.tema AND p.origen = 'oficial'
GROUP BY t.slug, t.num_preguntas HAVING t.num_preguntas <> count(p.id);
COMMIT;
