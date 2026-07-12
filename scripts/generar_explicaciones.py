#!/usr/bin/env python3
"""Genera explicaciones para preguntas MIR pendientes vía API de Anthropic (Haiku)."""
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
IMAGE_BATCH_SIZE = 5
PROGRESS_EVERY = 50
DB_CONTAINER = "mir-db"
SEP = "\x1f"
PUBLIC_DIR = "/root/mir/public"

IMAGE_RE = re.compile(r"\b(imagen|imágen|figura|radiograf[ií]a)\b", re.IGNORECASE)
MEDIA_TYPES = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}

SYSTEM_PROMPT = """Eres un médico especialista redactando explicaciones 100% originales para preguntas del examen MIR español.

Se te da una pregunta de examen con sus opciones y la respuesta marcada como oficialmente correcta por la Comisión Calificadora. Debes responder EXCLUSIVAMENTE con una de estas dos cosas:

1. Si puedes justificar razonablemente la respuesta oficial como correcta —según guías clínicas vigentes, la enseñanza estándar de manuales MIR (aunque esté debatida en literatura reciente), o un razonamiento que la Comisión Calificadora pudo haber usado en su momento— escribe una explicación breve (2-4 frases), clara, en español, dirigida a un estudiante de MIR, justificando por qué esa opción es correcta. No menciones "la opción oficial", "el examen" ni "la Comisión"; redacta la explicación como una explicación médica directa y autocontenida.

2. Si NO puedes justificar la respuesta oficial porque contradice de forma objetiva e inequívoca la medicina básica (errores aritméticos, fisiología invertida, taxonomía o microbiología incorrecta, etc.), o si genuinamente no tienes confianza suficiente en el razonamiento clínico, responde ÚNICAMENTE con la palabra: NULL

No hay una tercera opción. No uses prefijos como "Explicación:" ni comillas. Si tu respuesta es NULL, tu mensaje completo debe ser exactamente esas 4 letras y nada más: ni razonamiento, ni justificación, ni texto adicional antes o después.

IMPORTANTE: revisa individualmente CADA opción (no solo la marcada como correcta) en busca de errores factuales, antes de aceptar la respuesta oficial. Si la respuesta correcta te genera cualquier duda o contradice lo que sabes de medicina estándar —incluso si otra de las opciones no marcada como correcta te parece describir mejor la entidad, el mecanismo o el dato correcto— devuelve exactamente "NULL" sin explicación. Es preferible quedarse sin explicación que dar una incorrecta. No racionalices ni inventes una justificación para una respuesta que te parezca cuestionable: ante la duda, NULL."""

SYSTEM_PROMPT_IMAGE = SYSTEM_PROMPT + """

Se te adjunta también la imagen clínica (radiografía, ECG, histología, dermatoscopia, etc.) a la que se refiere el enunciado. Analízala con atención: es indispensable para justificar la respuesta. Si lo que observas en la imagen no encaja con la respuesta oficial, o no puedes distinguir con suficiente confianza los hallazgos relevantes en ella, responde NULL."""


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

COLS = ["id", "especialidad", "pregunta", "opcion_a", "opcion_b", "opcion_c", "opcion_d", "opcion_e", "correcta", "imagen_path"]


def psql(sql, capture=True):
    cmd = ["docker", "exec", "-i", DB_CONTAINER, "psql", "-U", "mir", "-d", "mir",
           "-t", "-A", "-F", SEP, "-c", sql]
    return subprocess.run(cmd, capture_output=capture, text=True, check=True)


def psql_stdin(sql):
    subprocess.run(["docker", "exec", "-i", DB_CONTAINER, "psql", "-U", "mir", "-d", "mir"],
                    input=sql, text=True, capture_output=True, check=True)


def get_pending_rows():
    sql = f"SELECT {', '.join(COLS)} FROM preguntas WHERE explicacion IS NULL ORDER BY id"
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


def is_image_dependent(row):
    return bool(row.get("imagen_path")) or bool(IMAGE_RE.search(row["pregunta"] or ""))


def has_image_file(row):
    return bool(row.get("imagen_path"))


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
    return (f"Especialidad: {row['especialidad']}\n\n"
            f"Pregunta: {row['pregunta']}\n\n"
            f"{chr(10).join(opts)}\n\n"
            f"Respuesta oficial correcta: {row['correcta']}")


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
        except requests.RequestException as e:
            time.sleep(2 ** attempt)
            continue
        if resp.status_code == 200:
            data = resp.json()
            text = "".join(b.get("text", "") for b in data.get("content", []) if b.get("type") == "text").strip()
            if data.get("stop_reason") == "max_tokens":
                # Respuesta cortada por el modelo antes de terminar: no es fiable
                # (puede quedarse a mitad de frase sin llegar a concluir NULL).
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


