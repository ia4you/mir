# Preguntas verificadas pero sin explicación por controversia clínica

Registro de preguntas donde la respuesta `correcta` de la BD está **confirmada
contra la plantilla oficial definitiva** (enunciado y opciones cotejados
palabra por palabra contra el cuadernillo oficial, sin discrepancia de
extracción), pero cuyo razonamiento clínico me genera dudas razonables como
para no redactar una `explicacion` que las justifique. Se deja
`explicacion = NULL` a propósito — mejor sin explicación que con una
justificación de algo en lo que no tengo confianza clínica.

**Protocolo definitivo (decidido por el usuario el 11/07/2026):** ante
cualquier pregunta donde la respuesta oficial verificada (plantilla
definitiva, o provisional confirmada por fuente secundaria corroborada)
contradiga la práctica clínica estándar o un hecho objetivo (matemático,
fisiológico), se respeta la respuesta oficial sin excepción, `correcta` no se
toca, `explicacion` queda NULL, y se documenta aquí. No se vuelve a preguntar
al usuario por este tipo de caso en ninguna especialidad futura.

## id 124 (MIR 2021, pregunta 124)

**Enunciado:** Mujer de 82 años con fibrilación auricular crónica de 10 años
de evolución y función sistólica biventricular conservada que presenta
episodios de bloqueo aurículo-ventricular completo sintomáticos, por lo que
se decide implantar un sistema de estimulación cardiaco definitivo. ¿Cuál de
los siguientes está indicado?

- A: Marcapasos DDD (bicameral).
- B: Marcapasos VVI (unicameral ventricular).
- C: Marcapasos AAI (unicameral auricular). ← **correcta según plantilla oficial**
- D: Terapia de resincronización ventricular (TRC).

**Verificación realizada (10/07/2026):**
- `plantilla_2021.pdf` (definitiva, versión 0, verificada con `parse_plantilla.py`): RC=3 → C.
- `cuadernillo_2021.pdf`: enunciado y las 4 opciones coinciden exactamente
  con lo almacenado en la BD — no es un error de extracción ni de
  desajuste de pregunta/opciones.

**Por qué no escribo explicación:** en fibrilación auricular crónica/permanente
no hay actividad auricular organizada que un electrodo auricular pueda
capturar de forma fiable, por lo que la enseñanza estándar (y la indicación
habitual en las guías de estimulación cardiaca) para "FA permanente + BAV
sintomático" es un marcapasos **VVI** (opción B), no AAI. No alcanzo el 90%
de confianza necesario para justificar por qué la opción C sería la correcta
sin más contexto, así que prefiero documentarlo y dejarlo sin explicar antes
que inventar un razonamiento en el que no confío.

**Estado:** `correcta` se deja tal cual (C, verificada contra fuente oficial).
`explicacion` = NULL.

---

# Lote Cardiología (resto, 10/07/2026) — 23 casos adicionales

Mismo protocolo que id 124: para cada uno, verifiqué `plantilla_AÑO.pdf` (RC, estado
"definitivamente", no anulada) y el `cuadernillo_AÑO.pdf` (enunciado/opciones
coinciden palabra por palabra con la BD). En todos los casos la fuente oficial
confirma el valor de `correcta` ya almacenado — no hay error de datos ni de
extracción. La discrepancia es puramente de criterio clínico/docente por mi
parte. `correcta` no se toca en ninguno; `explicacion` queda NULL.

## id 125 (2021-125) — WPW con FA preexcitada, fármaco a administrar
**Correcta oficial:** A) Verapamilo. **Objeción:** los fármacos bloqueantes del
nodo AV (verapamilo, digoxina, adenosina) están clásicamente contraindicados en
FA preexcitada por riesgo de acelerar la conducción por la vía accesoria; la
enseñanza estándar apunta a procainamida (D).

## id 128 (2021-128) — ICFEr en tto óptimo, próximo paso
**Correcta oficial:** D) Suspender carvedilol e iniciar ivabradina. **Objeción:**
la guía prioriza sustituir el IECA por sacubitrilo/valsartán (C) en pacientes
sintomáticos con FEVI reducida pese a tto óptimo; retirar el betabloqueante para
iniciar ivabradina no es la secuencia habitual.

## id 130 (2021-130) — Isquemia arterial aguda de MMII
**Correcta oficial:** A) Desestimar la cirugía por tiempo prolongado de isquemia.
**Objeción:** con déficit sensitivo-motor solo parcial, pulso femoral palpable y
6 h de evolución, el miembro es salvable; la enseñanza estándar indica
tromboembolectomía urgente (C).

## id 304 (2022-122) — Taponamiento cardiaco, afirmación cierta
**Correcta oficial:** B) Hipotensión, taquicardia, disminución de la PVY y ruidos
atenuados. **Objeción:** la tríada de Beck describe PVY *elevada*, no
disminuida; la opción A (cambios ecocardiográficos preceden a la clínica) me
parece la afirmación correcta.

## id 372 (2022-192) — ICFEr FEVI 30%, sin betabloqueante, próximo paso
**Correcta oficial:** B) Añadir diltiazem. **Objeción:** los calcioantagonistas
no dihidropiridínicos están relativamente contraindicados en ICFEr; el paso
estándar en un paciente sin betabloqueante aún sería iniciarlo (A).

## id 499 (2023-111) — Contraindicación de fibrinolisis en IAM
**Correcta oficial:** C) Ictus isquémico hace 18 meses. **Objeción:** el ictus
isquémico solo contraindica fibrinolisis si es de los últimos 6 meses; el
antecedente de hemorragia intracraneal (B), en cambio, es contraindicación
absoluta y permanente, independientemente del tiempo transcurrido.

## id 505 (2023-117) — ICFEr, combinación que reduce reingresos
**Correcta oficial:** A) Betabloqueante, digoxina, ARNI, iSGLT2. **Objeción:**
los "cuatro pilares" del tratamiento de la ICFEr son betabloqueante, ARM,
ARNI/IECA, iSGLT2 (opción D); la digoxina no forma parte del tratamiento
modificador de pronóstico de primera línea.

## id 508 (2023-120) — Síncope postoperatorio de bypass coronario
**Correcta oficial:** B) Pericarditis. **Objeción:** hipotensión + ruidos
cardiacos disminuidos + distensión yugular + alternancia eléctrica en el ECG es
la tríada clásica de taponamiento cardiaco (C), complicación conocida de la
cirugía cardiaca reciente.

## id 564 (2023-178) — Miopatía + estreñimiento + caída de cabello en tto con amiodarona
**Correcta oficial:** D) Cambiar la estatina por rosuvastatina a dosis bajas.
**Objeción:** el cuadro (estreñimiento, astenia, caída de cabello, CK elevada)
es muy sugestivo de hipotiroidismo inducido por amiodarona (B), causa
secundaria de miopatía que debería investigarse antes de simplemente rotar de
estatina.

## id 588 (2023-202) — Factor de alto riesgo en TEP
**Correcta oficial:** B) Signos de crecimiento del ventrículo *izquierdo* en TC.
**Objeción:** el TEP produce sobrecarga y disfunción de ventrículo *derecho*,
no izquierdo; la opción D (disfunción de VD + PAS<90mmHg mantenida) es la
definición estándar de TEP de alto riesgo.

## id 643 (2024-47) — Fármaco que requiere ecocardiograma basal antes de iniciar
**Correcta oficial:** C) Paclitaxel. **Objeción:** el fármaco con requerimiento
bien establecido de FEVI basal y seriada por cardiotoxicidad es trastuzumab
(A), no paclitaxel.

## id 691 (2024-97) — Hallazgo NO esperado en CIA evolucionada
**Correcta oficial:** B) Aumento de la silueta cardiaca en la Rx. **Objeción:**
la CIA produce sobrecarga de cavidades derechas, por lo que cardiomegalia sí es
esperable; la hipertrofia de ventrículo *izquierdo* (D) es lo que no encajaría,
ya que la sobrecarga es derecha.

## id 697 (2024-103) — Shock, IAo nueva + derrame pericárdico + dímero D muy elevado
**Correcta oficial:** B) IAM complicado con rotura de músculo papilar.
**Objeción:** la rotura de músculo papilar da insuficiencia *mitral* aguda, no
aórtica; el cuadro (IAo nueva + derrame pericárdico + dímero D muy elevado)
encaja mucho mejor con disección de aorta proximal con afectación de la raíz
(A).

## id 698 (2024-104) — Miocardiopatía inducida por marcapasos (99% estimulación VD)
**Correcta oficial:** D) Mitra-Clip. **Objeción:** ante sospecha de
miocardiopatía inducida por estimulación ventricular derecha crónica, el primer
paso estándar es la actualización a resincronización cardiaca (C) antes de
intervenir sobre la insuficiencia mitral funcional, que puede mejorar al
resincronizar.

## id 775 (2024-183) — Telemonitorización en IC, motivo de la consulta
**Correcta oficial:** C) Glucemia basal 130 mg/dL. **Objeción:** la ganancia de
2 kg de peso en una semana (83→85 kg, opción B) es el signo de alarma clásico
de descompensación por retención de líquidos en telemonitorización de IC, más
que un cambio leve en la glucemia basal.

## id 864 (2025-67) — Fisiología del ECG normal
**Correcta oficial:** B) La onda T indica la despolarización completa del
músculo ventricular. **Objeción:** esto es incorrecto por definición — la onda
T representa la *repolarización* ventricular, no la despolarización (que
corresponde al QRS). La opción C (onda P = despolarización auricular previa a
la contracción) es la afirmación correcta según la fisiología cardiaca básica.

## id 912 (2025-115) — STEMI anterior (V1-V4), sospecha de arteria responsable
**Correcta oficial:** D) Sospecha de lesión en la arteria circunfleja.
**Objeción:** la elevación del ST en V1-V4 corresponde al territorio de la
descendente anterior (DA), no de la circunfleja; además, la opción B
(administrar carga de AAS cuanto antes) es una afirmación correcta y estándar
en el manejo inicial del SCACEST.

## id 913 (2025-116) — Indicación de DAI, escenario NO indicado
**Correcta oficial:** C) Miocardiopatía isquémica, IAM anterior hace 3 meses,
disnea pese a tto óptimo, FEVI 30%. **Objeción:** este escenario cumple
exactamente los criterios clásicos de prevención primaria con DAI (>40 días
post-IAM, FEVI≤35%, NYHA II-III con tto óptimo); el escenario que NO estaría
indicado es el D (FEVI 35% a los 6 días post-IAM, dentro del periodo de espera
de 40 días).

## id 916 (2025-119) — Síncope que NO requiere ingreso en cardiología
**Correcta oficial:** C) Varón 75 años con BCRIHH en el ECG. **Objeción:** un
bloqueo completo de rama izquierda de nueva/no aclarada cronicidad es un
hallazgo de ECG de alto riesgo que motivaría ingreso; el síncope reflejo típico
con pródromos claros y recuperación lenta (A) encaja mejor con el perfil de
bajo riesgo que no requiere ingreso.

## id 917 (2025-120) — Diagnóstico de estenosis aórtica, afirmación FALSA
**Correcta oficial:** B) La ecocardiografía transesofágica puede ser útil si
hay dudas de severidad. **Objeción:** esta afirmación es correcta (uso
estándar de la ETE en casos dudosos); la opción A (ergometría indicada en
TODOS los pacientes sintomáticos) es la falsa, ya que la ergometría está
contraindicada en la estenosis aórtica sintomática y se reserva para el
paciente asintomático.

## id 918 (2025-121) — STEMI inferior con bradicardia, hipotensión, PVY elevada, sin soplos
**Correcta oficial:** D) IAM inferior con rotura del septo interventricular.
**Objeción:** la rotura septal produce típicamente un soplo holosistólico
llamativo, ausente en este caso ("sin soplos destacables"); la combinación de
IAM inferior + hipotensión + bradicardia + PVY elevada + auscultación pulmonar
limpia es el cuadro clásico de infarto de ventrículo derecho (C).

## id 919 (2025-122) — Trombos intraventriculares, localización
**Correcta oficial:** C) Se adhieren más frecuentemente a los segmentos con
mejor contracción. **Objeción:** por fisiopatología básica (estasis sanguínea),
los trombos murales se forman sobre segmentos acinéticos/discinéticos (mala
contracción), no sobre los de mejor contracción.

## id 921 (2025-124) — Miocardiopatía hipertrófica, afirmación correcta
**Correcta oficial:** C) El realce con gadolinio es típicamente en anillo
subendocárdico. **Objeción:** el patrón característico de fibrosis en RM
cardiaca en la MCH es parcheado/medio-mural, no en anillo subendocárdico
(patrón más típico de amiloidosis); la opción B (obstrucción dinámica del TSVI
también posible en hipertrofia de otro origen con desencadenantes como
deshidratación) me parece la afirmación correcta.

---

# Lote Respiratorio (10/07/2026) — 23 casos adicionales

Mismo protocolo: verificado contra `plantilla_AÑO.pdf` (RC, definitiva, no
anulada) para las 53 preguntas de Respiratorio; las 53 coinciden exactamente
con `correcta` en la BD (sin error de importación). Los 23 casos siguientes
son discrepancias de criterio clínico/docente, no de datos. `correcta` no se
toca; `explicacion` queda NULL.

## id 42 (2021-42) — Precauciones ante neumonía por Legionella
**Oficial:** B) Precauciones de contacto. **Objeción:** Legionella no se
transmite de persona a persona (se adquiere de fuentes ambientales), por lo
que no requiere precauciones especiales más allá de las estándar (D).

## id 80 (2021-80) — Bronquiolitis por VRS, sat. 89%
**Oficial:** B) Salbutamol nebulizado. **Objeción:** la evidencia actual no
respalda el broncodilatador de rutina en la bronquiolitis; con hipoxemia
franca, el tratamiento más indicado es el soporte con oxígeno (C).

## id 82 (2021-82) — Enfermedad de membrana hialina, afirmación FALSA
**Oficial:** D) Su causa principal es el déficit de surfactante. **Objeción:**
esto es verdadero, no falso; la afirmación falsa es la B — las
manifestaciones clínicas de la EMH aparecen desde el nacimiento o las
primeras horas, no "a partir de las 24 horas".

## id 109 (2021-109) — Sedación en UCI, afirmación cierta
**Oficial:** D) El paracetamol es el principal agente para la analgesia en
pacientes intubados. **Objeción:** los opioides son el pilar de la analgesia
en el paciente crítico ventilado; la afirmación respaldada por las guías
PADIS es la B (se prefieren sedantes no benzodiazepínicos por peor resultado
clínico con benzodiacepinas).

## id 134 (2021-134) — SAHS con IAH 15, Epworth 5, primera intervención
**Oficial:** B) Oxigenoterapia nocturna domiciliaria. **Objeción:** el
tratamiento de primera línea del SAHS es la CPAP (A); el oxígeno solo no
corrige la obstrucción de la vía aérea.

## id 233 (2022-50) — Fármaco excluido del tto de deshabituación por falta de evidencia
**Oficial:** A) Parche de nicotina. **Objeción:** la TSN (parche) es de los
tratamientos mejor estudiados y sí está en primera línea; lo que carece de
estudios robustos de eficacia/seguridad y no se incluye en los protocolos de
primera elección es el cigarrillo electrónico (D).

## id 268 (2022-85) — Empiema tabicado en niño, siguiente paso
**Oficial:** D) Ampliar cobertura antibiótica. **Objeción:** ante material
purulento franco con tabicaciones, el paso estándar es el drenaje (tubo
torácico con fibrinolíticos, A), no solo ampliar antibioterapia.

## id 288 (2022-105) — Fármaco a EVITAR en la IOT de una intoxicación
**Oficial:** C) Etomidato. **Objeción:** el etomidato es un inductor estándar
de secuencia rápida; la quetiapina (A) ni siquiera es un fármaco de
intubación, por lo que es la respuesta más clara a "no utilizaría".

## id 290 (2022-107) — Debilidad tras VM prolongada + traqueostomía, orientación y actitud
**Oficial:** C) Miopatía del enfermo crítico. Corticoides y pruebas
complementarias. **Objeción:** los corticoides son un factor de riesgo
reconocido de la miopatía del enfermo crítico, no su tratamiento; la actitud
estándar es la rehabilitación intensiva (D).

## id 331 (2022-150) — CID, resultado que NO se espera
**Oficial:** D) Dímero D presente. **Objeción:** el dímero D elevado sí es
esperable en la CID; lo que no se espera es una concentración elevada de
antitrombina y proteína C (B), que en realidad están consumidas/disminuidas.

## id 363 (2022-182) — Retirada de VMNI a petición propia en ELA terminal
**Oficial:** D) Eutanasia. **Objeción:** retirar un tratamiento de soporte
vital a petición explícita y competente del paciente es, por definición legal
y ética (incluida la Ley de Eutanasia española), limitación del esfuerzo
terapéutico / rechazo de tratamiento (B), no eutanasia — que requiere un acto
activo del profesional para causar la muerte directamente, no la suspensión
de un tratamiento a petición del paciente.

## id 387 (2022-207) — Enfermedades por asbesto, afirmación INCORRECTA
**Oficial:** B) Las opacidades lineales irregulares basales son
características de la asbestosis. **Objeción:** esto es cierto, no
incorrecto; la afirmación incorrecta es la A — un derrame pleural en un
paciente expuesto a asbesto no indica per se mesotelioma (existe el derrame
pleural benigno por asbesto).

