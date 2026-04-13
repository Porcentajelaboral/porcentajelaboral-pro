
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public."Perfiles" (
    id, user_id, plan_tipo, analisis_usados, mes_control,
    nombre, email,
    es_empresa, empresa_nombre,
    acepta_terminos, acepta_privacidad, cv_en_pool, autoriza_contacto
  )
  VALUES (
    NEW.id,
    NEW.id,
    'gratis',
    0,
    EXTRACT(MONTH FROM now())::integer,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE((NEW.raw_user_meta_data->>'es_empresa')::boolean, false),
    NEW.raw_user_meta_data->>'empresa_nombre',
    COALESCE((NEW.raw_user_meta_data->>'acepta_terminos')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'acepta_privacidad')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'cv_en_pool')::boolean, false),
    COALESCE((NEW.raw_user_meta_data->>'autoriza_contacto')::boolean, false)
  );
  RETURN NEW;
END;
$$;
