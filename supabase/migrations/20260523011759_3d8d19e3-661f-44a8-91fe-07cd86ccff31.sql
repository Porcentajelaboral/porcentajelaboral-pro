
ALTER TABLE public.ofertas_laborales ALTER COLUMN titulo TYPE text USING titulo::text;
ALTER TABLE public.match_candidatos ALTER COLUMN oferta_id DROP DEFAULT;
ALTER TABLE public.match_candidatos ALTER COLUMN candidato_id DROP DEFAULT;
ALTER TABLE public."Perfiles" ALTER COLUMN empresa_nombre DROP DEFAULT;
UPDATE public."Perfiles" SET empresa_nombre = NULL WHERE empresa_nombre = 'NULL';
ALTER TABLE public."Perfiles" ALTER COLUMN empresa_rut DROP DEFAULT;
UPDATE public."Perfiles" SET empresa_rut = NULL WHERE empresa_rut = 'NULL';