## id 388 (2022-208) — Neumonía COVID, P/F 250
**Oficial:** D) Infección grave con hipoventilación alveolar. **Objeción:** un
cociente PaO2/FiO2 de 250 cumple criterio de Berlín de SDRA leve; el
diagnóstico más preciso es neumonía por SARS-CoV-2 con SDRA (C).

## id 509 (2023-121) — Crisis asmática grave refractaria a broncodilatador+corticoide inhalado
**Oficial:** C) Los corticoides inhalados estarían contraindicados por
aumentar el riesgo de neumonía. **Objeción:** esto no es correcto en este
contexto; la actitud estándar es intensificar beta2 nebulizados y añadir
corticoides sistémicos (intravenosos) si no hay respuesta (A).

## id 515 (2023-127) — ELA con hipoventilación nocturna e hipercapnia diurna
**Oficial:** D) Iniciar CPAP. **Objeción:** la hipoventilación por debilidad
de la musculatura respiratoria (PaCO2 53, desaturaciones nocturnas
significativas) es indicación de ventilación mecánica no invasiva con
soporte de presión (A), no de CPAP, que no aporta soporte ventilatorio.

## id 559 (2023-173) — Esclerodermia, corticoides a dosis altas
**Oficial:** B) Mala evolución de las úlceras digitales. **Objeción:** la
asociación clásica y muy específicamente preguntada es que los corticoides a
dosis altas desencadenan la crisis renal esclerodérmica (A).

## id 571 (2023-185) — EPOC muy avanzado, disnea refractaria, introducir morfina
**Oficial:** A) No está indicada por deprimir el centro respiratorio y no
mejorar la disnea. **Objeción:** los opioides a dosis bajas son un
tratamiento paliativo con respaldo de evidencia para la disnea refractaria en
EPOC avanzado; la respuesta que refleja esto es la C (indicada por el
empeoramiento grave y mal pronóstico).

## id 704 (2024-110) — Tos y expectoración purulenta, >4-5 agudizaciones/año, hemoptisis
**Oficial:** D) Insuficiencia cardíaca. **Objeción:** este patrón
(expectoración mucopurulenta crónica, agudizaciones de repetición,
hemoptisis) es la presentación clásica de bronquiectasias (C), no de
insuficiencia cardíaca.

## id 797 (2024-205) — Autoanticuerpo asociado a curso agresivo de EPID en miopatías inflamatorias
**Oficial:** D) Anti-PM/Scl. **Objeción:** la asociación clásica y muy
específicamente preguntada en dermatomiositis es el anticuerpo anti-MDA5 (B),
vinculado a enfermedad pulmonar intersticial rápidamente progresiva.

## id 828 (2025-30) — Cuál NO es infección relacionada con la asistencia sanitaria
**Oficial:** B) ISQ con inicio de síntomas a los 25 días de cirugía mayor
ambulatoria. **Objeción:** 25 días está dentro de la ventana estándar de
vigilancia de 30 días para ISQ, por lo que sí se consideraría relacionada con
la asistencia; la que no cumpliría criterio es la D (neumonía con inicio de
síntomas a las 24 horas del ingreso, por debajo de las 48 horas que exige la
definición de neumonía nosocomial).

## id 877 (2025-80) — Segundo neumotórax espontáneo tratado con drenaje
**Oficial:** C) Esperar a un tercer episodio para plantear cirugía.
**Objeción:** las guías (BTS/ACCP) indican cirugía (videotoracoscopia, D) tras
el segundo episodio ipsilateral, no esperar a un tercero.

## id 959 (2025-163) — Enfermedad en la que el LBA NO tiene papel diagnóstico relevante
**Oficial:** D) Sarcoidosis. **Objeción:** en la sarcoidosis el LBA aporta un
dato de apoyo (cociente CD4/CD8 elevado); donde el LBA carece de valor
diagnóstico reconocido es en la neumonía intersticial usual/FPI (C), que se
diagnostica por patrón de TC y biopsia, no por LBA.

## id 970 (2025-174) — Lactante varón con infecciones bacterianas recurrentes, sin amígdalas, IgG/A/M muy bajas, linfocitos T normales y B (CD19+) ausentes
**Oficial:** B) Deleción 22q11.2 (síndrome de DiGeorge). **Objeción:** el
síndrome de DiGeorge cursa con déficit de linfocitos T (aplasia tímica) y B
normales — justo el patrón opuesto al descrito. El cuadro (varón, ausencia de
tejido linfoide/amígdalas, hipogammaglobulinemia global, linfocitos T
normales, B ausentes) es el cuadro clásico de agammaglobulinemia ligada al X
por mutación en BTK (C).

**Estado (11/07/2026):** respuesta oficial verificada contra `plantilla_2025.pdf`
definitiva (confirmada "aprobadas definitivamente por la Comisión
Calificadora", no provisional). No fue una pregunta anulada ni impugnada en
esa convocatoria. Es decir: la respuesta oficial es correcta desde el punto de
vista documental, pero contradice el cuadro clínico descrito — posible error
de la propia convocatoria que no llegó a ser impugnado (o impugnado y
desestimado). Se mantiene `correcta` tal cual figura en la BD (es la oficial),
`explicacion` = NULL, sin inventar una justificación que no puedo sostener.

**Verificación adicional 2022/2024 (11/07/2026):** `plantilla_2022.pdf` y
`plantilla_2024.pdf` resultaron ser **provisionales**, no definitivas (a
diferencia de 2021/2023/2025). No pude descargar el PDF definitivo oficial
(enlaces rotos en sanidad.gob.es / portal restringido a candidatos), pero
verifiqué por dos fuentes periodísticas MIR independientes y coincidentes
(redaccionmedica.com y gacetamedica.com/casimedicos.com):

- **MIR 2022:** solo 3 preguntas anuladas en la versión 0 (120, 126, 189),
  sustituidas por las de reserva 201-203. Cita: *"El resto de las respuestas
  en la plantilla definitiva no presentaron alteraciones respecto al
  documento provisional."*
- **MIR 2024:** solo 5 preguntas anuladas en la versión 0 (64, 68, 113, 180,
  206). Cita: *"No se realizó ningún cambio de respuesta en ninguna de las
  200 preguntas del examen MIR."*

Las siguientes 17 entradas de este documento proceden de preguntas de 2022 o
2024 cuyo `numero` **no coincide con ninguna de las 8 anuladas** arriba, por
lo que quedan **verificadas por fuentes secundarias corroboradas** (no por el
PDF definitivo original): en Cardiología — id 304 (num. 122), 372 (192), 643
(47), 691 (97), 697 (103), 698 (104), 775 (183); en Respiratorio — id 233
(50), 268 (85), 288 (105), 290 (107), 331 (150), 363 (182), 387 (207), 388
(208), 704 (110), 797 (205).

---

# Lote Neurología (11/07/2026) — 30 casos adicionales

Mismo protocolo. Verificadas las 52 respuestas de Neurología contra
`plantilla_AÑO.pdf` (2021/2023/2025 definitiva; 2022/2024 confirmadas por
fuentes secundarias corroboradas, ver nota más abajo). Tasa de controversia
inusualmente alta en esta especialidad (30/52, 58%), con varios errores que
ya no son matices de guías sino hechos objetivos (matemáticos o de fisiología
básica no debatible).

## id 58 (2021-58) — Factor NO asociado a delirium postoperatorio
**Oficial:** D) Alteración visual y auditiva. **Objeción:** el déficit
sensorial (visual y auditivo) es un factor de riesgo clásico y bien
establecido de delirium en el anciano (modelo de Inouye); no encaja como "no
es un factor de riesgo".

## id 84 (2021-84) — Enfermedad con fenómeno de anticipación por expansión de trinucleótidos
**Oficial:** C) Enfermedad de Parkinson. **Objeción:** el Parkinson idiopático
no se debe a expansión de trinucleótidos ni presenta anticipación; la
distrofia miotónica de Steinert (D) es precisamente el ejemplo clásico de
esta pregunta.

## id 85 (2021-85) — Neuroblastoma, afirmación FALSA
**Oficial:** A) Sospecharlo ante opsoclono-mioclono-ataxia. **Objeción:** esto
es cierto (asociación paraneoplásica clásica); lo falso es la D — la prueba
de imagen específica para neuroblastoma es la gammagrafía con MIBG, no con
tecnecio.

## id 101 (2021-101) — Enfermedad NO relacionada con la proteína Tau
**Oficial:** B) Demencia frontotemporal. **Objeción:** la FTD (sobre todo
FTLD-tau) sí es una tauopatía clásica; la enfermedad de Parkinson (C) es una
sinucleinopatía, no una tauopatía, y es la que no encaja en el grupo.

## id 103 (2021-103) — Tratamiento preventivo de la cefalea en racimos
**Oficial:** C) Carbamazepina 600-1200 mg/día. **Objeción:** el fármaco
preventivo de primera línea en la cefalea en racimos es el verapamilo,
habitualmente asociado a una pauta corta de prednisona como puente (B); la
carbamazepina es el tratamiento de la neuralgia del trigémino, no de esta
entidad.

## id 105 (2021-105) — Demencia + migraña + ictus lacunares + leucoencefalopatía grave
**Oficial:** D) Estudio genético para progranulina. **Objeción:** el cuadro
(migraña, episodios de focalidad autolimitados, demencia progresiva,
leucoencefalopatía grave en la RM) es el cuadro clásico de CADASIL, causado
por mutaciones en NOTCH3 (C); la progranulina se asocia a demencia
frontotemporal, sin este patrón de leucoencefalopatía/ictus.

## id 106 (2021-106) — Medida NO aceptada en el tratamiento de la hipertensión intracraneal
**Oficial:** D) Los glucocorticoides en algunas circunstancias. **Objeción:**
esto es cierto (indicados en el edema vasogénico tumoral); el drenaje lumbar
de LCR (B) está contraindicado en la hipertensión intracraneal por riesgo de
herniación, y es la medida que no debería aceptarse.

## id 107 (2021-107) — Deterioro subagudo un mes después de una HSA ya tratada
**Oficial:** D) La angiografía cerebral es la técnica diagnóstica de
elección. **Objeción:** a un mes de evolución, con buena recuperación previa,
el deterioro progresivo subagudo orienta a hidrocefalia (C), no a
vasoespasmo (que ocurre en los primeros 3-14 días) ni a resangrado de un
aneurisma ya tratado; la prueba adecuada ante sospecha de hidrocefalia es la
TC craneal, no la angiografía.

## id 108 (2021-108) — TCE grave, cálculo de la escala de Glasgow
**Oficial:** A) A su llegada se encuentra en un coma de Glasgow de 7.
**Objeción:** con los datos aportados (sin apertura ocular=1, sin sonidos
antes de intubar=1, extensión al dolor=2) el GCS correcto es 1+1+2=4, no 7;
la opción D (el flujo vascular cerebral aumenta con la hipercapnia y la
acidosis) es una afirmación fisiológica correcta y no debatible.

**Estado (11/07/2026):** verificación forense completa a petición del usuario
— texto de `cuadernillo_2021.pdf` coincide exactamente con la BD, RC de
`plantilla_2021.pdf` (definitiva) = 1 → A, confirma `correcta`. Respuesta
oficial verificada y mantenida. Sin explicación por divergencia con práctica
clínica estándar/aritmética básica.

## id 278 (2022-95) — Mecanismo de la enfermedad de Parkinson idiopática
**Oficial:** D) Degeneración neuronal progresiva a nivel cortical y de los
ganglios basales. **Objeción:** el mecanismo clásico y específico de la
enfermedad de Parkinson es la degeneración de la sustancia negra con déficit
de dopamina estriatal y actividad subtalámica/palidal excesiva, descrito
literalmente en la opción C.

## id 281 (2022-98) — Manifestación que haría dudar del diagnóstico de Parkinson
**Oficial:** C) Presencia de trastorno de conducta del sueño REM.
**Objeción:** el TCSREM es una manifestación prodrómica/asociada clásica de
la enfermedad de Parkinson (sinucleinopatía), no un dato que haga dudar del
diagnóstico; una disartria grave y precoz (A) encaja mejor como signo de
alarma de parkinsonismo atípico.

## id 282 (2022-99) — Primera crisis tónico-clónica con mioclonías previas, afirmación INCORRECTA
**Oficial:** A) Probablemente la RM craneal sea normal. **Objeción:** esto es
cierto en la epilepsia mioclónica juvenil (epilepsia generalizada idiopática,
sin lesión estructural); lo incorrecto es la B — no se trata de una primera
crisis aislada sin más (ya presentaba mioclonías de repetición), por lo que
sí estaría indicado iniciar tratamiento.

## id 284 (2022-101) — Ictus por oclusión distal (M3-M4) de la ACM
**Oficial:** C) Fibrinolisis IV y, si no hay recanalización, trombectomía
mecánica. **Objeción:** la trombectomía mecánica no está indicada de forma
estándar en oclusiones tan distales (M3-M4) por la dificultad técnica y la
falta de evidencia sólida de beneficio en ese segmento; el tratamiento
esperable sería fibrinolisis IV sola (B).

## id 286 (2022-103) — Neuralgia del trigémino, afirmación INCORRECTA
**Oficial:** B) El dolor tiene un punto gatillo asociado a estimulación
táctil. **Objeción:** esto es cierto y es un rasgo definitorio de la
neuralgia del trigémino clásica; lo incorrecto es la D — la neuralgia del
trigémino clásica/idiopática NO se asocia a hipoestesia facial (su presencia
sugiere una neuralgia secundaria).

## id 422 (2023-33) — Enfermedad por hipermetilación de expansión CGG en región promotora
**Oficial:** B) Ataxia de Friedreich. **Objeción:** la ataxia de Friedreich se
debe a expansión GAA intrónica, no CGG; la hipermetilación de una expansión
CGG en el promotor es el mecanismo clásico del síndrome del cromosoma X
frágil (C).

**Estado (11/07/2026):** verificación forense completa a petición del usuario
— texto de `cuadernillo_2023.pdf` coincide exactamente con la BD, RC de
`plantilla_2023.pdf` (definitiva) = 2 → B, confirma `correcta`. Respuesta
oficial verificada y mantenida. Sin explicación por divergencia con práctica
clínica estándar/aritmética básica.

## id 427 (2023-38) — Enfermedades por hipersensibilidad tipo II, afirmación INCORRECTA
**Oficial:** D) El síndrome de Goodpasture se asocia a anticuerpos frente a
la membrana basal glomerular renal y pulmonar. **Objeción:** esto es
correcto y es la definición clásica del síndrome; la opción A contiene el
error — en la enfermedad de Graves los anticuerpos van dirigidos contra el
receptor de TSH, no contra "receptores de las hormonas tiroideas T3 y T4".

## id 479 (2023-91) — Epilepsia mioclónica juvenil, fármaco de inicio más indicado
**Oficial:** A) Clonazepam. **Objeción:** el fármaco de primera elección para
iniciar tratamiento en la epilepsia mioclónica juvenil es el ácido valproico
(D), eficaz frente a mioclonías, ausencias y crisis generalizadas; el
clonazepam se usa como coadyuvante, no como fármaco de inicio.

## id 483 (2023-95) — Neuralgia del trigémino, afirmación INCORRECTA (2)
**Oficial:** C) Tanto la radiocirugía como los procedimientos ablativos
tienen riesgo de recidiva. **Objeción:** esto es cierto; de nuevo, la
afirmación incorrecta es la D — la pérdida de sensibilidad no es frecuente en
la neuralgia del trigémino clásica (ver también id 286, mismo patrón de
pregunta en otra convocatoria).

## id 548 (2023-162) — Inmunosenescencia, afirmación correcta
**Oficial:** D) Disminuye la producción de autoanticuerpos por los linfocitos
B. **Objeción:** el envejecimiento se asocia típicamente a un aumento, no una
disminución, de autoanticuerpos e inflamación crónica de bajo grado
("inflammaging"); la disminución del número/diversidad de linfocitos T
vírgenes por involución tímica (B) es el hallazgo mejor establecido de la
inmunosenescencia.

## id 573 (2023-187) — Esclerosis múltiple, afirmación INCORRECTA
**Oficial:** D) La lesión característica es la placa de desmielinización
perivenosa con inflamación y pérdida axonal variables. **Objeción:** esto es
correcto; lo incorrecto es la A — la esclerosis múltiple es más frecuente en
mujeres que en hombres, no al revés.

## id 637 (2024-41) — Cálculo del NNT en el estudio PREDIMED
**Oficial:** C) 80. **Objeción:** con una reducción absoluta del riesgo del
0,6% (4,4%-3,8%), el NNT = 1/0,006 ≈ 167 (D). Es un cálculo aritmético
objetivo, no una cuestión de criterio clínico.

**Estado (11/07/2026):** verificación forense completa a petición del
usuario — texto de `cuadernillo_2024.pdf` coincide exactamente con la BD, RC
de `plantilla_2024.pdf` (provisional, confirmado por fuente secundaria que
la pregunta 41 no cambió tras alegaciones) = 3 → C, confirma `correcta`.
Respuesta oficial verificada y mantenida. Sin explicación por divergencia con
práctica clínica estándar/aritmética básica.

