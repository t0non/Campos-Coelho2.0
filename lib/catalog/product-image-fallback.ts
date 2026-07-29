const CATEGORY_PRODUCT_IMAGE_MAP: Record<string, string> = {
  'cozinha-mesa': '/images/departments/cozinha-mesa.png',
  'jardim-decoracao': '/images/departments/jardim-decoracao.png',
  organizacao: '/images/departments/organizacao.png',
  'utilidades-limpeza': '/images/departments/utilidades-limpeza.png',
  diversos: '/images/departments/diversos.png',
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
