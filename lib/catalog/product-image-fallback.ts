const CATEGORY_PRODUCT_IMAGE_MAP: Record<string, string> = {
  'cozinha-mesa': '/images/departments/cozinha-mesa.webp',
  'jardim-decoracao': '/images/departments/jardim-decoracao.webp',
  organizacao: '/images/departments/organizacao.webp',
  'utilidades-limpeza': '/images/departments/utilidades-limpeza.webp',
  diversos: '/images/departments/diversos.webp',
}

export function getCategoryProductFallbackImage(
  categorySlug?: string | null,
): string {
  if (!categorySlug) return CATEGORY_PRODUCT_IMAGE_MAP.diversos

  return (
    CATEGORY_PRODUCT_IMAGE_MAP[categorySlug.toLowerCase()] ??
    CATEGORY_PRODUCT_IMAGE_MAP.diversos
  )
}

export function withCategoryProductFallback(
  images: string[],
  categorySlug?: string | null,
): string[] {
  if (images.length > 0) return images

  return [getCategoryProductFallbackImage(categorySlug)]
}