## id 655 (2024-59) — Anticoncepción en mujer con migraña con aura
**Oficial:** A) Anticonceptivos orales combinados. **Objeción:** la migraña
con aura es una contraindicación absoluta bien establecida para los
anticonceptivos hormonales combinados (mayor riesgo de ictus); el DIU de
levonorgestrel (D), un método sin estrógenos, es la opción segura en este
contexto.

**Estado (11/07/2026):** verificación forense completa a petición del
usuario — texto de `cuadernillo_2024.pdf` coincide exactamente con la BD, RC
de `plantilla_2024.pdf` (provisional, confirmado por fuente secundaria que
la pregunta 59 no cambió tras alegaciones) = 1 → A, confirma `correcta`.
Respuesta oficial verificada y mantenida. Sin explicación por divergencia con
práctica clínica estándar/aritmética básica.

## id 661 (2024-66) — Guillain-Barré, característica que es la EXCEPCIÓN
**Oficial:** C) En el LCR las proteínas están elevadas sin pleocitosis
(disociación albuminocitológica). **Objeción:** esto es un hallazgo clásico y
característico del GBS, no la excepción; el síndrome de Guillain-Barré cursa
con hiporreflexia/arreflexia, no con hiperreflexia (A), que es la afirmación
que no encaja.

**Estado (11/07/2026):** verificación forense completa a petición del
usuario — texto de `cuadernillo_2024.pdf` coincide exactamente con la BD, RC
de `plantilla_2024.pdf` (provisional, confirmado por fuente secundaria que
la pregunta 66 no cambió tras alegaciones) = 3 → C, confirma `correcta`.
Respuesta oficial verificada y mantenida. Sin explicación por divergencia con
práctica clínica estándar/aritmética básica.

## id 671 (2024-77) — Enfermedad de Alzheimer, afirmación INCORRECTA
**Oficial:** D) En la RM esperamos encontrar atrofia del lóbulo temporal
medial. **Objeción:** esto es correcto (hallazgo clásico de RM en Alzheimer);
lo incorrecto es la B — en el LCR de la enfermedad de Alzheimer la proteína
tau está elevada, no disminuida.

## id 672 (2024-78) — Hallazgo que apoya el diagnóstico de Parkinson idiopático
**Oficial:** C) Gammagrafía miocárdica con MIBG normal. **Objeción:** en el
Parkinson idiopático la captación miocárdica de MIBG está típicamente
reducida (denervación simpática cardiaca), no normal; una MIBG normal
orienta más bien a un parkinsonismo atípico. El SPECT de transportador de
dopamina con hipocaptación nigroestriada (B) sí apoya el diagnóstico.

## id 678 (2024-84) — Ictus agudo, oclusión M2, ASPECTS 8, sin sangrado
**Oficial:** C) Manejo conservador por los antecedentes del paciente.
**Objeción:** un ASPECTS de 8 sin sangrado y una oclusión de M2 son
candidatos habituales a terapia de reperfusión (fibrinolisis y/o
trombectomía, opciones A/D); una demencia leve e HTA/dislipemia no son
contraindicaciones estándar para el tratamiento agudo del ictus.

## id 766 (2024-173) — Debilidad proximal + ptosis + CPK/aldolasa elevadas + vacuolas ribeteadas en biopsia
**Oficial:** A) Distrofia oculofaríngea. **Objeción:** las vacuolas
ribeteadas ("rimmed vacuoles") sin infiltrado inflamatorio son el hallazgo
histológico característico y prácticamente diagnóstico de la miositis con
cuerpos de inclusión (D), no de la distrofia oculofaríngea.

## id 876 (2025-79) — Meningioma cerebral, afirmación correcta
**Oficial:** C) Al ser tumores de comportamiento benigno, no es necesario un
estudio anatomopatológico completo porque el grado tumoral no influye en el
tratamiento ni el pronóstico. **Objeción:** esto es incorrecto — el grado OMS
del meningioma sí condiciona el tratamiento (radioterapia adyuvante) y el
pronóstico (riesgo de recidiva). La opción A (extirpables por completo dado
su carácter extraaxial bien delimitado, lo que puede ser curativo) es la
afirmación correcta.

## id 963 (2025-167) — Diagnóstico diferencial de las crisis epilépticas
**Oficial:** C) La amnesia global transitoria cursa con pérdida de
conciencia prolongada. **Objeción:** esto es falso — la AGT cursa con nivel
de conciencia y alerta preservados, con amnesia anterógrada aislada, sin
pérdida de conciencia. La opción D (los síncopes se recuperan rápido sin
confusión postcrítica) es la afirmación correcta y un criterio diferencial
clásico frente a las crisis epilépticas.

## id 1004 (2025-210) — Hipertensión intracraneal idiopática (pseudotumor cerebri)
**Oficial:** B) Se caracteriza por aumento de la presión de apertura del LCR
con composición anormal. **Objeción:** la composición del LCR en la HII es
típicamente NORMAL (justo lo que define su carácter "idiopático"; una
composición anormal obligaría a descartar causa secundaria). La opción C
(afecta preferentemente a mujeres jóvenes obesas y puede causar pérdida
visual) es la afirmación correcta y la epidemiología clásica de la entidad.

**Verificación 2022/2024 de este lote:** de los 30 casos anteriores, 5 proceden
de 2022 (id 278 núm.95, 281 núm.98, 282 núm.99, 284 núm.101, 286 núm.103) y 6
de 2024 (id 637 núm.41, 655 núm.59, 661 núm.66, 671 núm.77, 672 núm.78, 678
núm.84). Ninguno de estos números coincide con las preguntas anuladas en la
plantilla definitiva (120/126/189 en 2022; 64/68/113/180/206 en 2024), por lo
que quedan verificados por la misma fuente secundaria corroborada
(redaccionmedica + gacetamedica/casimedicos) descrita más arriba.

---

# Lote Digestivo (11/07/2026) — 19 casos adicionales

Mismo protocolo. Las 37 respuestas de Digestivo verificadas contra fuente
oficial (2021/2023/2025 definitiva; 2022/2024 provisional+corroborada por
fuente secundaria). Por decisión del usuario del 11/07/2026: `correcta` no se
toca en ningún caso, `explicacion` = NULL, se documenta la objeción.

## id 120 (2021-120) — Fascitis plantar, afirmación correcta
**Oficial:** C) El tratamiento de elección es quirúrgico. **Objeción:** el
tratamiento de la fascitis plantar es fundamentalmente conservador (reposo,
estiramientos, ortesis); la cirugía es un último recurso en casos
refractarios. El dolor en el talón más intenso al iniciar la marcha (D) es el
rasgo clínico característico y la afirmación más defendible.

## id 137 (2021-137) — Nódulo hepático de 1,5 cm con patrón de captación típico de HCC
**Oficial:** B) Repetir la ecografía a los 3 meses. **Objeción:** un nódulo
≥1 cm en hígado cirrótico con captación arterial y lavado venoso en RM
cumple criterios diagnósticos no invasivos de hepatocarcinoma; lo esperable
es completar el estudio de extensión (D) para decidir tratamiento, no
limitarse a repetir una ecografía de seguimiento.

## id 143 (2021-143) — Estenosis sigmoidea sintomática de 5 cm con biopsia no concluyente
**Oficial:** B) Tratamiento conservador con fibra dietética y rifaximina.
**Objeción:** ante una estenosis sintomática y obstructiva con biopsia no
concluyente (sin poder descartar malignidad), la actitud más prudente suele
ser la resección quirúrgica (sigmoidectomía, A) en lugar de manejo
conservador.

## id 312 (2022-131) — HCC multifocal con invasión de vena porta
**Oficial:** C) Trasplante hepático. **Objeción:** la invasión macrovascular
portal es una contraindicación bien establecida para el trasplante hepático
(fuera de los criterios de Milán); ante enfermedad con invasión vascular, el
tratamiento estándar es sistémico (sorafenib u otro, B).

## id 356 (2022-175) — Anticuerpo esencial para el seguimiento de la esclerodermia
**Oficial:** A) Anti-ADN. **Objeción:** el anti-ADN de doble cadena es
característico del lupus eritematoso sistémico, no de la esclerodermia; el
anticuerpo con relevancia pronóstica específica en la esclerodermia (riesgo
de crisis renal esclerodérmica) es el anti-ARN polimerasa III (D).

## id 383 (2022-203) — Úlceras pépticas recurrentes + hipercalcemia + PTH elevada
**Oficial:** C) Neoplasia endocrina múltiple tipo 2A. **Objeción:** la
combinación de hiperparatiroidismo primario y enfermedad ulcerosa péptica
recidivante (sugestiva de gastrinoma) es característica de la MEN tipo 1 (D),
no de la MEN2A (que cursa con carcinoma medular de tiroides y feocromocitoma,
sin gastrinoma).

## id 464 (2023-76) — Hepatitis autoinmune anti-LKM1 positiva, característica EXCEPTO
**Oficial:** B) En la biopsia hepática presentará típica hepatitis de
interfase. **Objeción:** esto es cierto (hallazgo histológico definitorio de
la hepatitis autoinmune); lo que no encaja es la A — la hepatitis autoinmune
cursa típicamente con HIPERgammaglobulinemia, no hipogammaglobulinemia.

## id 518 (2023-131) — Crohn ileocecal refractario, técnica quirúrgica más adecuada
**Oficial:** B) Panproctocolectomía con reservorio en J. **Objeción:** el
reservorio ileoanal (IPAA) es la cirugía de la colitis ulcerosa y está
contraindicado/desaconsejado en la enfermedad de Crohn por el alto riesgo de
recidiva y complicaciones en el reservorio; ante una afectación ileocecal
localizada, la técnica adecuada es la ileocequectomía (C).

## id 520 (2023-133) — Encefalopatía hepática recidivante con shunt portosistémico de gran calibre
**Oficial:** D) Trasplante de microbiota fecal. **Objeción:** ante un shunt
portosistémico espontáneo de gran calibre identificado como causa de la
encefalopatía refractaria, el tratamiento dirigido estándar es la oclusión
del propio shunt (B); el trasplante de microbiota fecal es una terapia
emergente, no la primera opción establecida.

## id 713 (2024-120) — Fármaco a evitar en Crohn con antecedente de melanoma
**Oficial:** C) Vedolizumab. **Objeción:** el vedolizumab es un biológico de
acción intestinal selectiva sin asociación descrita con melanoma; los
anti-TNF (como el infliximab, B) sí tienen una asociación descrita con mayor
riesgo de melanoma y son los que se recomienda evitar en este contexto.

## id 715 (2024-122) — Hematemesis en cirrosis con ascitis e ictericia
**Oficial:** B) Realizar una paracentesis, seguido de una endoscopia y
ligadura de varices. **Objeción:** el manejo estándar de la hemorragia
digestiva alta en el cirrótico es estabilizar e iniciar un fármaco
vasoactivo (terlipresina/octreótido) cuanto antes, incluso antes de la
endoscopia, tal y como describe la opción C, que omite la opción B.

## id 720 (2024-127) — Evaluación preoperatoria de la función esofágica y del EEI
**Oficial:** A) Monitorización ambulatoria de pH e impedancia. **Objeción:**
la pH-impedanciometría cuantifica la exposición al reflujo, no la función
motora; la prueba que evalúa específicamente la función del cuerpo esofágico
y del esfínter esofágico inferior es la manometría esofágica (B).

## id 829 (2025-31) — Grupo que NO requiere vacunación frente a hepatitis A
**Oficial:** D) Pacientes con enfermedad hepática crónica. **Objeción:** la
enfermedad hepática crónica es precisamente una indicación clásica y bien
establecida de vacunación frente al VHA (riesgo de hepatitis fulminante); la
asplenia (C) no es una indicación estándar para esta vacuna en particular.

## id 925 (2025-128) — Delirium terminal con hiperbilirrubinemia, transaminasas y amonio elevados
**Oficial:** D) Sustituir la morfina por buprenorfina sublingual. **Objeción:**
ante un delirium multifactorial con posibles fármacos implicados (morfina,
corticoides) en un contexto de disfunción hepática, la actitud estándar es
tratar el síntoma agudo con haloperidol y revisar/ajustar todos los fármacos
potencialmente implicados (B), una respuesta más completa que rotar
únicamente el opioide.

## id 945 (2025-148) — Barrett con displasia de bajo grado confirmada por patólogo experto
**Oficial:** A) Mantener IBP a demanda y repetir endoscopia a los 3 años.
**Objeción:** la displasia de bajo grado confirmada por un patólogo experto
en Barrett tiene un riesgo de progresión relevante; las guías actuales
recomiendan ofrecer terapia de erradicación endoscópica (ablación por
radiofrecuencia, C), no limitarse a la vigilancia.

## id 947 (2025-150) — Diferenciación colitis ulcerosa vs. Crohn, afirmación MÁS correcta
**Oficial:** D) La afectación del íleon terminal nunca aparece en la colitis
ulcerosa. **Objeción:** esto es falso — la colitis ulcerosa extensa puede
producir "ileítis por reflujo" (backwash ileitis) en el íleon terminal; la
presencia de granulomas no caseificantes en la biopsia (B) es la afirmación
correcta y un dato mucho más específico y fiable de enfermedad de Crohn.

## id 949 (2025-152) — Necrosis pancreática encapsulada infectada a las 3 semanas
**Oficial:** A) Laparotomía urgente con necrosectomía abierta. **Objeción:**
el manejo actual estándar de la necrosis pancreática infectada es el
abordaje escalonado ("step-up approach": drenaje mínimamente invasivo primero,
necrosectomía diferida solo si es necesario, opción C), no la cirugía abierta
de entrada, que se asocia a mayor morbimortalidad.

## id 950 (2025-153) — Intervalo de cribado colonoscópico en síndrome de Lynch
**Oficial:** B) Cada 5 años desde los 40 años o 10 años antes del caso más
joven. **Objeción:** el cribado estándar en el síndrome de Lynch es mucho
más intensivo, dado el curso acelerado de la secuencia adenoma-carcinoma:
colonoscopia cada 1-2 años desde los 20-25 años o 2-5 años antes del caso más
joven en la familia (C).

## id 951 (2025-154) — Diarrea acuosa crónica, colonoscopia normal, banda de colágeno subepitelial >10 μm
**Oficial:** B) Enfermedad de Crohn colónica. **Objeción:** una banda de
colágeno subepitelial engrosada con colonoscopia macroscópicamente normal es,
por definición histológica, colitis colágena (D), una forma de colitis
microscópica; no guarda relación con la enfermedad de Crohn, que cursa con
lesiones macroscópicas, transmurales y a menudo granulomatosas.

---

# Lote Endocrinología (11/07/2026) — 25 casos adicionales

Mismo protocolo y misma decisión del usuario del 11/07/2026: `correcta` no se
toca, `explicacion` = NULL, se documenta la objeción. Tasa de controversia del
66% (25/38), la más alta hasta ahora.

## id 142 (2021-142) — Graves con oftalmopatía grave, rechaza yodo radiactivo
**Oficial:** D) Enucleación del nódulo principal. **Objeción:** la enfermedad
de Graves es una hiperplasia difusa, no tiene "nódulo principal" que
enuclear; el tratamiento quirúrgico estándar cuando se rechaza el yodo
radiactivo (o está relativamente contraindicado por la oftalmopatía grave) es
la tiroidectomía total (B).

## id 168 (2021-169) — Neoplasia NO asociada a MEN-1
**Oficial:** C) Insulinoma. **Objeción:** el insulinoma sí forma parte de la
MEN1 (tumores de islotes pancreáticos); el feocromocitoma (B) no forma parte
de la MEN1 (pertenece a la MEN2A/2B y a la enfermedad de von Hippel-Lindau).

## id 169 (2021-170) — Hiponatremia (Na 126) con natriuresis conservada, confusión
**Oficial:** B) Administrar suero salino hipertónico para restablecer la
natremia cuanto antes. **Objeción:** en una hiponatremia moderada sin datos
de gravedad extrema (crisis comicial, coma), el manejo estándar es escalonado
— restricción hídrica primero, y solo pasar a suero salino en infusión lenta
si no mejora (C) —, para evitar una corrección demasiado rápida y el riesgo
de mielinolisis osmótica.

## id 240 (2022-57) — Fármaco contraindicado en diabético con insuficiencia cardiaca de nuevo diagnóstico
**Oficial:** B) Canagliflozina. **Objeción:** los iSGLT2 como la
canagliflozina están indicados y son beneficiosos en la insuficiencia
cardiaca; el fármaco clásicamente contraindicado por retención de líquidos y
riesgo de descompensar una insuficiencia cardiaca es la pioglitazona (D).

## id 335 (2022-154) — Prescripción potencialmente inadecuada en el anciano, afirmación cierta
**Oficial:** A) Las benzodiacepinas no aumentan el riesgo de caídas.
**Objeción:** esto es falso — las benzodiacepinas son un factor de riesgo de
caídas muy bien establecido en el anciano; los estrógenos tópicos vaginales
para la vaginitis atrófica sintomática (D) sí están indicados y es la
afirmación correcta.

## id 340 (2022-159) — Mejor opción para tratar la obesidad en diabética con IMC 41,3
**Oficial:** D) Alogliptina. **Objeción:** los inhibidores de DPP4 como la
alogliptina son neutros en cuanto al peso; el fármaco indicado específicamente
para tratar la obesidad en este contexto es un agonista de GLP-1 como la
semaglutida (C), con eficacia demostrada en la pérdida de peso.

