-- Simulacro: preguntas marcadas como dudosas. Idempotente. NO se ejecuta sin OK.
-- Se marca durante el simulacro y se guarda al entregar; /resultados muestra
-- cuántas de las dudosas se acertaron, fallaron o quedaron en blanco. Todo lo
-- anterior queda como no dudosa (DEFAULT false). En PostgreSQL 11+ añadir una
-- columna con DEFAULT constante no reescribe la tabla: es instantáneo.
BEGIN;

ALTER TABLE public.respuestas_sesion
    ADD COLUMN IF NOT EXISTS dudosa boolean NOT NULL DEFAULT false;

COMMIT;
