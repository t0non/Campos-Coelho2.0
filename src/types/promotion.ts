export type ComboStatus =
  | "Rascunho"
  | "Programado"
  | "Ativo"
  | "Encerrado"
  | "Inativo";

export interface PromotionalCombo {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  full_description?: string | null;
  original_price?: number | null;
  promotional_price: number;
  image_url?: string | null;
  image_path?: string | null;
  badge?: string | null;
  cta_label: string;
  cta_url: string;
  benefits: string[];
  starts_at?: string | null; // ISO TIMESTAMPTZ
  ends_at?: string | null;   // ISO TIMESTAMPTZ
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface PromotionalComboFormData {
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  original_price: string;
  promotional_price: string;
  image_url: string;
  image_path: string;
  badge: string;
  cta_label: string;
  cta_url: string;
  benefits: string[];
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
}

export interface ComboSummaryStats {
  total: number;
  active: number;
  scheduled: number;
  ended: number;
}
