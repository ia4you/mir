-- Esquema de la biblioteca de vídeos (fase 1). Idempotente: se puede
-- ejecutar varias veces sin efecto. Los datos se cargan aparte con
-- scripts/cargar-videos.mjs.
--
-- La relación con las preguntas va por texto (sin columna nueva en
-- preguntas): preguntas.especialidad = video_temas.especialidad AND
-- NULLIF(preguntas.tema, '') = video_temas.tema.

BEGIN;

CREATE TABLE IF NOT EXISTS public.video_canales (
    id                  serial PRIMARY KEY,
    youtube_channel_id  text NOT NULL UNIQUE,
    nombre              text NOT NULL,
    handle              text,
    url                 text NOT NULL,
    -- NULL = sin restricción. Medicina con Cabeza: {'Cardiología'} + tema extra.
    solo_especialidades text[],
    temas_extra         text[],
    activo              boolean NOT NULL DEFAULT true,
    creado_en           timestamp without time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.videos (
    id                  serial PRIMARY KEY,
    youtube_id          text NOT NULL UNIQUE CHECK (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
    canal_id            integer NOT NULL REFERENCES public.video_canales(id),
    titulo              text NOT NULL,
    profesor            text,
    fecha_publicacion   date NOT NULL,
    duracion_seg        integer NOT NULL CHECK (duracion_seg > 0),
    insertable          boolean NOT NULL DEFAULT true,
    estado              text NOT NULL DEFAULT 'activo'
                        CHECK (estado IN ('activo', 'oculto')),
    -- 'retirada a petición del autor', 'comprobación: borrado'…
    motivo_oculto       text,
    disponibilidad      text NOT NULL DEFAULT 'disponible'
                        CHECK (disponibilidad IN ('disponible', 'borrado', 'privado', 'no_insertable')),
    ultima_comprobacion timestamp without time zone,
    anadido_por         text,
    creado_en           timestamp without time zone NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.video_temas (
    id                  serial PRIMARY KEY,
    video_id            integer NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    especialidad        text NOT NULL,
    -- Se guarda NULL, nunca ''.
    tema                text CHECK (tema <> ''),
    inicio_seg          integer CHECK (inicio_seg >= 0),
    principal           boolean NOT NULL DEFAULT true,
    -- La columna `nota` del CSV (informativa).
    nota                text
);
-- Un mismo vídeo no se asigna dos veces al mismo par.
CREATE UNIQUE INDEX IF NOT EXISTS video_temas_video_par
    ON public.video_temas (video_id, especialidad, COALESCE(tema, ''));
-- Como máximo un vídeo principal por especialidad + tema.
CREATE UNIQUE INDEX IF NOT EXISTS video_temas_principal_unico
    ON public.video_temas (especialidad, COALESCE(tema, '')) WHERE principal;

-- Solo Premium (fase 5). Se crea ya para que el esquema esté completo.
CREATE TABLE IF NOT EXISTS public.video_vistos (
    user_id             integer NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    video_id            integer NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    visto_en            timestamp without time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, video_id)
);

ALTER TABLE public.video_canales OWNER TO mir;
ALTER TABLE public.videos        OWNER TO mir;
ALTER TABLE public.video_temas   OWNER TO mir;
ALTER TABLE public.video_vistos  OWNER TO mir;

COMMIT;
