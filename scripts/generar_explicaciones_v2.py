#!/usr/bin/env python3
"""Segunda pasada de explicaciones MIR (criterio permisivo) vía API de Anthropic (Haiku).

A diferencia de generar_explicaciones.py (criterio estricto: ante la duda, NULL),
esta pasada solo deja la pregunta sin explicación en dos casos muy concretos
(NULL_SIN_IMAGEN, NULL_CONTROVERSIA); en cualquier otro caso de duda razonable
redacta igualmente una explicación y la marca como 'orientativa' en vez de
'verificada' (columna explicacion_calidad).
"""
import base64
import os
import re
import sys
import time
import argparse
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

MODEL = "claude-haiku-4-5-20251001"
BATCH_SIZE = 10
PROGRESS_EVERY = 50
DB_CONTAINER = "mir-db"
SEP = "\x1f"
PUBLIC_DIR = "/root/mir/public"

MEDIA_TYPES = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}

SYSTEM_PROMPT = """Eres un médico especialista redactando explicaciones 100% originales para preguntas del examen MIR español, dirigidas a un estudiante que acaba de fallar la pregunta.

Redacta una explicación de 2-4 frases de por qué la respuesta correcta es correcta. Razonamiento clínico directo, en español, sin mencionar "la opción oficial", "el examen" ni "la Comisión".

REGLAS (muy importantes):
- Solo devuelve NULL_SIN_IMAGEN si la pregunta dice explícitamente "ver imagen" o "en la figura" (o equivalente) Y no ves ninguna imagen adjunta en este mensaje.
- Solo devuelve NULL_CONTROVERSIA si hay un error aritmético verificable (como un NNT, sensibilidad o dosis mal calculados) o una definición de manual invertida de forma objetiva e inequívoca.
- EN TODOS LOS DEMÁS CASOS redacta una explicación útil, aunque tengas dudas razonables sobre la respuesta oficial. Si tienes alguna duda, añade "(criterio orientativo)" al final de la explicación — pero siempre redacta algo. Una explicación imperfecta es infinitamente más útil que ninguna para un estudiante que acaba de fallar una pregunta.
- Nunca devuelvas texto vacío ni "NULL" a secas: usa siempre NULL_SIN_IMAGEN o NULL_CONTROVERSIA si no vas a explicar, nunca otra cosa.
- No uses prefijos como "Explicación:" ni comillas."""

SYSTEM_PROMPT_IMAGE = SYSTEM_PROMPT + """

Se te adjunta también la imagen clínica (radiografía, ECG, histología, dermatoscopia, etc.) a la que se refiere el enunciado: analízala antes de responder."""


def load_env(path):
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            os.environ.setdefault(k, v.strip())


load_env("/root/mir/.env.local")
API_KEY = os.environ.get("ANTHROPIC_API_KEY")
if not API_KEY:
    sys.exit("ANTHROPIC_API_KEY no encontrada en el entorno ni en /root/mir/.env.local")

COLS = ["id", "especialidad", "año", "pregunta", "opcion_a", "opcion_b", "opcion_c", "opcion_d", "opcion_e", "correcta", "imagen_path"]


def psql(sql, capture=True):
    cmd = ["docker", "exec", "-i", DB_CONTAINER, "psql", "-U", "mir", "-d", "mir",
           "-t", "-A", "-F", SEP, "-c", sql]
    return subprocess.run(cmd, capture_output=capture, text=True, check=True)


def psql_stdin(sql):
    subprocess.run(["docker", "exec", "-i", DB_CONTAINER, "psql", "-U", "mir", "-d", "mir"],
                    input=sql, text=True, capture_output=True, check=True)


def get_pending_rows():
    sql = f"SELECT {', '.join(f'\"{c}\"' if c == 'año' else c for c in COLS)} FROM preguntas WHERE explicacion IS NULL ORDER BY id"
    out = psql(sql).stdout
    rows = []
    for line in out.strip().split("\n"):
        if not line.strip():
            continue
        parts = line.split(SEP)
        row = dict(zip(COLS, parts))
        row["id"] = int(row["id"])
        rows.append(row)
    return rows


def load_image_b64(imagen_path):
    path = os.path.join(PUBLIC_DIR, imagen_path.lstrip("/"))
    ext = os.path.splitext(path)[1].lower()
    media_type = MEDIA_TYPES.get(ext, "image/jpeg")
    with open(path, "rb") as f:
        data = base64.standard_b64encode(f.read()).decode("ascii")
    return media_type, data


def build_user_prompt(row):
    opts = []
    for letra, campo in [("A", "opcion_a"), ("B", "opcion_b"), ("C", "opcion_c"), ("D", "opcion_d"), ("E", "opcion_e")]:
        val = row.get(campo)
        if val and val.strip():
            opts.append(f"{letra}) {val.strip()}")
    return (f"Pregunta MIR (especialidad: {row['especialidad']}, año: {row['año']}):\n"
            f"{row['pregunta']}\n"
            f"{chr(10).join(opts)}\n"
            f"Respuesta correcta: {row['correcta']}")


