# Cardiología — resto (52 preguntas), borrador antes de UPDATE

Ninguna de estas explicaciones se ha escrito aún en la BD. Protocolo idéntico
al lote de prueba: 2-3 frases, solo el porqué de la correcta, NULL por imagen
sin excepción, NULL si <90% de confianza. Los casos con `correcta` verificada
pero que a mi juicio clínico no es la más defendible están documentados en
`preguntas_controvertidas.md` y no llevan explicación.

## Explicaciones redactadas (9)

### id 131 (2021-131) — Neumotórax espontáneo
**Correcta:** C) Disminución/abolición de las vibraciones vocales y timpanismo en la percusión en hemitórax derecho.
> El cuadro (varón joven, delgado, dolor torácico agudo y disnea brusca durante el ejercicio) es típico de un neumotórax espontáneo primario. El aire libre en el espacio pleural impide la transmisión de las vibraciones vocales hacia la pared torácica y sustituye la resonancia normal del pulmón por un timpanismo característico a la percusión, a diferencia del derrame pleural (matidez) o la consolidación (soplo tubárico).

### id 305 (2022-123) — Estenosis aórtica grave + enfermedad coronaria trivaso
**Correcta:** A) TAVI + stents coronarios simultáneos.
> En pacientes con estenosis aórtica grave y enfermedad coronaria multivaso candidatos a tratamiento percutáneo, revascularizar por completo y realizar el TAVI en el mismo procedimiento evita una segunda intervención y el periodo de riesgo hemodinámico que supondría tratar por separado la valvulopatía grave y las lesiones coronarias significativas.

### id 306 (2022-124) — Estenosis aórtica grave, riesgo intermedio, insuficiencia renal
**Correcta:** B) Implante percutáneo de válvula aórtica (TAVI).
> El paciente presenta estenosis aórtica grave sintomática (síncope, angina, disnea) con pulso parvus et tardus y riesgo quirúrgico intermedio, el escenario típico en el que las guías actuales recomiendan TAVI sobre el recambio quirúrgico, más aún considerando la insuficiencia renal asociada, que incrementa el riesgo de la cirugía convencional.

### id 350 (2022-169) — Endocarditis por SARM/VISA refractaria a daptomicina
**Correcta:** B) Añadir ceftarolina IV.
> Ante una endocarditis por SARM con sensibilidad intermedia a vancomicina que no responde a daptomicina en monoterapia, añadir un betalactámico como ceftarolina aprovecha la sinergia descrita entre daptomicina y betalactámicos frente a cepas resistentes de S. aureus, una estrategia de rescate reconocida en la endocarditis refractaria a daptomicina.

### id 502 (2023-114) — Miocarditis fulminante, shock refractario a aminas
**Correcta:** D) Dispositivo de asistencia ventricular de corta duración.
> En el shock cardiogénico refractario a aminas por miocarditis fulminante, el soporte circulatorio mecánico de corta duración permite descargar el ventrículo y mantener la perfusión sistémica mientras se espera la recuperación miocárdica —frecuente en esta entidad—, siendo una opción más eficaz que escalar únicamente el soporte farmacológico o el balón de contrapulsación.

### id 506 (2023-118) — Taquicardia de QRS ancho con inestabilidad hemodinámica
**Correcta:** D) Cardioversión eléctrica urgente.
> Una taquicardia de QRS ancho con signos de inestabilidad hemodinámica (hipotensión, obnubilación) constituye una emergencia que obliga a la cardioversión eléctrica sincronizada inmediata, sin demorar el tratamiento intentando antes fármacos antiarrítmicos, que además pueden empeorar la situación hemodinámica.

### id 693 (2024-99) — Bloqueo de rama izquierda, QRS 150 ms
**Correcta:** A) Asincronía ventricular.
> Un QRS ancho por bloqueo de rama izquierda refleja una activación ventricular secuencial (primero el septo y el VD, después la pared lateral del VI) en lugar de simultánea, lo que genera una contracción asincrónica que puede comprometer el llenado y la eyección, y es la base fisiopatológica que justifica la terapia de resincronización en pacientes seleccionados.

### id 879 (2025-82) — Trombosis vs. embolia arterial
**Correcta:** D) Mayor desarrollo de circulación colateral en la trombosis arterial.
> La trombosis arterial se instaura habitualmente sobre una arteria con enfermedad aterosclerótica previa, lo que ha dado tiempo a desarrollar circulación colateral; la embolia, en cambio, ocluye de forma súbita un vaso previamente sano sin colaterales desarrolladas, lo que explica la isquemia más brusca y grave típica de esta última.

### id 880 (2025-83) — Tratamiento de la estenosis aórtica
**Correcta:** B) Recambio valvular en pacientes sintomáticos.
> La aparición de síntomas (angina, síncope o disnea) en la estenosis aórtica marca el punto en el que el riesgo de muerte súbita y de deterioro clínico aumenta drásticamente, por lo que el recambio valvular —quirúrgico o percutáneo según el perfil de riesgo— está indicado en todo paciente sintomático, independientemente del grado de disfunción ventricular.

---

## NULL por imagen (12)
187, 188, 189, 401, 402, 403, 608, 609, 613, 811, 812, 825
— todas dependen de una imagen (ECG, angioTC, ecocardiograma, hallazgo exploratorio, ritmo de monitor) para determinar o justificar la respuesta correcta.

## NULL por controversia verificada — documentadas en `preguntas_controvertidas.md` (23)
125, 128, 130, 304, 372, 499, 505, 508, 564, 588, 643, 691, 697, 698, 775, 864, 912, 913, 916, 917, 918, 919, 921
— en todos, la `correcta` está verificada contra `plantilla_AÑO.pdf` + `cuadernillo_AÑO.pdf` (coincide exactamente), pero mi razonamiento clínico difiere del criterio oficial y no alcanzo el 90% de confianza para justificarla sin especular.

## NULL por confianza insuficiente, sin flag de error (8)
176, 293, 501, 510, 562, 799, 915, 755
— dudas razonables sobre el matiz exacto de la pregunta (p. ej. ambigüedad entre dos opciones, pregunta fuera de mi umbral de certeza) pero sin que yo tenga una alternativa clara que crea más correcta que la oficial, así que no las añado a controvertidas.md, solo quedan sin explicar.

**Nota:** ids 293 (fractura de muñeca), 613 (TIPS/trasplante hepático) y 755
(foliculitis) están catalogadas como "Cardiología" en la BD pero su contenido
es de Traumatología, Digestivo e Infecciosas/Dermatología respectivamente —
probablemente falsos positivos del clasificador por palabras clave
("insuficiencia cardíaca", etc. mencionadas como antecedente). Lo señalo para
que decidas si merece una reclasificación aparte; no lo he tocado.
