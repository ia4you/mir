-- Reumatología 182, 560 y 980 (revisión 2026-10): explicación nueva que descarta todas las opciones. Conservan la marca 'controversia'.
BEGIN;
CREATE TEMP TABLE tc (id int, antes_md5 text, despues text) ON COMMIT DROP;
INSERT INTO tc VALUES
(182, 'b9a2408abfe3775d37f6ed961a8b6799', 'La respuesta correcta es C) Polimialgia reumática, iniciaría tratamiento con corticoides. Dolor y rigidez en las cinturas escapular y pélvica, de predominio matutino, en una mujer de 70 años con VSG y PCR elevadas, sin cefalea ni síntomas generales que sugieran una arteritis de células gigantes, es una polimialgia reumática. Se trata con dosis bajas de corticoides, con una respuesta rápida. La artritis reumatoide (A) produce sinovitis de las pequeñas articulaciones de manos y pies, y se trata con metotrexato. La fibromialgia (B) produce dolor difuso con reactantes de fase aguda normales. La espondilitis anquilosante (D) afecta sobre todo a varones jóvenes con dolor lumbar inflamatorio y sacroilitis.'),
(560, '4164720c194c85017c304b0870122125', 'La respuesta correcta es B) Alcaptonuria. El déficit de homogentisato oxidasa hace que el ácido homogentísico se acumule y se deposite en los tejidos conectivos (ocronosis). Produce manchas pardas en la esclerótica, una artropatía degenerativa de las grandes articulaciones y de la columna, causa de la lumbalgia crónica, un líquido articular no inflamatorio y un tejido sinovial con pigmento ocre. La porfiria aguda intermitente (A) produce crisis de dolor abdominal y síntomas neurológicos, sin pigmentación de los tejidos ni artropatía. La artritis séptica (C) es aguda, con un líquido purulento de muchos leucocitos y gérmenes en el Gram o el cultivo. La artritis reumatoide (D) produce una poliartritis simétrica de pequeñas articulaciones, con líquido inflamatorio de más de 2.000 leucocitos, sin pigmento ocre.'),
(980, '310a9550c4aff75aac002f559c7054f7', 'La respuesta correcta es D) La granulomatosis con poliangitis (GPA) afecta frecuentemente a la vía aérea superior. La afectación de la vía aérea superior es una de las más características de la granulomatosis con poliangitis: sinusitis crónica, costras nasales, perforación del tabique, nariz en silla de montar o estenosis subglótica. La A es falsa: en la granulomatosis eosinofílica los ANCA son positivos en menos de la mitad de los casos, y suelen ser anti-MPO, no anti-PR3. La B es falsa: la enfermedad anti-membrana basal no siempre empieza en el pulmón, puede ser solo renal, y cuando afecta al riñón suele producir una glomerulonefritis rápidamente progresiva grave, no leve. La C es falsa: el asma grave es propio de la granulomatosis eosinofílica; la poliangitis microscópica afecta con frecuencia al riñón.');
CREATE TEMP TABLE h0 ON COMMIT DROP AS SELECT count(*) n FROM explicaciones_historial;
SET LOCAL mir.motivo = 'Reumatología 182, 560 y 980 controversia 2026-10';
DO $$ DECLARE n int; h int; BEGIN
  UPDATE preguntas p SET explicacion = tc.despues FROM tc
    WHERE p.id = tc.id AND md5(p.explicacion) = tc.antes_md5 AND p.explicacion_calidad = 'controversia';
  GET DIAGNOSTICS n = ROW_COUNT;
  SELECT (SELECT count(*) FROM explicaciones_historial) - h0.n INTO h FROM h0;
  IF n <> 3 OR h <> 3 THEN RAISE EXCEPTION 'actualizadas %, historial +% (esperado 3): ROLLBACK', n, h; END IF;
  RAISE NOTICE 'actualizadas %, historial +%', n, h;
END $$;
COMMIT;
