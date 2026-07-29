const LOWERCASE_WORDS = new Set([
  'a',
  'as',
  'com',
  'da',
  'das',
  'de',
  'do',
  'dos',
  'e',
  'em',
  'na',
  'nas',
  'no',
  'nos',
  'o',
  'os',
  'para',
  'por',
  'sem',
  'x',
])

const PRESERVED_ACRONYMS = new Set([
  'ABS',
  'B2B',
  'BPA',
  'DFM',
  'EVA',
  'LED',
  'LM',
  'MDF',
  'PET',
  'PP',
  'PVC',
  'RGB',
  'SN',
  'USB',
])

const WORD_REPLACEMENTS = new Map<string, string>([
  ['ACO', 'Aço'],
  ['ACUCAREIRO', 'Açucareiro'],
  ['AGUA', 'Água'],
  ['ALCA', 'Alça'],
  ['ALGODAO', 'Algodão'],
  ['AMBAR', 'Âmbar'],
  ['APLICACAO', 'Aplicação'],
  ['BEBE', 'Bebê'],
  ['CAFE', 'Café'],
  ['CERAMICO', 'Cerâmico'],
  ['CONICO', 'Cônico'],
  ['CONJ', 'Conjunto'],
  ['DIVISORIA', 'Divisória'],
  ['ESCRITORIO', 'Escritório'],
  ['ESPATULA', 'Espátula'],
  ['FACIL', 'Fácil'],
  ['FOGAO', 'Fogão'],
  ['GALAO', 'Galão'],
  ['HERMETICA', 'Hermética'],
  ['INDIV', 'Individual'],
  ['INDUSTRIA', 'Indústria'],
  ['LAMINA', 'Lâmina'],
  ['LAVATORIO', 'Lavatório'],
  ['LOUCA', 'Louça'],
  ['MAO', 'Mão'],
  ['MEDIO', 'Médio'],
  ['MEDIA', 'Média'],
  ['N', 'Nº'],
  ['ORGANIZ', 'Organizador'],
  ['PAO', 'Pão'],
  ['PEQ', 'Peq.'],
  ['PILAO', 'Pilão'],
  ['PLASTICA', 'Plástica'],
  ['PLASTICO', 'Plástico'],
  ['PO', 'Pó'],
  ['POLIESTER', 'Poliéster'],
  ['QUADR', 'Quadr.'],
  ['RET', 'Retangular'],
  ['RETANG', 'Retangular'],
  ['RODIZIO', 'Rodízio'],
  ['SAB', 'Sabão'],
  ['SABAO', 'Sabão'],
  ['SAO', 'São'],
  ['TABUA', 'Tábua'],
  ['TRANSLUCIDO', 'Translúcido'],
  ['TRANSP', 'Transparente'],
  ['VALVULA', 'Válvula'],
])

const UNIT_LABELS: Record<string, string> = {
  G: 'g',
  KG: 'kg',
  L: 'L',
  LT: 'L',
  M: 'm',
  ML: 'ml',
  MM: 'mm',
  CM: 'cm',
}

function formatMeasurementNumber(value: string) {
  return value.replace('.', ',')
}

function formatUnit(value: string) {
  return UNIT_LABELS[value.toUpperCase()] ?? value
}

function formatDimensions(value: string) {
  return value.replace(
    /(\d+(?:[,.]\d+)?)(MM|CM|M)?X(\d+(?:[,.]\d+)?)(MM|CM|M)?(?:X(\d+(?:[,.]\d+)?)(MM|CM|M)?)?/gi,
    (_, first, firstUnit, second, secondUnit, third, thirdUnit) => {
      const parts = [
        `${formatMeasurementNumber(first)}${firstUnit ? ` ${formatUnit(firstUnit)}` : ''}`,
        `${formatMeasurementNumber(second)}${secondUnit ? ` ${formatUnit(secondUnit)}` : ''}`,
      ]

      if (third) {
        parts.push(
          `${formatMeasurementNumber(third)}${thirdUnit ? ` ${formatUnit(thirdUnit)}` : ''}`,
        )
      }

      return parts.join(' x ')
    },
  )
}

