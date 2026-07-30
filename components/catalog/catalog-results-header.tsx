'use client'

import { SlidersHorizontal } from 'lucide-react'
import { CatalogSortSelect } from './catalog-sort-select'
import type { CatalogParams } from '@/lib/utils/catalog-params'

interface CatalogResultsHeaderProps {
  total: number
  params: CatalogParams
  canViewPrices: boolean
  onOpenMobileFilters?: () => void
}

export function CatalogResultsHeader({
  total,
  params,
  canViewPrices,
  onOpenMobileFilters,
}: CatalogResultsHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      {/* Total de Resultados */}
      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
        {onOpenMobileFilters && (
          <button
            type="button"
            onClick={onOpenMobileFilters}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 shadow-xs hover:bg-slate-50 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 text-orange-500" />
            <span>Filtros</span>
          </button>
        )}

        <p className="text-xs font-semibold text-slate-700">
          <strong className="text-slate-900 font-extrabold">{total}</strong> produtos encontrados
        </p>
      </div>

      {/* Ordenação */}
      <CatalogSortSelect
        currentSort={params.sort ?? 'relevancia'}
        canViewPrices={canViewPrices}
        params={params}
      />
    </div>
  )
}
