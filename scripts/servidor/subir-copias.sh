#!/usr/bin/env bash
# Copia fuera del servidor: sube cada noche, cifrado, a Google Drive (remoto rclone gdrive-cifrado,
# un crypt sobre gdrive:copias-vps-cifradas, con contenido y nombres cifrados).
#   - el último dump de cada proyecto que dejan backup-dbs.sh (03:15) y el cron de obediencia (03:45)
#   - mir-archivos.tar.gz: /var/data/mir (avatares, blog-uploads) y public/imagenes-mir
#   - secretos.tar.gz: /root/mir/.env.local y /root/videos/.env
#   - sistema.tar.gz: los scripts de copia y el crontab
# Destino: diario/AAAA-MM-DD (se guardan 7), semanal/ los domingos (4) y mensual/ el día 1 (6).
# Tras subir, rclone cryptcheck compara las sumas de los ficheros cifrados con los locales.
# Si algo falla, correo a SMTP_TO; con --comprobar (cron de mediodía) avisa si la última subida
# correcta tiene más de 2 días. Ningún valor de secretos va a argumentos ni al log.
set -uo pipefail
umask 077

RAIZ=/root/backups
LOG=/var/log/backups.log
REMOTO=gdrive-cifrado:
MARCA=$RAIZ/.ultima-subida-ok
MAX_HORAS=48
declare -A CONSERVAR=([diario]=7 [semanal]=4 [mensual]=6)
viejos=()

log() { echo "$(date '+%F %T') subida: $*" >> "$LOG"; }

# Lee por stdin las 6 líneas de printenv (host, puerto, usuario, contraseña, from, to), como backup-dbs.sh.
CORREO='
import os, sys, smtplib, ssl
from email.message import EmailMessage
host, port, user, pw, de, para = sys.stdin.read().split("\n")[:6]
m = EmailMessage()
m["Subject"] = os.environ["ASUNTO"]
m["From"] = de; m["To"] = para
m.set_content(os.environ["CUERPO"])
with smtplib.SMTP(host, int(port), timeout=20) as s:
    s.starttls(context=ssl._create_unverified_context())
    s.login(user, pw)
    s.send_message(m)
'
avisar() {  # $1 asunto, $2 cuerpo
  local mir
  mir=$(docker ps --filter name=juegos-mir-14sueh --format '{{.Names}}' | head -1)
  if [[ -z "$mir" ]]; then log "ERROR no se pudo avisar por correo: contenedor de mir no encontrado"; return 1; fi
  if docker exec "$mir" printenv SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASS SMTP_FROM SMTP_TO \
     | ASUNTO="$1" CUERPO="$2" python3 -c "$CORREO" 2>>"$LOG"
  then log "correo de aviso enviado: $1"; else log "ERROR no se pudo enviar el correo de aviso"; return 1; fi
}

# --comprobar: solo mira la antigüedad de la última subida correcta.
if [[ "${1:-}" == "--comprobar" ]]; then
  ultima=$(cat "$MARCA" 2>/dev/null || echo 0)
  horas=$(( ( $(date +%s) - ultima ) / 3600 ))
  if (( horas > MAX_HORAS )); then
    log "AVISO última subida correcta hace ${horas} h"
    avisar "Copias fuera del servidor: ${horas} h sin una subida correcta" \
      "La última subida correcta a Google Drive fue hace ${horas} horas (límite ${MAX_HORAS}).
Detalle en $LOG. Si el error es de token, renovar con: rclone config reconnect gdrive:"
  fi
  exit 0
fi

exec 9>"$RAIZ/.subir-copias.lock"
flock -n 9 || { log "ERROR ya hay otra subida en marcha"; exit 1; }

fallar() {
  log "ERROR $*"; log "== fin con fallo"
  avisar "Fallo en la copia fuera del servidor" "$*

Detalle en $LOG."
  rm -rf "$TMP"; exit 1
}

fecha=$(date +%F)
TMP=$(mktemp -d "$RAIZ/.subida-XXXX")
log "== inicio $fecha"

