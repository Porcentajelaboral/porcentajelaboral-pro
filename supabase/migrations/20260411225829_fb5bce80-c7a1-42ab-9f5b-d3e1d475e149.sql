
-- Add name and email columns to Perfiles
ALTER TABLE public."Perfiles" ADD COLUMN nombre text;
ALTER TABLE public."Perfiles" ADD COLUMN email text;

-- Update trigger to capture name and email from auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public."Perfiles" (id, user_id, plan_tipo, analisis_usados, mes_control, acepta_terminos, acepta_privacidad, nombre, email)
  VALUES (
    NEW.id,
    NEW.id,
    'gratis',
    0,
    EXTRACT(MONTH FROM now())::integer,
    false,
    false,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$;
