# Auditoría completa mir-db vs. clave oficial (2022–2026)

**Fecha:** 27/09/2026. **Tipo:** solo auditoría — **no se ha aplicado ningún UPDATE**.
**Alcance:** las 1.048 preguntas `origen = 'oficial'` de mir-db (las 10 `ia_generada` quedan fuera, no proceden de ningún examen real). Cruce exacto por `(año, número)`, ya que el desfase de año está corregido desde ayer.

## 1. Resumen por año

| Año | Total | Coinciden (a) | Difieren, alta confianza (b) | Difieren, baja confianza (c) | Sin clave (d) |
|---|---|---|---|---|---|
| 2022 | 209 | **209** | 0 | 0 | 0 |
| 2023 | 210 | **210** | 0 | 0 | 0 |
| 2024 | 210 | **210** | 0 | 0 | 0 |
| 2025 | 210 | **210** | 0 | 0 | 0 |
| 2026 | 209 | **209** | 0 | 0 | 0 |
| **Total** | **1048** | **1048** | **0** | **0** | **0** |

**Resultado: las 1.048 preguntas oficiales de mir-db coinciden con la clave oficial de su año, en `correcta` y en `anulada`.** No hay ninguna discrepancia de alta ni de baja confianza, ni ningún caso donde la clave no se pueda confirmar.

Esto es consistente con que ayer (26-27/09) ya se corrigieron 137 respuestas erróneas + se insertaron 44 preguntas que faltaban + se marcaron 23 anuladas, precisamente contra esta misma clave de 5 años. Esta auditoría de hoy es la verificación independiente, número a número, de que ese trabajo quedó completo y no dejó ningún caso suelto.

### Nota sobre las preguntas oficialmente anuladas (23 en total)

No tiene sentido comparar la letra `correcta` de una pregunta anulada oficialmente: el Ministerio no reconoce ninguna respuesta válida para ella y la app ya la excluye de todo test (`anulada = true`). Por eso, para estas 23 preguntas (120, 126, 189 en 2022; 15, 40, 128, 138 en 2023; 64, 68, 113, 180, 206 en 2024; 15, 26, 28, 56, 162, 186 en 2025; 13, 50, 64, 139, 142, 161, 208 en 2026) el criterio de "coincide" es únicamente que `anulada = true` en mir-db — y las 23 lo están. El valor que quede en la columna `correcta` de una pregunta anulada no tiene efecto en la app y no se ha auditado como si fuera un error.

*(Aclaración honesta: en una primera pasada, antes de aplicar este criterio, comparé ingenuamente la letra `correcta` de las 5 anuladas de 2024 contra la plantilla **provisional** — que al no reflejar todavía la anulación posterior, sí trae una letra para esas 5 preguntas — y eso generó 4 "discrepancias" falsas. Las descarté en cuanto apliqué el criterio correcto: pregunta anulada = no hay letra oficial que comparar.)*

## 2. Discrepancias de alta confianza

**Ninguna.** Lista vacía.

## 3. Verificación adicional: texto completo (no solo la letra)

Además del cruce por letra que pedías como criterio principal, extraje el texto completo (enunciado + 4 opciones) de las 210 preguntas de cada uno de los 5 cuadernillos reales y lo comparé contra el texto guardado en mir-db para cada `(año, número)`, con similitud difusa (`rapidfuzz`, `token_set_ratio`) sobre el conjunto enunciado+opciones.

- **Mediana de similitud: 100. Media: 99,1**, sobre las 1.048 filas.
- **0 filas por debajo de 70** (que habría sido la señal de una pregunta mal emparejada o con contenido sustituido).
- **4 filas entre 83 y 90** — las revisé una a una: en los 4 casos el texto es idéntico en contenido; la similitud baja se debe únicamente a que `cuadernillo_2023.pdf` (el cuadernillo real del año 2024) tiene, en esas 4 preguntas concretas, más espacios sueltos en mitad de palabra al extraer el PDF ("re vascularización cor onaria") que el resto del documento — un artefacto de extracción del PDF, no un error de contenido.

Aprovechando esta comparación, until encontré algo que no estaba buscando y no toca hoy: en la pregunta **id 543 (2024/157)**, el enunciado de mir-db dice *"...permiten hacer frente a los cambios de lentor no, originando discapacidad..."* — es el mismo bug de palabra partida ya conocido de otras 95 preguntas (aquí "del entorno" → "de lentor no"), que no fue corregido en el lote de 44 tildes/espacios de ayer. Lo anoto como deuda técnica (ver más abajo), **no lo corrijo ahora** porque esto es solo auditoría.

