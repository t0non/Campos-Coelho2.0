import Link from 'next/link'
import Image from 'next/image'
import type { BrandItem } from '@/lib/data/home'

interface BrandCarouselProps {
  brands: BrandItem[]
}

export function BrandCarousel({ brands }: BrandCarouselProps) {
  if (!brands || brands.length === 0) return null

  // Dividir somente as marcas que possuem um arquivo de logo.
  const mid = Math.ceil(brands.length / 2)
  const row1 = brands.slice(0, mid)
  const row2 = brands.slice(mid)

  return (
    <section
      aria-label="Marcas disponíveis"
      className="site-section-compact overflow-hidden border-y border-neutral-100 bg-neutral-50"
    >
      {/* Faixa 1 — da esquerda para a direita */}
      <div className="marquee-wrapper mb-5">
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
      href={`/catalogo?marca=${brand.slug}`}
      aria-label={`Ver produtos da marca ${brand.name}`}
      className="group mx-7 block shrink-0"
    >
      {/* Logo oficial */}
      <div
        className="relative h-20 w-44 overflow-hidden rounded-md transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_6px_10px_rgba(0,0,0,0.12)]"
        style={{ backgroundColor: brand.logoBackground ?? 'transparent' }}
      >
        <Image
          src={brand.logoUrl}
          alt={`Logo ${brand.name}`}
          fill
          sizes="176px"
          className="object-contain p-3"
        />
      </div>
    </Link>
  )
}
