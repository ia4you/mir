#!/bin/bash
# Ensayo de video_exclusiones_2017.sql en UNA transacción con ROLLBACK (no deja nada): 1.ª ejecución, 2.ª (idempotencia) y comprobación de que solo cambian preguntas de 2017.
cd "$(dirname "$0")/.." || exit 1
PGU=$(docker exec mir-db printenv POSTGRES_USER) || exit 1
{ cat <<'S'
\set ON_ERROR_STOP on
BEGIN;
CREATE TEMP TABLE _pv_antes AS SELECT pv.pregunta_id, pv.video_id, p."año" AS a FROM pregunta_video pv JOIN preguntas p ON p.id = pv.pregunta_id;
SELECT count(*) AS exclusiones_antes FROM video_exclusiones \gset
\echo === 1.ª ejecución
S
cat import2017/video_exclusiones_2017.sql
echo '\echo === 2.ª ejecución (idempotencia): no debe insertar nada'
cat import2017/video_exclusiones_2017.sql
cat <<'S'
SELECT (SELECT count(*) FROM video_exclusiones) - :exclusiones_antes AS exclusiones_nuevas_en_total;
\echo --- preguntas cuyo vídeo cambia, por año (solo debe salir 2017)
SELECT b.a AS año, count(*) AS cambian FROM _pv_antes b LEFT JOIN pregunta_video pv USING (pregunta_id) WHERE b.video_id IS DISTINCT FROM pv.video_id GROUP BY 1 ORDER BY 1;
\echo --- exclusiones nuevas por año de la pregunta
SELECT p."año", count(*) FROM video_exclusiones e JOIN preguntas p ON p.id = e.pregunta_id WHERE e.motivo LIKE 'MIR 2017: %' GROUP BY 1;
\echo --- preguntas de 2017 no anuladas con vídeo: antes y después
SELECT (SELECT count(*) FROM _pv_antes WHERE a = 2017 AND video_id IS NOT NULL AND pregunta_id IN (SELECT id FROM preguntas WHERE NOT anulada)) AS con_video_antes,
       (SELECT count(*) FROM pregunta_video pv JOIN preguntas p ON p.id = pv.pregunta_id WHERE p."año" = 2017 AND NOT p.anulada AND pv.video_id IS NOT NULL) AS con_video_despues;
\echo === reversión dentro del ensayo
S
cat import2017/revertir_video_exclusiones_2017.sql
cat <<'S'
SELECT (SELECT count(*) FROM video_exclusiones) = :exclusiones_antes AS vuelve_al_estado_inicial;
SELECT count(*) AS vistas_distintas_tras_revertir FROM _pv_antes b LEFT JOIN pregunta_video pv USING (pregunta_id) WHERE b.video_id IS DISTINCT FROM pv.video_id;
ROLLBACK;
SELECT count(*) AS exclusiones_2017_tras_rollback FROM video_exclusiones WHERE motivo LIKE 'MIR 2017: %';
S
} | docker exec -i mir-db psql -U "$PGU" mir 2>&1 | grep -v "^CREATE\|^BEGIN\|^SELECT [0-9]\|^$"
