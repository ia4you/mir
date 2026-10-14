#!/bin/sh
# Comprobación semanal de los vídeos. Pensado para el cron del host, que hace
# `docker exec` a este script en el contenedor de producción (igual que
# enviar_recordatorio.sh). La lógica vive en comprobar-videos.mjs.
set -e
cd "$(dirname "$0")/.."
node scripts/comprobar-videos.mjs "$@"
