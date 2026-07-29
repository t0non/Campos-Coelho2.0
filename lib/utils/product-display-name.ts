function cleanName(value: string | null | undefined) {
  return value?.replace(/\s+/g, ' ').trim() ?? ''
}

function comparableName(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR')
}

/**
 * Evita repetir o nome quando produto e variação chegam com o mesmo rótulo.
 */
export function getProductDisplayName(
  productName: string | null | undefined,
  variantName?: string | null,
) {
  const product = cleanName(productName)
  const variant = cleanName(variantName)

  if (!product) return variant
  if (!variant || comparableName(product) === comparableName(variant)) return product

  return `${product} — ${variant}`
}
