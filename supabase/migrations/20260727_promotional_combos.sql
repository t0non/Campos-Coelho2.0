-- ==============================================================================
-- Migration: Promotional Combos & Admin Access Control
-- Database: Supabase PostgreSQL (Timezone: America/Sao_Paulo)
-- ==============================================================================

-- 1. Table: admin_users (Stores authorized administrators)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view the admin_users list
CREATE POLICY "Admins can view admin_users"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- 2. Table: promotional_combos
CREATE TABLE IF NOT EXISTS public.promotional_combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT,
  original_price NUMERIC(10,2) CHECK (original_price >= 0),
  promotional_price NUMERIC(10,2) NOT NULL CHECK (promotional_price >= 0),
  image_url TEXT,
  image_path TEXT,
  badge TEXT,
  cta_label TEXT NOT NULL DEFAULT 'Solicitar agendamento',
  cta_url TEXT NOT NULL DEFAULT '/contato',
  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indices for fast querying
CREATE INDEX IF NOT EXISTS idx_promotional_combos_active_dates 
  ON public.promotional_combos (is_active, starts_at, ends_at, sort_order);

CREATE INDEX IF NOT EXISTS idx_promotional_combos_slug 
  ON public.promotional_combos (slug);

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_promotional_combos_updated_at ON public.promotional_combos;
CREATE TRIGGER set_promotional_combos_updated_at
  BEFORE UPDATE ON public.promotional_combos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS on promotional_combos
ALTER TABLE public.promotional_combos ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public SELECT (Visitors can only see ACTIVE, NON-EXPIRED combos whose start date has arrived)
CREATE POLICY "Public can view active valid promotional combos"
  ON public.promotional_combos
  FOR SELECT
  TO public
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= timezone('utc'::text, now()))
    AND (ends_at IS NULL OR ends_at >= timezone('utc'::text, now()))
  );

-- Policy 2: Admin SELECT (Authenticated admins can view ALL combos: active, inactive, expired, draft)
CREATE POLICY "Admins can view all promotional combos"
  ON public.promotional_combos
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- Policy 3: Admin INSERT
CREATE POLICY "Admins can insert promotional combos"
  ON public.promotional_combos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- Policy 4: Admin UPDATE
CREATE POLICY "Admins can update promotional combos"
  ON public.promotional_combos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM public.admin_users));

-- Policy 5: Admin DELETE
CREATE POLICY "Admins can delete promotional combos"
  ON public.promotional_combos
  FOR DELETE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM public.admin_users));

-- 3. Storage Bucket: promotional-combos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'promotional-combos',
  'promotional-combos',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage RLS Policies
CREATE POLICY "Public Read Access for promotional-combos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'promotional-combos');

CREATE POLICY "Admin Insert for promotional-combos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'promotional-combos'
    AND auth.uid() IN (SELECT id FROM public.admin_users)
  );

CREATE POLICY "Admin Update for promotional-combos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'promotional-combos'
    AND auth.uid() IN (SELECT id FROM public.admin_users)
  );

CREATE POLICY "Admin Delete for promotional-combos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'promotional-combos'
    AND auth.uid() IN (SELECT id FROM public.admin_users)
  );
