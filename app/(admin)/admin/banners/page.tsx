'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BannerList } from '@/components/admin/banners/banner-list'
import { BannerForm } from '@/components/admin/banners/banner-form'
import { Plus } from 'lucide-react'

import { Banner } from '@/types/banner.types'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | undefined>(undefined)

  const fetchBanners = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('banners')
      .select('*')
      .order('position', { ascending: true })
      
    if (data) {
      setBanners(data as Banner[])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const handleAddNew = () => {
    setEditingBanner(undefined)
    setShowForm(true)
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    fetchBanners() // recarrega a lista
  }

  if (isLoading && banners.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl border border-neutral-200 bg-white px-6 py-14 text-center text-sm font-medium text-neutral-500">
        Carregando banners...
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-neutral-400">
            Comunicação visual
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-neutral-950 sm:text-3xl">
            Banners
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
            Gerencie o carrossel principal e os destaques intermediários da loja para
            computador e celular.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Novo banner
          </button>
        )}
      </div>

      {showForm ? (
        <BannerForm 
          initialData={editingBanner} 
          onClose={handleFormClose} 
        />
      ) : (
        <BannerList 
          banners={banners} 
          onEdit={handleEdit} 
        />
      )}
    </div>
  )
}
