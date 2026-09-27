# Correcciones directas a mir-db

Registro en git de correcciones de datos aplicadas directamente sobre la base de
datos de producción (`mir-db`), fuera del ciclo normal de migraciones de código,
para que quede un rastro público y reversible en el historial del repositorio.

Cada corrección se documenta con tres archivos:

- `log_<nombre>.csv` — antes/después de cada fila y campo tocados.
- `aplicar_<nombre>.sql` — la transacción que se ejecutó (con guarda
  `GET DIAGNOSTICS` de 1 fila por `UPDATE`, para abortar si algo no coincide
  con lo esperado).
- `rollback_<nombre>.sql` — deshace la corrección, restaurando el valor
  exacto de `valor_antes` guardado en el log.

## 2026-09-27 — palabras partidas

Corrección de un artefacto de la extracción de PDF: un espacio insertado a
mitad de una palabra (p. ej. "g astrostomía" → "gastrostomía"), en los campos
`pregunta`, `opcion_a`-`opcion_e` y `explicacion`. Detectado con un escaneo de
pares de palabras adyacentes contra el vocabulario de estudio-db (Libro Gordo
AMIR) como diccionario de referencia.

- `*_palabras_partidas_20260927.*` — 125 casos: 95 ya conocidos de un audit
  anterior (2026-09-26) reconfirmados contra el texto real, más 29 nuevos
  encontrados al reescanear las 1058 preguntas actuales del banco (la mayoría
  en `explicacion`, campo que el pase anterior no había cubierto).
- `*_palabras_partidas_4casos_20260927.*` — 4 casos que no eran solo un
  espacio de más (una errata de letra adicional, o una decisión sobre cómo
  unir un término compuesto), aplicados tras revisión y aprobación explícita
  del contexto por el usuario.

Backup completo de `mir-db` previo a ambos lotes:
`/root/backup_mir_antes_de_palabras_partidas_20260927.sql` (fuera del
repositorio, en el servidor).
