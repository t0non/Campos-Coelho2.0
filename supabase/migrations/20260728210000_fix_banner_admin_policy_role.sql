-- A policy administrativa deve ser avaliada somente pelo papel authenticated.
-- Sem a cláusula TO authenticated, o Postgres também tenta executar
-- is_current_user_admin() para visitantes anon, que não possuem EXECUTE.

DROP POLICY IF EXISTS "Admin lê todos os Banners" ON public.banners;

CREATE POLICY "Admin lê todos os Banners"
ON public.banners
FOR SELECT
TO authenticated
USING (public.is_current_user_admin());
