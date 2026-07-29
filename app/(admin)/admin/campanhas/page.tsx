import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/auth'
import { getProductImageUrl } from '@/lib/utils/storage-url'
import { SeasonalCampaignManager } from '@/components/admin/campaigns/seasonal-campaign-manager'
import type {
  AdminSeasonalCampaign,
  AdminSeasonalProductOption,
} from '@/types/seasonal-campaign.types'

export const dynamic = 'force-dynamic'

export default async function AdminSeasonalCampaignsPage() {
  await requireAdmin()
  const supabase = createAdminClient()

  const [{ data: collectionsData }, { data: productsData }] = await Promise.all([
    supabase
      .from('collections')
      .select(
        `
        id,
        name,
        slug,
        description,
        banner_url,
        is_active,
        updated_at,
        collection_products(product_id, position)
        `,
      )
      .order('updated_at', { ascending: false }),
    supabase
      .from('products')
      .select(
        `
        id,
        sku,
        name,
        product_images(url, is_primary, position)
        `,
      )
      .eq('is_active', true)
      .eq('is_published', true)
      .order('name')
      .limit(300),
  ])

  const campaigns: AdminSeasonalCampaign[] = (collectionsData ?? []).map((collection) => ({
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    description: collection.description ?? '',
    bannerUrl: collection.banner_url ?? '',
    isActive: collection.is_active,
    productIds: [...(collection.collection_products ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((item) => item.product_id),
  }))

  const products: AdminSeasonalProductOption[] = (productsData ?? []).map((product) => {
    const primaryImage = [...(product.product_images ?? [])].sort(
      (a, b) =>
        Number(b.is_primary) - Number(a.is_primary) ||
        (a.position ?? 0) - (b.position ?? 0),
    )[0]

    return {
      id: product.id,
      sku: product.sku,
      name: product.name,
      imageUrl: getProductImageUrl(primaryImage?.url),
    }
  })

  return <SeasonalCampaignManager campaigns={campaigns} products={products} />
}
