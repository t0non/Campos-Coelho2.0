'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/auth'

const campaignSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, 'Informe o nome da campanha.').max(80),
  slug: z.string().trim().max(100).optional(),
  description: z.string().trim().max(300).optional(),
  bannerUrl: z.string().trim().min(1, 'Envie a imagem da campanha.'),
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

export async function uploadCollectionImage(formData: FormData) {
  await requireAdmin()

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Selecione uma imagem válida.' }
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Use uma imagem JPG, PNG ou WebP.' }
  }

  if (file.size > 8 * 1024 * 1024) {
    return { error: 'A imagem deve ter no máximo 8 MB.' }
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'png'
  const filePath = `seasonal/${crypto.randomUUID()}.${extension}`
  const supabase = createAdminClient()

  const { error: uploadError } = await supabase.storage
    .from('banners')
    .upload(filePath, file, {
      cacheControl: '3600',
      contentType: file.type,
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
  const { error } = await supabase.from('collections').delete().eq('id', parsedId.data)
  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/admin/campanhas')
  return { success: true }
}
