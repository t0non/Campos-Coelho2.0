'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { validateUploadedFile } from '@/lib/security/file-validation'

const safeImageUrlSchema = z
  .string()
  .trim()
  .max(1000)
  .refine((value) => value.startsWith('/') || /^https:\/\//i.test(value), {
    message: 'Use uma imagem interna ou uma URL HTTPS.',
  })

const bannerSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(100),
  subtitle: z.string().trim().max(180).nullable().optional(),
  image_url: safeImageUrlSchema,
  mobile_image_url: safeImageUrlSchema.nullable().optional(),
  link_url: z
    .string()
    .trim()
    .max(500)
    .nullable()
    .optional()
    .refine((value) => !value || value.startsWith('/') || /^https:\/\//i.test(value), {
      message: 'O link deve ser interno ou usar HTTPS.',
    }),
  is_active: z.boolean(),
  position: z.number().int().min(0).max(1000),
})

function bannerStoragePath(url: string | null | undefined) {
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

export async function uploadBannerImage(formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { error: 'Nenhum arquivo enviado' }
  }

  const validation = await validateUploadedFile(file, {
    allowedKinds: ['jpeg', 'png', 'webp'],
    maxBytes: 8 * 1024 * 1024,
  })
  if (!validation.success) return { error: validation.error }

  const fileName = `${crypto.randomUUID()}.${validation.extension}`
  const filePath = `images/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('banners')
    .upload(filePath, validation.bytes, {
      contentType: validation.mimeType,
      cacheControl: '86400',
      upsert: false,
    })

  if (uploadError) {
    console.error('Upload erro:', uploadError)
    return { error: 'Falha ao fazer upload da imagem' }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('banners')
    .getPublicUrl(filePath)

  return { url: publicUrl }
}

export async function saveBanner(data: {
  id?: string
  title: string
  subtitle?: string | null
  image_url: string
  mobile_image_url?: string | null
  link_url?: string | null
  is_active: boolean
  position: number
}) {
  await requireAdmin()
  const parsed = bannerSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados do banner inválidos.' }
  }
  data = parsed.data
  const supabase = createAdminClient()

  if (data.subtitle === '__secondary__') {
    let clearSecondary = supabase
      .from('banners')
      .update({ subtitle: null, updated_at: new Date().toISOString() })
      .eq('subtitle', '__secondary__')

    if (data.id) {
      clearSecondary = clearSecondary.neq('id', data.id)
    }

    const { error: clearError } = await clearSecondary
    if (clearError) return { error: clearError.message }
  }

  if (data.id) {
    const { error } = await supabase
      .from('banners')
      .update({
        title: data.title,
        subtitle: data.subtitle,
        image_url: data.image_url,
        mobile_image_url: data.mobile_image_url,
        link_url: data.link_url,
        is_active: data.is_active,
        position: data.position,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id)
      
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('banners')
      .insert({
        title: data.title,
        subtitle: data.subtitle,
        image_url: data.image_url,
        mobile_image_url: data.mobile_image_url,
        link_url: data.link_url,
        is_active: data.is_active,
        position: data.position
      })
      
    if (error) return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/admin/banners')
  return { success: true }
}

export async function deleteBanner(id: string) {
  await requireAdmin()
  const parsedId = z.string().uuid().safeParse(id)
  if (!parsedId.success) return { error: 'Banner inválido.' }
  const supabase = createAdminClient()
  const { data: banner } = await supabase
    .from('banners')
    .select('image_url, mobile_image_url')
    .eq('id', parsedId.data)
    .maybeSingle()

  const { error } = await supabase
    .from('banners')
    .delete()
    .eq('id', parsedId.data)

  if (error) return { error: error.message }
  const storagePaths = Array.from(
    new Set(
      [banner?.image_url, banner?.mobile_image_url]
        .map(bannerStoragePath)
        .filter((path): path is string => Boolean(path)),
    ),
  )
  if (storagePaths.length) {
    const { error: storageError } = await supabase.storage.from('banners').remove(storagePaths)
    if (storageError) console.error('Falha ao remover arquivos do banner:', storageError.message)
  }

  revalidatePath('/')
  revalidatePath('/admin/banners')
  return { success: true }
}

export async function updateBannerOrder(orderedIds: string[]) {
  await requireAdmin()
  const parsedIds = z.array(z.string().uuid()).max(100).safeParse(orderedIds)
  if (!parsedIds.success || new Set(parsedIds.data).size !== parsedIds.data.length) {
    return { error: 'A ordem dos banners é inválida.' }
  }
  const supabase = createAdminClient()

  // Simple sequential update for the order
  const results = await Promise.all(
    parsedIds.data.map((id, position) =>
      supabase
      .from('banners')
      .update({ position })
      .eq('id', id),
    ),
  )
  if (results.some((result) => result.error)) {
    return { error: 'Não foi possível salvar a ordem completa dos banners.' }
  }

  revalidatePath('/')
  revalidatePath('/admin/banners')
  return { success: true }
}
