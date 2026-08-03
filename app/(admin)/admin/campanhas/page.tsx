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

  const { data: collectionsData } = await supabase
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
    .order('updated_at', { ascending: false })

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

  const selectedProductIds = Array.from(
    new Set(campaigns.flatMap((campaign) => campaign.productIds)),
  )

  const productColumns = `
    id,
    sku,
    name,
    product_images(url, is_primary, position)
  `

  const { data: browseProductsData } = await supabase
    .from('products')
    .select(productColumns)
    .eq('is_active', true)
    .eq('is_published', true)
    .order('name')
    .limit(100)

  const { data: selectedProductsData } =
    selectedProductIds.length > 0
      ? await supabase.from('products').select(productColumns).in('id', selectedProductIds)
      : { data: [] }

  function mapProduct(product: {
    id: string
    sku: string
    name: string
    product_images: { url: string; is_primary: boolean; position: number | null }[] | null
  }): AdminSeasonalProductOption {
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
  }

  const productsById = new Map<string, AdminSeasonalProductOption>()
  for (const product of browseProductsData ?? []) {
    productsById.set(product.id, mapProduct(product))
  }
  for (const product of selectedProductsData ?? []) {
    productsById.set(product.id, mapProduct(product))
  }

  const products = Array.from(productsById.values())

  return <SeasonalCampaignManager campaigns={campaigns} products={products} />
}
