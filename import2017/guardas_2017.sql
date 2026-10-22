-- Guardas de la carga de 2017 (se ejecutan DENTRO de la transacción, tras actualizar_2016.sql e importar_2017.sql).
-- Necesita las tablas temporales _antes (id, a, numero, h) y _huella_antes (a, n, h) creadas antes de cargar. Cualquier fallo aborta la transacción.
DO $g$
DECLARE n17 int; n17na int; n17img int; n17num int; c16 int; num16 int[]; otros int; n_otros_antes int; n_otros int; huellas_malas int;
BEGIN
  SELECT count(*), count(*) FILTER (WHERE NOT anulada), count(*) FILTER (WHERE imagen_path IS NOT NULL), count(DISTINCT numero)
    INTO n17, n17na, n17img, n17num FROM preguntas WHERE "año" = 2017;
  IF n17 <> 235 OR n17na <> 231 OR n17img <> 35 OR n17num <> 235 THEN
    RAISE EXCEPTION 'GUARDA 2017: filas % (esperado 235), no anuladas % (231), con imagen % (35), números distintos % (235)', n17, n17na, n17img, n17num;
  END IF;
  SELECT count(*), array_agg(p.numero ORDER BY p.numero) INTO c16, num16
    FROM preguntas p JOIN _antes b USING (id) WHERE p."año" = 2016 AND md5(p::text) <> b.h;
  IF c16 <> 4 OR num16 <> ARRAY[11, 95, 206, 220] THEN
    RAISE EXCEPTION 'GUARDA 2016: cambian % filas (%); esperado exactamente 4: 11, 95, 206 y 220', c16, num16;
  END IF;
  IF (SELECT count(*) FROM preguntas WHERE "año" = 2016) <> (SELECT n FROM _huella_antes WHERE a = 2016) THEN
    RAISE EXCEPTION 'GUARDA 2016: ha cambiado el número de filas de 2016';
  END IF;
  SELECT count(*) INTO otros FROM preguntas p JOIN _antes b USING (id) WHERE p."año" NOT IN (2016, 2017) AND md5(p::text) <> b.h;
  SELECT count(*) INTO n_otros FROM preguntas WHERE "año" NOT IN (2016, 2017);
  SELECT count(*) INTO n_otros_antes FROM _antes WHERE a NOT IN (2016, 2017);
  IF otros <> 0 OR n_otros <> n_otros_antes THEN
    RAISE EXCEPTION 'GUARDA otros años: % filas modificadas, % filas ahora frente a % antes', otros, n_otros, n_otros_antes;
  END IF;
  SELECT count(*) INTO huellas_malas FROM _huella_antes h
    JOIN (SELECT "año" AS a, count(*) AS n, md5(string_agg(p::text, '|' ORDER BY id)) AS hh FROM preguntas p GROUP BY 1) d USING (a)
    WHERE h.a NOT IN (2016, 2017) AND (d.hh <> h.h OR d.n <> h.n);
  IF huellas_malas <> 0 THEN
    RAISE EXCEPTION 'GUARDA huella: cambia la huella del año 0 o de 2022-2026 (% años)', huellas_malas;
  END IF;
  RAISE NOTICE 'Guardas OK: 2017 con 235 filas (231 no anuladas, 35 con imagen); 2016 con 4 filas cambiadas (11, 95, 206, 220); año 0 y 2022-2026 sin cambios';
END
$g$;