## id 341 (2022-160) — Odinofagia con dolor cervical anterior tras cuadro viral, temblor y taquicardia
**Oficial:** B) Tiroiditis linfocitaria focal. **Objeción:** el cuadro
(pródromo viral, dolor cervical anterior con la palpación, fiebre y clínica
tirotóxica transitoria) es la presentación clásica de la tiroiditis subaguda
de De Quervain (A); la tiroiditis linfocitaria focal es un hallazgo
histológico incidental y asintomático, no encaja con este cuadro doloroso.

## id 343 (2022-162) — Carcinoma medular de tiroides, afirmación correcta
**Oficial:** B) En la mayoría de los casos es esporádico y para el
seguimiento se pueden usar calcitonina, CEA o tiroglobulina. **Objeción:** la
tiroglobulina no es un marcador del carcinoma medular (procede de células
foliculares, no de células C); las guías actuales recomiendan el estudio
genético de RET en todos los pacientes con CMT, tanto de apariencia
esporádica como hereditaria (D), dato correcto y bien establecido.

## id 373 (2022-193) — Objetivo de glucemia postprandial en diabético con insulina
**Oficial:** A) <126 mg/dL. **Objeción:** ese valor corresponde
aproximadamente al objetivo de glucemia basal/preprandial, no postprandial;
el objetivo estándar de glucemia postprandial (2 h) es <180 mg/dL (C).

## id 374 (2022-194) — Fármaco de uso crónico NO asociado a reducción de complicaciones cardiovasculares
**Oficial:** B) Agonistas del receptor de GLP-1. **Objeción:** los arGLP1
tienen una de las evidencias más sólidas de reducción de eventos
cardiovasculares en diabetes tipo 2; el fármaco sin beneficio cardiovascular
demostrado en ensayos de resultados es la insulina (C).

## id 384 (2022-204) — Síndrome de lisis tumoral, la EXCEPCIÓN
**Oficial:** C) Hiperfosfatemia. **Objeción:** la hiperfosfatemia es
precisamente una de las alteraciones características y esperables del
síndrome de lisis tumoral; la hipercalcemia (A) no lo es — de hecho, el
síndrome de lisis tumoral cursa con HIPOcalcemia (por precipitación de
fosfato cálcico), por lo que la hipercalcemia es la que no encaja.

## id 416 (2023-27) — Alteración bioquímica del reordenamiento metabólico de la diabetes
**Oficial:** B) Aumento de la producción de urea por mayor degradación
nucleotídica. **Objeción:** la alteración central y mejor establecida en la
resistencia a la insulina es la disminución de la translocación de los
transportadores GLUT2 y GLUT4 a la membrana plasmática mediada por insulina
(A), mecanismo fisiopatológico clásico de la diabetes.

## id 527 (2023-141) — Causa de acidosis metabólica con anion gap NORMAL
**Oficial:** D) Intoxicación por metanol. **Objeción:** la intoxicación por
metanol produce acidosis metabólica con anion gap ELEVADO (forma parte del
mnemotecnia MUDPILES); la causa clásica de acidosis con anion gap normal
(hiperclorémica) es la pérdida digestiva de bicarbonato por diarrea aguda
(B).

## id 546 (2023-160) — Anciano con fractura de cadera osteoporótica y demencia leve
**Oficial:** A) No es candidato a tratamiento osteoprotector por edad y
presencia de demencia. **Objeción:** la edad avanzada y la demencia no
excluyen el tratamiento de prevención secundaria de fracturas, que está
indicado tras una fractura osteoporótica independientemente de estos
factores; la afirmación correcta y bien establecida es que no deben iniciarse
bifosfonatos si hay hipocalcemia (B), que debe corregirse antes.

## id 576 (2023-190) — Fármaco preferente en diabético obeso (IMC>30) en prevención secundaria cardiovascular
**Oficial:** C) Sulfonilureas. **Objeción:** las sulfonilureas favorecen el
aumento de peso y no tienen beneficio cardiovascular demostrado; los
fármacos de elección en este perfil son los arGLP1 (D), con beneficio
demostrado en peso y en prevención cardiovascular secundaria.

## id 587 (2023-201) — Respuesta hormonal que NO ocurre en la hipoglucemia
**Oficial:** C) Aumento de la secreción de cortisol. **Objeción:** el
cortisol sí aumenta como hormona contrarreguladora clásica en la
hipoglucemia; lo que no ocurre es una reducción de la secreción de glucagón
(B) — el glucagón, de hecho, AUMENTA en la hipoglucemia como una de las
primeras respuestas contrarreguladoras.

## id 622 (2024-26) — Cambio metabólico en la resistencia a la insulina
**Oficial:** B) Descenso en los niveles intracelulares de hexoquinasa 2
dependiente de insulina. **Objeción:** el aumento de aminoácidos ramificados
(leucina, isoleucina) en suero (D) es un hallazgo actual y muy bien
establecido asociado a la resistencia a la insulina en la literatura
metabolómica reciente, más específico y defendible que el cambio propuesto
como correcto.

## id 746 (2024-153) — Estadios de la diabetes tipo 1 autoinmune, definición correcta
**Oficial:** C) El estadio 2 se caracteriza por hiperglucemia con cifras que
definen diabetes. **Objeción:** en la estadificación estándar, el estadio 2
se define por disglucemia (alteración de la tolerancia a la glucosa) SIN
alcanzar aún cifras diagnósticas de diabetes — eso corresponde al estadio 3;
la afirmación correcta es la B (estadio 1 = autoinmunidad aislada sin
alteración glucémica).

## id 750 (2024-157) — Fármaco a tener en cuenta al evaluar un hiperparatiroidismo
**Oficial:** C) Amlodipino. **Objeción:** el fármaco clásicamente asociado a
alterar el metabolismo del calcio (reduce la excreción urinaria de calcio,
pudiendo enmascarar o simular un hiperparatiroidismo) es la hidroclorotiazida
(A), una interacción farmacológica muy específicamente enseñada.

## id 751 (2024-158) — Causa de hipertiroidismo con TSH normal o elevada
**Oficial:** D) Hipertiroidismo por beta-HCG durante la gestación.
**Objeción:** el hipertiroidismo mediado por hCG cursa con TSH suprimida (por
retroalimentación negativa del exceso de hormona tiroidea), no normal o
elevada; la causa clásica de hipertiroidismo con TSH inapropiadamente normal
o elevada es el adenoma hipofisario productor de TSH (C).

## id 776 (2024-184) — Diabético obeso en prevención cardiovascular secundaria con metformina+iSGLT2, mal control
**Oficial:** A) Insulina. **Objeción:** ante mal control con metformina +
iSGLT2 en un paciente obeso con enfermedad cardiovascular, el fármaco de
elección para añadir es un arGLP1 (B), que aporta control glucémico, pérdida
de peso adicional y beneficio cardiovascular; la insulina no ofrece ninguna
de estas dos últimas ventajas.

## id 780 (2024-188) — Fármaco a evitar por inducir aumento de peso en diabético obeso
**Oficial:** C) Semaglutida. **Objeción:** la semaglutida es justo lo
contrario — un fármaco que produce pérdida de peso significativa, hasta el
punto de estar aprobado específicamente para el tratamiento de la obesidad;
el fármaco de esta lista que produce aumento de peso es la pioglitazona (D).

## id 884 (2025-87) — Vejiga hiperactiva refractaria a anticolinérgicos + agonista beta-3 en dosis máximas
**Oficial:** A) Retirar los anticolinérgicos y añadir agonistas beta-3 a
dosis máximas. **Objeción:** la paciente ya ha fracasado a la doble terapia
(anticolinérgico + agonista beta-3); retroceder a monoterapia con beta-3 no
es una escalada terapéutica. Ante fracaso de la terapia combinada oral, el
siguiente escalón estándar es la toxina botulínica intradetrusor (B).

## id 984 (2025-189) — Niño asintomático con dos autoanticuerpos positivos (anti-GAD, anti-IA2) y glucemia normal
**Oficial:** D) Repetir la determinación de glucosa cada año, ya que el
desarrollo de la enfermedad es improbable antes de la pubertad. **Objeción:**
este niño cumple criterios de estadio 1 de diabetes tipo 1 (autoinmunidad sin
disglucemia); las recomendaciones actuales indican clasificarlo como tal y
derivarlo a una unidad especializada para seguimiento y posible inclusión en
ensayos de prevención (C), no una vigilancia pasiva anual con una supuesta
protección hasta la pubertad que no está respaldada por la evidencia.

## id 989 (2025-194) — Albuminuria persistente pese a IECA + iSGLT2 optimizados, buen control glucémico/tensional
**Oficial:** A) Sustituir el enalapril por un ARA-II. **Objeción:** IECA y
ARA-II son terapéuticamente equivalentes para el bloqueo del sistema
renina-angiotensina; cambiar de uno a otro no aporta beneficio adicional
sobre la albuminuria. Ante albuminuria persistente pese a IECA + iSGLT2
optimizados, la recomendación actual (guías KDIGO/ADA, ensayos
FIDELIO-DKD/FIGARO-DKD) es añadir finerenona (C).

**Verificación 2022/2024 de este lote:** ids de 2022 (240 núm.57, 335 núm.154,
340 núm.159, 341 núm.160, 343 núm.162, 373 núm.193, 374 núm.194, 384 núm.204)
y de 2024 (622 núm.26, 746 núm.153, 750 núm.157, 751 núm.158, 776 núm.184,
780 núm.188) — ninguno coincide con las preguntas anuladas en la plantilla
definitiva (120/126/189 en 2022; 64/68/113/180/206 en 2024), verificados por
la misma fuente secundaria corroborada.

---

# Lote Oncología (11/07/2026) — 24 casos adicionales

Primera especialidad revisada ya con el criterio recalibrado (redactar si la
oficial es defendible por guía actual, manual MIR estándar, o razonamiento
razonable de la época del examen; NULL solo si imagen, error objetivo
inequívoco, o desconocimiento genuino). A pesar del criterio más permisivo,
estos 24 siguen sin ser defendibles.

## id 34 (2021-34) — Inmunoterapia anti-PD-1, afirmación cierta
**Oficial:** A) PD-1 se expresa mayoritariamente en linfocitos T naive.
**Objeción:** PD-1 se expresa en linfocitos T activados/exhaustos, no
predominantemente en naive; la afirmación correcta es que el bloqueo de PD-1
o sus ligandos potencia la capacidad antitumoral de los linfocitos T CD8+
(C), literalmente el mecanismo de acción de esta inmunoterapia.

## id 110 (2021-110) — Osteosarcoma, afirmación correcta
**Oficial:** D) Si presenta enfermedad de Paget previa tiene mejor
pronóstico. **Objeción:** el osteosarcoma secundario a enfermedad de Paget
tiene peor pronóstico, no mejor; la afirmación correcta y bien establecida es
que afecta con más frecuencia a huesos próximos a la rodilla (C).

## id 157 (2021-158) — Tumor en el que la braquiterapia NO es alternativa eficaz
**Oficial:** A) Adenocarcinoma de endometrio IB grado 2. **Objeción:** la
braquiterapia vaginal es tratamiento adyuvante estándar y eficaz en el cáncer
de endometrio de riesgo intermedio (ensayos PORTEC); el glioblastoma
resecado parcialmente (C) es el tumor en el que la braquiterapia intersticial
no ha demostrado beneficio y se considera ineficaz.

## id 242 (2022-59) — Tumor maligno lingual más frecuente y su metástasis habitual
**Oficial:** D) Carcinoma epidermoide, metastatiza en hígado. **Objeción:**
el carcinoma epidermoide sí es el tumor más frecuente, pero su vía de
diseminación habitual y característica es a los ganglios linfáticos
cervicales (B), no al hígado como localización metastásica típica.

## id 325 (2022-144) — Radioterapia, afirmación INCORRECTA
**Oficial:** A) Puede ser una alternativa de tratamiento curativo en diversas
situaciones en oncología. **Objeción:** esto es cierto; lo incorrecto es la
C — la radioterapia no está contraindicada en tumores pediátricos, se usa de
forma selectiva (p. ej. meduloblastoma, tumor de Wilms).

## id 326 (2022-145) — Glioblastoma con metilación del promotor MGMT
**Oficial:** D) Apoyaría la decisión de tratar con cisplatino frente a un
agente alquilante. **Objeción:** la metilación de MGMT reduce la reparación
del ADN y predice mayor sensibilidad a los agentes alquilantes como la
temozolomida (no al cisplatino); la afirmación correcta y clásica es que la
metilación aumenta la supervivencia en pacientes tratados con temozolomida
(B).

## id 327 (2022-146) — Radioterapia en cáncer de mama localmente avanzado con pronóstico molecular adverso
**Oficial:** C) Está contraindicada después de la quimioterapia neoadyuvante.
**Objeción:** la radioterapia tras quimioterapia neoadyuvante es práctica
estándar en el cáncer de mama localmente avanzado, no está contraindicada; la
afirmación correcta es que debe incluir las regiones ganglionares
locorregionales (A).

## id 424 (2023-35) — Inmunoterapia dirigida a mecanismos de evasión tumoral
**Oficial:** B) Inoculación de células mieloides supresoras (MDSC).
**Objeción:** las MDSC son células inmunosupresoras que FAVORECEN la evasión
tumoral, no tienen capacidad antitumoral; la inmunoterapia dirigida a
contrarrestar la evasión inmune son los anticuerpos frente a PD-1/PD-L1 (D).

## id 525 (2023-139) — Pólipo maligno de colon, hallazgo de alto riesgo que indica colectomía
**Oficial:** B) Distancia al borde de sección de 2,5 mm. **Objeción:** un
margen de 2,5 mm se considera adecuado/negativo, no de alto riesgo; la
invasión submucosa profunda (sm3) de un tumor T1 (A) sí es un hallazgo
histológico bien establecido de alto riesgo de metástasis ganglionar que
justifica la colectomía.

## id 549 (2023-163) — Yodo radiactivo en cáncer diferenciado de tiroides
**Oficial:** A) Se debe administrar antes de la tiroidectomía para disminuir
el tamaño tumoral. **Objeción:** el yodo radiactivo se administra siempre
DESPUÉS de la tiroidectomía, nunca antes; la afirmación correcta es que,
administrado con carácter ablativo postiroidectomía, facilita el seguimiento
con tiroglobulina sérica (B).

## id 568 (2023-182) — Familiar solicita no administrar cloruro mórfico a paciente con dolor
**Oficial:** A) Aceptar la petición del familiar y prescribir un analgésico
no opioide. **Objeción:** la autonomía y el bienestar del paciente priman
sobre la preferencia familiar cuando el paciente conserva capacidad de
decidir; la primera actitud correcta es preguntar directamente al paciente
por la intensidad de su dolor y sus preferencias de analgesia (D), no ceder
sin más a la petición de un tercero.

## id 717 (2024-124) — Adenocarcinoma duodenal localizado, sin diseminación
**Oficial:** D) Radioterapia dirigida al duodeno antes de considerar la
cirugía. **Objeción:** el tratamiento curativo estándar de un adenocarcinoma
duodenal localizado y resecable es la cirugía (duodenopancreatectomía
cefálica/Whipple, C), no la radioterapia primaria.

## id 728 (2024-135) — Masa renal derecha 4,9 cm con hidronefrosis/atrofia del riñón contralateral
**Oficial:** A) Nefrectomía bilateral, con suprarrenalectomía derecha y
linfadenectomía retroperitoneal. **Objeción:** no hay ninguna indicación
para extirpar el riñón izquierdo (afectado por una litiasis tratable, no por
tumor); dejar al paciente anéfrico de forma innecesaria es un error grave.
Dado el compromiso funcional del riñón contralateral, la cirugía conservadora
de nefronas (nefrectomía parcial derecha, B) es la opción adecuada.

## id 734 (2024-141) — Diana de unión del pembrolizumab
**Oficial:** B) PD-L1. **Objeción:** el pembrolizumab es un anticuerpo
anti-PD-1 (se une a PD-1 en el linfocito T, opción A), no anti-PD-L1; los
anti-PD-L1 son fármacos distintos como atezolizumab o durvalumab.

## id 735 (2024-142) — Paciente que cumple criterios de neutropenia febril
**Oficial:** C) Varón con escalofríos, Tª 37,5ºC, neutrófilos 600/mm3.
**Objeción:** ni la temperatura (37,5ºC no alcanza el umbral de fiebre
≥38,3ºC) ni el recuento de neutrófilos (600, por encima del umbral <500) de
este paciente cumplen los criterios estándar; la paciente de la opción A
(Tª 38,5ºC y neutrófilos 400/mm3) sí cumple ambos criterios de forma
inequívoca, independientemente del buen estado general aparente.

## id 736 (2024-143) — CCR metastásico irresecable RAS nativo con MSI-H (dMMR), primera línea
**Oficial:** A) Quimioterapia + Anti-EGFR. **Objeción:** en tumores MSI-H el
tratamiento de primera línea establecido (ensayo KEYNOTE-177) es la
inmunoterapia (B), que ha demostrado superioridad sobre la quimioterapia en
este subgrupo específico, independientemente del estado RAS.

