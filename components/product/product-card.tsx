'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { CatalogProduct } from '@/types/product.types'
import { ProductPrice } from './product-price'

interface ProductCardProps {
  product: CatalogProduct
  canViewPrices: boolean
  userStatus?: 'visitor' | 'pending' | 'approved' | 'rejected' | 'suspended'
  onAddToCart?: (product: CatalogProduct) => void
}

export function ProductCard({
  product,
  canViewPrices,
  userStatus = 'visitor',
  onAddToCart,
}: ProductCardProps) {
  const [added, setAdded] = useState(false)

  const imageSrc = product.images?.[0] ?? '/placeholder-product.png'
  const secondImageSrc = product.images?.[1]

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(product)
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <article className="group relative flex flex-col h-full overflow-hidden border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-md">
      {/* Imagem do Produto */}
      <Link href={`/produto/${product.slug}`} className="relative block aspect-square overflow-hidden bg-white p-4">
        {/* Categoria no canto superior esquerdo */}
        {(product.category?.name || product.brand?.name) && (
          <span className="absolute top-2 left-2 z-10 text-[10px] font-bold text-[#555555] uppercase tracking-wide bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded">
            {product.category?.name ?? product.brand?.name}
          </span>
        )}
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className={cn(
            'object-contain p-4 transition-all duration-300 group-hover:scale-105',
            secondImageSrc && 'group-hover:opacity-0',
          )}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />
        {secondImageSrc && (
          <Image
            src={secondImageSrc}
            alt={`${product.name} - Vista alternativa`}
            fill
            className="object-contain p-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        )}
      </Link>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col p-4 pt-0">
        {/* SKU no canto direito */}
        <div className="flex justify-end mb-1">
          <span className="text-[11px] text-[#333333] font-medium tracking-wide">
            {product.sku}
          </span>
        </div>

        {/* Nome */}
        <Link href={`/produto/${product.slug}`}>
          <h3 className="line-clamp-2 text-[13px] text-gray-700 uppercase font-medium group-hover:text-[#333333] transition-colors leading-relaxed mb-4">
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
                disabled={added}
                className={cn(
                  'mt-3 flex h-10 w-full items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer select-none rounded',
                  added
                    ? 'bg-green-600 text-white'
                    : 'bg-[#333333] text-white hover:bg-[#111111] active:bg-black',
                )}
              >
                {added ? (
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
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-[11px] text-gray-500 leading-tight">
                Para ver mais detalhes do produto faça login ou cadastre-se:
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex-1 border border-[#333333] bg-[#333333] text-white text-[11px] font-bold py-1.5 rounded-full text-center hover:bg-[#111111] hover:border-[#111111] transition-colors"
                >
                  LOGIN
                </Link>
                <Link
                  href="/cadastro"
                  className="flex-1 border border-[#333333] text-[#333333] text-[11px] font-bold py-1.5 rounded-full text-center hover:bg-gray-50 transition-colors"
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
