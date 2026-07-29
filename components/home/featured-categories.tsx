import Link from 'next/link'
import Image from 'next/image'
import {
  Gamepad2,
  Home,
  Sparkles,
  Tv,
  Baby,
  Dumbbell,
  Wrench,
  PartyPopper,
  ShoppingBag,
  Car,
  Utensils,
  LayoutGrid,
} from 'lucide-react'
import type { CategoryCardData } from '@/lib/data/home'

interface FeaturedCategoriesProps {
  categories: CategoryCardData[]
}

const CATEGORY_ICON_MAP: Record<string, any> = {
  brinquedos: Gamepad2,
  'utilidade-domestica': Home,
  decoracao: Sparkles,
  'eletro-eletronicos': Tv,
  'bebes-cia': Baby,
  'esportes-lazer': Dumbbell,
  ferramentas: Wrench,
  festas: PartyPopper,
  acessorios: ShoppingBag,
  automoveis: Car,
  utilidades: Utensils,
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  if (!categories || categories.length === 0) return null

  // Pegar as primeiras 8 ou 12 para formar um grid bonito
  const displayCategories = categories.slice(0, 12)

  return (
    <section className="site-section select-none border-y border-neutral-100 bg-neutral-50">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Title Centered like Importec */}
        <div className="site-section-header text-center">
          <h2 className="site-section-title text-neutral-950">
            Navegue por departamentos
          </h2>
        </div>

        {/* Categories Grid (Circles) */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {displayCategories.map((cat) => {
            const IconComponent = CATEGORY_ICON_MAP[cat.slug ?? ''] ?? LayoutGrid
            const hasCustomImage = Boolean(
              cat.imageUrl && cat.imageUrl !== '/placeholder-category.png',
            )

            return (
              <Link
                key={cat.id}
                href={`/catalogo?cat=${cat.slug ?? ''}`}
                className="flex flex-col items-center group w-24 sm:w-32"
              >
                {/* Circle Container */}
                <div className="relative mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-black group-hover:shadow-[0_14px_32px_rgba(0,0,0,0.12)] sm:h-32 sm:w-32">
                  {hasCustomImage ? (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      sizes="(min-width: 640px) 128px, 96px"
                      className="object-cover"
                    />
                  ) : (
                    <IconComponent className="h-10 w-10 stroke-[1.5] text-neutral-800 transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14" />
                  )}
                </div>
                {/* Text Label */}
                <span className="text-center text-xs font-bold uppercase leading-tight tracking-wide text-neutral-800 transition-colors group-hover:text-black sm:text-sm">
                  {cat.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
