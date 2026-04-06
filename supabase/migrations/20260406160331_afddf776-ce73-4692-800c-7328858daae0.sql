
-- RLS for Perfiles
CREATE POLICY "Users can view own profile" ON public."Perfiles" FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public."Perfiles" FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public."Perfiles" FOR UPDATE USING (auth.uid() = user_id);

-- RLS for analisis
CREATE POLICY "Users can view own analyses" ON public.analisis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON public.analisis FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS for ofertas_laborales
CREATE POLICY "Companies can manage own postings" ON public.ofertas_laborales FOR ALL USING (auth.uid() = empresa_id);
CREATE POLICY "Anyone can view active postings" ON public.ofertas_laborales FOR SELECT USING (activa = true);

-- RLS for match_candidatos
CREATE POLICY "Candidates can view own matches" ON public.match_candidatos FOR SELECT USING (auth.uid() = candidato_id);

-- RLS for suscripciones
CREATE POLICY "Users can view own subscriptions" ON public.suscripciones FOR SELECT USING (auth.uid() = user_id);
