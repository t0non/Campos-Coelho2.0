import { Boxes, PackageCheck } from 'lucide-react'
import type { FullProductData } from '@/lib/data/products'
import { isMeaningfulProductValue } from '@/lib/catalog/product-details'

interface ProductPackagingProps {
  product: FullProductData
}

interface PackagingData {
  type?: string
  unitsPerPackage?: string | number
  packageDimensions?: string
  packageWeight?: string
  unitsPerMasterBox?: string | number
  masterBoxDimensions?: string
  boxDimensions?: string
  masterBoxWeight?: string
  grossWeight?: string
  stackabilityMax?: string | number
}

export function ProductPackaging({ product }: ProductPackagingProps) {
  const packaging =
    product.detail.packaging && typeof product.detail.packaging === 'object'
      ? (product.detail.packaging as PackagingData)
      : null

  if (!packaging) return null

  const commercialPackage = [
    { label: 'Tipo', value: packaging.type },
    { label: 'Unidades por embalagem', value: packaging.unitsPerPackage },
    { label: 'Dimensões', value: packaging.packageDimensions },
    { label: 'Peso bruto', value: packaging.packageWeight },
  ].filter((item) => isMeaningfulProductValue(item.value))

  const masterBox = [
    { label: 'Unidades por caixa', value: packaging.unitsPerMasterBox },
    {
      label: 'Dimensões da caixa',
      value: packaging.masterBoxDimensions ?? packaging.boxDimensions,
    },
    {
      label: 'Peso total',
      value: packaging.masterBoxWeight ?? packaging.grossWeight,
    },
    { label: 'Empilhamento máximo', value: packaging.stackabilityMax },
  ].filter((item) => isMeaningfulProductValue(item.value))

  if (commercialPackage.length === 0 && masterBox.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <Boxes className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-bold text-slate-900">Embalagem</h2>
      </div>

      <div className="grid gap-4 text-xs md:grid-cols-2">
        {commercialPackage.length > 0 && (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 font-bold text-slate-900">
              <PackageCheck className="h-4 w-4 text-slate-700" />
              <span>Embalagem comercial</span>
            </div>
            <dl className="space-y-2">
              {commercialPackage.map((item) => (
                <div key={item.label} className="flex justify-between gap-3">
                  <dt className="text-slate-500">{item.label}</dt>
                  <dd className="text-right font-semibold text-slate-900">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {masterBox.length > 0 && (
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 font-bold text-slate-900">
              <Boxes className="h-4 w-4 text-orange-500" />
              <span>Caixa de transporte</span>
            </div>
            <dl className="space-y-2">
              {masterBox.map((item) => (
                <div key={item.label} className="flex justify-between gap-3">
                  <dt className="text-slate-500">{item.label}</dt>
                  <dd className="text-right font-semibold text-slate-900">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  )
}
