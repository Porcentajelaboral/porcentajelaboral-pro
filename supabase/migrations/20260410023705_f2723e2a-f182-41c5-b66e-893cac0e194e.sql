INSERT INTO public.user_roles (user_id, role)
VALUES ('20ddc06d-99eb-4597-b9db-3290f2730195', 'admin')
ON CONFLICT DO NOTHING;