'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const PROMOTIONAL_SLIDES = [
  {
    id: 'mix-completo',
    eyebrow: 'Variedade para o seu negócio',
    title: 'Prepare seu estoque para vender mais o ano inteiro',
    description:
      'Encontre utilidades, organização e produtos para diferentes perfis de loja.',
    image: '/images/banners/secondary-evergreen-products-v1.webp',
  },
  {
    id: 'cozinha',
    eyebrow: 'Praticidade que vende',
    title: 'Um mix completo para cozinha e organização',
    description:
      'Abasteça sua loja com soluções úteis para diferentes rotinas e públicos.',
    image: '/images/banners/secondary-kitchen-v1.webp',
  },
  {
    id: 'limpeza',
    eyebrow: 'Soluções para o dia a dia',
    title: 'Limpeza e organização para completar suas vendas',
    description:
      'Ofereça produtos funcionais para lavanderia, cuidados com a casa e organização.',
    image: '/images/banners/secondary-cleaning-v1.webp',
  },
  {
    id: 'jardim-lazer',
    eyebrow: 'Mais opções para sua loja',
    title: 'Jardim, ferramentas e lazer em um só lugar',
    description:
      'Amplie suas oportunidades com variedade para a casa e para toda a família.',
    image: '/images/banners/secondary-garden-leisure-v1.webp',
  },
] as const

const ROTATION_INTERVAL = 6500

export function EvergreenPromotionalCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const showNext = useCallback(() => {
    setCurrentIndex((current) => (current + 1) % PROMOTIONAL_SLIDES.length)
  }, [])

  const showPrevious = useCallback(() => {
    setCurrentIndex(
      (current) =>
        (current - 1 + PROMOTIONAL_SLIDES.length) %
        PROMOTIONAL_SLIDES.length,
    )
  }, [])

  useEffect(() => {
    if (
      isPaused ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const timer = window.setInterval(showNext, ROTATION_INTERVAL)
    return () => window.clearInterval(timer)
  }, [isPaused, showNext])

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return

    const distance = touchStartX.current - (event.changedTouches[0]?.clientX ?? 0)
    if (distance > 50) showNext()
    if (distance < -50) showPrevious()
    touchStartX.current = null
  }

  return (
    <section
      aria-label="Destaques do catálogo"
      aria-roledescription="carrossel"
      className="site-section-compact bg-neutral-100"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative overflow-hidden rounded-2xl bg-neutral-950 text-white shadow-[0_18px_50px_rgba(0,0,0,0.18)]"
        >
          <p className="sr-only" aria-live="polite">
            Banner {currentIndex + 1} de {PROMOTIONAL_SLIDES.length}:{' '}
            {PROMOTIONAL_SLIDES[currentIndex].title}
          </p>

          <div
            className="flex transition-transform duration-700 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {PROMOTIONAL_SLIDES.map((slide, index) => (
              <Link
                key={slide.id}
                href="/catalogo"
                aria-hidden={index !== currentIndex}
                tabIndex={index === currentIndex ? 0 : -1}
                className="relative isolate flex min-h-[290px] w-full shrink-0 items-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800 px-8 pb-16 pt-8 sm:px-14 lg:min-h-[300px]"
              >
                <div className="relative z-10 max-w-[520px] lg:max-w-[500px]">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-300">
                    {slide.eyebrow}
                  </p>
                  <h2 className="site-section-title mt-3 text-white sm:text-4xl">
                    {slide.title}
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-white/80">
                    {slide.description}
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
                    src={slide.image}
                    alt=""
                    fill
                    sizes="(min-width: 1200px) 744px, 62vw"
                    className="object-cover object-right"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/55 to-transparent" />
                </div>
              </Link>
            ))}
          </div>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {PROMOTIONAL_SLIDES.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Mostrar banner ${index + 1}: ${slide.eyebrow}`}
                aria-pressed={index === currentIndex}
                className={`h-2.5 rounded-full border border-white/25 transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-white'
                    : 'w-2.5 bg-white/45 hover:bg-white/80'
                }`}
              />
            ))}
          </div>

          <div className="absolute bottom-4 right-5 z-20 hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={showPrevious}
              aria-label="Banner anterior"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white transition-colors hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Próximo banner"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white transition-colors hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
