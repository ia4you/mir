#!/usr/bin/env python3
"""Extrae las imágenes numeradas de los cuadernillos de imágenes MIR (2021-2025).

Estrategia por año, verificada visualmente contra el render de cada página:

- 2021/2022/2023: PDF "landscape" de doble página (spread), texto "IMAGEN N"
  extraíble directamente con posición. 2 columnas x 2 filas por página.
- 2024: PDF portrait de una página por hoja, texto de las etiquetas no
  extraíble (fuente rota) pero sí extraíble el nº de página y pie; usa
  agrupación adaptativa de los objetos-imagen (get_image_info) + orden
  secuencial conocido (1..25 de arriba a abajo), verificado visualmente.
- 2025: mismo layout "spread" de doble página que 2021, con las etiquetas
  dibujadas de forma no extraíble como texto (ni con OCR fiable) — mapa de
  página->números fijado a partir de inspección visual de las 8 páginas de
  contenido. Incluye imágenes partidas en sub-imágenes (5a/5b, 10a/10b,
  12a/12b) que se fusionan en un único archivo por número.
"""
import io
import os

import fitz
from PIL import Image

PDFS_DIR = "/root/mir/pdfs"
OUT_DIR = "/root/mir/public/imagenes-mir"
RENDER_DPI = 250

# --- 2021/2022/2023: extracción por texto (ya validada: 25/25 en los 3 años) ---

import re


def etiquetas_por_texto(page):
    words = page.get_text("words")
    labels = []
    for i, w in enumerate(words):
        if w[4].lower() == "imagen" and i + 1 < len(words):
            nxt = words[i + 1]
            if re.match(r"^\d+$", nxt[4]):
                labels.append((int(nxt[4]), w[0], w[1], nxt[2], nxt[3]))
    return labels


def extraer_por_texto(anio):
    path = f"{PDFS_DIR}/imagenes_{anio}.pdf"
    doc = fitz.open(path)
    out_dir = f"{OUT_DIR}/{anio}"
    os.makedirs(out_dir, exist_ok=True)

    guardadas = {}
    for pno in range(len(doc)):
        page = doc[pno]
        etiquetas = etiquetas_por_texto(page)
        if not etiquetas:
            continue
        pw, ph = page.rect.width, page.rect.height
        columnas = [(0, pw / 2), (pw / 2, pw)]
        for col_x0, col_x1 in columnas:
            en_columna = sorted(
                [e for e in etiquetas if col_x0 <= e[1] < col_x1], key=lambda e: e[2]
            )
            for idx, (numero, lx0, ly0, lx1, ly1) in enumerate(en_columna):
                y_top = ly1 + 3
                y_bottom = en_columna[idx + 1][2] - 3 if idx + 1 < len(en_columna) else ph - 20
                clip = fitz.Rect(col_x0 + 2, y_top, col_x1 - 2, y_bottom)
                if clip.height < 20 or clip.width < 20:
                    continue
                pix = page.get_pixmap(dpi=RENDER_DPI, clip=clip)
                img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
                out_path = f"{out_dir}/imagen_{numero}.jpg"
                img.save(out_path, "JPEG", quality=90)
                guardadas[numero] = out_path
    return guardadas


# --- 2024: agrupación adaptativa + orden secuencial conocido ---

MAPA_2024 = {
    2: [1, 2], 3: [3, 4], 4: [5, 6], 5: [7, 8], 6: [9, 10], 7: [11, 12],
    8: [13], 9: [14, 15], 10: [16, 17], 11: [18, 19], 12: [20, 21],
    13: [22, 23], 14: [24, 25],
}


def objetos_validos(page):
    infos = page.get_image_info()
    return [i for i in infos if i["bbox"][3] - i["bbox"][1] > 15 and i["bbox"][2] - i["bbox"][0] > 15]


def agrupar_en_n_clusters(objetos, n):
    objetos = sorted(objetos, key=lambda i: i["bbox"][1])
    if n == 1:
        return [objetos]
    # buscamos los (n-1) huecos verticales más grandes entre objetos consecutivos
    huecos = []
    for i in range(len(objetos) - 1):
        gap = objetos[i + 1]["bbox"][1] - objetos[i]["bbox"][3]
        huecos.append((gap, i))
    huecos.sort(reverse=True)
    cortes = sorted(idx for _, idx in huecos[: n - 1])
    grupos, inicio = [], 0
    for corte in cortes:
        grupos.append(objetos[inicio : corte + 1])
        inicio = corte + 1
    grupos.append(objetos[inicio:])
    return grupos


