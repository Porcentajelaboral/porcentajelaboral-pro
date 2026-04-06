-- Fix user_id default from gen_random_uuid() to auth.uid()
ALTER TABLE suscripciones
  ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Explicit deny policies for authenticated users
CREATE POLICY "No direct inserts" ON suscripciones
  FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "No direct updates" ON suscripciones
  FOR UPDATE TO authenticated USING (false);

CREATE POLICY "No direct deletes" ON suscripciones
  FOR DELETE TO authenticated USING (false);