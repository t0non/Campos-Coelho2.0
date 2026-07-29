'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { ProductCard } from '@/components/product/product-card'
import type { CollectionCampaign } from '@/lib/data/home'

interface CampaignGridProps {
  collections: CollectionCampaign[]
  canViewPrices: boolean
}

export function CampaignGrid({
  collections,
  canViewPrices,
}: CampaignGridProps) {
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const firstCampaignWithProducts = collections.findIndex(
      (campaign) => campaign.products?.length > 0,
    )
    return firstCampaignWithProducts >= 0 ? firstCampaignWithProducts : 0
  })
  const productsTrackRef = useRef<HTMLDivElement>(null)

  if (!collections || collections.length === 0) return null

  const selectedCampaign = collections[selectedIndex] ?? collections[0]
  const selectedProducts = selectedCampaign.products ?? []

  const scrollProducts = (direction: -1 | 1) => {
    productsTrackRef.current?.scrollBy({
      left: direction * Math.max(240, productsTrackRef.current.clientWidth * 0.82),
      behavior: 'smooth',
    })
  }

  return (
    <section
      aria-label="Campanhas sazonais"
      className="site-section-compact border-b border-neutral-100 bg-white"
    >
      <Container>
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-7 sm:overflow-visible sm:px-0 lg:grid-cols-4 lg:gap-10">
          {collections.slice(0, 4).map((item, index) => {
            const isSelected = selectedCampaign.id === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-pressed={isSelected}
                className="group flex min-w-[165px] snap-start flex-col items-center text-center sm:min-w-0"
              >
                <div className="relative h-28 w-full sm:h-32 lg:h-36">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 250px, (min-width: 640px) 45vw, 165px"
                    className={`object-contain transition-transform duration-300 group-hover:scale-105 ${
                      isSelected ? 'scale-105' : ''
                    }`}
                  />
                </div>

                <span
                  className={`mt-3 border-b-2 pb-1 text-sm font-extrabold uppercase tracking-wide transition-colors sm:text-base ${
                    isSelected
                      ? 'border-black text-black'
                      : 'border-transparent text-neutral-600 group-hover:text-black'
                  }`}
                >
                  {item.title}
                </span>
              </button>
            )
          })}
        </div>

        {selectedProducts.length > 0 && (
          <div className="mt-8 border-t border-neutral-200 pt-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500">
                  Seleção da campanha
                </p>
                <h2 className="site-section-title mt-1 text-black">
                  {selectedCampaign.title}
                </h2>
              </div>

              {selectedProducts.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scrollProducts(-1)}
                    aria-label="Ver produtos anteriores"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-600 transition-colors hover:border-black hover:bg-neutral-100 hover:text-black"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollProducts(1)}
                    aria-label="Ver próximos produtos"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white shadow-md transition-all hover:scale-105 hover:bg-neutral-800"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            <div
              ref={productsTrackRef}
              className="grid snap-x snap-mandatory grid-flow-col auto-cols-[78%] gap-4 overflow-x-auto pb-3 sm:auto-cols-[46%] md:auto-cols-[31%] lg:auto-cols-[216px] xl:auto-cols-[220px]"
            >
              {selectedProducts.map((product) => (
                <div key={product.id} className="snap-start">
                  <ProductCard
                    product={product}
                    canViewPrices={canViewPrices}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  )
}
