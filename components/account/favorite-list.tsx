'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { HeartOff } from 'lucide-react'
import { removeFavoriteAction } from '@/app/actions/favorites'

export interface FavoriteListItem {
  id: string
  productId: string
  sku: string
  name: string
  slug: string
  imageUrl: string | null
}

export function FavoriteList({ items }: { items: FavoriteListItem[] }) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  return (
    <div>
      {message && (
        <p className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-neutral-600">
          {message}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
          >
            <Link
              href={`/produto/${item.slug}`}
              className="relative block aspect-square bg-neutral-100"
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-contain p-4"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-semibold text-neutral-400">
                  Imagem indisponível
                </div>
              )}
            </Link>
            <div className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                Ref. {item.sku}
              </p>
              <Link
                href={`/produto/${item.slug}`}
                className="mt-1 line-clamp-2 min-h-10 text-sm font-extrabold text-neutral-950 hover:underline"
              >
                {item.name}
              </Link>
              <button
                type="button"
                disabled={isPending && pendingId === item.productId}
                onClick={() => {
                  setPendingId(item.productId)
                  setMessage('')
                  startTransition(async () => {
                    const result = await removeFavoriteAction(item.productId)
                    setMessage(result.message)
                    setPendingId(null)
                    if (result.success) router.refresh()
                  })
                }}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 text-xs font-bold text-neutral-800 transition hover:border-black disabled:cursor-wait disabled:opacity-50"
              >
                <HeartOff className="h-4 w-4" />
                {isPending && pendingId === item.productId ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
