-- Simulacro: marca de "pregunta vista". Idempotente. NO se ejecuta sin OK.
-- Las preguntas de un simulacro que nunca se llegaron a abrir se guardan en
-- blanco (cuentan en la nota) con vista = false, y no van al repaso
-- espaciado ni a /errores. Todo lo anterior queda como vista (DEFAULT true).
-- En PostgreSQL 11+ añadir una columna con DEFAULT constante no reescribe la
-- tabla: es instantáneo.
BEGIN;

ALTER TABLE public.respuestas_sesion
    ADD COLUMN IF NOT EXISTS vista boolean NOT NULL DEFAULT true;

COMMIT;
