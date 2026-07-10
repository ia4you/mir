#!/usr/bin/env python3
"""
parse_plantilla.py
-------------------
Parser para el formato oficial "Consulta de las Respuestas Correctas" que
publica el Ministerio de Sanidad (tabla V0/RC en varias columnas). Usa las
posiciones (x,y) de las palabras extraídas por pdfplumber para reconstruir
la tabla sin depender del orden de lectura del texto plano.

USO como librería:
    from parse_plantilla import parse_plantilla_pdf
    info = parse_plantilla_pdf("plantilla_2023.pdf")
    info["titulacion"]      -> "MEDICINA"
    info["version"]         -> 0
    info["estado"]          -> "definitivamente" | "provisionalmente" | None
    info["respuestas"]      -> {1: "3", 2: "3", 3: "4", ..., 15: None, ...}
    info["anuladas"]        -> [15, 40, 128, 138]   (números con RC en blanco)

USO como CLI (para inspección rápida):
    python3 parse_plantilla.py plantilla_2023.pdf
"""

import sys
import re
import pdfplumber

RESP_RE = re.compile(r"^[1-5]$")
NUM_RE = re.compile(r"^\d{1,3}$")


def parse_plantilla_pdf(pdf_path):
    titulacion = None
    version = None
    estado = None
    pares = []  # lista de (numero_pregunta:int, respuesta:str|None) en orden de lectura

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            if titulacion is None:
                m = re.search(r"Titulaci[oó]n:\s*([A-ZÁÉÍÓÚÑ /]+?)(?:\s{2,}|\s+N[ºo°])", text)
                if m:
                    titulacion = m.group(1).strip()
            if version is None:
                m = re.search(r"versi[oó]n de examen:\s*(\d+)", text, re.IGNORECASE)
                if m:
                    version = int(m.group(1))
            if estado is None:
                m = re.search(r"aprobadas?\s+(definitivamente|provisionalmente)", text, re.IGNORECASE)
                if m:
                    estado = m.group(1).lower()

            words = page.extract_words(use_text_flow=False, keep_blank_chars=False)
            # Agrupa palabras en filas por coordenada 'top' (con tolerancia)
            rows = []
            for w in sorted(words, key=lambda w: (round(w["top"]), w["x0"])):
                placed = False
                for row in rows:
                    if abs(row["top"] - w["top"]) <= 3:
                        row["words"].append(w)
                        placed = True
                        break
                if not placed:
                    rows.append({"top": w["top"], "words": [w]})

            for row in rows:
                row_words = sorted(row["words"], key=lambda w: w["x0"])
                tokens = [w["text"] for w in row_words]
                # Salta cabeceras / pies de página
                joined = " ".join(tokens)
                if "V0" in tokens and "RC" in tokens:
                    continue
                if "Ministerio" in joined or "Consulta" in joined or "Titulaci" in joined \
                        or "Respuestas correctas" in joined or "aprobadas" in joined \
                        or "Nº de versión" in joined or "Nº de la pregunta" in joined:
                    continue
                if not tokens or not NUM_RE.match(tokens[0]):
                    continue

                # Camina la fila emparejando "numero [respuesta]" repetidamente.
                i = 0
                n = len(row_words)
                while i < n:
                    if NUM_RE.match(row_words[i]["text"]):
                        numero = int(row_words[i]["text"])
                        respuesta = None
                        if i + 1 < n and RESP_RE.match(row_words[i + 1]["text"]):
                            # Sólo lo tomamos como respuesta si el siguiente token
                            # no es en realidad el próximo número de pregunta
                            # (los números de pregunta en esta tabla nunca son de un solo dígito
                            # salvo el rango 1-9, que ya viene emparejado con RC en la práctica).
                            respuesta = row_words[i + 1]["text"]
                            i += 2
                        else:
                            i += 1
                        pares.append((numero, respuesta))
                    else:
                        i += 1

    respuestas = {}
    for numero, resp in pares:
        # Si ya existe (duplicado por artefacto de extracción), preferimos el que tenga respuesta.
        if numero not in respuestas or respuestas[numero] is None:
            respuestas[numero] = resp

    anuladas = sorted(n for n, r in respuestas.items() if r is None)

    return {
        "titulacion": titulacion,
        "version": version,
        "estado": estado,
        "respuestas": respuestas,
        "anuladas": anuladas,
        "total_preguntas": len(respuestas),
    }


def main():
    if len(sys.argv) != 2:
        print("Uso: python3 parse_plantilla.py <plantilla.pdf>")
        sys.exit(1)

    info = parse_plantilla_pdf(sys.argv[1])
    print(f"Titulación:        {info['titulacion']}")
    print(f"Versión de examen: {info['version']}")
    print(f"Estado:            {info['estado']}")
    print(f"Total preguntas detectadas: {info['total_preguntas']}")
    print(f"Preguntas con RC en blanco (candidatas a anuladas): {info['anuladas']}")

    faltantes = [n for n in range(1, (max(info["respuestas"]) if info["respuestas"] else 0) + 1)
                 if n not in info["respuestas"]]
    if faltantes:
        print(f"[AVISO] Números de pregunta ausentes por completo en la tabla: {faltantes}")


if __name__ == "__main__":
    main()
