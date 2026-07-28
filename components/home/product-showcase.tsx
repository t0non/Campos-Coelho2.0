'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/product/product-card'
import type { CatalogProduct } from '@/types/product.types'

interface ProductShowcaseProps {
  title: string
  subtitle?: string
  tagline?: string
  products: CatalogProduct[]
  canViewPrices: boolean
  userStatus: 'visitor' | 'pending' | 'approved' | 'rejected' | 'suspended'
  seeAllHref?: string
}

export function ProductShowcase({
  title,
  products,
  canViewPrices,
  userStatus,
  seeAllHref = '/catalogo',
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
    <section className="py-8 bg-white select-none">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Section Header - Importec exact style */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-[#333333] tracking-tight">
            {title}
          </h2>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Anterior"
              className="w-8 h-8 rounded-full bg-[#333333] text-white hover:bg-[#111111] transition-colors flex items-center justify-center"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Próximo"
              className="w-8 h-8 rounded-full bg-[#333333] text-white hover:bg-[#111111] transition-colors flex items-center justify-center"
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
                userStatus={userStatus}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