## id 777 (2024-185) — Dolor perineal por masa presacra de adenocarcinoma rectal, refractario
**Oficial:** C) Bloqueo de nervios esplácnicos. **Objeción:** el bloqueo de
nervios esplácnicos se emplea para dolor visceral abdominal alto (páncreas);
para el dolor perineal/pélvico por afectación presacra el bloqueo
anatómicamente indicado es el del ganglio impar (B).

## id 795 (2024-203) y id 882 (2025-85) — Cáncer de próstata Gleason 9 con metástasis óseas y hepáticas, tratamiento inicial
**Oficial:** B (795) / C (882) — radioterapia pélvica+estereotáxica / braquiterapia prostática.
**Objeción:** ante enfermedad metastásica de alto volumen con afectación
visceral (hepática), el tratamiento inicial estándar actual es sistémico
(terapia triple: análogo de LHRH + antiandrógeno de nueva generación +
docetaxel, opción D en ambas preguntas), no un tratamiento local dirigido
únicamente a la próstata/pelvis.

## id 875 (2025-78) — Tumores cerebrales metastásicos, afirmación correcta
**Oficial:** B) Se desarrollan típicamente en la primera y segunda década de
la vida. **Objeción:** las metástasis cerebrales son mucho más frecuentes en
adultos de mayor edad, en relación con los tumores primarios que las
originan; además son MÁS frecuentes que los tumores primarios cerebrales, no
menos (contradice también la opción A).

## id 896 (2025-99) — Principios oncológicos en cáncer de colon, la EXCEPCIÓN
**Oficial:** A) Resección con márgenes quirúrgicos amplios. **Objeción:** los
márgenes amplios sí son un principio oncológico fundamental; la afirmación
que no encaja (la excepción) es la B — la linfadenectomía sí es necesaria
para la estadificación y el tratamiento adecuados, no es prescindible.

## id 904 (2025-107) — Hallazgo funduscópico más sugestivo de metástasis coroidea
**Oficial:** B) Drusas blandas. **Objeción:** las drusas blandas son
características de la degeneración macular asociada a la edad; la metástasis
coroidea se presenta clásicamente como una lesión amarillenta subretiniana
(C).

## id 927 (2025-130) — Anciano con cáncer de próstata oligometastásico, fragilidad, decisión terapéutica
**Oficial:** D) La edad cronológica como criterio principal para limitar el
tratamiento. **Objeción:** esto contradice un principio fundamental de la
oncogeriatría actual — no debe limitarse el tratamiento por la edad
cronológica aislada; lo que debe priorizarse son las comorbilidades, el
estado funcional y la expectativa de vida (C).

## id 1001 (2025-206) — Mejor prueba de imagen para planificar tratamiento local del cáncer de recto medio
**Oficial:** D) Ecografía combinada abdomino-pélvica y endorrectal.
**Objeción:** el estándar actual para la estadificación locorregional del
cáncer de recto y planificación del tratamiento (valoración de la fascia
mesorrectal) es la RM pélvica de alta resolución (C); la ecografía endorrectal
mantiene un papel más limitado, sobre todo en tumores muy superficiales.

**Verificación 2022/2024 de este lote:** ids de 2022 (242 núm.59, 325 núm.144,
326 núm.145, 327 núm.146, 424 núm.35) y de 2024 (717 núm.124, 728 núm.135,
734 núm.141, 735 núm.142, 736 núm.143, 777 núm.185, 795 núm.203) — ninguno
coincide con las preguntas anuladas en la plantilla definitiva (120/126/189
en 2022; 64/68/113/180/206 en 2024), verificados por la misma fuente
secundaria corroborada.

---

# Lote Nefrología (11/07/2026) — 23 casos adicionales

Mismo criterio recalibrado. Tasa de controversia del 72% (23/32 no-imagen),
la más alta hasta ahora.

## id 148 (2021-149) — ERC diabética con FGe 14 ml/min, afirmación cierta
**Oficial:** D) Es poco probable que presente proteinuria superior a 500
mg/24h. **Objeción:** en la nefropatía diabética avanzada la proteinuria
significativa (a menudo en rango nefrótico) es esperable, no infrecuente; la
afirmación correcta es que se trata de ERC estadio 5 (FGe<15) en la que debe
plantearse tratamiento renal sustitutivo (B).

## id 150 (2021-151) — Hematuria dismórfica concurrente con cuadro catarral
**Oficial:** B) Glomerulonefritis post-infecciosa. **Objeción:** la GN
postinfecciosa cursa con un periodo de latencia de 1-3 semanas tras la
infección; la hematuria que aparece de forma sincrónica o casi inmediata con
un cuadro catarral ("sinfaríngítica") es característica de la nefropatía IgA
(C).

## id 165 (2021-166) — Anciana con caídas, deterioro cognitivo y polifarmacia
**Oficial:** D) Aumentaría la dosis de benzodiacepinas para el insomnio.
**Objeción:** aumentar la dosis de benzodiacepinas en una anciana con caídas
y deterioro cognitivo es una actuación de riesgo, contraindicada por
principios básicos de prescripción geriátrica; la actitud correcta es revisar
el tratamiento para desprescribir, priorizando fármacos imprescindibles (C).

## id 179 (2021-181) — Proptosis, costras nasales, VSG elevada, microhematuria
**Oficial:** D) Poliarteritis nudosa. **Objeción:** la afectación de la vía
respiratoria superior (costras nasales, obstrucción) junto con proptosis
orbitaria y afectación renal es la tríada clásica de la granulomatosis con
poliangitis (C); la poliarteritis nudosa no afecta típicamente la vía
respiratoria superior ni produce glomerulonefritis.

## id 209 (2022-26) — Perfil lipoproteico en el síndrome nefrótico
**Oficial:** C) Aumento de la apolipoproteína A-I. **Objeción:** el hallazgo
clásico y mejor establecido en el síndrome nefrótico es el aumento de la
síntesis hepática de lipoproteínas que contienen apolipoproteína B-100 (LDL,
VLDL) (B), no de la apoA-I (asociada a HDL).

## id 317 (2022-136) — Síndrome pulmón-riñón con semilunas, prueba confirmatoria
**Oficial:** C) Títulos de antiestreptolisina O. **Objeción:** el cuadro
(disnea, hemoptisis/hematuria, glomerulonefritis con semilunas) es un
síndrome pulmón-riñón, característico de la enfermedad por anticuerpos
antimembrana basal glomerular (síndrome de Goodpasture); la prueba
confirmatoria adecuada son los anticuerpos anti-MBG (B), no el ASLO.

## id 318 (2022-137) — Fracaso renal crónico avanzado sin albuminuria
**Oficial:** D) Nefropatía diabética. **Objeción:** la nefropatía diabética
cursa característicamente con albuminuria progresiva; la ausencia de
microalbuminuria en un paciente sin antecedente de diabetes mencionado en el
enunciado orienta mejor hacia una nefropatía tubulointersticial crónica (C),
que típicamente no cursa con proteinuria significativa.

## id 382 (2022-202) — GN necrotizante con semilunas, inmunofluorescencia NEGATIVA
**Oficial:** A) Glomerulonefritis postinfecciosa. **Objeción:** una
inmunofluorescencia negativa junto con semilunas es, por definición, el
patrón pauci-inmune (B); la GN postinfecciosa se caracteriza por depósitos
positivos (C3 y IgG granulares), no por inmunofluorescencia negativa.

## id 408 (2023-19) — Litiasis obstructiva con sepsis (hipotensión, fiebre, obnubilación)
**Oficial:** D) Antibioticoterapia y sueroterapia IV y litotricia
extracorpórea o ureterorrenoscopia. **Objeción:** ante una obstrucción de la
vía urinaria con datos de sepsis/shock séptico, la prioridad es la
derivación urgente de la vía urinaria (catéter doble J o nefrostomía
percutánea) con tratamiento definitivo de la litiasis diferido (B); tratar
la litiasis de forma definitiva durante la sepsis activa no es seguro.

## id 528 (2023-142) — Hallazgo que NO apoya la nefropatía diabética
**Oficial:** A) Aumento lento de las cifras de creatinina sérica.
**Objeción:** una elevación lenta y progresiva de creatinina es compatible
con el curso habitual de la nefropatía diabética; la hematuria persistente
(C) es un hallazgo atípico que debería hacer sospechar un diagnóstico
alternativo o adicional (p. ej. nefropatía IgA), y es la que no apoya el
diagnóstico.

## id 530 (2023-144) — Rash pruriginoso y caída del FGe tras AINE y omeprazol
**Oficial:** C) Necrosis tubular aguda; esperar recuperación espontánea.
**Objeción:** la presencia de un rash cutáneo junto con el deterioro renal
tras la exposición a fármacos clásicamente implicados (AINE, IBP) es
altamente sugestiva de nefritis intersticial aguda (D), no de necrosis
tubular aguda simple, que no cursa con manifestaciones cutáneas.

## id 582 (2023-196) — LLA, 48h post-quimioterapia, hiperuricemia+hiperK+hiperfosfatemia+hipoCa
**Oficial:** D) Alteración metabólica secundaria a hiperemesis
postquimioterapia. **Objeción:** esta tétrada bioquímica (hiperuricemia,
hiperpotasemia, hiperfosfatemia, hipocalcemia) junto con fracaso renal agudo
tras quimioterapia en una neoplasia hematológica de alto recambio celular es
la definición clásica del síndrome de lisis tumoral (B); los vómitos por sí
solos no explican este patrón (de hecho, producirían más bien hipopotasemia).

## id 723 (2024-130) — Indicación de hemodiálisis en el FRA, la EXCEPCIÓN
**Oficial:** C) Hiperpotasemia refractaria a tratamiento médico.
**Objeción:** la hiperpotasemia refractaria es una indicación clásica y
absoluta de diálisis urgente (mnemotecnia AEIOU); la proteinuria aislada de
1 g/24h (D) no es, en sí misma, una indicación de diálisis.

## id 725 (2024-132) — Características del SIADH
**Oficial:** D) En la mayoría de los casos se asocia a fármacos,
especialmente antibióticos e inmunosupresores. **Objeción:** esta afirmación
sobredimensiona el papel de los fármacos (y en particular de los
antibióticos) como causa predominante; la definición correcta y clásica del
SIADH es la hiponatremia con osmolalidad sérica baja y osmolalidad urinaria
inapropiadamente elevada (A).

## id 726 (2024-133) — Nefropatía IgA con MEST M1S1E0T0, sin semilunas, tratamiento actual
**Oficial:** A) Monoterapia con corticoides en pauta descendente de 3 meses.
**Objeción:** las guías actuales (KDIGO 2021) priorizan optimizar el
tratamiento de soporte —control de la presión arterial y la proteinuria con
bloqueo del sistema renina-angiotensina (B)— antes de plantear
inmunosupresión, dado el perfil de toxicidad de los corticoides sin claro
beneficio neto demostrado en formas no agresivas como esta (sin semilunas ni
proliferación endocapilar).

## id 787 (2024-195) — GN necrotizante con semilunas >50%, inmunofluorescencia NEGATIVA (2)
**Oficial:** C) Síndrome de Goodpasture. **Objeción:** el síndrome de
Goodpasture se caracteriza por depósitos LINEALES de IgG a lo largo de la
membrana basal glomerular en la inmunofluorescencia, no por
inmunofluorescencia negativa; una inmunofluorescencia negativa con semilunas
define la glomerulonefritis pauci-inmune (A) — mismo patrón de error que en
la id 382 de esta misma especialidad.

## id 843 (2025-45) — SHU pediátrico, afirmación correcta
**Oficial:** D) En los casos asociados a E. coli O157:H7, el tratamiento
antibiótico precoz con quinolonas mejora el pronóstico. **Objeción:** el
tratamiento antibiótico en la diarrea por E. coli productor de toxina Shiga
está desaconsejado, ya que puede aumentar la liberación de toxina y el
riesgo de progresión a SHU; la afirmación correcta es que la insuficiencia
renal combinada con la hemólisis puede producir hiperpotasemia grave (B).

## id 885 (2025-88) — Fumadora, trabajadora del caucho, síndrome miccional con ecografía normal
**Oficial:** D) La disuria descarta patología tumoral. **Objeción:** la
disuria no descarta en absoluto un tumor vesical, y menos en una paciente de
alto riesgo (tabaquismo, exposición ocupacional a la industria del caucho);
ante clínica irritativa con ecografía normal en este perfil de riesgo, está
indicada la cistoscopia con citologías para descartar un carcinoma in situ
vesical (B), que puede pasar desapercibido en la ecografía.

## id 914 (2025-117) — ACOD, afirmación FALSA
**Oficial:** A) Existen ensayos clínicos que avalan su uso en hemodiálisis.
**Objeción:** esta afirmación, formulada de forma moderada ("algunos
ensayos"), tiene cierto respaldo en la literatura reciente (p. ej.
AXADIA-AFNET8 con apixabán); la afirmación más claramente falsa es que
puedan usarse en "todo tipo" de prótesis cardíacas (C) — los ACOD están
formalmente contraindicados en prótesis valvulares mecánicas.

## id 926 (2025-129) — Neurotoxicidad por opioides con dolor no controlado y FGe 40
**Oficial:** A) Aumentar la dosis de morfina un 25-50% y añadir
benzodiacepinas para las mioclonías. **Objeción:** el cuadro (mioclonías,
sueños vívidos, confusión leve) es típico de neurotoxicidad por opioides,
agravada por el deterioro de la función renal; la actitud correcta ante
neurotoxicidad con analgesia insuficiente es la rotación de opioide con
reducción de la dosis equianalgésica por tolerancia cruzada incompleta (C),
no aumentar la dosis del opioide causante.

## id 982 (2025-187) — T2DM con IAM previo y FGe 52, mejor fármaco a añadir
**Oficial:** C) Inhibidor de DPP-4 (sitagliptina). **Objeción:** en un
paciente con enfermedad cardiovascular establecida (IAM previo), el fármaco
de elección para añadir es un iSGLT2 (D), con beneficio cardiovascular
demostrado; los iDPP4 son metabólicamente neutros y no han mostrado ese
beneficio.

## id 987 (2025-192) — Mejor marcador bioquímico de función renal
**Oficial:** A) Urea plasmática. **Objeción:** la urea está influida por
múltiples factores no renales (ingesta proteica, catabolismo, sangrado
digestivo, hidratación) y es un marcador menos fiable que la creatinina
plasmática (B), el marcador bioquímico estándar y más utilizado en la
práctica clínica habitual.

## id 990 (2025-195) — Indigente hallado inconsciente con hematomas, CPK 9.000 U/L
**Oficial:** A) Necrosis tubular aguda alcohólica. **Objeción:** una CPK tan
marcadamente elevada (9.000 U/L) es el dato clave que apunta específicamente
a rabdomiolisis por inmovilización prolongada (posiblemente agravada por
traumatismo y alcohol), causa de fracaso renal agudo por mioglobinuria (D);
"necrosis tubular aguda alcohólica" no es una entidad específica que explique
esa cifra de CPK.

**Verificación 2022/2024 de este lote:** id 382 (2022, núm.202) y ids de 2024
(723 núm.130, 725 núm.132, 726 núm.133, 787 núm.195) — ninguno coincide con
las preguntas anuladas en la plantilla definitiva (120/126/189 en 2022;
64/68/113/180/206 en 2024), verificados por la misma fuente secundaria
corroborada.

---

# Lote Ginecología (12/07/2026) — 19 casos adicionales

Mismo criterio recalibrado. Tasa de controversia del 58% (19/33 no-imagen).

## id 69 (2021-69) — Marcador ecográfico más importante en el cribado de preeclampsia
**Oficial:** A) Longitud cráneo-caudal. **Objeción:** la LCC se usa para
datar la gestación, no tiene relación con el riesgo de preeclampsia; el
marcador ecográfico específico del cribado de preeclampsia de primer
trimestre es el índice de pulsatilidad de las arterias uterinas (C).

## id 71 (2021-71) — Cribado combinado de aneuploidías del primer trimestre, afirmación correcta
**Oficial:** C) Está indicado en el primer trimestre en población gestante
de riesgo. **Objeción:** el cribado combinado se ofrece de forma universal a
toda la población gestante, no solo a la de riesgo; la afirmación
inequívocamente correcta es que combina datos analíticos y ecográficos (B).

## id 72 (2021-72) — Criterio NO utilizado para elegir la vía del parto en presentación de nalgas
**Oficial:** A) Tipo de presentación podálica. **Objeción:** el tipo de
presentación podálica (nalgas puras, completas o incompletas) es
precisamente uno de los criterios clásicos que condicionan la elección de la
vía del parto (las incompletas/podálicas contraindican el parto vaginal por
riesgo de prolapso de cordón).

## id 252 (2022-69) — Síndrome de ovario poliquístico, afirmación INCORRECTA
**Oficial:** C) Se asocia a obesidad y resistencia a la insulina.
**Objeción:** esto es cierto, es una asociación clásica del SOP; la
afirmación incorrecta es la D — el SOP se asocia clásicamente a mayor riesgo
de cáncer de ENDOMETRIO (por anovulación crónica), no de ovario.

