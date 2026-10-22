#!/bin/bash
# CARGA REAL de 2017 y actualización de 2016 en la BD de producción. NO se lanza sin que José lo indique (hecho el redeploy del código).
# 1) pg_dump nuevo; 2) UNA transacción: actualizar_2016.sql + importar_2017.sql + guardas_2017.sql; 3) COMMIT solo si las guardas pasan.
# Uso: bash import2017/cargar_2017.sh --confirmo
cd "$(dirname "$0")/.." || exit 1
if [ "${1:-}" != "--confirmo" ]; then echo "Esto escribe en la BD de producción. Uso: bash import2017/cargar_2017.sh --confirmo"; exit 2; fi
PGU=$(docker exec mir-db printenv POSTGRES_USER) || exit 1
DUMP="import2017/backup/mir_antes_carga_$(date +%Y%m%d_%H%M).dump"
mkdir -p import2017/backup
docker exec mir-db pg_dump -U "$PGU" -Fc mir > "$DUMP" || { echo "FALLO en pg_dump: no se carga nada"; exit 1; }
[ -s "$DUMP" ] && docker exec -i mir-db pg_restore -l < "$DUMP" > /dev/null || { echo "La copia $DUMP no es válida: no se carga nada"; exit 1; }
echo "Copia: $DUMP ($(du -h "$DUMP" | cut -f1))"
{ cat <<'S'
\set ON_ERROR_STOP on
BEGIN;
CREATE TEMP TABLE _antes AS SELECT id, "año" AS a, numero, md5(p::text) AS h FROM preguntas p;
CREATE TEMP TABLE _huella_antes AS SELECT "año" AS a, count(*) AS n, md5(string_agg(p::text, '|' ORDER BY id)) AS h FROM preguntas p GROUP BY 1;
S
cat import2017/actualizar_2016.sql import2017/importar_2017.sql import2017/guardas_2017.sql
echo "COMMIT;"
cat <<'S'
SELECT "año", count(*) AS filas, count(*) FILTER (WHERE NOT anulada) AS no_anuladas, count(*) FILTER (WHERE imagen_path IS NOT NULL) AS con_imagen FROM preguntas WHERE origen = 'oficial' GROUP BY 1 ORDER BY 1;
S
} | docker exec -i mir-db psql -U "$PGU" mir
rc=${PIPESTATUS[1]}
if [ "$rc" -ne 0 ]; then echo "ROLLBACK: la transacción se ha abortado (psql devolvió $rc). La BD no ha cambiado. Copia previa: $DUMP"; exit "$rc"; fi
echo "COMMIT hecho. Reversión: revertir_2017.sql y revertir_actualizar_2016.sql (o restaurar $DUMP)."
