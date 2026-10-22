#!/bin/bash
# Ensayo de actualizar_2016.sql + importar_2017.sql en UNA transacción con ROLLBACK (no deja nada). Uso: bash import2017/ensayo_2017.sh
cd "$(dirname "$0")/.." || exit 1
ACT=import2017/actualizar_2016.sql
{ cat <<'S'
\set ON_ERROR_STOP on
SELECT last_value AS seq_antes FROM preguntas_id_seq \gset
BEGIN;
CREATE TEMP TABLE _antes AS SELECT id, "año" AS a, numero, md5(p::text) AS h FROM preguntas p;
CREATE TEMP TABLE _huella_antes AS SELECT "año" AS a, count(*) AS n, md5(string_agg(p::text, '|' ORDER BY id)) AS h FROM preguntas p GROUP BY 1;
\echo === 1.ª ejecución
S
cat $ACT import2017/importar_2017.sql
cat <<'S'
CREATE TEMP TABLE _tras1 AS SELECT md5(string_agg(p::text, '|' ORDER BY id)) AS h, count(*) AS n FROM preguntas p;
\echo --- filas de 2016 que cambian (esperado: 95, 206, 220 y la 11 solo en motivo_revision)
SELECT p.id, p.numero, p.anulada, p.requiere_revision, left(coalesce(p.motivo_anulacion,'-'),30) AS motivo_anul, p.motivo_revision FROM preguntas p JOIN _antes b USING (id) WHERE p."año"=2016 AND md5(p::text)<>b.h ORDER BY p.numero;
\echo --- filas que cambian fuera de 2016 y 2017 (esperado 0)
SELECT count(*) AS cambian_otros_años FROM preguntas p JOIN _antes b USING (id) WHERE p."año" NOT IN (2016,2017) AND md5(p::text)<>b.h;
\echo --- 2017
SELECT count(*) AS filas, count(*) FILTER (WHERE NOT anulada) AS no_anuladas, count(*) FILTER (WHERE imagen_path IS NOT NULL) AS con_imagen, count(*) FILTER (WHERE anulada) AS anuladas, count(*) FILTER (WHERE requiere_revision) AS requiere_revision, count(DISTINCT numero) AS numeros, count(*) FILTER (WHERE explicacion IS NULL) AS sin_explicacion, count(*) FILTER (WHERE tema IS NULL) AS tema_null FROM preguntas WHERE "año"=2017;
SELECT numero, correcta, anulada, motivo_anulacion FROM preguntas WHERE "año"=2017 AND anulada ORDER BY numero;
\echo === 2.ª ejecución (idempotencia): etiquetas UPDATE n / INSERT 0 n
S
cat $ACT import2017/importar_2017.sql
cat <<'S'
SELECT (SELECT h FROM _tras1) = md5(string_agg(p::text, '|' ORDER BY id)) AND (SELECT n FROM _tras1) = count(*) AS tabla_identica_tras_2a_ejecucion FROM preguntas p;
\echo --- huella por año tras el ensayo frente a antes (0 y 2022-2026 deben ser iguales)
SELECT d.a AS año, d.n, (d.h = a.h) AS igual_que_antes FROM (SELECT "año" AS a, count(*) n, md5(string_agg(p::text, '|' ORDER BY id)) h FROM preguntas p GROUP BY 1) d LEFT JOIN _huella_antes a USING (a) ORDER BY 1;
ROLLBACK;
SELECT setval('preguntas_id_seq', :seq_antes) AS seq_restaurada;
SELECT last_value AS seq_ahora, :seq_antes AS seq_antes FROM preguntas_id_seq;
SELECT count(*) AS filas_2017_tras_rollback FROM preguntas WHERE "año"=2017;
SELECT count(*) FILTER (WHERE requiere_revision) AS req_rev_2016, count(*) FILTER (WHERE motivo_anulacion LIKE 'Marcada%') AS anuladas_con_motivo_antiguo FROM preguntas WHERE "año"=2016;
S
} | docker exec -i mir-db psql -U "$(docker exec mir-db printenv POSTGRES_USER)" mir 2>&1 | grep -v "^CREATE\|^BEGIN\|^SELECT [0-9]\|^$"