def build_message_content(row):
    text = build_user_prompt(row)
    if not row.get("imagen_path"):
        return text
    media_type, data = load_image_b64(row["imagen_path"])
    return [
        {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": data}},
        {"type": "text", "text": text},
    ]


def call_api(row, retries=4):
    headers = {
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    system = SYSTEM_PROMPT_IMAGE if row.get("imagen_path") else SYSTEM_PROMPT
    payload = {
        "model": MODEL,
        "max_tokens": 1000,
        "system": system,
        "messages": [{"role": "user", "content": build_message_content(row)}],
    }
    for attempt in range(retries):
        try:
            resp = requests.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload, timeout=60)
        except requests.RequestException:
            time.sleep(2 ** attempt)
            continue
        if resp.status_code == 200:
            data = resp.json()
            text = "".join(b.get("text", "") for b in data.get("content", []) if b.get("type") == "text").strip()
            if data.get("stop_reason") == "max_tokens":
                print(f"  [id {row['id']}] truncada por max_tokens, se descarta", file=sys.stderr)
                return row["id"], None
            return row["id"], text
        if resp.status_code == 429 or resp.status_code >= 500:
            time.sleep((2 ** attempt) * 3)
            continue
        print(f"  [id {row['id']}] HTTP {resp.status_code}: {resp.text[:200]}", file=sys.stderr)
        return row["id"], None
    return row["id"], None


def sql_escape(s):
    return s.replace("'", "''")


NULL_TOKEN_RE = re.compile(r"NULL_(SIN_IMAGEN|CONTROVERSIA)", re.IGNORECASE)
ORIENTATIVO_RE = re.compile(r"\(criterio orientativo\)", re.IGNORECASE)


def classify(text):
    """Devuelve (explicacion_o_None, calidad, motivo_null_o_None)."""
    if not text:
        return None, None, "vacio"
    m = NULL_TOKEN_RE.search(text)
    if m:
        return None, None, m.group(1).lower()
    calidad = "orientativa" if ORIENTATIVO_RE.search(text) else "verificada"
    return text.strip(), calidad, None


def apply_updates(results):
    stmts = ["BEGIN;"]
    count = 0
    for id_, text in results:
        explicacion, calidad, _motivo = classify(text)
        if explicacion:
            stmts.append(
                f"UPDATE preguntas SET explicacion = '{sql_escape(explicacion)}', "
                f"explicacion_calidad = '{calidad}' WHERE id = {id_};"
            )
            count += 1
    stmts.append("COMMIT;")
    if count:
        psql_stdin("\n".join(stmts))
    return count


def run_test():
    rows = get_pending_rows()
    seen_esp = set()
    sample = []
    for r in rows:
        if r["especialidad"] not in seen_esp:
            seen_esp.add(r["especialidad"])
            sample.append(r)
        if len(sample) == 5:
            break
    print(f"Probando con {len(sample)} preguntas de especialidades distintas: {[r['especialidad'] for r in sample]}\n")
    for r in sample:
        id_, text = call_api(r)
        explicacion, calidad, motivo = classify(text)
        print("=" * 100)
        print(f"id {id_} | {r['especialidad']} | correcta: {r['correcta']} | imagen: {r.get('imagen_path') or '-'}")
        print(f"Pregunta: {r['pregunta'][:200]}")
        print(f"-> calidad={calidad} motivo_null={motivo}")
        print(f"-> {text}")
    print("\n(modo prueba: no se ha escrito nada en la base de datos)")


def run_full():
    rows = get_pending_rows()
    total = len(rows)
    print(f"Pendientes a procesar (criterio permisivo, incluye preguntas con imagen): {total}\n")

    processed = 0
    verificada = 0
    orientativa = 0
    null_sin_imagen = 0
    null_controversia = 0
    errors = 0

    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i:i + BATCH_SIZE]
        results = []
        with ThreadPoolExecutor(max_workers=BATCH_SIZE) as ex:
            futures = [ex.submit(call_api, r) for r in batch]
            for fut in as_completed(futures):
                results.append(fut.result())

        for id_, text in results:
            processed += 1
            explicacion, calidad, motivo = classify(text)
            if explicacion is None and motivo == "vacio":
                errors += 1
            elif motivo == "sin_imagen":
                null_sin_imagen += 1
            elif motivo == "controversia":
                null_controversia += 1
            elif calidad == "orientativa":
                orientativa += 1
            else:
                verificada += 1

        apply_updates(results)

        if processed % PROGRESS_EVERY < BATCH_SIZE:
            print(f"[{processed}/{total}] verificadas={verificada} orientativas={orientativa} "
                  f"NULL_sin_imagen={null_sin_imagen} NULL_controversia={null_controversia} errores={errors}")

    print(f"\nCompletado. Total procesadas: {processed}")
    print(f"  verificadas (sin duda): {verificada}")
    print(f"  orientativas (con duda razonable): {orientativa}")
    print(f"  NULL_sin_imagen: {null_sin_imagen}")
    print(f"  NULL_controversia: {null_controversia}")
    print(f"  errores: {errors}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--test", action="store_true", help="Prueba con 5 preguntas de especialidades distintas, sin escribir en la BD")
    args = parser.parse_args()
    if args.test:
        run_test()
    else:
        run_full()