## id 255 (2022-72) — Test de O'Sullivan positivo (175 mg/dl), siguiente paso
**Oficial:** B) Se indicará SOG de 100 g solo si tiene factores de riesgo.
**Objeción:** una vez que el test de cribado (O'Sullivan) resulta positivo,
la confirmación diagnóstica con SOG de 100 g está indicada de forma
incondicional, no supeditada a la presencia de factores de riesgo
adicionales (D); el criterio de riesgo se aplica a si se realiza o no el
cribado inicial, no a la confirmación tras un cribado ya positivo.

## id 258 (2022-75) — CIR con Doppler umbilical >p95 a las 36,5 semanas, recomendación
**Oficial:** C) Controles semanales hasta las 40 semanas. **Objeción:** ante
un CIR con Doppler de arteria umbilical alterado, los protocolos habituales
recomiendan finalizar la gestación no más allá de las 37 semanas por el
riesgo asociado a la insuficiencia placentaria; la opción D (inducción a
partir de las 37 semanas) es más acorde con el manejo estándar.

## id 259 (2022-76) — Insuficiencia ovárica prematura confirmada, tratamiento
**Oficial:** C) Hábitos de vida saludables esenciales; terapia hormonal como
segunda línea. **Objeción:** las guías actuales (ESHRE) recomiendan la
terapia hormonal sustitutiva como tratamiento de PRIMERA línea en la
insuficiencia ovárica prematura (no como segunda opción), dado el riesgo a
largo plazo del déficit estrogénico precoz; la opción B, que incluye estudio
con cariotipo y THS de entrada, es más acorde con las guías vigentes.

## id 456 (2023-68) — Prevención de recurrencia del parto pretérmino, cérvix 28mm
**Oficial:** A) Reposo relativo, antibioticoterapia y nifedipino oral.
**Objeción:** la intervención con mayor evidencia para la prevención de la
recurrencia del parto pretérmino en mujeres con cérvix corto y antecedente de
parto pretérmino es la progesterona natural micronizada vaginal (B); el
nifedipino es un tocolítico para el trabajo de parto activo, no una medida
profiláctica.

## id 457 (2023-69) — Esterilidad, dismenorrea grave, dispareunia y disquecia
**Oficial:** D) Esterilidad de origen tubárico. **Objeción:** la tríada de
dismenorrea incapacitante, dolor con la defecación (disquecia) y dispareunia
es la presentación clásica de la endometriosis (A), no de la esterilidad
tubárica, que no suele cursar con este patrón de dolor.

## id 458 (2023-70) — Mastitis puerperal con fiebre, lactancia establecida
**Oficial:** D) Antibióticos locales y lavados con antisépticos.
**Objeción:** el tratamiento estándar de la mastitis puerperal es la
antibioticoterapia oral (sistémica) junto con el vaciado adecuado de la
mama, manteniendo la lactancia (B); el tratamiento tópico/local no es el
manejo estándar de una infección del parénquima mamario.

## id 583 (2023-197) — Origen del carcinoma seroso de alto grado de ovario
**Oficial:** B) Epitelio de quistes de endometriosis ovárica. **Objeción:**
la evidencia actual bien establecida sitúa el origen del carcinoma seroso de
alto grado en el epitelio de las fimbrias de la trompa de Falopio (A,
lesiones STIC); el origen endometriósico se relaciona más bien con los
carcinomas de células claras y endometrioide, no con el seroso de alto grado.

## id 630 (2024-34) — Recurrencia de osteogénesis imperfecta tipo II en dos gestaciones, padres no afectos
**Oficial:** B) Mutación de novo. **Objeción:** dos eventos "de novo"
independientes en gestaciones sucesivas de la misma pareja serían una
coincidencia estadísticamente muy improbable; la explicación clásica y mejor
establecida para la recurrencia de una enfermedad autosómica dominante en
padres clínicamente no afectos es el mosaicismo germinal (D).

## id 654 (2024-58) — Discrepancia de biometría fetal (22 vs 19 semanas), siguiente paso
**Oficial:** A) Valorar estudio genético por riesgo de anomalía cromosómica.
**Objeción:** ante una discrepancia biométrica, el primer paso lógico es
comprobar si la datación de la gestación es correcta según la longitud
cráneo-caudal del primer trimestre (B) antes de asumir patología y plantear
estudios más invasivos.

## id 659 (2024-63) — Factor crucial e independiente en el tratamiento adyuvante del cáncer de endometrio
**Oficial:** D) Presencia de metrorragia. **Objeción:** la metrorragia es un
síntoma que motiva el diagnóstico, no un factor pronóstico; la clasificación
molecular del tumor (B) es el factor que las guías actuales (ESGO/ESTRO/ESP
2020) reconocen como determinante crucial e independiente en la decisión de
tratamiento adyuvante del cáncer de endometrio.

## id 748 (2024-155) — Estrategia de cribado de diabetes gestacional en un solo paso
**Oficial:** D) SOG con 100 g. **Objeción:** la estrategia de "un solo paso"
(criterios IADPSG) utiliza una SOG de 75 g (B); la SOG de 100 g corresponde a
la prueba de confirmación de la estrategia de "dos pasos", tras un cribado
positivo con el test de O'Sullivan de 50 g.

## id 830 (2025-32) — Indicador de resultado según el modelo de Donabedian
**Oficial:** A) Ratio de camas hospitalarias por 1.000 habitantes.
**Objeción:** la disponibilidad de camas es un indicador de ESTRUCTURA
(recursos disponibles), no de resultado; la incidencia de infecciones
relacionadas con la asistencia sanitaria (C) es el ejemplo clásico de
indicador de resultado, ya que mide un desenlace clínico real.

## id 845 (2025-47) — Síndrome de dificultad respiratoria del prematuro, afirmación correcta
**Oficial:** A) Existe mayor riesgo por la administración de corticoides a
la madre gestante. **Objeción:** esto es lo contrario de lo establecido — los
corticoides antenatales REDUCEN el riesgo de distrés respiratorio neonatal;
la afirmación correcta es que existe un déficit de surfactante por distintos
mecanismos asociados a la prematuridad (D).

## id 849 (2025-51) — Baches amenorreicos con FSH 80 y LH 51 (patrón hipergonadotropo)
**Oficial:** C) Amenorrea hipotalámica. **Objeción:** la amenorrea
hipotalámica cursa con gonadotropinas bajas o normales (hipogonadismo
hipogonadotropo); unas cifras de FSH y LH tan marcadamente elevadas
corresponden al patrón opuesto (hipergonadotropo), característico de la
insuficiencia o fallo ovárico prematuro (A).

## id 854 (2025-57) — Indicación de tocolisis en gestante de 30 semanas con contracciones confirmadas
**Oficial:** C) Debe administrarse en todos los casos, dada la edad
gestacional. **Objeción:** la tocolisis no es una indicación universal por
la sola edad gestacional; se basa en la valoración del riesgo real de parto
inminente. Una longitud cervical muy corta (20 mm, opción A) junto con
contracciones confirmadas sí constituye una indicación clara y
estandarizada de tocolisis.

**Verificación 2022/2024 de este lote:** ids de 2022 (252 núm.69, 255 núm.72,
258 núm.75, 259 núm.76) y de 2024 (630 núm.34, 654 núm.58, 659 núm.63, 748
núm.155) — ninguno coincide con las preguntas anuladas en la plantilla
definitiva (120/126/189 en 2022; 64/68/113/180/206 en 2024), verificados por
la misma fuente secundaria corroborada.

---

# Lote Hematología (12/07/2026) — 22 casos adicionales

Mismo criterio recalibrado. Tasa de controversia del 76% (22/29 no-imagen),
la más alta hasta ahora, con varios de los errores más flagrantes de todo el
proyecto (hechos fundacionales de hematología, no matices de guías).

## id 62 (2021-62) — Rigidez y deformidad mamaria progresiva años después de mamoplastia
**Oficial:** D) Carcinoma ductal infiltrante de mama. **Objeción:** el cuadro
(asimetría progresiva, aumento de consistencia, desplazamiento axilar años
después de una prótesis mamaria) es la presentación clásica y específicamente
enseñada del linfoma anaplásico de células grandes asociado a prótesis
mamarias (B, BIA-ALCL).

## id 126 (2021-126) — HTA resistente con hipopotasemia y alcalosis metabólica
**Oficial:** A) El origen es la secreción excesiva de aldosterona por
hiperfunción de la MÉDULA suprarrenal. **Objeción:** la aldosterona se
produce en la CORTEZA suprarrenal (zona glomerular), no en la médula (que
produce catecolaminas) — error anatómico básico. La afirmación correcta es
que el sustrato anatómico más frecuente del hiperaldosteronismo primario es
la hiperplasia bilateral de la corteza suprarrenal (B).

## id 158 (2021-159) — Efecto adverso grave de la heparina, más allá del sangrado
**Oficial:** B) Trastornos gastrointestinales con diarrea y deshidratación.
**Objeción:** esto no es un efecto adverso reconocido de la heparina; el
efecto grave y potencialmente mortal, además de la hemorragia, es la
trombocitopenia inducida por heparina con fenómenos trombóticos (D), una de
las reacciones adversas farmacológicas más clásicamente enseñadas.

## id 159 (2021-160) — Pentada clásica de PTT etiquetada como otra entidad
**Oficial:** D) Trombocitopenia inmune idiopática. **Objeción:** la
combinación de anemia hemolítica microangiopática (esquistocitos, LDH muy
elevada, haptoglobina indetectable, Coombs negativo), trombocitopenia grave,
fiebre y clínica neurológica es la pentada clásica de la púrpura trombótica
trombocitopénica (B), no de una PTI aislada (que no cursa con hemólisis
microangiopática).

## id 160 (2021-161) — t(11;14) con afectación de ciclina D1
**Oficial:** A) Linfoma folicular. **Objeción:** la t(11;14) con
sobreexpresión de ciclina D1 es la alteración genética definitoria del
linfoma del manto (D); el linfoma folicular se caracteriza por la t(14;18)
con reordenamiento de BCL2, una translocación distinta.

## id 172 (2021-173) — Fiebre y odinofagia en paciente con Graves en tratamiento con metimazol
**Oficial:** C) Interrumpir el propranolol y obtener un cultivo de
orofaringe. **Objeción:** la fiebre y el dolor de garganta en un paciente
tratado con metimazol son signos de alarma clásicos de agranulocitosis
inducida por el fármaco; la actitud correcta y de seguridad es suspender el
metimazol (no el propranolol) y solicitar un hemograma con fórmula (D).

## id 221 (2022-38) — CAR-T anti-CD19, afirmación INCORRECTA
**Oficial:** A) El reconocimiento se basa en scFvs de anticuerpos anti-CD19.
**Objeción:** esto es cierto, es el diseño estructural real del receptor
CAR; la afirmación incorrecta es la D — precisamente una de las
características definitorias de la tecnología CAR-T es que el reconocimiento
del antígeno es INDEPENDIENTE de las moléculas HLA, a diferencia del receptor
de célula T convencional.

## id 237 (2022-54) — Toxicidad renal por metotrexato con orina ácida
**Oficial:** C) Bicarbonato sódico por vía enteral para reducir la absorción
digestiva. **Objeción:** el metotrexato se administró por vía intravenosa,
por lo que la absorción digestiva es irrelevante; siendo un ácido débil, la
alcalinización de la ORINA con bicarbonato sódico INTRAVENOSO aumenta su
ionización y favorece su eliminación renal, evitando la precipitación
tubular (B).

## id 328 (2022-147) — Trombopenia aislada incidental y asintomática en varón joven
**Oficial:** B) Realizar una biopsia de médula ósea. **Objeción:** el primer
paso ante una trombopenia aislada e inesperada es descartar la
pseudotrombopenia por agregados plaquetarios inducidos por el anticoagulante
mediante revisión del frotis de sangre periférica (C), antes de plantear
pruebas más invasivas.

## id 357 (2022-176) — Factores de riesgo de linfoma B en el síndrome de Sjögren
**Oficial:** C) Esplenomegalia y pancitopenia. **Objeción:** los factores de
riesgo de linfoma mejor establecidos y validados en el síndrome de Sjögren
son la hipocomplementemia y la crioglobulinemia (D), recogidos en los
modelos de predicción de riesgo de esta enfermedad.

## id 469 (2023-81) — Características del SHU en la infancia, la EXCEPCIÓN
**Oficial:** A) Anemia hemolítica microangiopática. **Objeción:** la AHMA es
precisamente una característica definitoria del SHU, no la excepción; lo que
NO es característico es el alargamiento de los tiempos de coagulación (C),
que suelen ser normales en el SHU (a diferencia de la CID).

## id 496 (2023-108) — Síndrome de Sjögren (parotidomegalia, anti-Ro/La, hipocomplementemia), riesgo de neoplasia
**Oficial:** C) Leucemia de células NK. **Objeción:** la asociación clásica y
mejor establecida del síndrome de Sjögren es con el linfoma B (B),
particularmente el linfoma MALT originado en las glándulas salivales
crónicamente inflamadas, no con la leucemia de células NK.

## id 538 (2023-152) — Encefalitis anti-NMDA en mujer joven
**Oficial:** B) Sarcoma de Ewing. **Objeción:** la encefalitis por anticuerpos
anti-receptor NMDA tiene una asociación paraneoplásica clásica y muy bien
establecida con el teratoma ovárico (A) en mujeres jóvenes; no existe una
asociación reconocida con el sarcoma de Ewing.

## id 540 (2023-154) — 15% de blastos mieloides en médula ósea, clasificación OMS
**Oficial:** D) Aplasia medular. **Objeción:** la aplasia medular se define
por hipocelularidad SIN exceso de blastos, justo lo opuesto a este hallazgo;
un 15% de blastos (por debajo del 20% que define leucemia aguda) corresponde
a un síndrome mielodisplásico con exceso de blastos (B).

## id 565 (2023-179) — Sospecha de vasculitis de grandes vasos (tipo Takayasu), afirmación INCORRECTA
**Oficial:** A) Algunos pacientes presentan estenosis establecidas
detectadas de forma casual en fase inactiva. **Objeción:** esto es cierto y
un escenario clínico reconocido; la afirmación incorrecta es la C — una VSG
normal NO descarta el diagnóstico de vasculitis de grandes vasos, un punto
de enseñanza clásico precisamente para evitar el error de excluir la
enfermedad solo por reactantes de fase aguda normales.

## id 721 (2024-128) — Esplenectomía laparoscópica en PTI refractaria
**Oficial:** B) La preservación del polo inferior del bazo es recomendable
para mantener función inmunológica parcial. **Objeción:** en la PTI, dejar
tejido esplénico residual es contraproducente, ya que continuaría
destruyendo plaquetas opsonizadas y podría causar fallo terapéutico; la
esplenectomía debe ser completa. La vacunación preoperatoria frente a
gérmenes encapsulados al menos 2 semanas antes de la cirugía (D) sí es una
medida estándar y bien establecida.

## id 738 (2024-145) — Hemofilia A grave con inhibidor de alto título, sangrado articular agudo
**Oficial:** C) Ácido tranexámico. **Objeción:** ante un paciente con
inhibidor de alto título frente al FVIII, el tratamiento específico para
controlar un sangrado agudo son los agentes bypass, como el factor VII
activado recombinante (D); el ácido tranexámico es solo un adyuvante
antifibrinolítico, no el tratamiento específico de elección.

## id 740 (2024-147) — Linfoma producido por el virus herpes humano tipo 8 (HHV8/KSHV)
**Oficial:** C) Linfoma de Burkitt. **Objeción:** el linfoma de Burkitt se
asocia clásicamente al virus de Epstein-Barr, no al HHV8; la entidad
específicamente causada por HHV8 es el linfoma primario de cavidades (B),
literalmente la misma entidad mencionada en esa opción.

## id 824 (2025-24) — Esplenomegalia, leucoeritroblastosis, aspirado seco, JAK2 V617F+ASXL1, antecedente de trombocitosis aislada
**Oficial:** D) Leucemia mieloide crónica. **Objeción:** la LMC se define
por la fusión BCR-ABL1 (cromosoma Filadelfia), no por la mutación JAK2
V617F, que es propia de las neoplasias mieloproliferativas clásicas
(policitemia vera, trombocitemia esencial, mielofibrosis). El cuadro
completo (antecedente de trombocitosis aislada que evoluciona a anemia,
leucoeritroblastosis, aspirado seco y fibrosis en la tinción de reticulina)
es el descrito literalmente en la opción A (mielofibrosis post
trombocitemia esencial).

## id 935 (2025-138) — aPTT alargado con agregación anómala a ristocetina, sin clínica hemorrágica
**Oficial:** D) Síndrome de Bernard-Soulier. **Objeción:** el síndrome de
Bernard-Soulier cursa típicamente con trombocitopenia y clínica hemorrágica
relevante, ausentes en este caso; la combinación de aPTT alargado con
agregación anómala específicamente a ristocetina, plaquetas normales y
clínica mínima o ausente es más compatible con una enfermedad de von
Willebrand tipo I (B), con frecuencia leve o asintomática.

## id 936 (2025-139) — LES con anemia, hierro bajo, ferritina muy elevada
**Oficial:** D) Talasemia menor. **Objeción:** el patrón de hierro sérico
bajo con ferritina claramente elevada (400 ng/mL) es el patrón clásico de la
anemia de trastorno crónico/inflamatorio (A), especialmente en el contexto
de una enfermedad autoinmune activa como el LES; la ferritina elevada
descarta una ferropenia real y no es un hallazgo característico de la
talasemia menor.

