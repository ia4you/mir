#!/usr/bin/env python3
"""
verificar_preguntas_mir.py
---------------------------
Extrae preguntas de un cuadernillo MIR (PDF oficial) y las cruza con su
plantilla de respuestas correctas (PDF oficial), para generar sentencias
SQL INSERT ya verificadas para la tabla `preguntas` de MIR Turel.

USO:
    python3 verificar_preguntas_mir.py \
        --cuadernillo cuadernillo_2025.pdf \
        --plantilla plantilla_2025.pdf \
        --anio 2025 \
        --anuladas 13,50,64,139,142,161,208 \
        --salida mir_2025.sql

Requisitos:
    pip install pdfplumber --break-system-packages
"""

import argparse
import re
import sys
import pdfplumber

from parse_plantilla import parse_plantilla_pdf

OPCIONES = ["A", "B", "C", "D", "E"]

RUIDO_MARCA_AGUA = re.compile(r"\)\d+/\d+--\d+-\w+--\(")
RUIDO_PIE_PAGINA = re.compile(r"^\d{1,3} de \d{1,3}\s*$", re.MULTILINE)
RUIDO_PAGINA_ETIQUETA = re.compile(r"P[aá]gina:\s*\d*")

# El PDF justifica el texto partiendo palabras con guion a final de línea
# (p.ej. "antece-\ndente"). Solo se une cuando ambos lados son letra
# minúscula, para no tocar guiones reales de palabras compuestas.
LETRA_MINUSCULA = r"[a-záéíóúñü]"
CORTE_GUION_SALTO = re.compile(rf"({LETRA_MINUSCULA})-\s*\n\s*({LETRA_MINUSCULA})")
CORTE_GUION_ESPACIO = re.compile(rf"({LETRA_MINUSCULA})- ({LETRA_MINUSCULA})")

def unir_palabras_cortadas(texto):
    texto = CORTE_GUION_SALTO.sub(r"\1\2", texto)
    texto = CORTE_GUION_ESPACIO.sub(r"\1\2", texto)
    return texto

def limpiar_ruido(texto):
    """Quita la marca de agua y el pie de página que el Ministerio imprime en
    cada hoja, que a veces quedan pegados sin salto de línea justo delante
    del número de la siguiente pregunta y rompen su detección."""
    texto = RUIDO_MARCA_AGUA.sub("\n", texto)
    texto = RUIDO_PIE_PAGINA.sub("\n", texto)
    texto = RUIDO_PAGINA_ETIQUETA.sub("\n", texto)
    texto = unir_palabras_cortadas(texto)
    return texto

PORTADA_MARCADORES = ("NÚMERO DE MESA", "NÚMERO DE EXPEDIENTE")

def extraer_texto(pdf_path):
    texto = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            # La portada (con los datos del aspirante) y la hoja con sólo la
            # marca de agua no contienen preguntas: si se dejan pasar, sus
            # listas numeradas de instrucciones o el ruido residual descuadran
            # la máquina de estados justo al principio del cuadernillo.
            crudo = page.extract_text() or ""
            if any(m in crudo for m in PORTADA_MARCADORES):
                continue
            if not limpiar_ruido(crudo).strip():
                continue

            # Los cuadernillos MIR se maquetan a dos columnas; extract_text()
            # sin recortar intercala líneas de ambas columnas y rompe las
            # preguntas. Se recorta cada página por la mitad y se extrae
            # primero la columna izquierda y luego la derecha.
            w, h = page.width, page.height
            izquierda = limpiar_ruido(page.crop((0, 0, w / 2, h)).extract_text() or "")
            derecha = limpiar_ruido(page.crop((w / 2, 0, w, h)).extract_text() or "")
            texto.append(izquierda)
            texto.append(derecha)
    # Segunda pasada de seguridad sobre el texto ya unido, por si algún
    # corte de palabra sobrevivió con un espacio en vez de salto de línea.
    return unir_palabras_cortadas("\n".join(texto))

