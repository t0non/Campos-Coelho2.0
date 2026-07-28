import Link from 'next/link'
import { Award } from 'lucide-react'
import type { BrandItem } from '@/lib/mocks/mock-brands'

interface BrandCarouselProps {
  brands: BrandItem[]
}

export function BrandCarousel({ brands }: BrandCarouselProps) {
  if (!brands || brands.length === 0) return null

  // Dividir as 20 marcas em 2 grupos de 10 para cada faixa
  const mid = Math.ceil(brands.length / 2)
  const row1 = brands.slice(0, mid)
  const row2 = brands.slice(mid)

  return (
    <section className="py-10 bg-white border-b border-slate-200 overflow-hidden">
      {/* Cabeçalho */}
      <div className="max-w-[1400px] mx-auto px-4 mb-7 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">
          <Award className="h-4 w-4" />
          <span>Top 20 Marcas Principais</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">
          Marcas mais Famosas do Nosso Catálogo
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Os fabricantes mais reconhecidos em utilidades domésticas, plásticos, organização e brinquedos.
        </p>
      </div>

      {/* Faixa 1 — da esquerda para a direita */}
      <div className="marquee-wrapper mb-3">
        <div className="marquee-track marquee-track--ltr">
          {/* Duplicar para loop contínuo perfeito */}
          {[...row1, ...row1].map((b, i) => (
            <BrandChip key={`r1-${b.id}-${i}`} brand={b} />
          ))}
        </div>
      </div>

      {/* Faixa 2 — da direita para a esquerda */}
      <div className="marquee-wrapper">
        <div className="marquee-track marquee-track--rtl">
          {[...row2, ...row2].map((b, i) => (
            <BrandChip key={`r2-${b.id}-${i}`} brand={b} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BrandChip({ brand }: { brand: BrandItem }) {
  return (
    <Link
      href={`/catalogo?brand=${brand.slug}`}
      className="group flex items-center gap-3 mx-3 px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-orange-400 hover:shadow-md transition-all shrink-0"
    >
      {/* Monograma */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-extrabold text-xs group-hover:bg-orange-500 transition-colors">
        {brand.initials}
      </div>
      {/* Texto */}
      <div className="text-left leading-tight">
        <span className="block text-xs font-bold text-slate-800 group-hover:text-orange-600 whitespace-nowrap">
          {brand.name}
        </span>
        <span className="block text-[10px] text-slate-500 whitespace-nowrap">
          {brand.category}
        </span>
      </div>
    </Link>
  )
}