## id 974 (2025-178) — Anemia microcítica hipocroma progresiva con trombocitosis en anciana
**Oficial:** A) Trombocitemia esencial. Estudio de médula ósea.
**Objeción:** el patrón (anemia microcítica-hipocroma de instauración
progresiva en el último año, con trombocitosis) es mucho más compatible con
una anemia ferropénica por pérdidas digestivas ocultas con trombocitosis
reactiva secundaria (un fenómeno bien conocido) que con una trombocitemia
esencial primaria, que no explica la microcitosis; lo indicado es descartar
ferropenia y estudiar el origen digestivo (D).

**Verificación 2022/2024 de este lote:** ids de 2022 (221 núm.38, 237 núm.54,
328 núm.147, 357 núm.176) y de 2024 (721 núm.128, 738 núm.145, 740 núm.147) —
ninguno coincide con las preguntas anuladas en la plantilla definitiva
(120/126/189 en 2022; 64/68/113/180/206 en 2024), verificados por la misma
fuente secundaria corroborada.

---

# Lote Reumatología (12/07/2026) — 21 casos adicionales

Mismo criterio recalibrado. Tasa de controversia del 76% (22/29 no-imagen,
incluyendo id 559 ya documentado en el lote de Respiratorio). Llamativo: dos
viñetas de polimialgia reumática de manual (id 182, id 933) en las que la
respuesta oficial evita el diagnóstico obvio.

## id 47 (2021-47) — Infección que precisa aislamiento de contacto Y gotas
**Oficial:** D) Clostridioides difficile. **Objeción:** C. difficile
requiere únicamente precauciones de contacto (transmisión fecal-oral por
esporas), sin componente de gotas; las fiebres hemorrágicas virales (B) sí
requieren combinación de precauciones de contacto y gotas (a veces también
aéreas) en la mayoría de protocolos de control de infecciones.

## id 60 (2021-60) — Complicación más frecuente de fractura órbito-malar
**Oficial:** B) Maloclusión dental. **Objeción:** la maloclusión es más
propia de fracturas mandibulares o LeFort con afectación del arco dentario;
la complicación clásicamente más asociada a las fracturas del complejo
cigomático-orbitario es el enoftalmos (D), por aumento del volumen orbitario.

## id 182 (2021-184) — Dolor y rigidez de cinturas escapular y pelviana en anciana, VSG y PCR elevadas
**Oficial:** D) Espondilitis anquilosante, AINEs. **Objeción:** la
espondilitis anquilosante es una enfermedad de inicio típico en adultos
jóvenes (20-30 años) con afectación axial, no de cinturas en una mujer de 70
años; el cuadro es la presentación de manual de la polimialgia reumática (C),
que se trata con corticoides.

## id 295 (2022-112) — Pseudoartrosis del escafoides, afirmación INCORRECTA
**Oficial:** C) A largo plazo suele provocar artrosis radiocarpiana.
**Objeción:** esto es cierto (patrón SNAC de muñeca); lo incorrecto es la A —
la necrosis en la pseudoartrosis del escafoides afecta característicamente
al fragmento PROXIMAL (por la vascularización retrógrada del hueso), no al
distal.

## id 298 (2022-115) — Lumbalgia, edema de manos, ojo rojo, tras relaciones sin protección
**Oficial:** B) Artritis psoriásica. **Objeción:** la tríada de conjuntivitis,
uretritis/exposición sexual de riesgo y artritis con sacroileítis es la
presentación clásica de la artritis reactiva (A) ("no puede ver, no puede
orinar, no puede subir a un árbol"); el antecedente familiar de psoriasis es
un distractor.

## id 316 (2022-135) — Dolor generalizado progresivo, hiponatremia leve, transaminitis leve, diagnosticada de fibromialgia sin respuesta
**Oficial:** A) Estudio del gen MEFV. **Objeción:** el cuadro (dolor
abdominal previo mal etiquetado, debilidad progresiva, síntomas
psiquiátricos, hiponatremia) es muy sugestivo de porfiria aguda intermitente,
una entidad clásicamente confundida con fibromialgia/depresión; la prueba a
comprobar es la determinación de porfobilinógeno y ácido aminolevulínico en
orina (B), no el gen MEFV (fiebre mediterránea familiar, que no encaja con
este cuadro).

## id 337 (2022-156) — Cribado de sarcopenia, Timed Up and Go de 26 segundos
**Oficial:** A) No presenta riesgo de caídas. **Objeción:** un TUG de 26
segundos está muy por encima del punto de corte habitual (>12-14 segundos)
que indica riesgo aumentado de caídas; con estos resultados tan alterados en
las pruebas funcionales, la afirmación de que "no presenta riesgo de caídas"
es la que peor encaja de las cuatro opciones.

## id 353 (2022-172) — Controles periódicos en los primeros meses de esclerodermia difusa
**Oficial:** D) Pruebas funcionales respiratorias y TC de tórax.
**Objeción:** en la esclerodermia DIFUSA, el riesgo más urgente en los
primeros meses es la crisis renal esclerodérmica, por lo que el control
estrecho de la función renal y la presión arterial (C) es especialmente
enfatizado en este periodo inicial.

## id 385 (2022-205) — Artritis asimétrica de manos con lesiones descamativas en superficies extensoras
**Oficial:** B) Lupus eritematoso sistémico. **Objeción:** las lesiones
cutáneas descamativas en codos y rodilla (superficies extensoras) son la
descripción clásica de placas de psoriasis, y junto con una artritis de
patrón asimétrico y FR/anti-CCP negativos, configuran el cuadro típico de
artritis psoriásica (C), no de LES.

## id 497 (2023-109) — Dolor lumbar inflamatorio (rigidez matutina >1h, mejora con movimiento)
**Oficial:** B) Osteofitos típicos de la espondiloartritis. **Objeción:** el
hallazgo radiológico característico de la espondiloartritis es el
sindesmofito, no el osteofito (propio de la espondiloartrosis, un proceso
mecánico que no encaja con el patrón inflamatorio descrito); la opción
correcta sería sindesmofitos típicos de la espondiloartritis (D).

## id 584 (2023-198) — Dermatitis atópica grave desde la infancia, refractaria a ciclosporina y metotrexato
**Oficial:** A) Ustekinumab. **Objeción:** el ustekinumab (anti-IL12/23) está
indicado en psoriasis, no en dermatitis atópica; el biológico específicamente
aprobado y bien establecido para la dermatitis atópica moderada-grave
refractaria es el dupilumab (B).

## id 642 (2024-46) — Fotosensibilidad facial tras excursión en barco, polimedicado
**Oficial:** B) Amlodipino. **Objeción:** las tiazidas (hidroclorotiazida, A)
son una de las causas farmacológicas de fotosensibilidad mejor establecidas y
más clásicamente enseñadas, muy por encima del amlodipino en frecuencia y
solidez de la asociación.

## id 690 (2024-96) — Hallazgo anatomopatológico sugestivo de enfermedad por IgG4
**Oficial:** B) Proliferación de la íntima arterial sin datos de vasculitis.
**Objeción:** la tríada histológica clásica y específicamente nombrada de la
enfermedad por IgG4 es infiltrado linfoplasmocitario rico en células IgG4+,
flebitis obliterativa (venosa) y fibrosis estoriforme (C) — este último es el
hallazgo más específicamente asociado y nombrado en la literatura.

## id 742 (2024-149) — Insomnio en anciana de 90 años sin otras comorbilidades activas
**Oficial:** C) Mirtazapina. **Objeción:** para el insomnio aislado en el
anciano, la trazodona (D) se cita con más frecuencia como opción preferente
por su perfil de seguridad geriátrico (menor riesgo anticolinérgico y de
aumento de peso que la mirtazapina), que se reserva más para cuadros con
depresión asociada.

## id 923 (2025-126) — "Hallmark" de envejecimiento de tipo PRIMARIO
**Oficial:** D) Agotamiento de células madre. **Objeción:** según la
clasificación de "Hallmarks of Aging" (López-Otín), el agotamiento de células
madre se clasifica como un hallmark INTEGRATIVO (consecuencia), mientras que
el acortamiento de los telómeros (B) es el ejemplo clásico de hallmark
PRIMARIO (causa directa de daño).

## id 933 (2025-136) — Segunda viñeta de polimialgia reumática etiquetada como otra entidad
**Oficial:** C) Artritis indiferenciada. **Objeción:** de nuevo (ver id 182
en este mismo lote), el cuadro clásico de dolor y rigidez de cinturas
escapular y pelviana en un anciano, con VSG muy elevada (85 mm/h) y FR/ACPA
negativos, sin afectación articular periférica, es polimialgia reumática (B),
no una artritis indiferenciada.

## id 940 (2025-143) — Orina rojiza recidivante, dolor abdominal recurrente, trombosis venosa mesentérica
**Oficial:** B) Síndrome antifosfolípido. **Objeción:** la tríada de
hemoglobinuria recidivante, dolor abdominal y trombosis venosa en
localizaciones atípicas (mesentérica, hepática) es la presentación clásica de
la hemoglobinuria paroxística nocturna (A), que explica específicamente el
componente de orina oscura/rojiza, a diferencia del síndrome antifosfolípido.

## id 975 (2025-179) — Artritis psoriásica con mal control en metotrexato, antecedente de ictus isquémico, opción NO recomendable
**Oficial:** D) Biológico anti-IL12/23. **Objeción:** los inhibidores de JAK
(B) tienen una advertencia regulatoria específica y bien establecida (FDA/EMA,
tras el ensayo ORAL Surveillance) de mayor riesgo cardiovascular y
trombótico, por lo que se desaconsejan específicamente en pacientes con
antecedentes cardiovasculares como un ictus previo, mucho más que los
anti-IL12/23.

## id 976 (2025-180) — Poliartritis rizomiélica dos meses después de iniciar pembrolizumab
**Oficial:** A) Vasculitis secundaria al carcinoma. **Objeción:** la
relación temporal con el inicio de un inhibidor de checkpoint (pembrolizumab)
señala directamente hacia un evento adverso inmunomediado (irAE) — una
enfermedad reumática secundaria al propio fármaco (C) —, una complicación
cada vez mejor reconocida de esta clase de inmunoterapia, más específica que
una vasculitis paraneoplásica.

## id 979 (2025-183) — Lumbalgia inflamatoria con dactilitis asimétrica y erosión con neoformación ósea yuxta-articular
**Oficial:** B) Enfermedad mixta del tejido conectivo. **Objeción:** la
combinación de dactilitis y el patrón radiológico de erosión con
neoformación ósea yuxta-articular es característica de la artritis
psoriásica (D), incluso sin lesiones cutáneas ("psoriasis sine psoriasis");
la EMTC se define por anticuerpos anti-RNP y ANA positivos (aquí negativos),
por lo que no encaja.

## id 980 (2025-184) — Vasculitis pulmonares, afirmación correcta
**Oficial:** B) La enfermedad anti-MBG comienza siempre con afectación
pulmonar seguida de afectación renal leve. **Objeción:** esta afirmación es
demasiado absoluta e imprecisa (la enfermedad anti-MBG no "siempre" empieza
por vía pulmonar, y la afectación renal suele ser grave, no leve); la
afirmación clásicamente correcta y bien establecida es que la granulomatosis
con poliangitis afecta con frecuencia a la vía aérea superior (D).

**Verificación 2022/2024 de este lote:** ids de 2022 (295 núm.112, 298 núm.115,
316 núm.135, 337 núm.156, 353 núm.172, 385 núm.205) y de 2024 (642 núm.46,
690 núm.96, 742 núm.149) — ninguno coincide con las preguntas anuladas en la
plantilla definitiva (120/126/189 en 2022; 64/68/113/180/206 en 2024),
verificados por la misma fuente secundaria corroborada.

**Nota general:** en todos los casos anteriores verifiqué que no se trata de un
problema de versión de examen — los 5 `cuadernillo_AÑO.pdf` son todos
"VERSIÓN: 0", igual que la tabla "V0/RC" de sus `plantilla_AÑO.pdf`
correspondientes, así que no hay desajuste de numeración entre cuadernillo y
plantilla. La coincidencia texto-por-texto entre BD y cuadernillo, más la
coincidencia de la letra con el RC oficial, descartan un error de importación:
son, literalmente, las respuestas dadas por buenas por la Comisión
Calificadora del Ministerio de Sanidad en su versión "definitiva" (post
alegaciones).

# Lote Traumatología (2026-07-12) — 12 casos adicionales

## id 111 (2021-111) — Síndrome del túnel carpiano, afirmación correcta
**Oficial:** D) Se acompaña de atrofia de la musculatura de la eminencia
hipotenar. **Objeción:** la eminencia hipotenar está inervada por el nervio
cubital, no por el mediano; el síndrome del túnel carpiano (compresión del
mediano) produce clásicamente atrofia de la eminencia TENAR, no de la
hipotenar. La afirmación C (exacerbación nocturna de los síntomas) es el
hallazgo clásico y mejor establecido del síndrome del túnel carpiano.

## id 117 (2021-117) — Fracturas de epitróclea en niños, afirmación INCORRECTA
**Oficial:** C) Pueden presentar asociada una neurapraxia del nervio
cubital. **Objeción:** esta afirmación es en realidad VERDADERA — el
nervio cubital discurre pegado a la epitróclea y su neurapraxia es una
complicación clásica y bien descrita de estas fracturas. La afirmación
objetivamente incorrecta es la D (mayor frecuencia entre 4 y 6 años); las
fracturas-avulsión de epitróclea son típicas de niños mayores/adolescentes
(9-14 años, en el estirón puberal, frecuentemente por mecanismo deportivo de
lanzamiento), no de la primera infancia.

## id 119 (2021-119) — Escoliosis idiopática, Risser 0, Cobb 35º, menarquia reciente
**Oficial:** A) Recomendar natación y revisión en tres meses. **Objeción:**
una curva de 35º de Cobb con Risser 0 y menarquia muy reciente (máximo
potencial de crecimiento restante) es indicación clásica de tratamiento
ortopédico con corsé (B), no de observación con natación; el manejo
puramente expectante se reserva para curvas menores (<20-25º) o con escaso
potencial de crecimiento remanente.

## id 291 (2022-108) — Lumbociatalgia con hipoestesia, reflejo rotuliano disminuido, dificultad para la marcha de talones
**Oficial:** D) Hernia discal L5-S1 derecha. **Objeción:** el dolor en cara
anterolateral del muslo/rodilla y, sobre todo, el reflejo ROTULIANO
disminuido son hallazgos característicos de radiculopatía L4, propia de una
hernia L3-L4 (A) o, para la raíz L4 en su trayecto, L4-L5 (C); una hernia
L5-S1 típicamente cursa con reflejo AQUÍLEO abolido y dolor/debilidad en
territorio S1 (marcha de puntillas afectada, no de talones), no con
afectación del reflejo rotuliano.

## id 296 (2022-113) — Dolor lumbar y glúteo bilateral que empeora al bipedestar/caminar y mejora sentado, Lasègue negativo
**Oficial:** A) Hernia discal a nivel L5-S1. **Objeción:** el patrón
descrito (empeoramiento con la bipedestación y la marcha, mejoría al
sentarse o en decúbito, Lasègue negativo, sin irradiación a miembros
inferiores) es la claudicación neurógena clásica de la estenosis de canal
lumbar (B), no de una hernia discal, que típicamente cursa con Lasègue
positivo y dolor radicular franco.

## id 486 (2023-98) — Politraumatismo con balance muscular 5/5 en las 4 extremidades superiores y debilidad distal progresiva en miembros inferiores
**Oficial:** A) Fractura-luxación de C7-T1. **Objeción:** un balance
muscular 5/5 en todos los grupos de ambas extremidades superiores excluye
razonablemente una lesión medular cervical baja C7-T1, que afectaría la
función de la mano. El patrón lumbar descrito (psoas relativamente
conservado, cuádriceps algo debilitado, y parálisis completa distal —
tibial anterior, tríceps sural, EHL) orienta mejor a una lesión del
cono medular/cauda equina por fractura-estallido de L2 con afectación
neurológica (B) que a una lesión cervical.

## id 488 (2023-100) — Hombro doloroso con impingement positivo, actitud INCORRECTA
**Oficial:** D) Se sospecha una lesión del manguito de los rotadores
(supraespinoso con bursitis subacromial), por lo que hay que potenciar la
musculatura descoaptante del hombro. **Objeción:** esta afirmación es en
realidad una conducta terapéutica estándar y correcta (el fortalecimiento de
la musculatura descoaptante/depresora de la cabeza humeral es el pilar del
tratamiento conservador del impingement). La conducta objetivamente más
incorrecta como primer paso es la B (derivación directa a cirugía para
artroscopia sin haber agotado antes el tratamiento conservador).

## id 560 (2023-174) — Gonalgia con pigmentación ocre en biopsia sinovial y mancha en el ojo
**Oficial:** A) Porfiria aguda intermitente. **Objeción:** la pigmentación
"ocre" del tejido sinovial (ocronosis) es el hallazgo patognomónico de la
alcaptonuria (B), enfermedad por depósito de ácido homogentísico que
produce artropatía degenerativa precoz y pigmentación ocronótica de
esclera/cartílago; la porfiria aguda intermitente no produce pigmentación
articular ni artropatía.

