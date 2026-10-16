-- Hematología 160 y 740 (revisión 2026-10): explicación nueva que descarta todas las opciones. Conservan la marca 'controversia'.
BEGIN;
CREATE TEMP TABLE tc (id int, antes_md5 text, despues text) ON COMMIT DROP;
INSERT INTO tc VALUES
(160, '118bb3ef3c96feda506f5496fcdcb294', 'La respuesta correcta es D) Linfoma del manto. La translocación t(11;14) coloca el gen de la ciclina D1 (CCND1) junto al locus de las cadenas pesadas de las inmunoglobulinas. La ciclina D1 se sobreexpresa y acelera el ciclo celular; está presente en la gran mayoría de los linfomas del manto y define esta entidad. También aparece en algunos mielomas, pero entre las opciones es la alteración característica del linfoma del manto. El linfoma folicular (A) se asocia a la t(14;18), que activa BCL2, no la ciclina D1. Los linfomas de la zona marginal (B), sobre todo los de tipo MALT, se asocian a otras translocaciones, como la t(11;18) con API2-MALT1. El linfoma linfoblástico (C) es una neoplasia de precursores inmaduros, TdT positiva, sin sobreexpresión de ciclina D1.'),
(740, 'ffa395cc184133c85f76baa963170ef9', 'La respuesta correcta es B) Linfoma primario de cavidades. El virus herpes humano 8 causa el linfoma primario de cavidades, que crece como un derrame pleural, pericárdico o peritoneal sin masa tumoral, sobre todo en pacientes con VIH; también causa el sarcoma de Kaposi y la enfermedad de Castleman multicéntrica. La leucemia-linfoma T del adulto (A) se debe al virus HTLV-1. El linfoma de Burkitt (C), sobre todo en su forma endémica africana, se asocia al virus de Epstein-Barr. La granulomatosis linfomatoide (D) es un proceso linfoproliferativo B, con afectación pulmonar, asociado también al virus de Epstein-Barr.');
CREATE TEMP TABLE h0 ON COMMIT DROP AS SELECT count(*) n FROM explicaciones_historial;
SET LOCAL mir.motivo = 'Hematología 160 y 740 controversia 2026-10';
DO $$ DECLARE n int; h int; BEGIN
  UPDATE preguntas p SET explicacion = tc.despues FROM tc
    WHERE p.id = tc.id AND md5(p.explicacion) = tc.antes_md5 AND p.explicacion_calidad = 'controversia';
  GET DIAGNOSTICS n = ROW_COUNT;
  SELECT (SELECT count(*) FROM explicaciones_historial) - h0.n INTO h FROM h0;
  IF n <> 2 OR h <> 2 THEN RAISE EXCEPTION 'actualizadas %, historial +% (esperado 2): ROLLBACK', n, h; END IF;
  RAISE NOTICE 'actualizadas %, historial +%', n, h;
END $$;
COMMIT;
