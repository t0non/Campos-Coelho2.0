import { List } from 'lucide-react'
import type { FullProductData } from '@/lib/data/products'
import {
  isMeaningfulProductValue,
  isProductAttributeAlias,
} from '@/lib/catalog/product-details'

interface ProductSpecificationsProps {
  product: FullProductData
}

const TECHNICAL_FIELDS = [
  { label: 'Material', aliases: ['Material'] },
  { label: 'Capacidade', aliases: ['Capacidade', 'Volume'] },
  { label: 'Dimensões', aliases: ['Dimensões', 'Dimensão', 'Medidas'] },
  { label: 'Cor', aliases: ['Cor', 'Cores'] },
  {
    label: 'Unidades por caixa',
    aliases: ['Unidades por caixa', 'Quantidade por caixa', 'Itens por caixa'],
  },
] as const

const RESERVED_ATTRIBUTE_ALIASES = [
  'EAN',
  'Código EAN',
  'Código de barras',
  'Barcode',
  'NCM',
  'Peso',
  'Peso bruto',
  'Peso líquido',
]

export function ProductSpecifications({ product }: ProductSpecificationsProps) {
  const attributeEntries = Object.entries(product.attributes).filter(([, value]) =>
    isMeaningfulProductValue(value),
  )
  const consumedKeys = new Set<string>()

  const preferredSpecs = TECHNICAL_FIELDS.flatMap((field) => {
    const match = attributeEntries.find(([key]) =>
      isProductAttributeAlias(key, [...field.aliases]),
    )
    if (!match) return []
    consumedKeys.add(match[0])
    return [{ label: field.label, value: match[1] }]
  })

  const additionalSpecs = attributeEntries
    .filter(
      ([key]) =>
        !consumedKeys.has(key) &&
        !isProductAttributeAlias(key, RESERVED_ATTRIBUTE_ALIASES),
    )
    .map(([label, value]) => ({ label, value }))

  const specs = [
    { label: 'Marca', value: product.brand?.name },
    ...preferredSpecs,
    { label: 'Código SKU', value: product.sku },
    { label: 'Código EAN', value: product.detail.ean },
    { label: 'NCM', value: product.detail.ncm },
    { label: 'Peso', value: product.detail.weight },
    { label: 'Categoria', value: product.category?.name },
    { label: 'Unidade de venda', value: product.unit },
    {
      label: 'Quantidade mínima',
      value: `${product.min_quantity} ${product.unit}`,
    },
    ...(product.multiple_quantity > 1
      ? [
          {
            label: 'Múltiplo de compra',
            value: `${product.multiple_quantity} ${product.unit}`,
          },
        ]
      : []),
    ...(isMeaningfulProductValue(product.detail.warranty)
      ? [{ label: 'Garantia', value: product.detail.warranty }]
      : []),
    ...additionalSpecs,
  ].filter((spec): spec is { label: string; value: string } =>
    isMeaningfulProductValue(spec.value),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <List className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-bold text-slate-900">Informações do produto</h2>
      </div>

      <dl className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-xs">
        {specs.map((spec, index) => (
          <div
            key={`${spec.label}-${index}`}
            className={`grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-4 p-3.5 ${
              index > 0 ? 'border-t border-slate-100' : ''
            } ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}`}
          >
            <dt className="font-semibold text-slate-600">{spec.label}</dt>
            <dd className="break-words text-right font-bold text-slate-900">
              {spec.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
