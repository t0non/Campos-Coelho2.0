export const PRODUCT_CATEGORY_SLUGS = [
  'cozinha-mesa',
  'jardim-decoracao',
  'organizacao',
  'utilidades-limpeza',
  'diversos',
] as const

export type ProductCategorySlug = (typeof PRODUCT_CATEGORY_SLUGS)[number]

type CategoryRule = {
  slug: Exclude<ProductCategorySlug, 'diversos'>
  terms: readonly string[]
}

const CATEGORY_RULES: readonly CategoryRule[] = [
  {
    slug: 'utilidades-limpeza',
    terms: [
      'vaso sanitario',
      'escova sanitaria',
      'escova para limpeza',
      'escova p limpeza',
      'cesto de lixo',
      'saco de lixo',
      'saco lixo',
      'cortina de pia',
      'cortina de vitro',
      'lixeira',
      'vassoura',
      'rodo',
      'mop',
      'balde',
      'bacia',
      'esponja',
      'bucha',
      'flanela',
      'pano de limpeza',
      'pa de lixo',
      'desentupidor',
      'varal',
      'pregador',
      'ralo',
      'limpeza',
      'lavanderia',
      'sanitario',
    ],
  },
  {
    slug: 'jardim-decoracao',
    terms: [
      'vaso',
      'cachepot',
      'floreira',
      'jardineira',
      'regador',
      'mangueira de jardim',
      'jardim',
      'planta artificial',
      'flor artificial',
      'porta retrato',
      'porta-retrato',
      'moldura',
      'quadro',
      'castical',
      'enfeite',
      'decoracao',
      'decorativo',
    ],
  },
  {
    slug: 'organizacao',
    terms: [
      'porta sabonete',
      'porta sab',
      'porta caneta',
      'caixa organizadora',
      'caixa agricola',
      'organizador',
      'organizadora',
      'gaveteiro',
      'sapateira',
      'cabideiro',
      'cabide',
      'prateleira',
      'estante',
      'cesto',
      'cesta',
      'colmeia',
      'porta objetos',
      'porta objeto',
      'porta treco',
    ],
  },
  {
    slug: 'cozinha-mesa',
    terms: [
      'tela de fritura',
      'porta papinha',
      'porta tempero',
      'porta condimento',
      'porta mantimento',
      'escorredor de louca',
      'escorredor louca',
      'panela',
      'frigideira',
      'assadeira',
      'chaleira',
      'cafeteira',
      'leiteira',
      'jarra',
      'garrafa',
      'marmita',
      'pote',
      'bisnaga',
      'colher',
      'garfo',
      'talher',
      'espatula',
      'concha',
      'escumadeira',
      'pegador',
      'faca',
      'copo',
      'taca',
      'xicara',
      'caneca',
      'prato',
      'travessa',
      'tigela',
      'saladeira',
      'bandeja',
      'tabua',
      'coador',
      'peneira',
      'ralador',
      'funil',
      'abridor',
      'saca rolha',
      'saleiro',
      'acucareiro',
      'manteigueira',
      'queijeira',
      'suqueira',
      'fritura',
      'churrasco',
      'cozinha',
      'mesa',
    ],
  },
]

export function normalizeProductCategoryText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' e ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function inferProductCategorySlug(productName: string): ProductCategorySlug {
  const normalizedName = normalizeProductCategoryText(productName)

  if (!normalizedName) return 'diversos'

  for (const rule of CATEGORY_RULES) {
    if (rule.terms.some((term) => normalizedName.includes(normalizeProductCategoryText(term)))) {
      return rule.slug
    }
  }

  return 'diversos'
}
