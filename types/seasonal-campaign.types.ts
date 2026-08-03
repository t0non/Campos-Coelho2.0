export interface AdminSeasonalCampaign {
  id: string
  name: string
  slug: string
  description: string
  bannerUrl: string
  isActive: boolean
  productIds: string[]
}

export interface AdminSeasonalProductOption {
  id: string
  sku: string
  name: string
  imageUrl: string
}