function formatStandaloneUnits(value: string) {
  return value
    .replace(
      /(\d+(?:[,.]\d+)?)(MM|CM|ML|LT|KG|M|L|G)(?=\b|[),])/gi,
      (_, amount, unit) => `${formatMeasurementNumber(amount)} ${formatUnit(unit)}`,
    )
    .replace(
      /(\d+(?:[,.]\d+)?)\s+(MM|CM|ML|LT|KG|M|L|G)(?=\b|[),])/gi,
      (_, amount, unit) => `${formatMeasurementNumber(amount)} ${formatUnit(unit)}`,
    )
    .replace(
      /(\d+)(?:UN|UND)(?=\b|[),])/gi,
      (_, amount) => `${Number(amount)} un.`,
    )
    .replace(
      /(\d+)\s+(?:UN|UND)(?=\b|[),])/gi,
      (_, amount) => `${Number(amount)} un.`,
    )
    .replace(
      /(\d+)(?:PC|PÇ)(?=\b|[),])/gi,
      (_, amount) => `${Number(amount)} peças`,
    )
    .replace(
      /(\d+)\s+(?:PC|PÇ)(?=\b|[),])/gi,
      (_, amount) => `${Number(amount)} peças`,
    )
}

function capitalizeWord(value: string) {
  if (!value) return value
  return `${value.charAt(0).toLocaleUpperCase('pt-BR')}${value
    .slice(1)
    .toLocaleLowerCase('pt-BR')}`
}

function titleCasePart(value: string, index: number): string {
  const leading = value.match(/^[([{]+/)?.[0] ?? ''
  const trailing = value.match(/[)\]},.;:]+$/)?.[0] ?? ''
  const core = value.slice(leading.length, value.length - trailing.length)

  if (!core) return value

  if (core.includes('/')) {
    return `${leading}${core
      .split('/')
      .map((part, partIndex) => titleCasePart(part, index + partIndex))
      .join('/')}${trailing}`
  }

  const upper = core.toLocaleUpperCase('pt-BR')
  const lower = core.toLocaleLowerCase('pt-BR')

  if (core === lower && ['cm', 'g', 'kg', 'm', 'ml', 'mm'].includes(core)) {
    return `${leading}${core}${trailing}`
  }

  if (PRESERVED_ACRONYMS.has(upper)) {
    return `${leading}${upper}${trailing}`
  }

  if (WORD_REPLACEMENTS.has(upper)) {
    const replacement = WORD_REPLACEMENTS.get(upper)!
    const suffix = trailing && replacement.endsWith(trailing) ? '' : trailing
    return `${leading}${replacement}${suffix}`
  }

  if (/\d/.test(core)) {
    return `${leading}${core}${trailing}`
  }

  if (index > 0 && LOWERCASE_WORDS.has(lower)) {
    return `${leading}${lower}${trailing}`
  }

  return `${leading}${capitalizeWord(core)}${trailing}`
}

export function standardizeCatalogProductName(rawName: string): string {
  const normalized = rawName
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\bVIDRO\/PLAST\.?\b/gi, 'VIDRO E PLÁSTICO')
    .replace(/(^|[\s(])C\/(?=\s|[A-ZÀ-Ú0-9])/gi, '$1COM ')
    .replace(/(^|[\s(])P\/(?=\s|[A-ZÀ-Ú0-9])/gi, '$1PARA ')
    .replace(/(^|[\s(])S\/(?=\s|[A-ZÀ-Ú0-9])/gi, '$1SEM ')
    .replace(/\s*-\s*/g, ' - ')
    .replace(/\bPOS\s+INDUSTRIA\b/gi, 'PÓS-INDÚSTRIA')

  return formatStandaloneUnits(formatDimensions(normalized))
    .split(/\s+/)
    .map((part, index) => titleCasePart(part, index))
    .join(' ')
    .replace(/\s+([),.;:])/g, '$1')
    .replace(/([(])\s+/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
