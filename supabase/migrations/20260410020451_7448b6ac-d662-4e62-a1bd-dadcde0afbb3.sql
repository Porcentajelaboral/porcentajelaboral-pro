
-- 1. Fix Perfiles policies: change from public to authenticated
ALTER POLICY "Users can insert own profile" ON "Perfiles" TO authenticated;
ALTER POLICY "Users can update own profile" ON "Perfiles" TO authenticated;
ALTER POLICY "Users can view own profile" ON "Perfiles" TO authenticated;

-- 2. Fix analisis policies: change from public to authenticated
ALTER POLICY "Users can insert own analyses" ON analisis TO authenticated;
ALTER POLICY "Users can view own analyses" ON analisis TO authenticated;

-- 3. Fix match_candidatos: add company SELECT policy and explicit deny for UPDATE/DELETE
CREATE POLICY "Companies can view matches for their offers"
ON match_candidatos
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM ofertas_laborales
    WHERE ofertas_laborales.id = match_candidatos.oferta_id
      AND ofertas_laborales.empresa_id = auth.uid()
  )
);

-- Change existing candidate SELECT policy to authenticated
ALTER POLICY "Candidates can view own matches" ON match_candidatos TO authenticated;

-- Explicit deny for UPDATE and DELETE
CREATE POLICY "No direct updates on matches"
ON match_candidatos
FOR UPDATE TO authenticated
USING (false);

CREATE POLICY "No direct deletes on matches"
ON match_candidatos
FOR DELETE TO authenticated
USING (false);

-- 4. Fix suscripciones user_id default
ALTER TABLE suscripciones
  ALTER COLUMN user_id SET DEFAULT auth.uid();
