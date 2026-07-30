import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone } from 'lucide-react'
import type { InstitutionalBannerItem } from '@/lib/data/home'

interface InstitutionalBannersProps {
  banners: InstitutionalBannerItem[]
}

function isLocationBanner(banner: InstitutionalBannerItem) {
  return /local|endere|onde/i.test(`${banner.title} ${banner.href}`)
}

export function InstitutionalBanners({ banners }: InstitutionalBannersProps) {
  if (!banners.length) return null

  return (
    <section
      aria-label="Atendimento e localização"
      className="site-section-compact border-b border-neutral-100 bg-white"
    >
      <div className="mx-auto grid max-w-[1200px] gap-4 px-4 sm:px-6 lg:grid-cols-2">
        {banners.map((banner) => {
          const location = isLocationBanner(banner)
          const Icon = location ? MapPin : Phone

          return (
            <Link
              key={banner.id}
              href={banner.href}
              className="group relative isolate aspect-[8/5] overflow-hidden rounded-2xl bg-[#082653] shadow-[0_14px_35px_rgba(8,38,83,0.18)] sm:aspect-[3/1] lg:aspect-[8/3]"
            >
              <Image
                src={banner.imageUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 584px, 100vw"
                className="hidden object-cover transition-transform duration-500 group-hover:scale-[1.02] sm:block"
              />
              <Image
                src={banner.mobileImageUrl}
                alt=""
                fill
                sizes="100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02] sm:hidden"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#061d40]/95 via-[#082653]/76 to-transparent" />

              <div className="relative z-10 flex h-full max-w-[58%] flex-col justify-center p-5 text-white sm:p-6">
                <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/25">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/75">
                  {location ? 'Onde estamos' : 'Fale com nossa equipe'}
                </p>
                <h2 className="mt-1 text-lg font-black leading-tight text-white sm:text-xl">
                  {banner.title}
                </h2>
                <span className="mt-3 inline-flex w-fit rounded-md bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wide text-[#082653]">
                  {location ? 'Como chegar' : 'Entrar em contato'}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
