const PLACEHOLDER_VALUES = new Set([
  '-',
  '--',
  'n/a',
  'na',
  'não informado',
  'nao informado',
  'não informada',
  'nao informada',
  'padrão',
  'padrao',
  'genérico',
  'generico',
  'null',
  'undefined',
])

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

export function isMeaningfulProductValue(value: unknown): value is string | number {
  if (typeof value === 'number') return Number.isFinite(value) && value > 0
  if (typeof value !== 'string') return false

  const trimmed = value.trim()
  if (!trimmed) return false
  return !PLACEHOLDER_VALUES.has(normalizeText(trimmed))
}

export function findProductAttribute(
  attributes: Record<string, string>,
  aliases: string[],
): string | undefined {
  const normalizedAliases = new Set(aliases.map(normalizeText))

  for (const [key, value] of Object.entries(attributes)) {
    if (normalizedAliases.has(normalizeText(key)) && isMeaningfulProductValue(value)) {
      return value.trim()
    }
  }

  return undefined
}

export function isProductAttributeAlias(key: string, aliases: string[]): boolean {
  const normalizedKey = normalizeText(key)
  return aliases.some((alias) => normalizeText(alias) === normalizedKey)
}
