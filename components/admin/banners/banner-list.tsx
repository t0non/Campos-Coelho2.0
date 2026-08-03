'use client'

import { useState } from 'react'
import { updateBannerOrder, deleteBanner } from '@/lib/actions/admin/banners'
import { ArrowUp, ArrowDown, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

import { Banner } from '@/types/banner.types'

interface BannerListProps {
  banners: Banner[]
  onEdit: (banner: Banner) => void
}

function getBannerLabel(banner: Banner, index: number) {
  const title = banner.title.trim()
  if (title && !/^https?:\/\//i.test(title)) return title

  if (banner.subtitle === '__secondary__') return `Banner intermediário ${index + 1}`
  if (banner.subtitle === '__institutional__') return `Banner institucional ${index + 1}`
  return `Banner principal ${index + 1}`
}

export function BannerList({ banners, onEdit }: BannerListProps) {
  const [localBanners, setLocalBanners] = useState(banners)
  const [isUpdating, setIsUpdating] = useState(false)

  const moveUp = async (index: number) => {
    if (index === 0) return
    const newBanners = [...localBanners]
    const temp = newBanners[index]
    newBanners[index] = newBanners[index - 1]
    newBanners[index - 1] = temp
    setLocalBanners(newBanners)
    await saveOrder(newBanners)
  }

  const moveDown = async (index: number) => {
    if (index === localBanners.length - 1) return
    const newBanners = [...localBanners]
    const temp = newBanners[index]
    newBanners[index] = newBanners[index + 1]
    newBanners[index + 1] = temp
    setLocalBanners(newBanners)
    await saveOrder(newBanners)
  }

  const saveOrder = async (orderedBanners: Banner[]) => {
    setIsUpdating(true)
    await updateBannerOrder(orderedBanners.map(b => b.id))
    setIsUpdating(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este banner?')) {
      setIsUpdating(true)
      await deleteBanner(id)
      setIsUpdating(false)
    }
  }

  if (localBanners.length === 0) {
    return (
      <div className="border border-dashed border-neutral-300 bg-white px-6 py-14 text-center">
        <p className="text-sm font-bold text-neutral-900">Nenhum banner cadastrado</p>
        <p className="mt-1 text-sm text-neutral-500">
          Use “Novo banner” para publicar o primeiro destaque.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {localBanners.map((banner, index) => (
        <article
          key={banner.id}
          className={`grid gap-4 border border-neutral-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_5rem] lg:grid-cols-[2rem_12rem_4rem_minmax(0,1fr)_auto] lg:items-center ${!banner.is_active ? 'opacity-60' : ''}`}
        >
          {/* Ordenação */}
          <div className="order-4 flex gap-1 sm:col-span-2 lg:order-none lg:col-span-1 lg:flex-col">
            <button
              type="button"
              disabled={index === 0 || isUpdating}
              onClick={() => moveUp(index)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30"
              aria-label={`Mover ${getBannerLabel(banner, index)} para cima`}
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={index === localBanners.length - 1 || isUpdating}
              onClick={() => moveDown(index)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-30"
              aria-label={`Mover ${getBannerLabel(banner, index)} para baixo`}
            >
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Imagem (Preview Desktop) */}
          <div className="relative aspect-[12/5] w-full overflow-hidden bg-neutral-100 lg:h-20 lg:w-48">
            {banner.image_url ? (
              <Image
                src={banner.image_url}
                alt={getBannerLabel(banner, index)}
                fill
                sizes="(min-width: 1024px) 192px, (min-width: 640px) calc(100vw - 10rem), 100vw"
                className="object-cover"
              />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-300" />
            )}
          </div>
          
          {/* Imagem (Preview Mobile) */}
          <div className="relative h-full min-h-20 w-20 overflow-hidden border border-dashed border-neutral-300 bg-neutral-100 sm:w-full lg:h-20 lg:w-16" title="Banner Mobile">
            {banner.mobile_image_url ? (
              <Image
                src={banner.mobile_image_url}
                alt={`${getBannerLabel(banner, index)} para celular`}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full items-center justify-center px-1 text-center text-[10px] text-neutral-400">
                Sem mobile
              </span>
            )}
          </div>

          {/* Dados */}
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <h2 className="truncate text-sm font-extrabold text-neutral-950">
              {getBannerLabel(banner, index)}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] ${banner.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-600'}`}>
                {banner.is_active ? 'ATIVO' : 'INATIVO'}
              </span>
              <span className="bg-neutral-100 px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] text-neutral-600">
                {banner.subtitle === '__secondary__'
                  ? 'INTERMEDIÁRIO'
                  : banner.subtitle === '__institutional__'
                    ? 'INSTITUCIONAL'
                    : 'PRINCIPAL'}
              </span>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onEdit(banner)}
              disabled={isUpdating}
              className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
              aria-label={`Editar ${getBannerLabel(banner, index)}`}
            >
              <Edit className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(banner.id)}
              disabled={isUpdating}
              className="flex h-9 w-9 items-center justify-center rounded-md text-neutral-400 hover:bg-red-50 hover:text-red-600"
              aria-label={`Excluir ${getBannerLabel(banner, index)}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
