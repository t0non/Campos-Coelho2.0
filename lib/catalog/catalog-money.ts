export function parseCatalogMoney(value: string): number {
  const normalized = value
    .replace(/[R$\s\u00a0]/gi, '')
    .replace(/[^\d,.-]/g, '')

  if (!normalized) return Number.NaN

  if (normalized.includes(',')) {
    return Number.parseFloat(
      normalized
        .replace(/\./g, '')
        .replace(',', '.'),
    )
  }

  const dotMatches = normalized.match(/\./g) ?? []
  if (dotMatches.length === 1) {
    const [integerPart, decimalPart = ''] = normalized.split('.')
    if (decimalPart.length > 0 && decimalPart.length <= 2) {
      return Number.parseFloat(`${integerPart}.${decimalPart}`)
    }
  }

  if (dotMatches.length > 1) {
    const parts = normalized.split('.')
    const decimalPart = parts.at(-1) ?? ''
    if (decimalPart.length > 0 && decimalPart.length <= 2) {
      return Number.parseFloat(`${parts.slice(0, -1).join('')}.${decimalPart}`)
    }
  }

  return Number.parseFloat(normalized.replace(/\./g, ''))
}
