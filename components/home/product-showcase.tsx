'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
import Link from 'next/link'
import type { CatalogProduct } from '@/types/product.types'

interface ProductShowcaseProps {
  title: string
  products: CatalogProduct[]
  canViewPrices: boolean
  href?: string
}

export function ProductShowcase({
  title,
  products,
  canViewPrices,
  href,
}: ProductShowcaseProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollTo({
      left: scrollRef.current.scrollLeft + (dir === 'left' ? -amount : amount),
      behavior: 'smooth',
    })
  }

  if (!products || products.length === 0) return null

  return (
    <section className="site-section-compact select-none border-b border-neutral-100 bg-white">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Section Header - Importec exact style */}
        <div className="site-section-header flex items-center justify-between">
          {href ? (
            <Link
              href={href}
              className="site-section-title text-neutral-950 underline-offset-4 hover:underline"
            >
              {title}
            </Link>
          ) : (
            <h2 className="site-section-title text-neutral-950">{title}</h2>
          )}

          <div className="flex items-center gap-2">
            {href && (
              <Link
                href={href}
                className="mr-1 hidden text-xs font-bold uppercase tracking-wide text-neutral-600 hover:text-black sm:inline"
              >
                Ver todos
              </Link>
            )}
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Anterior"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition-all hover:border-black hover:bg-neutral-100 hover:text-black"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Próximo"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white shadow-md transition-all hover:scale-105 hover:bg-neutral-800"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Product Carousel */}
        <div
          ref={scrollRef}
          className="grid snap-x snap-mandatory grid-flow-col auto-cols-[calc((100%-0.75rem)/2)] gap-3 overflow-x-auto scroll-smooth pb-4 sm:auto-cols-[240px] sm:gap-4 no-scrollbar"
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-0 snap-start">
              <ProductCard
                product={product}
                canViewPrices={canViewPrices}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
