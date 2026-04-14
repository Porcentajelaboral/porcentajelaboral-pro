
CREATE TABLE public.preguntas_seguridad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  pregunta_1 TEXT NOT NULL,
  respuesta_1 TEXT NOT NULL,
  pregunta_2 TEXT NOT NULL,
  respuesta_2 TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.preguntas_seguridad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own security questions"
  ON public.preguntas_seguridad FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own security questions"
  ON public.preguntas_seguridad FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own security questions"
  ON public.preguntas_seguridad FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can read all security questions"
  ON public.preguntas_seguridad FOR SELECT
  TO service_role
  USING (true);
