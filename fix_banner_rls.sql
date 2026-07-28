-- ============================================================
-- FIX: Banners visíveis para visitantes anônimos (sem login)
-- Execute no SQL Editor do Supabase Dashboard:
-- https://supabase.com/dashboard/project/szntzeclwouyidfossrk/sql/new
-- ============================================================

-- Remove a policy atual que bloqueia anônimos
DROP POLICY IF EXISTS "Leitura de Banners" ON public.banners;

-- Cria policy que permite leitura pública de banners ativos
-- (sem exigir autenticação - resolve o erro permission denied for function is_current_user_admin)
CREATE POLICY "Banners ativos são públicos"
ON public.banners FOR SELECT
TO anon, authenticated
USING (is_active = true);
