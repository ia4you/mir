#!/bin/bash
# CARGA REAL de las exclusiones de vídeo de 2017 en la BD de producción: pg_dump previo y UNA transacción con las guardas de video_exclusiones_2017.sql.
# Uso: bash import2017/cargar_videos_2017.sh --confirmo
cd "$(dirname "$0")/.." || exit 1
if [ "${1:-}" != "--confirmo" ]; then echo "Esto escribe en la BD de producción. Uso: bash import2017/cargar_videos_2017.sh --confirmo"; exit 2; fi
PGU=$(docker exec mir-db printenv POSTGRES_USER) || exit 1
DUMP="import2017/backup/mir_antes_videos_$(date +%Y%m%d_%H%M).dump"
mkdir -p import2017/backup
docker exec mir-db pg_dump -U "$PGU" -Fc mir > "$DUMP" || { echo "FALLO en pg_dump: no se carga nada"; exit 1; }
[ -s "$DUMP" ] && docker exec -i mir-db pg_restore -l < "$DUMP" > /dev/null || { echo "La copia $DUMP no es válida: no se carga nada"; exit 1; }
echo "Copia: $DUMP ($(stat -c %s "$DUMP") bytes, $(du -h "$DUMP" | cut -f1))"
{ echo '\set ON_ERROR_STOP on'; echo 'BEGIN;'; cat import2017/video_exclusiones_2017.sql; echo 'COMMIT;'; } | docker exec -i mir-db psql -U "$PGU" mir
rc=${PIPESTATUS[1]}
if [ "$rc" -ne 0 ]; then echo "ROLLBACK: la transacción se ha abortado (psql devolvió $rc). La BD no ha cambiado. Copia previa: $DUMP"; exit "$rc"; fi
echo "COMMIT hecho. Reversión: import2017/revertir_video_exclusiones_2017.sql (o restaurar $DUMP)."
