import Link from 'next/link'
import Image from 'next/image'
import type { SecondaryBannerItem } from '@/lib/data/home'
import { EvergreenPromotionalCarousel } from './promotional-banner-carousel'

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

  return <EvergreenPromotionalCarousel />
}
