# Genera video_exclusiones_2017.sql y su reversión desde trabajo/exclusiones_propuestas_2017.json. No toca la BD.
import json
ex=json.load(open('import2017/trabajo/exclusiones_propuestas_2017.json',encoding='utf-8'))
q=lambda s:"'"+s.replace("'","''")+"'"
vals=[]
for x in ex:
    m=' '.join(x['motivo'].split()).rstrip('.')
    m+=f". El #{x['excl']} no encaja"+(f"; #{x['alt']} encaja en parte." if x['alt'] else " y no hay otro en la biblioteca.") if True else ''
    vals.append(f"({x['id']}, {x['excl']}, {x['alt'] if x['alt'] else 'NULL'}, {q('MIR 2017: '+m)})")
assert len(ex)==105 and sum(1 for x in ex if x['alt'])==3, (len(ex),)
n=len(ex); alt=sum(1 for x in ex if x['alt']); sin=n-alt; ids=','.join(str(x['id']) for x in ex)
open('import2017/video_exclusiones_2017.sql','w',encoding='utf-8').write(f"""-- Exclusiones de vídeo de MIR 2017: {n} preguntas cuyo vídeo de tema no encaja (primera ronda y repetición con título primero) o encaja en parte siendo antiguo (>5 años) y sensible a guías; {alt} con otro vídeo y {sin} sin vídeo.
-- Solo INSERTA en video_exclusiones (PK pregunta_id: ON CONFLICT DO NOTHING lo hace idempotente). Sin BEGIN/COMMIT: lo decide quien lo invoca.
-- Una exclusión solo se aplica mientras el tema siga mostrando video_excluido_id. Si algo no cuadra, RAISE EXCEPTION (aborta la transacción).
-- Ensayo: bash import2017/simular_video_exclusiones_2017.sh (termina en ROLLBACK). Reversión: import2017/revertir_video_exclusiones_2017.sql.
CREATE TEMP TABLE IF NOT EXISTS ve_antes AS SELECT pregunta_id, video_id FROM pregunta_video;
CREATE TEMP TABLE IF NOT EXISTS ve_previas AS SELECT md5(coalesce(string_agg(e::text, '|' ORDER BY pregunta_id), '')) AS hprev, count(*) AS nprev FROM video_exclusiones e WHERE pregunta_id NOT IN ({ids});
CREATE TEMP TABLE IF NOT EXISTS ve_antes2017 AS SELECT count(*) FILTER (WHERE pv.video_id IS NOT NULL) AS con_video FROM pregunta_video pv JOIN preguntas p ON p.id = pv.pregunta_id WHERE p."año" = 2017 AND NOT p.anulada;
CREATE TEMP TABLE IF NOT EXISTS ve_log (n int);

WITH ins AS (
  INSERT INTO video_exclusiones (pregunta_id, video_excluido_id, video_alternativo_id, motivo)
  VALUES
{',\n'.join('  '+v for v in vals)}
  ON CONFLICT (pregunta_id) DO NOTHING RETURNING 1
)
INSERT INTO ve_log SELECT count(*) FROM ins;

DO $$
DECLARE hechas int; n int; mal int; alt int; sin int; resto int; c17 int; v_prev int; v_hprev text;
BEGIN
  SELECT coalesce(sum(ve_log.n), 0) INTO hechas FROM ve_log;
  IF hechas NOT IN (0, {n}) THEN RAISE EXCEPTION 'se han insertado % filas (esperadas 0 o {n})', hechas; END IF;
  SELECT count(*) INTO n FROM video_exclusiones e JOIN preguntas p ON p.id = e.pregunta_id WHERE e.pregunta_id IN ({ids}) AND p."año" = 2017 AND NOT p.anulada;
  IF n <> {n} THEN RAISE EXCEPTION 'no son {n} preguntas de 2017 visibles con exclusión (%)', n; END IF;
  SELECT count(*), md5(coalesce(string_agg(e::text, '|' ORDER BY pregunta_id), '')) INTO v_prev, v_hprev FROM video_exclusiones e WHERE pregunta_id NOT IN ({ids});
  IF v_prev <> 305 OR v_prev <> (SELECT nprev FROM ve_previas) OR v_hprev <> (SELECT hprev FROM ve_previas) THEN RAISE EXCEPTION 'han cambiado las exclusiones existentes (deben ser 305, iguales)'; END IF;
  SELECT count(*) INTO mal FROM video_exclusiones e JOIN ve_antes a USING (pregunta_id) WHERE e.pregunta_id IN ({ids}) AND a.video_id IS DISTINCT FROM e.video_excluido_id;
  IF mal <> 0 THEN RAISE EXCEPTION '% exclusiones no coinciden con el vídeo que mostraba la pregunta', mal; END IF;
  SELECT count(*) INTO alt FROM video_exclusiones e JOIN pregunta_video pv USING (pregunta_id) WHERE e.pregunta_id IN ({ids}) AND e.video_alternativo_id IS NOT NULL AND pv.video_id = e.video_alternativo_id;
  SELECT count(*) INTO sin FROM video_exclusiones e JOIN pregunta_video pv USING (pregunta_id) WHERE e.pregunta_id IN ({ids}) AND e.video_alternativo_id IS NULL AND pv.video_id IS NULL;
  IF alt <> {alt} OR sin <> {sin} THEN RAISE EXCEPTION 'con alternativo % de {alt}, sin vídeo % de {sin}', alt, sin; END IF;
  SELECT count(*) INTO resto FROM ve_antes a JOIN pregunta_video pv USING (pregunta_id) WHERE a.pregunta_id NOT IN ({ids}) AND a.video_id IS DISTINCT FROM pv.video_id;
  IF resto <> 0 OR (SELECT count(*) FROM ve_antes) <> (SELECT count(*) FROM pregunta_video) THEN RAISE EXCEPTION '% preguntas sin exclusión cambian de vídeo', resto; END IF;
  SELECT count(*) FILTER (WHERE pv.video_id IS NOT NULL) INTO c17 FROM pregunta_video pv JOIN preguntas p ON p.id = pv.pregunta_id WHERE p."año" = 2017 AND NOT p.anulada;
  IF c17 <> (SELECT con_video FROM ve_antes2017) - {sin} THEN RAISE EXCEPTION 'preguntas de 2017 con vídeo % (esperadas % - {sin})', c17, (SELECT con_video FROM ve_antes2017); END IF;
  RAISE NOTICE 'exclusiones de 2017: {n} (con alternativo %, sin vídeo %), preguntas de 2017 con vídeo % (antes %), el resto sin cambios, insertadas en esta sesión %', alt, sin, c17, (SELECT con_video FROM ve_antes2017), hechas;
END $$;
""")
open('import2017/revertir_video_exclusiones_2017.sql','w',encoding='utf-8').write(f"""-- Revierte video_exclusiones_2017.sql: borra solo sus {n} filas (las preguntas vuelven a mostrar el vídeo de su tema). Sin BEGIN/COMMIT.
DELETE FROM video_exclusiones WHERE pregunta_id IN ({ids}) AND pregunta_id IN (SELECT id FROM preguntas WHERE "año" = 2017) AND motivo LIKE 'MIR 2017: %';
DO $$ DECLARE r int; BEGIN
  SELECT count(*) INTO r FROM video_exclusiones WHERE pregunta_id IN (SELECT id FROM preguntas WHERE "año" = 2017);
  IF r <> 0 THEN RAISE EXCEPTION 'quedan % exclusiones de 2017', r; END IF;
  RAISE NOTICE 'exclusiones de 2017 borradas; total restante %', (SELECT count(*) FROM video_exclusiones);
END $$;
""")
print(n,alt,sin)
