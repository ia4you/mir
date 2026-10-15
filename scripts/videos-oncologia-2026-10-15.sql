-- Vídeos de Oncología elegidos el 15-10-2026 (un vídeo por tema). Datos de la
-- caché de recoger-videos.mjs del 13-10; la comprobación semanal los refresca.
-- Dos de ellos ya estaban en `videos` por otra especialidad: solo se añade su
-- fila en video_temas. Cada paso comprueba cuántas filas toca y, si no es lo
-- esperado, aborta la transacción entera. Para probar en seco: cambiar el
-- COMMIT final por ROLLBACK.
BEGIN;

DO $do$
DECLARE n int;
BEGIN
  -- Los 5 pares especialidad + tema existen tal cual en preguntas válidas.
  SELECT count(*) INTO n FROM (VALUES
    ('Urgencias oncológicas'), ('Tumores endocrinos'), ('Radioterapia y biología tumoral'),
    ('Tumores óseos y de partes blandas'), ('Tumores de cabeza y cuello')) t(tema)
  WHERE EXISTS (SELECT 1 FROM preguntas p WHERE p.especialidad = 'Oncología' AND p.tema = t.tema
                AND p.origen = 'oficial' AND p.anulada = false);
  IF n <> 5 THEN RAISE EXCEPTION 'pares especialidad+tema encontrados: % (esperaba 5)', n; END IF;

  -- Ningún tema de Oncología tiene ya vídeo principal.
  SELECT count(*) INTO n FROM video_temas WHERE especialidad = 'Oncología';
  IF n <> 0 THEN RAISE EXCEPTION 'Oncología ya tiene % filas en video_temas', n; END IF;

  -- 3 vídeos nuevos (canal MIR Asturias).
  INSERT INTO videos (youtube_id, canal_id, titulo, fecha_publicacion, duracion_seg, ultima_comprobacion, anadido_por)
  SELECT v.youtube_id, c.id, v.titulo, v.fecha::date, v.duracion, '2026-10-13', 'oncologia-2026-10-15'
  FROM (VALUES
    ('8trnLHfO4RE', 'Urgencias Oncológicas', '2020-08-21', 481),
    ('iAnooKaS3KQ', 'Neoplasias Endocrinas Múltiples y Síndromes Autoinmunes Poliglandulares', '2020-05-05', 424),
    ('27OVYi0G024', 'Patología general de las neoplasias. Sofia del Barrio', '2021-05-24', 389)
  ) v(youtube_id, titulo, fecha, duracion)
  JOIN video_canales c ON c.youtube_channel_id = 'UCJLl9AxVjJtyFMyMiIKa2iw'
  WHERE NOT EXISTS (SELECT 1 FROM videos x WHERE x.youtube_id = v.youtube_id);
  GET DIAGNOSTICS n = ROW_COUNT; IF n <> 3 THEN RAISE EXCEPTION 'videos nuevos: % (esperaba 3)', n; END IF;

  -- 5 filas en video_temas (las 2 de vídeos ya existentes, con nota).
  INSERT INTO video_temas (video_id, especialidad, tema, principal, nota)
  SELECT x.id, 'Oncología', t.tema, true, t.nota
  FROM (VALUES
    ('8trnLHfO4RE', 'Urgencias oncológicas', NULL),
    ('iAnooKaS3KQ', 'Tumores endocrinos', NULL),
    ('27OVYi0G024', 'Radioterapia y biología tumoral', NULL),
    ('AG58DUw8PBI', 'Tumores óseos y de partes blandas', 'cubre el tema solo en parte'),
    ('Yen75-eqgF8', 'Tumores de cabeza y cuello', 'cubre el tema solo en parte')
  ) t(youtube_id, tema, nota)
  JOIN videos x ON x.youtube_id = t.youtube_id;
  GET DIAGNOSTICS n = ROW_COUNT; IF n <> 5 THEN RAISE EXCEPTION 'video_temas: % (esperaba 5)', n; END IF;
END
$do$;

-- Comprobaciones: 102 vídeos (99 + 3) y 5 temas de Oncología con vídeo activo.
SELECT count(*) AS videos FROM videos;
SELECT vt.tema, v.youtube_id, v.titulo, vt.nota
FROM video_temas vt JOIN videos v ON v.id = vt.video_id
WHERE vt.especialidad = 'Oncología' AND v.estado = 'activo'
ORDER BY vt.tema;

COMMIT;
