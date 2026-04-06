
-- Security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
      AND email = 'contacto@porcentajelaboral.com'
  )
$$;

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles"
ON public."Perfiles"
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Admin can update any profile
CREATE POLICY "Admin can update any profile"
ON public."Perfiles"
FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Admin can view all analyses
CREATE POLICY "Admin can view all analyses"
ON public.analisis
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Admin can view all subscriptions
CREATE POLICY "Admin can view all subscriptions"
ON public.suscripciones
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Admin can insert subscriptions (for manual management)
CREATE POLICY "Admin can insert subscriptions"
ON public.suscripciones
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Admin can update subscriptions
CREATE POLICY "Admin can update subscriptions"
ON public.suscripciones
FOR UPDATE
TO authenticated
USING (public.is_admin());
