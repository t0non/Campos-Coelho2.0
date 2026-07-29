import Link from 'next/link'
import Image from 'next/image'
import type { SecondaryBannerItem } from '@/lib/data/home'

interface PromotionalBannerProps {
  banner: SecondaryBannerItem | null
}

export function PromotionalBanner({ banner }: PromotionalBannerProps) {
  if (banner) {
    return (
      <section aria-label={banner.title} className="site-section-compact bg-neutral-100">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <Link
            href={banner.href}
            className="relative block aspect-[16/7] overflow-hidden rounded-2xl bg-white shadow-[0_16px_50px_rgba(0,0,0,0.10)] sm:aspect-[20/7] lg:aspect-[24/6]"
          >
            <Image
              src={banner.imageUrl}
              alt={banner.title}
              fill
              sizes="(min-width: 1200px) 1200px, 100vw"
              className="hidden object-cover md:block"
            />
            <Image
              src={banner.mobileImageUrl}
              alt={banner.title}
              fill
              sizes="100vw"
              className="object-cover md:hidden"
            />
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Banner promocional" className="site-section-compact bg-neutral-100">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <Link
          href="/catalogo"
          className="relative isolate flex min-h-[250px] overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 px-8 py-8 text-white shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:min-h-[290px] sm:items-center sm:px-14 lg:min-h-[300px]"
        >
          <div className="relative z-10 max-w-[520px] lg:max-w-[500px]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300">
              Variedade para o seu negócio
            </p>
            <h2 className="site-section-title mt-3 text-white sm:text-4xl">
              Prepare seu estoque para vender mais o ano inteiro
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
              Encontre utilidades, organização e produtos para diferentes perfis de loja.
            </p>
            <span className="mt-6 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-black uppercase text-black transition-colors hover:bg-neutral-200">
              Ver catálogo
            </span>
          </div>

          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 hidden w-[62%] lg:block"
          >
            <Image
              src="/images/banners/secondary-evergreen-products-v1.webp"
              alt=""
              fill
              sizes="(min-width: 1200px) 744px, 62vw"
              className="object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/55 to-transparent" />
          </div>
        </Link>
      </div>
    </section>
  )
}
