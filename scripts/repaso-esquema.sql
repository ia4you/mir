-- Repaso espaciado de fallos (fase 1). Idempotente. NO se ejecuta sin OK.
-- Cada pregunta fallada vuelve a los 1, 3, 7, 14 y 30 días; acertarla
-- cuando toca la sube de nivel, fallarla la devuelve al nivel 0; tras
-- acertar en el de 30 días queda dominada (nivel y proxima a NULL).
BEGIN;

CREATE TABLE IF NOT EXISTS public.repaso_espaciado (
    user_id       integer  NOT NULL REFERENCES public.usuarios(id)  ON DELETE CASCADE,
    pregunta_id   integer  NOT NULL REFERENCES public.preguntas(id) ON DELETE CASCADE,
    -- 0..4 = intervalo que toca (1, 3, 7, 14, 30 días); NULL si está dominada
    nivel         smallint CHECK (nivel BETWEEN 0 AND 4),
    -- día (hora de Canarias) en que vuelve a tocar; NULL si está dominada
    proxima       date,
    dominada_en   timestamp without time zone,
    veces_fallada integer NOT NULL DEFAULT 1,
    ultimo_repaso timestamp without time zone,
    creado_en     timestamp without time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, pregunta_id),
    CHECK ((nivel IS NULL) = (proxima IS NULL)),
    CHECK ((dominada_en IS NULL) = (nivel IS NOT NULL))
);

-- "¿Qué me toca hoy?": pendientes de un usuario por fecha.
CREATE INDEX IF NOT EXISTS repaso_espaciado_pendientes
    ON public.repaso_espaciado (user_id, proxima)
    WHERE proxima IS NOT NULL;

ALTER TABLE public.repaso_espaciado OWNER TO mir;

COMMIT;