# 1. Último dump de cada proyecto (patrón de backup-dbs.sh) y de obediencia.
mkdir -p "$TMP/bd"
n=0
for dir in "$RAIZ"/*/; do
  p=$(basename "$dir")
  ultimo=$(ls -1 "$dir"/"$p"-[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-[0-9][0-9][0-9][0-9].dump 2>/dev/null | sort | tail -1)
  [[ -z "$ultimo" ]] && ultimo=$(ls -1 "$dir"/"$p"-[0-9]*.sql.gz 2>/dev/null | sort | tail -1)   # obediencia
  [[ -z "$ultimo" ]] && continue
  # Si la copia local tiene más de 2 días, backup-dbs.sh no está funcionando: se sube igual, pero se avisa.
  if (( $(date +%s) - $(stat -c %Y "$ultimo") > MAX_HORAS * 3600 )); then
    log "AVISO $p: la última copia local es antigua ($(basename "$ultimo"))"; viejos+=("$p")
  fi
  cp -p "$ultimo" "$TMP/bd/" && n=$((n+1))
done
(( n > 0 )) || fallar "no se encontró ningún dump local en $RAIZ"
log "$n dumps preparados"

# 2. Archivos de mir, secretos y sistema.
tar -czf "$TMP/mir-archivos.tar.gz" -C / var/data/mir root/mir/public/imagenes-mir 2>>"$LOG" \
  || fallar "no se pudo crear mir-archivos.tar.gz"
tar -czf "$TMP/secretos.tar.gz" -C / root/mir/.env.local root/videos/.env 2>>"$LOG" \
  || fallar "no se pudo crear secretos.tar.gz"
crontab -l > "$TMP/crontab.txt" 2>>"$LOG"
tar -czf "$TMP/sistema.tar.gz" -C "$TMP" crontab.txt -C / root/backups/backup-dbs.sh root/backups/subir-copias.sh \
  root/obediencia/scripts/backup-db.sh 2>>"$LOG" || fallar "no se pudo crear sistema.tar.gz"
rm -f "$TMP/crontab.txt"

# 3. Subida y verificación (cryptcheck: compara sumas del contenido cifrado con los ficheros locales).
destino="${REMOTO}diario/$fecha"
rclone copy "$TMP" "$destino" --log-file="$LOG" --log-level ERROR || fallar "rclone copy a $destino falló"
rclone cryptcheck "$TMP" "$destino" --one-way --log-file="$LOG" --log-level ERROR \
  || fallar "rclone cryptcheck de $destino no coincide"
log "subido y verificado $destino ($(du -sh "$TMP" | cut -f1))"

# 4. Semanal (domingo) y mensual (día 1): copia en el servidor de Drive, sin volver a subir.
[[ $(date +%u) == 7 ]] && { rclone copy "$destino" "${REMOTO}semanal/$fecha" --log-file="$LOG" --log-level ERROR \
  || fallar "copia semanal falló"; log "copia semanal $fecha"; }
[[ $(date +%d) == 01 ]] && { rclone copy "$destino" "${REMOTO}mensual/$fecha" --log-file="$LOG" --log-level ERROR \
  || fallar "copia mensual falló"; log "copia mensual $fecha"; }

# 5. Retención: solo carpetas con nombre de fecha dentro de diario/, semanal/ y mensual/.
for tipo in "${!CONSERVAR[@]}"; do
  rclone lsf --dirs-only "${REMOTO}$tipo" 2>/dev/null | tr -d / | grep -E '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' | sort \
    | head -n -"${CONSERVAR[$tipo]}" | while read -r vieja; do
      rclone purge "${REMOTO}$tipo/$vieja" --log-file="$LOG" --log-level ERROR && log "borrada $tipo/$vieja"
    done
done

rm -rf "$TMP"
date +%s > "$MARCA"
if (( ${#viejos[@]} )); then
  avisar "Copias locales antiguas" "Se subieron, pero la última copia local de ${viejos[*]} tiene más de 2 días. Revisar backup-dbs.sh y $LOG."
fi
log "== fin sin fallos"
