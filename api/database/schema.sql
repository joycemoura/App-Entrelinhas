CREATE TABLE IF NOT EXISTS public.usuarios (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome VARCHAR(80) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(20),
  senha_hash TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS telefone VARCHAR(20);

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_email_unico
  ON public.usuarios (LOWER(email));


CREATE TABLE IF NOT EXISTS public.registros_humor (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id INTEGER NOT NULL
    REFERENCES public.usuarios(id) ON DELETE CASCADE,
  humor SMALLINT NOT NULL CHECK (humor BETWEEN 1 AND 5),
  contextos TEXT[] NOT NULL DEFAULT '{}',
  anotacao TEXT,
  registrado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS registros_humor_usuario_data_idx
  ON public.registros_humor (usuario_id, registrado_em DESC, id DESC);

ALTER TABLE public.registros_humor
  ADD COLUMN IF NOT EXISTS titulo TEXT;