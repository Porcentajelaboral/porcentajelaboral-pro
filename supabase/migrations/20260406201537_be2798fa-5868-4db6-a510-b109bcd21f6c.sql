-- Confirm admin email
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'contacto@porcentajelaboral.com';

-- Insert admin profile (id must match auth user id due to FK)
INSERT INTO public."Perfiles" (id, user_id, plan_tipo, es_empresa, acepta_terminos, acepta_privacidad, analisis_usados, mes_control)
SELECT id, id, 'gratis', false, true, true, 0, EXTRACT(MONTH FROM now())::integer
FROM auth.users WHERE email = 'contacto@porcentajelaboral.com'
ON CONFLICT DO NOTHING;

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public."Perfiles" (id, user_id, plan_tipo, analisis_usados, mes_control, acepta_terminos, acepta_privacidad)
  VALUES (NEW.id, NEW.id, 'gratis', 0, EXTRACT(MONTH FROM now())::integer, false, false);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();