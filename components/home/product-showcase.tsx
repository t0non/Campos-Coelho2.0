'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
import type { CatalogProduct } from '@/types/product.types'

interface ProductShowcaseProps {
  title: string
  products: CatalogProduct[]
  canViewPrices: boolean
}

export function ProductShowcase({
  title,
  products,
  canViewPrices,
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
          <h2 className="site-section-title text-neutral-950">
            {title}
          </h2>

          <div className="flex items-center gap-2">
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
          className="flex gap-4 overflow-x-auto scroll-smooth pb-4 no-scrollbar"
        >
          {products.map((product) => (
            <div key={product.id} className="w-[240px] shrink-0">
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
