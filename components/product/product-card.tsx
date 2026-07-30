'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { CatalogProduct } from '@/types/product.types'
import { ProductPrice } from './product-price'
import { addToCartAction } from '@/app/actions/cart'

interface ProductCardProps {
  product: CatalogProduct
  canViewPrices: boolean
  onAddToCart?: (product: CatalogProduct) => void
}

export function ProductCard({
  product,
  canViewPrices,
  onAddToCart,
}: ProductCardProps) {
  const [added, setAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alternateImageRequested, setAlternateImageRequested] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const imageSrc = product.images?.[0] ?? '/placeholder-product.png'
  const secondImageSrc = product.images?.[1]

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(product)
      window.dispatchEvent(new Event('cart:open'))
      return
    }

    if (isPending) return
    setError(null)

    startTransition(async () => {
      const result = await addToCartAction({
        product_id: product.id,
        variant_id: product.primary_variant_id ?? null,
        quantity: product.min_quantity,
      })

      if (!result.success) {
        if (result.code === 'ADMIN_PREVIEW_REQUIRED') {
          window.dispatchEvent(
            new CustomEvent('cart:preview-add', { detail: product }),
          )
          setAdded(true)
          setTimeout(() => setAdded(false), 2000)
          return
        }

        setError(result.message ?? 'Não foi possível adicionar ao carrinho.')
        return
      }

      setAdded(true)
      router.refresh()
      window.dispatchEvent(new Event('cart:open'))
      setTimeout(() => setAdded(false), 2000)
    })
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-neutral-400 hover:shadow-[0_16px_36px_rgba(0,0,0,0.10)]">
      {/* Imagem do Produto */}
      <Link
        href={`/produto/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-white p-2 sm:p-4"
        onPointerEnter={() => setAlternateImageRequested(true)}
        onFocus={() => setAlternateImageRequested(true)}
      >
        {/* Categoria no canto superior esquerdo */}
        {(product.category?.name || product.brand?.name) && (
          <span className="absolute left-1.5 top-1.5 z-10 max-w-[calc(100%-0.75rem)] truncate rounded-md bg-neutral-900 px-1.5 py-1 text-[8px] font-bold uppercase tracking-[0.05em] text-white sm:left-2 sm:top-2 sm:px-2 sm:text-[9px]">
            {product.category?.name ?? product.brand?.name}
          </span>
        )}
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className={cn(
            'object-contain p-2 transition-all duration-300 group-hover:scale-105 sm:p-4',
            secondImageSrc && 'group-hover:opacity-0 group-focus-within:opacity-0',
          )}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 280px"
        />
        {secondImageSrc && alternateImageRequested && (
          <Image
            src={secondImageSrc}
            alt={`${product.name} - Vista alternativa`}
            fill
            className="object-contain p-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105 group-focus-within:opacity-100"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 280px"
          />
        )}
      </Link>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col p-2.5 pt-0 sm:p-4 sm:pt-0">
        {/* SKU no canto direito */}
        <div className="flex justify-end mb-1">
          <span className="text-[9px] font-medium tracking-wide text-neutral-500 sm:text-[11px]">
            {product.sku}
          </span>
        </div>

        {/* Nome */}
        <Link href={`/produto/${product.slug}`}>
          <h3 className="mb-3 line-clamp-3 text-[10px] font-semibold uppercase leading-snug text-neutral-700 transition-colors group-hover:text-black sm:mb-4 sm:line-clamp-2 sm:text-[13px] sm:leading-relaxed">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto">
          {/* Preço ou Mensagem de Login */}
          {canViewPrices ? (
            <>
              <ProductPrice price={product.price} canViewPrices={true} />
              
              <div className="mt-3 text-[11px] text-gray-500 font-medium">
                Mín: {product.min_quantity} {product.unit}
              </div>

              {/* Botão Adicionar ao Carrinho */}
              <button
                type="button"
                onClick={handleAdd}
                disabled={added || isPending}
                aria-busy={isPending}
                className={cn(
                  'mt-3 flex h-10 w-full items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer select-none rounded',
                  added
                    ? 'bg-green-600 text-white'
                    : 'bg-black text-white hover:bg-neutral-800 active:bg-neutral-700',
                  isPending && 'cursor-wait opacity-70',
                )}
              >
                {isPending ? (
                  'Adicionando...'
                ) : added ? (
                  <>
                    <Check className="h-4 w-4" />
                    Adicionado
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    Comprar
                  </>
                )}
              </button>
              {error && (
                <p
                  role="alert"
                  className="mt-2 flex items-start gap-1.5 text-[11px] font-medium text-red-600"
                >
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {error}
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-[9px] leading-snug text-gray-500 sm:text-[11px]">
                Para ver mais detalhes do produto faça login ou cadastre-se:
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex min-h-10 flex-1 items-center justify-center rounded-md border border-black bg-black px-1 py-2 text-center text-[9px] font-bold text-white transition-colors hover:bg-neutral-800 sm:text-[11px]"
                >
                  LOGIN
                </Link>
                <Link
                  href="/cadastro"
                  className="flex min-h-10 flex-1 items-center justify-center rounded-md border border-neutral-300 px-1 py-2 text-center text-[9px] font-bold text-neutral-800 transition-colors hover:border-black hover:bg-neutral-100 sm:text-[11px]"
                >
                  CADASTRO
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
