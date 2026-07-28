import Link from 'next/link'
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
import type { CategoryCardData } from '@/lib/mocks/mock-categories'

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
    <section className="py-12 bg-white select-none">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Title Centered like Importec */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-[#333333]">
            Navegue por departamentos
          </h2>
        </div>

        {/* Categories Grid (Circles) */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {displayCategories.map((cat) => {
            const IconComponent = CATEGORY_ICON_MAP[cat.slug ?? ''] ?? LayoutGrid

            return (
              <Link
                key={cat.id}
                href={`/catalogo?cat=${cat.slug ?? ''}`}
                className="flex flex-col items-center group w-24 sm:w-32"
              >
                {/* Circle Container */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-[1.5px] border-[#333333] bg-white flex items-center justify-center mb-4 group-hover:bg-[#f5f5f5] group-hover:scale-105 transition-all duration-300 shadow-sm">
                  <IconComponent className="w-10 h-10 sm:w-14 sm:h-14 text-[#333333] group-hover:text-[#111111] stroke-[1.5]" />
                </div>
                {/* Text Label */}
                <span className="text-xs sm:text-sm font-bold text-[#333333] group-hover:text-[#111111] uppercase tracking-wide text-center leading-tight">
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
