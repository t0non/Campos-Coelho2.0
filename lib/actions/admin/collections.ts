'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/auth'
import { validateUploadedFile } from '@/lib/security/file-validation'

const campaignSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, 'Informe o nome da campanha.').max(80),
  slug: z.string().trim().max(100).optional(),
  description: z.string().trim().max(300).optional(),
  bannerUrl: z
    .string()
    .trim()
    .min(1, 'Envie a imagem da campanha.')
    .max(1000)
    .refine((value) => value.startsWith('/') || /^https:\/\//i.test(value), {
      message: 'Use uma imagem interna ou uma URL HTTPS.',
    }),
  isActive: z.boolean(),
  productIds: z.array(z.string().uuid()).max(12, 'Selecione no máximo 12 produtos.'),
})

function toSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function campaignStoragePath(url: string | null | undefined) {
  if (!url) return null
  try {
    const marker = '/storage/v1/object/public/banners/'
    const pathname = new URL(url).pathname
    const index = pathname.indexOf(marker)
    return index === -1 ? null : decodeURIComponent(pathname.slice(index + marker.length))
  } catch {
    return null
  }
}

export async function uploadCollectionImage(formData: FormData) {
  await requireAdmin()

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Selecione uma imagem válida.' }
  }

  const validation = await validateUploadedFile(file, {
    allowedKinds: ['jpeg', 'png', 'webp'],
    maxBytes: 8 * 1024 * 1024,
  })
  if (!validation.success) return { error: validation.error }

  const filePath = `seasonal/${crypto.randomUUID()}.${validation.extension}`
  const supabase = createAdminClient()

  const { error: uploadError } = await supabase.storage
    .from('banners')
    .upload(filePath, validation.bytes, {
      cacheControl: '86400',
      contentType: validation.mimeType,
      upsert: false,
    })

  if (uploadError) {
    return { error: `Não foi possível enviar a imagem: ${uploadError.message}` }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('banners').getPublicUrl(filePath)

  return { url: publicUrl }
}

export async function saveSeasonalCampaign(input: {
  id?: string
  name: string
  slug?: string
  description?: string
  bannerUrl: string
  isActive: boolean
  productIds: string[]
}) {
  await requireAdmin()

  const parsed = campaignSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const values = parsed.data
  const slug = toSlug(values.slug || values.name)
  if (!slug) return { error: 'Não foi possível gerar o endereço da campanha.' }

  const supabase = createAdminClient()
  let campaignId = values.id

  if (campaignId) {
    const { error } = await supabase
      .from('collections')
      .update({
        name: values.name,
        slug,
        description: values.description || null,
        banner_url: values.bannerUrl,
        is_active: values.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)

    if (error) return { error: error.message }
  } else {
    const { data, error } = await supabase
      .from('collections')
      .insert({
        name: values.name,
        slug,
        description: values.description || null,
        banner_url: values.bannerUrl,
        is_active: values.isActive,
      })
      .select('id')
      .single()

    if (error || !data) return { error: error?.message ?? 'Não foi possível criar a campanha.' }
    campaignId = data.id
  }

  const { error: clearError } = await supabase
    .from('collection_products')
    .delete()
    .eq('collection_id', campaignId)

  if (clearError) return { error: clearError.message }

  if (values.productIds.length > 0) {
    const { error: productsError } = await supabase
      .from('collection_products')
      .insert(
        values.productIds.map((productId, position) => ({
          collection_id: campaignId!,
          product_id: productId,
          position,
        })),
      )

    if (productsError) return { error: productsError.message }
  }

  revalidatePath('/')
  revalidatePath('/admin/campanhas')
  return { success: true, id: campaignId }
}

export async function deleteSeasonalCampaign(id: string) {
  await requireAdmin()

  const parsedId = z.string().uuid().safeParse(id)
  if (!parsedId.success) return { error: 'Campanha inválida.' }

  const supabase = createAdminClient()
  const { data: campaign } = await supabase
    .from('collections')
    .select('banner_url')
    .eq('id', parsedId.data)
    .maybeSingle()
  const { error } = await supabase.from('collections').delete().eq('id', parsedId.data)
  if (error) return { error: error.message }
  const storagePath = campaignStoragePath(campaign?.banner_url)
  if (storagePath) {
    const { error: storageError } = await supabase.storage.from('banners').remove([storagePath])
    if (storageError) console.error('Falha ao remover imagem da campanha:', storageError.message)
  }

  revalidatePath('/')
  revalidatePath('/admin/campanhas')
  return { success: true }
}
