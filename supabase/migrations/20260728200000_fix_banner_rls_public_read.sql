-- Fix: Banner SELECT deve ser público para banners ativos (sem checar autenticação)
-- O erro "permission denied for function is_current_user_admin" ocorre porque 
-- a função é SECURITY DEFINER mas requer uma sessão autenticada.

-- Remove policy antiga que misturava leitura pública com admin check
DROP POLICY IF EXISTS "Leitura de Banners" ON public.banners;

-- Nova policy: banners ativos são visíveis para TODOS (inclusive anônimos)
-- banners inativos só são visíveis para admin
CREATE POLICY "Leitura pública de Banners ativos"
ON public.banners FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin lê todos os Banners"
ON public.banners FOR SELECT
USING (public.is_current_user_admin());
