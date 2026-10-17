-- Especialidad o tema mal asignados (revisión 2026-10): 17 preguntas a la especialidad y el tema donde
-- están sus gemelas (la 1112 solo cambia de tema; la 580 se queda igual). No toca explicacion ni correcta.
-- Cada fila exige la especialidad y el tema actuales; si no cuadran 17 actualizadas, ROLLBACK de todo.
BEGIN;
CREATE TEMP TABLE m (id int, esp_antes text, tema_antes text, esp text, tema text) ON COMMIT DROP;
INSERT INTO m VALUES
(293, 'Cardiología', 'Insuficiencia cardíaca', 'Traumatología', 'Fracturas y traumatismos agudos'),
(819, 'Endocrinología', 'Diabetes mellitus', 'Dermatología', 'Otros/Miscelánea'),
(860, 'Ginecología', 'Amenorrea, fallo ovárico y trastornos del eje hipotálamo-hipófisis-ovario', 'Psiquiatría', 'Trastornos de la conducta alimentaria'),
(845, 'Ginecología', 'Patología obstétrica y complicaciones del embarazo — sangrado en gestante, prematuridad, crecimiento fetal', 'Respiratorio', 'Insuficiencia respiratoria aguda y SDRA'),
(1112, 'Bioestadística', NULL, 'Bioestadística', 'Otros/Miscelánea'),
(830, 'Ginecología', 'Otros/Miscelánea', 'Bioestadística', 'Otros/Miscelánea'),
(656, 'Urgencias', 'Urgencias en poblaciones especiales', 'Ginecología', 'Patología obstétrica y complicaciones del embarazo — sangrado en gestante, prematuridad, crecimiento fetal'),
(657, 'Urgencias', 'Urgencias en poblaciones especiales', 'Ginecología', 'Patología obstétrica y complicaciones del embarazo — sangrado en gestante, prematuridad, crecimiento fetal'),
(662, 'Urgencias', 'Urgencias en poblaciones especiales', 'Pediatría', 'Urgencias pediátricas, maltrato y muerte súbita del lactante'),
(616, 'Endocrinología', 'Complicaciones crónicas de la diabetes', 'Urgencias', 'Urgencias urológicas y vasculares periféricas'),
(884, 'Endocrinología', 'Otros/Miscelánea', 'Ginecología', 'Suelo pélvico y uroginecología — incontinencia, prolapso, atrofia'),
(408, 'Nefrología', 'Fracaso renal agudo: causas y manejo', 'Urgencias', 'Urgencias urológicas y vasculares periféricas'),
(909, 'Nefrología', 'Enfermedad renal crónica y manejo terapéutico', 'Endocrinología', 'Diabetes mellitus'),
(926, 'Nefrología', 'Enfermedad renal crónica y manejo terapéutico', 'Oncología', 'Farmacología oncológica'),
(988, 'Nefrología', 'Otros/Miscelánea', 'Ginecología', 'Patología obstétrica y complicaciones del embarazo — sangrado en gestante, prematuridad, crecimiento fetal'),
(316, 'Reumatología', 'Otros/Miscelánea', 'Hematología', 'Otros/Miscelánea'),
(642, 'Reumatología', 'Otros/Miscelánea', 'Dermatología', 'Fotodermatosis y reacciones a agentes externos');

DO $$
DECLARE n int;
BEGIN
  UPDATE preguntas p SET especialidad = m.esp, tema = m.tema
  FROM m
  WHERE p.id = m.id AND p.especialidad = m.esp_antes AND p.tema IS NOT DISTINCT FROM m.tema_antes;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 17 THEN RAISE EXCEPTION 'actualizadas % de 17', n; END IF;
  RAISE NOTICE 'actualizadas %', n;
END $$;

SELECT p.id, p.especialidad, p.tema FROM preguntas p JOIN m USING (id) ORDER BY p.id;
COMMIT;