TOKEN = re.compile(
    # El número debe estar al principio de línea: evita falsos positivos con
    # números que aparecen en medio de una frase (p. ej. estadiajes "T2.",
    # "N1.", valores clínicos, o el propio "N." repetido dentro de
    # "Pregunta asociada a la imagen N.").
    r"^(\d{1,3})\.\s+(.*?)(?=^\d{1,3}\.\s|\Z)",
    re.DOTALL | re.MULTILINE,
)

def parsear_cuadernillo(texto):
    tokens = [(int(n), t) for n, t in TOKEN.findall(texto)]
    preguntas = {}
    if not tokens:
        return preguntas

    estado = "nueva_pregunta"
    q_actual = None
    enunciado_actual = ""
    opciones_actual = {}
    siguiente_opcion = 1

    def guardar_pregunta_actual():
        if q_actual is not None:
            preguntas[q_actual] = {
                "enunciado": enunciado_actual.strip().replace("\n", " "),
                "opciones": opciones_actual,
            }

    for i, (numero, texto_tok) in enumerate(tokens):
        # Una pregunta real numerada "5" (posible únicamente si la pregunta
        # anterior tiene 4 opciones y la siguiente pregunta del examen es
        # justo la nº 5) es indistinguible de una 5ª opción (E) por el mero
        # valor del token. Se desambigua mirando el token siguiente: una
        # opción E real es seguida por el número de la próxima pregunta,
        # mientras que una pregunta nueva es siempre seguida por su propia
        # opción "1.".
        es_realmente_nueva_pregunta = (
            numero <= 5 and i + 1 < len(tokens) and tokens[i + 1][0] == 1
        )

        if estado == "nueva_pregunta":
            q_actual = numero
            enunciado_actual = texto_tok
            opciones_actual = {}
            siguiente_opcion = 1
            estado = "esperando_primera_opcion"

        elif estado == "esperando_primera_opcion":
            if numero == 1:
                opciones_actual[OPCIONES[0]] = texto_tok.strip().replace("\n", " ")
                siguiente_opcion = 2
                estado = "leyendo_opciones"
            else:
                enunciado_actual += f" {numero}. {texto_tok}"

        elif estado == "leyendo_opciones":
            if numero == siguiente_opcion and siguiente_opcion <= 5 and not es_realmente_nueva_pregunta:
                opciones_actual[OPCIONES[siguiente_opcion - 1]] = texto_tok.strip().replace("\n", " ")
                siguiente_opcion += 1
            else:
                guardar_pregunta_actual()
                q_actual = numero
                enunciado_actual = texto_tok
                opciones_actual = {}
                siguiente_opcion = 1
                estado = "esperando_primera_opcion"

    guardar_pregunta_actual()

    resultado = {}
    for numero, datos in preguntas.items():
        if len(datos["opciones"]) < 4:
            print(f"[AVISO] Pregunta {numero}: solo {len(datos['opciones'])} opciones detectadas, se omite.")
            continue
        resultado[numero] = datos
    return resultado

def parsear_plantilla(pdf_path):
    """Parsea el PDF oficial "Consulta de las Respuestas Correctas" (tabla V0/RC
    en varias columnas) usando las posiciones de las palabras, no el orden de
    lectura del texto plano. Ver parse_plantilla.py."""
    info = parse_plantilla_pdf(pdf_path)

    if info["estado"] != "definitivamente":
        print(f"[AVISO] La plantilla indica estado='{info['estado']}' (se esperaba 'definitivamente'). "
              f"Verifica manualmente que las respuestas correspondan a la versión final tras impugnaciones.")
    if info["version"] not in (0, None):
        print(f"[AVISO] La plantilla es de la versión {info['version']} del examen, no versión 0.")

    respuestas = {}
    for numero, resp_digit in info["respuestas"].items():
        if resp_digit is None:
            continue  # sin RC en la plantilla (anulada); también se excluirá vía --anuladas si se indica
        idx = int(resp_digit) - 1
        if 0 <= idx < len(OPCIONES):
            respuestas[numero] = OPCIONES[idx]
    return respuestas
    return respuestas