def extraer_2024():
    anio = 2024
    doc = fitz.open(f"{PDFS_DIR}/imagenes_{anio}.pdf")
    out_dir = f"{OUT_DIR}/{anio}"
    os.makedirs(out_dir, exist_ok=True)
    guardadas = {}

    for pno, numeros in MAPA_2024.items():
        page = doc[pno]
        ph = page.rect.width, page.rect.height
        objetos = objetos_validos(page)
        grupos = agrupar_en_n_clusters(objetos, len(numeros))
        for numero, grupo in zip(numeros, grupos):
            x0 = min(o["bbox"][0] for o in grupo) - 5
            x1 = max(o["bbox"][2] for o in grupo) + 5
            y0 = min(o["bbox"][1] for o in grupo) - 35  # incluye la etiqueta "Imagen N"
            y1 = max(o["bbox"][3] for o in grupo) + 5
            clip = fitz.Rect(max(0, x0), max(0, y0), min(page.rect.width, x1), min(page.rect.height, y1))
            pix = page.get_pixmap(dpi=RENDER_DPI, clip=clip)
            img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
            out_path = f"{out_dir}/imagen_{numero}.jpg"
            img.save(out_path, "JPEG", quality=90)
            guardadas[numero] = out_path
    return guardadas


# --- 2025: mapa fijo por cuadrante, verificado visualmente ---
# cada entrada: numero -> (pagina_idx, cuadrante) con cuadrante en
# {TL,TR,BL,BR}; TL/TR ocupan la fila superior, BL/BR la inferior.
MAPA_2025 = {
    1: (2, "TR"), 2: (2, "BR"),
    3: (3, "TL"), 4: (3, "BL"),
    5: (4, "TR"), 6: (4, "BR"),
    7: (5, "TL"), 25: (5, "TR"), 8: (5, "BL"),
    23: (6, "TL"), 9: (6, "TR"), 24: (6, "BL"), 10: (6, "BR"),
    11: (7, "TL"), 21: (7, "TR"), 12: (7, "BL"), 22: (7, "BR"),
    19: (8, "TL"), 13: (8, "TR"), 20: (8, "BL"), 14: (8, "BR"),
    15: (9, "TL"), 17: (9, "TR"), 16: (9, "BL"), 18: (9, "BR"),
}


def extraer_2025():
    anio = 2025
    doc = fitz.open(f"{PDFS_DIR}/imagenes_{anio}.pdf")
    out_dir = f"{OUT_DIR}/{anio}"
    os.makedirs(out_dir, exist_ok=True)
    guardadas = {}

    por_pagina = {}
    for numero, (pidx, cuad) in MAPA_2025.items():
        por_pagina.setdefault(pidx, []).append((numero, cuad))

    for pidx, entradas in por_pagina.items():
        page = doc[pidx]
        pw, ph = page.rect.width, page.rect.height
        x_mid, y_mid = pw / 2, ph * 0.52
        margenes = {
            "TL": fitz.Rect(2, 15, x_mid - 2, y_mid),
            "TR": fitz.Rect(x_mid + 2, 15, pw - 2, y_mid),
            "BL": fitz.Rect(2, y_mid, x_mid - 2, ph - 20),
            "BR": fitz.Rect(x_mid + 2, y_mid, pw - 2, ph - 20),
        }
        for numero, cuad in entradas:
            clip = margenes[cuad]
            pix = page.get_pixmap(dpi=RENDER_DPI, clip=clip)
            img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
            out_path = f"{out_dir}/imagen_{numero}.jpg"
            img.save(out_path, "JPEG", quality=90)
            guardadas[numero] = out_path
    return guardadas


if __name__ == "__main__":
    resumen = {}
    for anio in [2021, 2022, 2023]:
        guardadas = extraer_por_texto(anio)
        resumen[anio] = guardadas
    resumen[2024] = extraer_2024()
    resumen[2025] = extraer_2025()

    print("\n=== RESUMEN ===")
    for anio, guardadas in resumen.items():
        faltantes = sorted(set(range(1, 26)) - set(guardadas.keys()))
        print(f"{anio}: {len(guardadas)}/25", f"(faltan {faltantes})" if faltantes else "OK")
