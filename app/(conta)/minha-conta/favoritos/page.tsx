export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { getUserFavoritesAction } from '@/app/actions/favorites'
import { FavoriteList, type FavoriteListItem } from '@/components/account/favorite-list'
import { requireApprovedAccess } from '@/lib/supabase/auth'

export const metadata: Metadata = { title: 'Favoritos' }

export default async function FavoritosPage() {
  await requireApprovedAccess()
  const favorites = await getUserFavoritesAction()

  const items: FavoriteListItem[] = favorites
    .map((favorite) => {
      const product = Array.isArray(favorite.products)
        ? favorite.products[0]
        : favorite.products
      if (!product || !product.is_active || !product.is_published) return null

      const images = [...(product.product_images ?? [])].sort(
        (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
      )

      return {
        id: favorite.id,
        productId: product.id,
        sku: product.sku,
        name: product.name,
        slug: product.slug,
        imageUrl: images[0]?.url ?? null,
      }
    })
    .filter((item): item is FavoriteListItem => Boolean(item))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-950">Favoritos</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Produtos salvos para você consultar novamente com rapidez.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-14 text-center shadow-sm">
          <Heart className="mx-auto h-9 w-9 text-neutral-300" />
          <p className="mt-3 text-sm font-bold text-neutral-800">Sua lista de favoritos está vazia.</p>
          <Link
            href="/catalogo"
            className="mt-5 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-bold text-white hover:bg-neutral-800"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <FavoriteList items={items} />
      )}
    </div>
  )
}
