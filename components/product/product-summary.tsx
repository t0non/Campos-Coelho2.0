'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Heart, Share2, CircleCheck, CircleX } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { FullProductData } from '@/lib/data/products'

const ProductShareModal = dynamic(() =>
  import('./product-share-modal').then((module) => module.ProductShareModal),
)

interface ProductSummaryProps {
  product: FullProductData
}

export function ProductSummary({ product }: ProductSummaryProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)

  return (
    <div className="min-w-0 space-y-4">
      {/* Marca & Categoria Links */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        {product.brand && (
          <Link
            href={`/marca/${product.brand.slug}`}
            className="rounded-md bg-navy-900 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-orange-500 transition-colors uppercase tracking-wider"
          >
            {product.brand.name}
          </Link>
        )}
        {product.category && (
          <Link
            href={`/categoria/${product.category.slug}`}
            className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            {product.category.name}
          </Link>
        )}
      </div>

      {/* Nome do Produto */}
      <h1 className="break-words text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">
        {product.name}
      </h1>

      {/* Metadados públicos e ações */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-slate-100 py-3 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-4">
          <span>REF: <strong className="text-slate-800 font-bold">{product.sku}</strong></span>
          {product.detail.ean && (
            <span>
              EAN: <strong className="font-bold text-slate-800">{product.detail.ean}</strong>
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 font-bold ${
              product.isAvailable ? 'text-green-700' : 'text-slate-500'
            }`}
          >
            {product.isAvailable ? (
              <CircleCheck className="h-4 w-4" />
            ) : (
              <CircleX className="h-4 w-4" />
            )}
            {product.isAvailable ? 'Disponível' : 'Indisponível no momento'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão Favoritar */}
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className={cn(
              'flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-bold transition-colors',
              isFavorite ? 'border-red-200 bg-red-50 text-red-600' : 'text-slate-700 hover:bg-slate-100',
            )}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current text-red-600')} />
            <span>{isFavorite ? 'Favoritado' : 'Favoritar'}</span>
          </button>

          {/* Botão Compartilhar */}
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            aria-label="Compartilhar produto"
            className="flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
          >
            <Share2 className="h-4 w-4" />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>

      {/* Modal de Compartilhamento */}
      {isShareOpen && (
        <ProductShareModal
          isOpen
          onClose={() => setIsShareOpen(false)}
          productName={product.name}
        />
      )}
    </div>
  )
}
