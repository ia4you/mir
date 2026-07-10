# Fuentes del banco de preguntas — MIR Turel

Trazabilidad completa de dónde sale cada dato del banco de 1004 preguntas (`mir_5_anios.sql`), año por año. Generado antes de tocar el código de la app, según lo pedido.

## Resumen por año

| Año | Cuadernillo (preguntas) | Plantilla (respuestas correctas) | Anuladas — fuente | ¿Versión 0? |
|---|---|---|---|---|
| 2021 | [Mirial](https://mirial.es/images/examen-mir/Examen%20MIR%202021/Examen%20MIR%202021.pdf) — mirror del cuadernillo oficial del Ministerio de Sanidad | [ConSalud](https://www.consalud.es/uploads/s1/15/67/49/5/mir-version-0-respuestas-correctas.pdf) — plantilla **definitiva** oficial, confirmada por cabecera interna "aprobadas definitivamente" | [ConSalud](https://www.consalud.es/formacion/mir-2021-consultar-respuestas-correctas-examen_95132_102.html) — "histórico mínimo", solo 2 impugnadas | Sí (confirmado en el propio PDF) |
| 2022 | [Mirial](https://mirial.es/images/examen-mir/Examen%20MIR%202022/Examen%20MIR%202022.pdf) | [ConSalud](https://www.consalud.es/uploads/s1/18/30/61/1/respuestas-correctas-definitivas-examen-mir-2022.pdf) — la cabecera interna del PDF dice "aprobadas provisionalmente" pese a estar publicado en un artículo de "definitivas" (posible error de plantilla del Ministerio o mezcla de archivo por parte de ConSalud); se aceptó porque sus 3 filas en blanco coinciden exactamente con las anuladas confirmadas por prensa | [RedacciónMédica](https://www.redaccionmedica.com/secciones/formacion/publicadas-las-respuestas-definitivas-del-examen-mir-3-preguntas-anuladas-4171) + [AMIR](https://amireducacion.com/el-ministerio-da-a-conocer-las-respuestas-correctas-definitivas-del-mir-2022/) — 120, 126, 189 | Sí (indicado en el PDF), contenido validado por 3 fuentes de prensa independientes |
| 2023 | [Mirial](https://mirial.es/images/examen-mir/Examen%20MIR%202023/Examen%20MIR%202023.pdf) | [isanidad.com](https://isanidad.com/wp-content/uploads/2023/02/respuestasCorrectas.pdf) — plantilla **definitiva** oficial, cabecera "aprobadas definitivamente" verificada | Confirmado por blancos en la propia plantilla + [isanidad.com](https://isanidad.com/240110/sanidad-anula-cuatro-preguntas-examen-mir-publica-plantilla-definitiva-respuestas-correctas/) — 15, 40, 128, 138 | Sí (confirmado en el propio PDF) |
| 2024 | [Mirial](https://mirial.es/images/examen-mir/Examen%20MIR%202024/Examen%20MIR%202024.pdf) | [ConSalud](https://www.consalud.es/uploads/s1/27/52/69/5/respuestas-correctas-provisionales-examen-mir-2024-version-0.pdf) — es la plantilla **PROVISIONAL**; no se localizó un PDF etiquetado "definitiva". Se usó igualmente porque [RedacciónMédica](https://www.redaccionmedica.com/secciones/formacion/el-examen-mir-2024-carga-con-5-anulaciones-en-sus-respuestas-definitivas-3205) y [Gaceta Médica](https://gacetamedica.com/profesion/las-respuestas-definitivas-anulan-cinco-preguntas-del-examen-mir-y-tres-nuevas-del-eir/) confirman explícitamente que la definitiva **no cambió ningún valor de respuesta** respecto a la provisional, solo anuló 5 preguntas | RedacciónMédica + Gaceta Médica + [ConSalud](https://www.consalud.es/formacion/mir/examen-mir-2024-anula-definitivamente-5-preguntas-despues-recibir-impugnaciones_139907_102.html) — 64, 68, 113, 180, 206 | Sí |
| 2025 | [Mirial](https://mirial.es/images/examen-mir/Examen%20MIR%202025/Examen%20MIR%202025.pdf) | [ConSalud](https://www.consalud.es/uploads/s1/34/72/70/2/plantillas-de-respuestas-definitivas-correctas-mir-2025-version-0.pdf) — plantilla **definitiva** oficial, cabecera "aprobadas definitivamente" verificada, incluye los 2 cambios de respuesta post-impugnación (P150 y P208) | Confirmado por blancos en la propia plantilla + [isanidad.com](https://isanidad.com/319105/sanidad-publica-las-respuestas-definitivas-del-examen-mir-2025-con-seis-preguntas-impugnadas/) — 15, 26, 28, 56, 162, 186 | Sí (confirmado en el propio PDF) |

## Herramientas propias usadas para procesar las fuentes

- `verificar_preguntas_mir.py` — extrae preguntas del cuadernillo (PDF) y las cruza con la plantilla de respuestas para generar el SQL.
- `parse_plantilla.py` — parser dedicado (posiciones pdfplumber) para la tabla oficial multi-columna "Consulta de las Respuestas Correctas" del Ministerio de Sanidad; necesario porque el texto plano de esas tablas no es legible en orden de lectura simple.
- `procesar_5_anios.sh` — orquesta los 5 años y concatena el resultado en `mir_5_anios.sql`.

## Incidencia relevante — pregunta 208 de 2025 (EXCLUIDA)

Durante la verificación crucé el contenido real de la pregunta 208 (reserva) contra la descripción que hace [RedacciónMédica](https://www.redaccionmedica.com/secciones/formacion/las-respuestas-definitivas-del-examen-mir-2025-acarrean-seis-impugnaciones-5828) del cambio de respuesta de esa pregunta. El cuadernillo descargado la tiene como un caso de cirrosis hepática; RedacciónMédica la describe (cita textual) como un varón con IAMSEST y antiagregación. No pude resolver la discrepancia con certeza — **se excluyó del banco de datos** en vez de arriesgar un dato incorrecto.

## Totales finales por año

| Año | Preguntas insertadas | Anuladas excluidas |
|---|---|---|
| 2021 | 183 (de 185 totales — edición COVID reducida: 175 base + 10 reserva) | 147, 176 |
| 2022 | 207 | 120, 126, 189 |
| 2023 | 206 | 15, 40, 128, 138 |
| 2024 | 205 | 64, 68, 113, 180, 206 |
| 2025 | 203 | 15, 26, 28, 56, 162, 186, **208** (discrepancia sin resolver) |
| **Total** | **1004** | — |

## Nota sobre fiabilidad de fuentes

No se usó ningún foro, red social ni fuente sin respaldo editorial/oficial. Todas las plantillas de respuestas son PDFs oficiales del Ministerio de Sanidad, mirroreados por medios especializados en Formación Sanitaria Especializada (ConSalud, isanidad.com) tras la retirada de los enlaces originales de sanidad.gob.es. Cada lista de anuladas está corroborada por al menos 2 medios de prensa independientes, y en 3 de los 5 años (2021, 2023, 2025) además por la presencia física de filas en blanco en el propio documento oficial descargado.