def cruzar(preguntas, respuestas, anuladas):
    verificadas = []
    descartadas = []

    for numero, datos in sorted(preguntas.items()):
        if numero in anuladas:
            descartadas.append((numero, "anulada"))
            continue

        correcta = respuestas.get(numero)
        if not correcta:
            descartadas.append((numero, "sin respuesta en plantilla"))
            continue

        if correcta not in datos["opciones"]:
            descartadas.append((numero, f"respuesta '{correcta}' no existe entre sus opciones"))
            continue

        if not datos["enunciado"] or len(datos["enunciado"]) < 5:
            descartadas.append((numero, "enunciado vacío o demasiado corto"))
            continue

        verificadas.append((numero, datos, correcta))

    return verificadas, descartadas

def escapar(s):
    return s.replace("'", "''")

def generar_sql(verificadas, anio, especialidad_por_defecto="Sin clasificar"):
    lineas = []
    lineas.append(f"-- Preguntas MIR {anio} verificadas automáticamente")
    lineas.append(f"-- Total insertadas: {len(verificadas)}")
    lineas.append("")

    for numero, datos, correcta in verificadas:
        op = datos["opciones"]
        a = escapar(op.get("A", ""))
        b = escapar(op.get("B", ""))
        c = escapar(op.get("C", ""))
        d = escapar(op.get("D", ""))
        e = op.get("E")
        e_sql = f"'{escapar(e)}'" if e else "NULL"
        pregunta = escapar(datos["enunciado"])

        sql = (
            "INSERT INTO preguntas "
            "(año, numero, especialidad, pregunta, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e, correcta) "
            f"VALUES ({anio}, {numero}, '{especialidad_por_defecto}', '{pregunta}', "
            f"'{a}', '{b}', '{c}', '{d}', {e_sql}, '{correcta}');"
        )
        lineas.append(sql)

    return "\n".join(lineas)

def main():
    parser = argparse.ArgumentParser(description="Verifica y convierte preguntas MIR a SQL")
    parser.add_argument("--cuadernillo", required=True, help="PDF del cuadernillo (versión 0)")
    parser.add_argument("--plantilla", required=True, help="PDF de la plantilla definitiva (versión 0)")
    parser.add_argument("--anio", required=True, type=int, help="Año de la convocatoria")
    parser.add_argument("--anuladas", default="", help="Números de preguntas anuladas separados por coma")
    parser.add_argument("--salida", required=True, help="Fichero .sql de salida")
    args = parser.parse_args()

    anuladas = set()
    if args.anuladas.strip():
        anuladas = {int(x.strip()) for x in args.anuladas.split(",") if x.strip()}

    print(f"[1/4] Extrayendo texto de {args.cuadernillo} ...")
    texto_cuadernillo = extraer_texto(args.cuadernillo)

    print(f"[2/4] Extrayendo y parseando plantilla {args.plantilla} ...")
    respuestas = parsear_plantilla(args.plantilla)

    print("[3/4] Parseando y cruzando preguntas con respuestas ...")
    preguntas = parsear_cuadernillo(texto_cuadernillo)
    verificadas, descartadas = cruzar(preguntas, respuestas, anuladas)

    print(f"\nPreguntas detectadas en el cuadernillo: {len(preguntas)}")
    print(f"Respuestas detectadas en la plantilla:   {len(respuestas)}")
    print(f"Preguntas verificadas y listas:          {len(verificadas)}")
    print(f"Preguntas descartadas:                   {len(descartadas)}")

    if descartadas:
        print("\nDetalle de descartadas (revisar manualmente si es necesario):")
        for numero, motivo in descartadas:
            print(f"  - Pregunta {numero}: {motivo}")

    print(f"\n[4/4] Generando {args.salida} ...")
    sql = generar_sql(verificadas, args.anio)
    with open(args.salida, "w", encoding="utf-8") as f:
        f.write(sql)

    print(f"\nListo. {len(verificadas)} preguntas escritas en {args.salida}")
    if descartadas:
        print("Revisa las descartadas antes de dar el año por completo: puede que el patrón")
        print("regex necesite un ajuste puntual para ese PDF concreto (formato distinto).")

if __name__ == "__main__":
    main()
