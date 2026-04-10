
-- 1. Block direct inserts on match_candidatos (only service_role via edge functions)
CREATE POLICY "No direct inserts on matches"
ON match_candidatos
FOR INSERT TO authenticated
WITH CHECK (false);

-- 2. Create user_roles table for proper role management
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can view roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- No direct modifications from client
CREATE POLICY "No direct inserts on roles"
ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (false);

CREATE POLICY "No direct updates on roles"
ON public.user_roles
FOR UPDATE TO authenticated
USING (false);

CREATE POLICY "No direct deletes on roles"
ON public.user_roles
FOR DELETE TO authenticated
USING (false);

-- 3. Create has_role helper (SECURITY DEFINER to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Replace is_admin() to use user_roles instead of hardcoded email
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- 5. Seed current admin user into user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'contacto@porcentajelaboral.com'
ON CONFLICT DO NOTHING;

-- 6. Fix ofertas_laborales: restrict company management to authenticated
ALTER POLICY "Companies can manage own postings" ON ofertas_laborales TO authenticated;
