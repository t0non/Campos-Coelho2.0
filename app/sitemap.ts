import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSiteUrl } from '@/lib/utils/site-url'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/catalogo`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/privacidade`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/politica-de-privacidade`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/termos-de-uso`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  try {
    const supabase = createAdminClient()
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('is_active', true)
      .eq('is_published', true)
      .limit(50000)

    return [
      ...staticRoutes,
      ...(products ?? []).map((product) => ({
        url: `${siteUrl}/produto/${product.slug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    ]
  } catch (error) {
    console.error('[sitemap] Não foi possível listar os produtos:', error)
    return staticRoutes
  }
}