## id 685 (2024-91) — Factores que favorecen la inestabilidad fémoro-patelar, cuál NO la favorece
**Oficial:** D) Patela alta. **Objeción:** la patela alta es uno de los
cuatro factores anatómicos clásicos de inestabilidad femoropatelar (junto
con la displasia troclear, el aumento de la distancia TT-TG y el tilt
patelar lateral), por lo que sí la favorece. La torsión tibial interna (B)
es la opción que, a diferencia de la torsión tibial externa (que sí
aumenta el ángulo Q y favorece la inestabilidad), no se considera un factor
clásico favorecedor.

## id 687 (2024-93) — Gonartrosis, tratamiento más adecuado
**Oficial:** C) Infiltración intraarticular de corticoides. **Objeción:**
las guías de práctica clínica (OARSI, NICE) sitúan la pérdida de peso y el
ejercicio físico supervisado para potenciar el cuádriceps (B) como
tratamiento de primera línea de la gonartrosis; la infiltración de
corticoides se reserva para brotes de dolor o fracaso de las medidas
conservadoras, no como tratamiento inicial de elección.

## id 688 (2024-94) — Sacroileítis con lumbalgia inflamatoria típica, tratamiento inicial
**Oficial:** B) Corticoides orales. **Objeción:** el tratamiento inicial de
la espondiloartritis axial es la fisioterapia junto con AINE (C), según las
guías ASAS/EULAR; los corticoides orales no forman parte del tratamiento
estándar de la afectación axial de la espondiloartritis, por su escasa
eficacia sobre el esqueleto axial y su perfil de efectos adversos.

## id 887 (2025-90) — Red flag en la anamnesis y exploración de una lumbalgia
**Oficial:** A) Dolor lumbar de patrón mecánico. **Objeción:** el patrón
mecánico (mejora con el reposo, empeora con la actividad) es precisamente
el patrón BENIGNO y esperado de la lumbalgia común, no una señal de alarma.
El antecedente personal de proceso neoplásico (C) es una red flag clásica y
universalmente reconocida en todas las guías de lumbalgia.

**Verificación 2022/2024 de este lote:** ids de 2022 (291 núm.108, 296
núm.113) y de 2024 (685 núm.91, 687 núm.93, 688 núm.94) — ninguno coincide
con las preguntas anuladas en la plantilla definitiva (120/126/189 en 2022;
64/68/113/180/206 en 2024), verificados por la misma fuente secundaria
corroborada.

# Lote Infecciosas (2026-07-12) — 24 casos adicionales

## id 19 (2021-19) — VIH avanzado con hemiparesia, pérdida de peso y diarrea, RM cerebral (imagen), serologías negativas
**Oficial:** D) Encefalitis por CMV. **Objeción:** la propia carga viral de
CMV es negativa en el enunciado, lo que descarta razonablemente el
diagnóstico de encefalitis por CMV (que requiere viremia/ADN-CMV detectable
para su diagnóstico); el cuadro de déficit neurológico focal progresivo,
pérdida de peso y diarrea crónica con CD4 muy bajo y sin fiebre encaja mejor
con la leucoencefalopatía multifocal progresiva (C).

## id 20 (2021-20) — Endocarditis por SARM en tratamiento con vancomicina, empeoramiento agudo de insuficiencia mitral
**Oficial:** A) Añadir al tratamiento voriconazol. **Objeción:** el
voriconazol es un antifúngico, sin ningún papel en una endocarditis
bacteriana por SARM; el empeoramiento agudo del soplo mitral con
disnea/ortopnea indica progresión de la destrucción valvular con
insuficiencia cardiaca aguda, una indicación clásica de cirugía de recambio
valvular urgente junto con tratamiento deplectivo (D).

## id 36 (2021-36) — Interferones tipo I, autoanticuerpos neutralizantes en COVID-19 grave
**Oficial:** D) Inhiben la expresión de los antígenos HLA de clase I en las
células infectadas. **Objeción:** los interferones tipo I hacen
precisamente lo contrario — AUMENTAN la expresión de HLA de clase I en la
célula infectada para facilitar su reconocimiento por linfocitos T CD8+; su
función antiviral fundamental, bien establecida, es activar la expresión de
genes que confieren resistencia a la infección viral (C).

## id 56 (2021-56) — Niño alérgico a penicilina, antibiótico según antibiograma
**Oficial:** B) Imipenem. **Objeción:** el imipenem sigue siendo un
betalactámico, con riesgo de reactividad cruzada en el paciente alérgico a
penicilina; la claritromicina (A), un macrólido sin relación estructural
con los betalactámicos, es la opción sin ningún riesgo de reactividad
cruzada y por tanto la más segura ante una alergia a penicilina.

## id 218 (2022-35) — Anticuerpos monoclonales tixagevimab/cilgavimab frente a SARS-CoV-2
**Oficial:** D) Induce memoria inmunológica basada en la activación de
linfocitos B. **Objeción:** los anticuerpos monoclonales son inmunización
PASIVA, no generan memoria inmunológica de linfocitos B (eso es propio de
la inmunización activa/vacunación). La afirmación correcta y bien
documentada es que este tratamiento está indicado en pacientes
inmunodeprimidos, como los trasplantados de órganos (B), que es
precisamente la indicación autorizada de este fármaco.

## id 230 (2022-47) — Enfermedad con aislamiento por contacto Y aire (aerosoles)
**Oficial:** B) Tuberculosis. **Objeción:** la tuberculosis requiere
únicamente aislamiento aéreo (no de contacto). La entidad clásica que
requiere aislamiento combinado de contacto Y aéreo es la varicela (D), por
la transmisión tanto por gotas/aerosoles como por contacto directo con las
lesiones cutáneas.

## id 301 (2022-118) — Criterio NO válido para el diagnóstico de endocarditis infecciosa
**Oficial:** A) Presencia de fenómenos embólicos arteriales mayores.
**Objeción:** los fenómenos embólicos arteriales mayores SÍ forman parte de
los criterios de Duke (criterio menor, "fenómenos vasculares"). La anemia
hemolítica (D) no forma parte de los criterios de Duke y sería la opción
que efectivamente NO constituye un criterio diagnóstico.

## id 342 (2022-161) — Mujer de 83 años, postoperatorio, pérdida de 9kg en 20 días, ingesta 25%, IMC 31,2
**Oficial:** D) Obesidad grado II. **Objeción:** un IMC de 31,2 kg/m2
corresponde a obesidad grado I (30-34,9), no grado II (35-39,9) — un error
de clasificación. Además, la pérdida involuntaria de peso (>10% en 20
días), la ingesta insuficiente y la enfermedad aguda subyacente cumplen
criterios de desnutrición relacionada con la enfermedad aguda (B) según los
criterios GLIM/ESPEN, independientemente del IMC de partida ("obesidad
sarcopénica"/desnutrición en paciente obeso).

## id 345 (2022-164) — Sepsis urinaria por E. coli productor de BLEE, resistente a ceftriaxona
**Oficial:** D) Ceftazidima. **Objeción:** por definición, las
betalactamasas de espectro extendido (BLEE) hidrolizan las cefalosporinas
de amplio espectro, incluida la ceftazidima, que por tanto NO es una opción
terapéutica válida frente a un microorganismo productor de BLEE. El
tratamiento de elección clásico es un carbapenem, como el ertapenem (A).

## id 347 (2022-166) — Proctitis por Chlamydia trachomatis serovar linfogranuloma venéreo
**Oficial:** C) Ceftriaxona 0,5g IM + azitromicina 1g VO (dosis única).
**Objeción:** la pauta de dosis única (ceftriaxona+azitromicina) es el
tratamiento de la infección gonocócica/clamidial no complicada, pero el
linfogranuloma venéreo, al afectar tejido linfático más profundo, requiere
un tratamiento prolongado con doxiciclina 100mg/12h durante 21 días (A); el
propio enunciado especifica expresamente el serovar LGV, precisamente para
diferenciar este punto.

## id 348 (2022-167) — Meningitis bacteriana tras otitis media en varón de 34 años
**Oficial:** D) Meropenem más ampicilina. **Objeción:** el tratamiento
empírico estándar de la meningitis bacteriana extrahospitalaria del adulto
es ceftriaxona más vancomicina (A), para cubrir neumococo con posible
resistencia; la ampicilina se añade específicamente para cubrir Listeria en
mayores de 50 años, inmunodeprimidos, embarazadas o alcohólicos, ninguno de
los cuales se describe en este paciente de 34 años sano.

## id 355 (2022-174) — Intolerancia al ejercicio, hepatomegalia, debilidad tras COVID leve, hipoglucemia con cetonuria++
**Oficial:** D) Alteración en la beta-oxidación de los ácidos grasos.
**Objeción:** los defectos de la betaoxidación de ácidos grasos cursan
característicamente con hipoglucemia HIPOCETÓSICA (ausencia de cetonas
pese a la hipoglucemia, por la incapacidad de generar cuerpos cetónicos a
partir de grasas); la presencia de cetonuria++ en este paciente es
incompatible con ese diagnóstico y apunta, junto con la hepatomegalia, la
intolerancia al ejercicio desde la infancia y la miocardiopatía, a una
glucogenosis tipo III (A), que sí cursa con hipoglucemia cetósica.

## id 376 (2022-196) — Manejo inicial del shock séptico, afirmación INCORRECTA
**Oficial:** A) Se debe determinar el lactato sérico como marcador de
hipoperfusión tisular. **Objeción:** esta afirmación es correcta y forma
parte de los paquetes de medidas ("bundles") de la Surviving Sepsis
Campaign. La afirmación realmente incorrecta es la D (recomendar la
dopamina como vasopresor de primera elección): las guías actuales
recomiendan la noradrenalina como vasopresor de primera línea, habiendo
quedado la dopamina relegada por su mayor arritmogenicidad y peor perfil de
seguridad (ensayo SOAP II).

## id 426 (2023-37) — Vacuna ARNm frente a SARS-CoV-2, afirmación INCORRECTA
**Oficial:** C) Es una forma de inmunización activa cuyo resultado se
asocia al cambio de isotipo de los anticuerpos. **Objeción:** esta
afirmación es correcta (el cambio de isotipo de anticuerpos es un fenómeno
real de la respuesta humoral activa). La afirmación realmente incorrecta es
la A: la proteína S es un antígeno proteico, típicamente T-DEPENDIENTE (no
timo-independiente), por lo que sí requiere la colaboración de linfocitos T
para generar una respuesta de anticuerpos eficaz y memoria inmunológica.

## id 481 (2023-93) — Niño con fiebre, rigidez de nuca y petequias, cuadro compatible con meningococcemia
**Oficial:** A) Es esperable encontrar diplococos grampositivos en el
líquido cefalorraquídeo. **Objeción:** Neisseria meningitidis es un
diplococo GRAMNEGATIVO, no grampositivo — un error básico de
microbiología. La afirmación correcta y bien establecida es que ante un
caso de enfermedad meningocócica está indicada la quimioprofilaxis de los
contactos íntimos (C).

## id 556 (2023-170) — Leishmaniasis visceral en paciente VIH con inmunodeficiencia grave
**Oficial:** B) Voriconazol y anfotericina B liposomal. **Objeción:** el
voriconazol es un antifúngico, sin ningún papel en el tratamiento de la
leishmaniasis (una parasitosis). El tratamiento de elección en pacientes
VIH con inmunodeficiencia grave es la anfotericina B liposomal,
habitualmente en combinación con miltefosina (C) según las recomendaciones
de la OMS para mejorar la eficacia y reducir las recidivas en el paciente
muy inmunodeprimido.

## id 558 (2023-172) — Fracaso de la PrEP con serología basal negativa y buena adherencia
**Oficial:** C) Se trata de un falso positivo. **Objeción:** el escenario
descrito (serología negativa al inicio de la PrEP, seroconversión tres
meses después pese a buena adherencia) es el ejemplo clásico de haber
iniciado la PrEP durante el periodo ventana de una infección por VIH ya
presente pero aún no detectable (B), un riesgo bien conocido que justifica
las pruebas de cribado repetidas al inicio de la profilaxis; catalogarlo
sin más como falso positivo no es la explicación más probable ni la más
enseñada para este escenario.

## id 567 (2023-181) — Segundo episodio de TB pulmonar, resistencia a isoniacida
**Oficial:** C) Rifampicina, bedaquilina y protionamida durante 12 meses.
**Objeción:** la bedaquilina es un fármaco reservado para la tuberculosis
multirresistente (resistencia a isoniacida Y rifampicina), no para la
monorresistencia a isoniacida descrita en este caso (la rifampicina sigue
siendo útil). El tratamiento recomendado por la OMS para la TB
monorresistente a isoniacida es rifampicina + pirazinamida + etambutol +
levofloxacino durante 6 meses (B).

## id 639 (2024-43) — Enfermedad meningocócica, afirmación INCORRECTA
**Oficial:** A) El mecanismo de transmisión es por gotas. **Objeción:**
esta afirmación es correcta (la transmisión de N. meningitidis es
efectivamente por gotas respiratorias). La afirmación más
discutible/incorrecta es la B: además de la vacuna tetravalente frente a
los serogrupos A, C, W e Y, existe también una vacuna eficaz frente al
serogrupo B (4CMenB), por lo que no es cierto que solo se disponga de
vacunas para "4 subtipos".

## id 762 (2024-169) — Fiebre prolongada, cefalea retroorbitaria, colestasis, ANA positivo débil, sin mialgias ni afectación renal
**Oficial:** C) Leptospirosis grave (enfermedad de Weil). **Objeción:** la
enfermedad de Weil cursa clásicamente con mialgias intensas (sobre todo
gemelares) e insuficiencia renal, ninguna de las cuales está presente en
este paciente (que expresamente niega dolor musculoesquelético y tiene
función renal normal), además de trombocitopenia (aquí hay trombocitosis,
648.000/mm3). La fiebre Q aguda (B) encaja mejor: cefalea retroorbitaria,
hepatitis colestásica y positividad de autoanticuerpos (incluido ANA) son
hallazgos bien descritos en la fiebre Q aguda.

## id 833 (2025-35) — Colecistitis gangrenosa, shock séptico refractario, antibiograma con patrón compatible con BLEE
**Oficial:** B) Mantener piperacilina-tazobactam añadiendo un
aminoglucósido. **Objeción:** el patrón de resistencia descrito
(resistencia a todas las cefalosporinas y aztreonam, con sensibilidad
conservada a piperacilina-tazobactam y carbapenems) es característico de
un microorganismo productor de BLEE. En bacteriemia/sepsis grave por BLEE,
la evidencia actual (ensayo MERINO) y las guías respaldan el cambio a un
carbapenem como meropenem (C) en lugar de mantener piperacilina-tazobactam,
cuya eficacia en infecciones graves por BLEE es inferior pese a la
sensibilidad in vitro, especialmente relevante en esta paciente en shock
séptico refractario.

## id 835 (2025-37) — Manejo inicial del shock séptico, afirmación CORRECTA
**Oficial:** C) El objetivo es mantener una presión arterial sistólica > 90
mmHg. **Objeción:** el objetivo hemodinámico estandarizado en las guías de
shock séptico es una presión arterial MEDIA (PAM) ≥ 65 mmHg, no una presión
sistólica concreta. La afirmación D (posibilidad de iniciar vasopresores
por vía venosa periférica si no se dispone de acceso central y no se logra
el objetivo hemodinámico) refleja la práctica actual más recientemente
respaldada por las guías, que ya no exige demorar el inicio de
vasopresores a la disponibilidad de una vía central.

## id 836 (2025-38) — Diagnóstico de la enfermedad por citomegalovirus, afirmación INCORRECTA
**Oficial:** C) La determinación periódica de la carga viral en sangre se
realiza en los receptores de trasplante de alto riesgo como guía para el
tratamiento anticipado. **Objeción:** esta afirmación es correcta y
describe la estrategia estándar de "tratamiento anticipado" (preemptive
therapy) en trasplante de alto riesgo. La afirmación realmente cuestionable
es la A: la IgM frente a CMV no siempre se negativiza en menos de 30 días —
puede persistir varios meses en un subgrupo de pacientes, una limitación
bien conocida de la serología de CMV para distinguir infección aguda de
reciente.

## id 837 (2025-39) — VIH con sospecha de micobacteriosis respiratoria, PCR negativa del complejo M. tuberculosis
**Oficial:** D) Micobacterium africanum. **Objeción:** Mycobacterium
africanum SÍ forma parte del complejo Mycobacterium tuberculosis (junto con
M. tuberculosis, M. bovis, M. canetti, etc.), por lo que una PCR negativa
para dicho complejo también lo excluiría a él. La especie que NO estaría
cubierta por esa PCR, al tratarse de una micobacteria no tuberculosa ajena
al complejo, es Mycobacterium kansasii (C).

**Verificación 2022/2024 de este lote:** ids de 2022 (218 núm.35, 230
núm.47, 301 núm.118, 342 núm.161, 345 núm.164, 347 núm.166, 348 núm.167, 355
núm.174) y de 2024 (639 núm.43, 762 núm.169) — ninguno coincide con las
preguntas anuladas en la plantilla definitiva (120/126/189 en 2022;
64/68/113/180/206 en 2024), verificados por la misma fuente secundaria
corroborada.
