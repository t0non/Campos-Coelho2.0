'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowDown,
  ArrowUp,
  CalendarRange,
  Check,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import {
  deleteSeasonalCampaign,
  saveSeasonalCampaign,
  uploadCollectionImage,
} from '@/lib/actions/admin/collections'
import type {
  AdminSeasonalCampaign,
  AdminSeasonalProductOption,
} from '@/types/seasonal-campaign.types'

interface SeasonalCampaignManagerProps {
  campaigns: AdminSeasonalCampaign[]
  products: AdminSeasonalProductOption[]
}

interface CampaignDraft {
  id?: string
  name: string
  slug: string
  description: string
  bannerUrl: string
  isActive: boolean
  productIds: string[]
}

const EMPTY_DRAFT: CampaignDraft = {
  name: '',
  slug: '',
  description: '',
  bannerUrl: '',
  isActive: true,
  productIds: [],
}

function toSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function SeasonalCampaignManager({
  campaigns,
  products,
}: SeasonalCampaignManagerProps) {
  const router = useRouter()
  const [draft, setDraft] = useState<CampaignDraft | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [error, setError] = useState('')

  const productById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  )

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLocaleLowerCase('pt-BR')
    if (!query) return products.slice(0, 80)

    return products
      .filter(
        (product) =>
          product.name.toLocaleLowerCase('pt-BR').includes(query) ||
          product.sku.toLocaleLowerCase('pt-BR').includes(query),
      )
      .slice(0, 80)
  }, [productSearch, products])

  const openNew = () => {
    setDraft({ ...EMPTY_DRAFT })
    setImageFile(null)
    setImagePreview('')
    setProductSearch('')
    setError('')
  }

  const openEdit = (campaign: AdminSeasonalCampaign) => {
    setDraft({
      id: campaign.id,
      name: campaign.name,
      slug: campaign.slug,
      description: campaign.description,
      bannerUrl: campaign.bannerUrl,
      isActive: campaign.isActive,
      productIds: [...campaign.productIds],
    })
    setImageFile(null)
    setImagePreview('')
    setProductSearch('')
    setError('')
  }

  const closeForm = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setDraft(null)
    setImageFile(null)
    setImagePreview('')
    setError('')
  }

  const handleImageChange = (file?: File) => {
    if (!file) return
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const toggleProduct = (productId: string) => {
    if (!draft) return

    const isSelected = draft.productIds.includes(productId)
    if (!isSelected && draft.productIds.length >= 12) {
      setError('Selecione no máximo 12 produtos por campanha.')
      return
    }

    setError('')
    setDraft({
      ...draft,
      productIds: isSelected
        ? draft.productIds.filter((id) => id !== productId)
        : [...draft.productIds, productId],
    })
  }

  const moveProduct = (index: number, direction: -1 | 1) => {
    if (!draft) return
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= draft.productIds.length) return

    const ordered = [...draft.productIds]
    ;[ordered[index], ordered[nextIndex]] = [ordered[nextIndex], ordered[index]]
    setDraft({ ...draft, productIds: ordered })
  }

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!draft) return

    setIsSaving(true)
    setError('')

    try {
      let bannerUrl = draft.bannerUrl

      if (imageFile) {
        const uploadData = new FormData()
        uploadData.append('file', imageFile)
        const uploadResult = await uploadCollectionImage(uploadData)
        if (uploadResult.error) throw new Error(uploadResult.error)
        bannerUrl = uploadResult.url ?? ''
      }

      const result = await saveSeasonalCampaign({
        ...draft,
        bannerUrl,
      })

      if (result.error) throw new Error(result.error)

      closeForm()
      router.refresh()
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Não foi possível salvar a campanha.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (campaign: AdminSeasonalCampaign) => {
    const confirmed = window.confirm(
      `Excluir a campanha “${campaign.name}”? Os produtos não serão excluídos do catálogo.`,
    )
    if (!confirmed) return

    setDeletingId(campaign.id)
    setError('')
    const result = await deleteSeasonalCampaign(campaign.id)

    if (result.error) {
      setError(result.error)
    } else {
      router.refresh()
    }
    setDeletingId('')
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <CalendarRange className="h-6 w-6 text-[#171717]" />
            <h1 className="text-2xl font-black text-gray-950">Campanhas sazonais</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Defina a imagem e os produtos exibidos logo abaixo do banner da página inicial.
          </p>
        </div>

        {!draft && (
          <button
            type="button"
            onClick={openNew}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#171717] px-4 text-sm font-bold text-white transition-colors hover:bg-[#050505]"
          >
            <Plus className="h-4 w-4" />
            Nova campanha
          </button>
        )}
      </div>

      {error && !draft && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {draft ? (
        <form onSubmit={handleSave} className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-950">
                {draft.id ? 'Editar campanha' : 'Nova campanha'}
              </h2>
              <p className="text-xs text-gray-500">
                A ordem escolhida abaixo também será usada na vitrine.
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Fechar formulário"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800">
                Imagem da campanha *
              </label>
              <p className="mb-3 text-xs text-gray-500">
                Proporção recomendada: 1:1 (quadrada), preferencialmente 800 × 800 px,
                em WEBP ou PNG, com o produto centralizado e fundo limpo.
              </p>
              <label className="relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => handleImageChange(event.target.files?.[0])}
                  className="absolute inset-0 z-10 cursor-pointer opacity-0"
                />
                {imagePreview || draft.bannerUrl ? (
                  <Image
                    src={imagePreview || draft.bannerUrl}
                    alt="Prévia da campanha"
                    fill
                    unoptimized={Boolean(imagePreview)}
                    className="object-contain p-4"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center text-gray-400">
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-xs font-semibold">Clique para enviar</span>
                  </div>
                )}
              </label>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold">Nome *</label>
                  <input
                    required
                    value={draft.name}
                    onChange={(event) => {
                      const name = event.target.value
                      setDraft({
                        ...draft,
                        name,
                        slug: draft.slug ? draft.slug : toSlug(name),
                      })
                    }}
                    placeholder="Ex.: Dia dos Pais"
                    className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/15"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold">Identificador</label>
                  <input
                    value={draft.slug}
                    onChange={(event) =>
                      setDraft({ ...draft, slug: toSlug(event.target.value) })
                    }
                    placeholder="dia-dos-pais"
                    className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/15"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Descrição</label>
                <textarea
                  value={draft.description}
                  onChange={(event) =>
                    setDraft({ ...draft, description: event.target.value })
                  }
                  rows={3}
                  maxLength={300}
                  placeholder="Texto interno para identificar a campanha."
                  className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/15"
                />
              </div>

              <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(event) =>
                    setDraft({ ...draft, isActive: event.target.checked })
                  }
                  className="h-4 w-4 accent-[#171717]"
                />
                <span>
                  <span className="block text-sm font-semibold">Campanha ativa</span>
                  <span className="block text-xs text-gray-500">
                    Campanhas inativas não aparecem na página inicial.
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div className="grid gap-6 border-t pt-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-950">Catálogo de produtos</h3>
                  <p className="text-xs text-gray-500">
                    Clique para adicionar ou remover. Máximo de 12 produtos.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#171717]">
                  {draft.productIds.length}/12
                </span>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Buscar por nome ou SKU"
                  className="h-10 w-full rounded-md border border-gray-300 pl-9 pr-3 text-sm outline-none focus:border-[#171717] focus:ring-2 focus:ring-[#171717]/15"
                />
              </div>

              <div className="grid max-h-[430px] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {filteredProducts.map((product) => {
                  const selected = draft.productIds.includes(product.id)
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => toggleProduct(product.id)}
                      className={`flex items-center gap-3 rounded-lg border p-2 text-left transition-colors ${
                        selected
                          ? 'border-[#171717] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-white">
                        <Image
                          src={product.imageUrl}
                          alt=""
                          fill
                          className="object-contain p-1"
                          sizes="48px"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 block text-xs font-semibold text-gray-800">
                          {product.name}
                        </span>
                        <span className="block text-[11px] text-gray-500">{product.sku}</span>
                      </span>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          selected
                            ? 'border-[#171717] bg-[#171717] text-white'
                            : 'border-gray-300 bg-white text-transparent'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-950">Produtos escolhidos</h3>
              <p className="mb-3 text-xs text-gray-500">
                Use as setas para definir a ordem da vitrine.
              </p>

              <div className="space-y-2">
                {draft.productIds.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-xs text-gray-500">
                    Nenhum produto selecionado.
                  </div>
                ) : (
                  draft.productIds.map((productId, index) => {
                    const product = productById.get(productId)
                    if (!product) return null

                    return (
                      <div
                        key={productId}
                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#171717] text-[11px] font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="truncate block text-xs font-semibold">
                            {product.name}
                          </span>
                          <span className="block text-[10px] text-gray-500">{product.sku}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => moveProduct(index, -1)}
                          disabled={index === 0}
                          className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-25"
                          aria-label="Mover produto para cima"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveProduct(index, 1)}
                          disabled={index === draft.productIds.length - 1}
                          className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-25"
                          aria-label="Mover produto para baixo"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleProduct(productId)}
                          className="rounded p-1 text-red-500 hover:bg-red-50"
                          aria-label="Remover produto"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t pt-5">
            <button
              type="button"
              onClick={closeForm}
              disabled={isSaving}
              className="h-10 rounded-md border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="h-10 rounded-md bg-[#171717] px-6 text-sm font-bold text-white hover:bg-[#050505] disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Salvar campanha'}
            </button>
          </div>
        </form>
      ) : campaigns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <CalendarRange className="mx-auto h-10 w-10 text-gray-300" />
          <h2 className="mt-3 font-bold text-gray-900">Nenhuma campanha cadastrada</h2>
          <p className="mt-1 text-sm text-gray-500">
            A página inicial usa exemplos até você cadastrar a primeira campanha.
          </p>
          <button
            type="button"
            onClick={openNew}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-[#171717] px-4 text-sm font-bold text-white hover:bg-[#050505]"
          >
            <Plus className="h-4 w-4" />
            Criar primeira campanha
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((campaign) => (
            <article
              key={campaign.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[16/9] bg-gray-50">
                {campaign.bannerUrl ? (
                  <Image
                    src={campaign.bannerUrl}
                    alt={campaign.name}
                    fill
                    className="object-contain p-4"
                    sizes="(min-width: 1280px) 360px, 50vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-300">
                    <ImagePlus className="h-10 w-10" />
                  </div>
                )}
                <span
                  className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                    campaign.isActive
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {campaign.isActive ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              <div className="p-4">
                <h2 className="font-bold text-gray-950">{campaign.name}</h2>
                <p className="mt-0.5 text-xs text-gray-500">/{campaign.slug}</p>
                <p className="mt-3 text-sm text-gray-600">
                  {campaign.productIds.length} produto
                  {campaign.productIds.length === 1 ? '' : 's'} selecionado
                  {campaign.productIds.length === 1 ? '' : 's'}
                </p>

                <div className="mt-4 flex gap-2 border-t pt-4">
                  <button
                    type="button"
                    onClick={() => openEdit(campaign)}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(campaign)}
                    disabled={deletingId === campaign.id}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-red-200 px-3 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    aria-label={`Excluir ${campaign.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