## 4. Cómo se construyó la clave oficial completa (con nivel de confianza por año)

Para poder comparar "todas las opciones a-d y la respuesta correcta, no solo la letra", extraje el texto íntegro de las 210 preguntas de cada cuadernillo real (`cuadernillo_2021/2022/2023/2024/2025.pdf`, que corresponden a los exámenes celebrados en 2022-2026 tras el fix del desfase).

Esto no fue trivial: los números de opción (1-5) usan la misma notación "N. " que los números de pregunta real, así que un extractor ingenuo confunde ambas cosas, sobre todo al principio del cuadernillo, donde los números de pregunta (1, 2, 3, 4) coinciden literalmente con los números de sus propias opciones. Tuve que escribir un parser con dos contadores en paralelo (número de pregunta esperado / número de opción esperado dentro de esa pregunta) que solo interpreta un "N." como el inicio de una pregunta nueva cuando no encaja como continuación de la lista de opciones vigente, con un desempate por longitud/forma del texto para el único caso realmente ambiguo. Verificado: **210/210 preguntas extraídas en los 5 años, cada una con exactamente 4 opciones** (formato estándar del MIR desde 2020), sin huecos.

| Año | Respaldo de la clave (letra) | Nivel |
|---|---|---|
| 2022 | Plantilla PDF oficial "aprobadas definitivamente" del Ministerio, RC en blanco = anuladas (120,126,189). Corroborada por RedacciónMédica y AMIR. | **Alta** |
| 2023 | Plantilla PDF oficial "aprobadas definitivamente", RC en blanco (15,40,128,138). Corroborada por isanidad.com. | **Alta** |
| 2024 | Solo se localizó la plantilla **provisional** (no la definitiva), pero 2 medios de prensa independientes (RedacciónMédica, Gaceta Médica) confirman explícitamente que la definitiva no cambió ningún valor respecto a la provisional, solo anuló 5 preguntas (64,68,113,180,206); el texto de las preguntas 64 y 113 se verificó palabra por palabra contra la cita de prensa. | **Alta**, con la salvedad de que la fuente primaria en mano es provisional |
| 2025 | Plantilla PDF oficial "aprobadas definitivamente", RC en blanco (15,26,28,56,162,186). Corroborada por isanidad.com. | **Alta** |
| 2026 | Dos PDFs oficiales en formato Ministerio (versión 0 provisional y definitiva) descargados de blog.promir.es durante esta sesión; validados cruzando las 203 respuestas compartidas con la transcripción de casiMedicos usada ayer (0 discrepancias) y las 7 anuladas coinciden con ConSalud/isanidad.com. | **Alta** — la más verificada de las 5, con fuente primaria en mano |

**No ha aparecido ningún año en nivel "baja confianza"** (los 5 tienen respaldo de PDF oficial o de corroboración cruzada de prensa), así que el grupo (c) del encargo queda vacío.

## 5. Tiempo y esfuerzo

La mayor parte del tiempo se fue en la extracción de texto completo de los 5 cuadernillos (no en el cruce final, que es casi instantáneo): tres iteraciones de depuración del parser (fallo por textos de la portada confundidos con preguntas 1-8; fallo por colisión entre números de opción y números de pregunta real en las primeras 4 preguntas de cada año; fallo puntual por un salto de página "Página:" pegado justo donde el parser tenía que decidir si era opción o pregunta nueva). Cada iteración completa sobre los 5 cuadernillos (extracción PDF de ~200 páginas × 5) tardó 80-115 segundos; en total, unas 8-9 pasadas de prueba/verificación. El cruce final contra mir-db y la comparación de similitud de texto son inmediatos una vez con los datos limpios.

## 6. Conclusión

No hay ninguna decisión bloqueante que plantearte: los 5 años tienen clave con respaldo alto, y las 1.048 preguntas oficiales de mir-db coinciden con ella en respuesta y en estado de anulación. No se necesita ningún UPDATE derivado de esta auditoría.

Único hallazgo nuevo, no urgente, para la lista de deuda técnica: **id 543 (2024/157)**, palabra partida "de lentor no" → "del entorno" en el enunciado (mismo patrón que las ~95 ya conocidas, pendientes de corregir).
