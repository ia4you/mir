# Lote de prueba — Explicaciones Cardiología (5 primeras)

## id 22 — NULL (depende de imagen)

**Pregunta:** Mujer de 64 años, diabetes/HTA/obesidad, dolor torácico nocturno + shock (TA 75/30) + PVY elevada con la inspiración + pulso paradójico + **sin** edema pulmonar. ECG urgente (imagen). ¿Qué complicación del infarto sospecha?

**Correcta:** D) Pseudoaneurisma ventricular inferobasal.

**Explicación:** *(dejo NULL)*

**Por qué NULL:** La propia pregunta dice explícitamente "con los datos clínicos, exploratorios **y electrocardiográficos** expuestos", citando el ECG como parte de la base diagnóstica para diferenciar entre las 4 complicaciones (todas ellas cursan con shock tras IAM, pero cada una tiene un patrón ECG distinto de localización). No puedo verificar qué muestra esa imagen, así que no puedo justificar con certeza por qué es D y no A (afectación de VD, que también cursa con PVY elevada y clínica similar) sin verla.

---

## id 23 — Explicación redactada

**Pregunta:** Varón de 19 años, antecedente familiar de muerte súbita, ángor y síncopes de esfuerzo, palpitaciones. ECG (imagen) + ecocardiograma → diagnóstico de miocardiopatía. Señale la respuesta verdadera sobre el tipo de miocardiopatía.

**Correcta:** B) Esta entidad es debida a una hipertrofia del tabique con obstrucción dinámica en el tracto de salida del ventrículo izquierdo.

**Explicación:**
> El cuadro (varón joven, antecedente familiar de muerte súbita, ángor y síncope de esfuerzo) es la presentación típica de cribado de la miocardiopatía hipertrófica. Esta entidad se caracteriza por hipertrofia septal asimétrica que puede generar obstrucción dinámica del tracto de salida del ventrículo izquierdo, la cual empeora con el esfuerzo y explica la clínica de bajo gasto (síncope, ángor) durante el ejercicio.

*(No depende de leer el ECG en sí: el diagnóstico de miocardiopatía ya viene dado por el enunciado vía ecocardiograma, y la pregunta pide un hecho general sobre la fisiopatología de esa entidad, deducible del contexto clínico.)*

---

## id 46 — Explicación redactada

**Pregunta (bioestadística):** Ensayo clínico. Control: mortalidad 10% mujeres, 8% hombres. Tratamiento: mortalidad se reduce a la mitad en ambos sexos. ¿Es más eficaz el fármaco en mujeres o en hombres, y por qué?

**Correcta:** A) Es más eficaz en mujeres, porque el NNT estimado en mujeres es inferior al de los hombres.

**Explicación:**
> La reducción absoluta del riesgo (RAR) es la diferencia de mortalidad entre control y tratamiento: en mujeres pasa del 10% al 5% (RAR=5%) y en hombres del 8% al 4% (RAR=4%). Como el NNT es el inverso de la RAR (1/RAR), el NNT en mujeres es 20 y en hombres 25; un NNT menor significa que hacen falta menos pacientes tratados para evitar un evento, por lo que el fármaco es más eficiente en mujeres.

---

## id 122 — Explicación redactada

**Pregunta:** Varón de 78 años, disnea progresiva hasta hacerse de reposo, angina de esfuerzo, soplo sistólico rudo en 2º espacio intercostal derecho, crepitantes bibasales. Diagnóstico más probable.

**Correcta:** B) Estenosis aórtica.

**Explicación:**
> La tríada de angina, disnea progresiva e insuficiencia cardíaca en un paciente anciano, junto con un soplo sistólico rudo en el foco aórtico (segundo espacio intercostal derecho), es la presentación clásica de la estenosis aórtica severa. La aparición de síntomas (angina, síncope o disnea) en un paciente con estenosis aórtica marca un punto de inflexión pronóstico que obliga a valorar el recambio valvular.

---

## id 124 — RESUELTO: NULL por controversia clínica (respuesta verificada contra fuente oficial)

**Pregunta:** Mujer de 82 años con FA **crónica** de 10 años y función sistólica biventricular conservada, con episodios de BAV completo sintomático. ¿Qué sistema de estimulación está indicado?

**Correcta según BD:** C) Marcapasos AAI (unicameral auricular).

**Explicación:** *(se deja NULL, a propósito)*

**Verificación contra fuente primaria (10/07/2026):** Siguiendo tu instrucción, verifiqué directamente contra los PDFs oficiales en vez de fiarme solo de mi propio razonamiento clínico:
- `plantilla_2021.pdf` (definitiva, versión 0) vía `parse_plantilla_pdf()`: RC=3 → letra C. Confirma la BD.
- `cuadernillo_2021.pdf` vía `extraer_texto()` + `parsear_cuadernillo()`: enunciado y las 4 opciones extraídas coinciden **exactamente, palabra por palabra**, con lo almacenado en la BD. Descarta cualquier error de extracción/mapeo de pregunta u opciones.

**Conclusión:** no hay error de datos — `correcta='C'` es la respuesta oficial, verificada. Se mantiene el detalle completo del razonamiento clínico en `~/mir/preguntas_controvertidas.md` (id 124): mi enseñanza estándar dice que AAI no es adecuado en FA permanente/crónica y que lo esperable sería VVI, pero como la fuente oficial confirma C de forma inequívoca, no me corresponde sobreescribirla ni inventar una explicación en la que no tengo confianza clínica del 90%. Se documenta como "respuesta verificada pero sin explicación por controversia clínica" y se pasa a la siguiente pregunta sin tocar `correcta`.

**Acción tomada:** ninguna UPDATE (ni en `correcta` ni en `explicacion`, que ya estaban en su valor final correcto: C / NULL).