NULL_WORD_RE = re.compile(r"\bnull\b", re.IGNORECASE)


def is_null_response(text):
    if not text:
        return True
    # El modelo a veces antepone/pospone NULL a una justificación en vez de
    # responder solo "NULL" pese a la instrucción; si la palabra aparece en
    # cualquier posición, se trata como no-explicación (no se escribe en BD).
    return bool(NULL_WORD_RE.search(text))


def apply_updates(results):
    stmts = ["BEGIN;"]
    count = 0
    for id_, text in results:
        if text and not is_null_response(text):
            stmts.append(f"UPDATE preguntas SET explicacion = '{sql_escape(text.strip())}' WHERE id = {id_};")
            count += 1
    stmts.append("COMMIT;")
    if count:
        psql_stdin("\n".join(stmts))
    return count


def run_test(images=False):
    rows = get_pending_rows()
    rows = [r for r in rows if has_image_file(r)] if images else [r for r in rows if not is_image_dependent(r)]
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
        print("=" * 100)
        print(f"id {id_} | {r['especialidad']} | correcta: {r['correcta']} | imagen: {r.get('imagen_path') or '-'}")
        print(f"Pregunta: {r['pregunta'][:200]}")
        print(f"-> {text}")
    print("\n(modo prueba: no se ha escrito nada en la base de datos)")


def run_full():
    rows = get_pending_rows()
    total_pending = len(rows)
    image_rows = [r for r in rows if is_image_dependent(r)]
    work_rows = [r for r in rows if not is_image_dependent(r)]
    print(f"Pendientes totales: {total_pending} | excluidas por imagen: {len(image_rows)} | a procesar via API: {len(work_rows)}\n")

    processed = 0
    explained = 0
    nulled = 0
    errors = 0

    for i in range(0, len(work_rows), BATCH_SIZE):
        batch = work_rows[i:i + BATCH_SIZE]
        results = []
        with ThreadPoolExecutor(max_workers=BATCH_SIZE) as ex:
            futures = [ex.submit(call_api, r) for r in batch]
            for fut in as_completed(futures):
                results.append(fut.result())

        for id_, text in results:
            processed += 1
            if text is None:
                errors += 1
            elif is_null_response(text):
                nulled += 1
            else:
                explained += 1

        n_updated = apply_updates(results)

        if processed % PROGRESS_EVERY < BATCH_SIZE:
            print(f"[{processed}/{len(work_rows)}] explicadas={explained} NULL={nulled} errores={errors}")

    print(f"\nCompletado. Total procesadas: {processed} | explicadas: {explained} | NULL (sin update): {nulled} | errores: {errors}")
    print(f"Excluidas por imagen (no tocadas): {len(image_rows)}")


def run_images():
    rows = get_pending_rows()
    image_rows = [r for r in rows if has_image_file(r)]
    print(f"Preguntas con imagen asociada y sin explicación: {len(image_rows)}\n")

    processed = 0
    explained = 0
    nulled = 0
    errors = 0

    for i in range(0, len(image_rows), IMAGE_BATCH_SIZE):
        batch = image_rows[i:i + IMAGE_BATCH_SIZE]
        results = []
        with ThreadPoolExecutor(max_workers=IMAGE_BATCH_SIZE) as ex:
            futures = [ex.submit(call_api, r) for r in batch]
            for fut in as_completed(futures):
                results.append(fut.result())

        for id_, text in results:
            processed += 1
            if text is None:
                errors += 1
            elif is_null_response(text):
                nulled += 1
            else:
                explained += 1

        apply_updates(results)
        print(f"[{processed}/{len(image_rows)}] explicadas={explained} NULL={nulled} errores={errors}")

    print(f"\nCompletado. Total procesadas: {processed} | explicadas: {explained} | NULL (sin update): {nulled} | errores: {errors}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--test", action="store_true", help="Prueba con 5 preguntas de especialidades distintas, sin escribir en la BD")
    parser.add_argument("--images", action="store_true", help="Procesa (con la imagen adjunta) las preguntas con imagen_path asociado")
    args = parser.parse_args()
    if args.test:
        run_test(images=args.images)
    elif args.images:
        run_images()
    else:
        run_full()
