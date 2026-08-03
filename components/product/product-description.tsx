import { FileText, CheckCircle2 } from 'lucide-react'
import type { FullProductData } from '@/lib/data/products'
import { isMeaningfulProductValue } from '@/lib/catalog/product-details'

interface ProductDescriptionProps {
  product: FullProductData
}

export function ProductDescription({ product }: ProductDescriptionProps) {
  const description = isMeaningfulProductValue(product.detail.longDescription)
    ? product.detail.longDescription
    : undefined
  const applications = (product.detail.applications ?? []).filter(
    isMeaningfulProductValue,
  )
  const instructions = (product.detail.instructions ?? []).filter(
    isMeaningfulProductValue,
  )

  if (!description && applications.length === 0 && instructions.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <FileText className="h-5 w-5 text-orange-500" />
        <h2 className="text-lg font-bold text-slate-900">Descrição do Produto</h2>
      </div>

      <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        {description && <p>{description}</p>}

        {applications.length > 0 && (
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Principais Aplicações Comerciais:
            </h3>
            <ul className="space-y-1.5">
              {applications.map((app) => (
                <li key={app} className="flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span>{app}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {instructions.length > 0 && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
            <span className="font-bold text-slate-800">Instruções e Armazenamento:</span>
            <ul className="list-disc space-y-1 pl-4 text-slate-600">
              {instructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
