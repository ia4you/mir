# Fuentes del banco de preguntas — MIR Turel

Trazabilidad de dónde sale cada dato del banco de preguntas oficiales (`preguntas`, `origen = 'oficial'`), año por año.

**Reescrito el 27/09/2026.** La versión anterior de este documento (ver historial de git) daba por buena una relación cuadernillo↔plantilla que resultó estar desplazada un año en los cinco años del banco — ver «Bug de desfase de año», más abajo. Todo lo que sigue está verificado tras corregirlo.

## Criterio de año

`preguntas.año` es el **año de celebración del examen** (enero del año siguiente al de la convocatoria), no el año de convocatoria impreso en la portada del cuadernillo. Es el criterio usado por el BOE, la prensa especializada y las academias (CTO, AMIR, etc.) al hablar de "el MIR de tal año".

## Resumen por año

| Año (celebración) | Cuadernillo real | Plantilla de respuestas | Anuladas verificadas | ¿Plantilla "definitiva"? |
|---|---|---|---|---|
| 2022 | `cuadernillo_2021.pdf` — portada "PRUEBAS SELECTIVAS 2021" ([Mirial](https://mirial.es/images/examen-mir/Examen%20MIR%202021/Examen%20MIR%202021.pdf), mirror del oficial) | `plantilla_2022.pdf` ([ConSalud](https://www.consalud.es/uploads/s1/18/30/61/1/respuestas-correctas-definitivas-examen-mir-2022.pdf)) | **120, 126, 189** — RC en blanco en la propia plantilla | Sí, cabecera "aprobadas definitivamente"; corroborado por [RedacciónMédica](https://www.redaccionmedica.com/secciones/formacion/publicadas-las-respuestas-definitivas-del-examen-mir-3-preguntas-anuladas-4171) + [AMIR](https://amireducacion.com/el-ministerio-da-a-conocer-las-respuestas-correctas-definitivas-del-mir-2022/) |
| 2023 | `cuadernillo_2022.pdf` — portada "2022" ([Mirial](https://mirial.es/images/examen-mir/Examen%20MIR%202022/Examen%20MIR%202022.pdf)) | `plantilla_2023.pdf` ([isanidad.com](https://isanidad.com/wp-content/uploads/2023/02/respuestasCorrectas.pdf)) | **15, 40, 128, 138** — RC en blanco | Sí, cabecera "aprobadas definitivamente"; corroborado por [isanidad.com](https://isanidad.com/240110/sanidad-anula-cuatro-preguntas-examen-mir-publica-plantilla-definitiva-respuestas-correctas/) |
| 2024 | `cuadernillo_2023.pdf` — portada "2023" ([Mirial](https://mirial.es/images/examen-mir/Examen%20MIR%202023/Examen%20MIR%202023.pdf)) | `plantilla_2024.pdf` ([ConSalud](https://www.consalud.es/uploads/s1/27/52/69/5/respuestas-correctas-provisionales-examen-mir-2024-version-0.pdf)) — **es la provisional**, sin RC en blanco | **64, 68, 113, 180, 206** — no marcadas en el PDF; confirmadas por [RedacciónMédica](https://www.redaccionmedica.com/secciones/formacion/el-examen-mir-2024-carga-con-5-anulaciones-en-sus-respuestas-definitivas-3205) y [Gaceta Médica](https://gacetamedica.com/profesion/las-respuestas-definitivas-anulan-cinco-preguntas-del-examen-mir-y-tres-nuevas-del-eir/) (ambas dicen explícitamente que la definitiva no cambió ningún valor respecto a la provisional, solo anuló estas 5); texto de las preguntas 64 y 113 verificado palabra por palabra contra la cita de prensa | No (provisional), pero sin cambios de valor respecto a la definitiva según 2 fuentes independientes |
| 2025 | `cuadernillo_2024.pdf` — portada "2024" ([Mirial](https://mirial.es/images/examen-mir/Examen%20MIR%202024/Examen%20MIR%202024.pdf)) | `plantilla_2025.pdf` ([ConSalud](https://www.consalud.es/uploads/s1/34/72/70/2/plantillas-de-respuestas-definitivas-correctas-mir-2025-version-0.pdf)) | **15, 26, 28, 56, 162, 186** — RC en blanco; incluye ya el cambio de respuesta post-impugnación de la pregunta 150 | Sí, cabecera "aprobadas definitivamente"; corroborado por [isanidad.com](https://isanidad.com/319105/sanidad-publica-las-respuestas-definitivas-del-examen-mir-2025-con-seis-preguntas-impugnadas/) |
| 2026 | `cuadernillo_2025.pdf` — portada "2025" ([Mirial](https://mirial.es/images/examen-mir/Examen%20MIR%202025/Examen%20MIR%202025.pdf)) | **No se descargó un PDF oficial del Ministerio.** Clave transcrita de la tabla V0 de [casiMedicos.com](https://www.casimedicos.com/respuestas-definitivas-mir-2026/) | **13, 50, 64, 139, 142, 161, 208** — huecos de la tabla, coinciden exactamente con las 7 anuladas anunciadas por [ConSalud](https://www.consalud.es/formacion/mir/mir-2026-la-comision-calificadora-anuncia-las-preguntas-que-anula-del-examen.html) e [isanidad.com](https://isanidad.com/359991/la-comision-calificadora-anula-siete-preguntas-de-las-plantillas-definitivas-del-examen-mir-2026/) | Ver «Verificación de la clave de 2026», abajo — **pendiente contrastar con el PDF oficial del Ministerio** cuando se localice |

`plantilla_2021.pdf` (185 filas, examen reducido por la pandemia) **no se usa para nada de este banco**: corresponde al examen celebrado en enero de 2021, cuyo cuadernillo (portada "PRUEBAS SELECTIVAS 2020") no está en este repositorio. Se queda en el proyecto por si hace falta en el futuro, pero no debe emparejarse con ningún cuadernillo aquí presente — ver el bug de abajo, causado exactamente por un emparejamiento de este tipo.

## Bug de desfase de año (encontrado y corregido el 27/09/2026)

La carga original de la base de datos emparejó `cuadernillo_AÑO.pdf` con `plantilla_AÑO.pdf` (mismo año), usando la portada del cuadernillo como si fuera también el año de la plantilla. Es un error: la portada del cuadernillo lleva el año de **convocatoria**, y la plantilla corresponde al año en que se **celebra** el examen (enero del año siguiente). El emparejamiento correcto es `cuadernillo_AÑO.pdf` ↔ `plantilla_(AÑO+1).pdf`, como refleja la tabla de arriba.

**Cómo se descubrió:** al cruzar mir-db contra estudio-db (Libro Gordo AMIR, verificado independientemente), las respuestas coincidían con la plantilla del año "vecino" un 94-100 % de las veces, y con la plantilla del propio año un ~25 % (el nivel del azar). Se confirmó con evidencia independiente: el cuadernillo que la propia API pública de examenesmir.com etiqueta como "convocatoria 2026" es, byte a byte, idéntico a nuestro `cuadernillo_2025.pdf`; y el texto de las preguntas anuladas citado por la prensa para cada examen aparece, palabra por palabra, en el cuadernillo del año correcto (por ejemplo, la pregunta 64 anulada del "MIR 2024" de la prensa es la número 64 de `cuadernillo_2023.pdf`, no de `cuadernillo_2024.pdf`).

**Consecuencias corregidas ese mismo día:**
- `preguntas.año` desplazado +1 en las 1048 filas oficiales (2021→2022 … 2025→2026).
- 137 preguntas con `correcta`/`explicacion` erróneas por este motivo, corregidas contra la clave del año que de verdad les corresponde.
- 23 preguntas identificadas como realmente anuladas por el Ministerio, marcadas con la columna `anulada` (antes se creía que las anuladas eran otras, de un examen distinto).
- 44 preguntas oficiales que faltaban en el banco (por el mismo desfase, quedaban excluidas o nunca llegaron a cargarse) extraídas de los cuadernillos e incorporadas.
- Todo el texto de la web ("MIR 2021–2025", filtros por año, etc.) actualizado al rango correcto (2022–2026).
- `preguntas_controvertidas.md`: sus 265 entradas verificadas contra la clave ya bien emparejada; 41 quedaban resueltas por esta corrección (39 de ellas coincidían exactamente con lo que ya argumentaba el razonamiento clínico de la auditoría anterior) y 5 resultaron ser preguntas realmente anuladas.

Detalle completo, con toda la evidencia paso a paso (matrices de coincidencia por año, hashes de los cuadernillos, capturas de la API de examenesmir.com), en `/root/informe_comparacion_v3/plantilla_desfase/LEEME_causa_desfase.md` — fuera de este repositorio, junto al resto de material de la corrección (`mir_db_vs_clave_oficial.csv`, `discrepancias_a_corregir.csv`).

## Verificación de la clave de 2026

Al no existir en este repositorio un PDF oficial del Ministerio para el examen de enero de 2026, se usó la tabla V0 transcrita por casiMedicos.com, validada con tres comprobaciones independientes antes de usarla:

1. **Corroboración de contenido:** el texto de dos preguntas anuladas citadas literalmente por la prensa (la 50, "Respecto al cáncer de mama:", y la 64, sobre un ensayo de un colirio) coincide exactamente con esos mismos números en `cuadernillo_2025.pdf`.
2. **Consistencia interna:** casiMedicos publica también las tablas de conversión de las versiones de examen V1 a V4 a V0; se cruzaron las 839 celdas de esas tablas contra la V0 transcrita y no hubo ni una sola inconsistencia.
3. **Coincidencia de anuladas:** los 7 huecos (RC en blanco) de la tabla V0 coinciden exactamente con las 7 preguntas que ConSalud e isanidad.com identifican como anuladas en la resolución definitiva.

Pendiente: sustituir esta fuente por el PDF oficial del Ministerio de Sanidad en cuanto se localice o se publique un mirror.

## Herramientas propias usadas para procesar las fuentes

- `verificar_preguntas_mir.py` — extrae preguntas del cuadernillo (PDF) y las cruza con la plantilla de respuestas para generar el SQL.
- `parse_plantilla.py` — parser dedicado (posiciones pdfplumber) para la tabla oficial multi-columna "Consulta de las Respuestas Correctas" del Ministerio de Sanidad.
- `procesar_5_anios.sh` — orquesta los años y concatena el resultado en `mir_5_anios.sql` (carga original, hoy superada por las correcciones posteriores directamente en la base de datos).

## Totales actuales por año

| Año | Preguntas en el banco | Marcadas `anulada` (excluidas de tests) | Anuladas que no llegaron a cargarse |
|---|---|---|---|
| 2022 | 209 | 2 (120, 126) | 189 |
| 2023 | 210 | 4 (15, 40, 128, 138) | — |
| 2024 | 210 | 5 (64, 68, 113, 180, 206) | — |
| 2025 | 210 | 6 (15, 26, 28, 56, 162, 186) | — |
| 2026 | 209 | 6 (13, 50, 64, 139, 142, 161) | 208 (de reserva) |
| **Total oficiales** | **1048** | **23** | **2** |

A esto se suman 10 preguntas de origen `ia_generada` (año 0, sin relación con ningún examen real), no usadas actualmente en ningún punto de la app. Total del banco: 1058.

## Nota sobre fiabilidad de fuentes

No se usa ningún foro, red social ni fuente sin respaldo editorial. Las plantillas de 2022, 2023 y 2025 son PDFs oficiales "definitiva" del Ministerio de Sanidad, con RC en blanco confirmando cada anulada directamente en el propio documento. La de 2024 es la provisional (no se localizó la definitiva), corroborada por dos medios de prensa independientes que confirman explícitamente que no hubo cambios de valor respecto a ella. La de 2026 se documenta aparte, con su propia verificación de tres vías, por no proceder de un PDF oficial descargado directamente.
