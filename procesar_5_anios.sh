#!/usr/bin/env bash
#
# procesar_5_anios.sh
# ---------------------
# Lanza verificar_preguntas_mir.py para los 5 años de MIR configurados
# abajo y concatena todo en un único fichero final: mir_5_anios.sql

set -e

# El campo tras "|" son preguntas a excluir del SQL: anuladas oficialmente,
# salvo la 208 de 2025, que no está anulada pero se excluye porque el
# contenido de la pregunta 208 en el cuadernillo descargado (cirrosis
# hepática) no coincide con el tema que la prensa (redaccionmedica.com,
# cita textual) atribuye a la pregunta 208 (varón con IAMSEST y
# antiagregación). No se pudo resolver la discrepancia con certeza, así que
# se deja fuera en vez de arriesgar un dato incorrecto.
ANIOS=(
  "2021|147,176"
  "2022|120,126,189"
  "2023|15,40,128,138"
  "2024|64,68,113,180,206"
  "2025|15,26,28,56,162,186,208"
)

SALIDA_FINAL="mir_5_anios.sql"
> "$SALIDA_FINAL"

for entry in "${ANIOS[@]}"; do
  ANIO="${entry%%|*}"
  ANULADAS="${entry##*|}"

  CUADERNILLO="cuadernillo_${ANIO}.pdf"
  PLANTILLA="plantilla_${ANIO}.pdf"
  SALIDA_ANIO="mir_${ANIO}.sql"

  echo ""
  echo "=================================================="
  echo " Procesando MIR ${ANIO}"
  echo "=================================================="

  if [[ ! -f "$CUADERNILLO" ]]; then
    echo "[SALTADO] No se encuentra $CUADERNILLO en esta carpeta."
    continue
  fi
  if [[ ! -f "$PLANTILLA" ]]; then
    echo "[SALTADO] No se encuentra $PLANTILLA en esta carpeta."
    continue
  fi

  python3 verificar_preguntas_mir.py \
    --cuadernillo "$CUADERNILLO" \
    --plantilla "$PLANTILLA" \
    --anio "$ANIO" \
    --anuladas "$ANULADAS" \
    --salida "$SALIDA_ANIO"

  echo "-- ============================================" >> "$SALIDA_FINAL"
  echo "-- MIR ${ANIO}" >> "$SALIDA_FINAL"
  echo "-- ============================================" >> "$SALIDA_FINAL"
  cat "$SALIDA_ANIO" >> "$SALIDA_FINAL"
  echo "" >> "$SALIDA_FINAL"
done

echo ""
echo "=================================================="
echo "Proceso completo. Resultado combinado en: $SALIDA_FINAL"
echo "=================================================="
echo ""
echo "Para importar en el contenedor Postgres:"
echo "  cat $SALIDA_FINAL | docker exec -i mir-db psql -U mir -d mir"
