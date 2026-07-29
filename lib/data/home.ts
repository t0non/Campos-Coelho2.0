import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'
import type { AuthContext } from '@/types/auth.types'
import type { CatalogProduct, PriceInfo } from '@/types/product.types'
import { getProductImageUrl } from '@/lib/utils/storage-url'
import {
  getCategoryProductFallbackImage,
  withCategoryProductFallback,
} from '@/lib/catalog/product-image-fallback'

export interface HeroBannerItem {
  id: string
  title: string
  subtitle: string
  description: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  desktopImage: string
  mobileImage: string
  theme: 'dark' | 'light'
}

export interface SecondaryBannerItem {
  id: string
  title: string
  imageUrl: string
  mobileImageUrl: string
  href: string
}

export interface BenefitItem {
  id: string
  title: string
  description: string
  iconName: 'Truck' | 'Building2' | 'Boxes' | 'Headset'
}

export interface CategoryCardData {
  id: string
  name: string
  slug: string
  itemCount: number
  imageUrl: string
  badgeText?: string
}

export interface BrandItem {
  id: string
  name: string
  slug: string
  initials: string
  category: string
  logoUrl: string
  logoBackground?: string
}

export interface TestimonialItem {
  id: string
  name: string
  role: string
  company: string
  city: string
  state: string
  text: string
  rating: number
  isMockNotice?: boolean
}

export interface CollectionCampaign {
  id: string
  title: string
  slug: string
  description: string
  itemCount: number
  imageUrl: string
  ctaLabel: string
  badge?: string
  bgClass?: string
  products: CatalogProduct[]
}

export interface HomePageData {
  heroBanners: HeroBannerItem[]
  secondaryBanner: SecondaryBannerItem | null
  benefits: BenefitItem[]
  featuredCategories: CategoryCardData[]
  newArrivals: CatalogProduct[]
  bestSellers: CatalogProduct[]
  weeklyOpportunities: CatalogProduct[]
  collections: CollectionCampaign[]
  brands: BrandItem[]
  testimonials: TestimonialItem[]
  metrics: { label: string; value: string; hint: string }[]
  canViewPrices: boolean
  userStatus: 'visitor' | 'pending' | 'approved' | 'rejected' | 'suspended'
}

const SEASONAL_IMAGE_MAP: Record<string, string> = {
  'festa-junina': '/images/seasonal/festa-junina.png',
  inverno: '/images/seasonal/inverno.png',
  'dia-dos-pais': '/images/seasonal/dia-dos-pais.png',
  natal: '/images/seasonal/natal.png',
}

function getStoreBannerHref(value: string | null | undefined) {
  if (!value) return '/catalogo'
  if (value.startsWith('/')) return value

  try {
    const url = new URL(value)
    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname)) {
      return `${url.pathname}${url.search}${url.hash}` || '/catalogo'
    }

    return url.protocol === 'https:' ? url.toString() : '/catalogo'
  } catch {
    return '/catalogo'
  }
}

function getStoreBannerTitle(value: string | null | undefined, index: number) {
  const title = value?.trim()
  if (title && !/^https?:\/\//i.test(title)) return title

  return index === 0 ? 'Campos & Coelho Atacado' : `Destaque Campos & Coelho ${index + 1}`
}

const DEFAULT_SEASONAL_COLLECTIONS: CollectionCampaign[] = [
  {
    id: 'seasonal-festa-junina',
    title: 'Festa Junina',
    slug: 'festa-junina',
    description: 'Itens temáticos para as festas de junho.',
    itemCount: 0,
    imageUrl: SEASONAL_IMAGE_MAP['festa-junina'],
    ctaLabel: 'Ver produtos',
    badge: 'Temporada',
    products: [],
  },
  {
    id: 'seasonal-inverno',
    title: 'Inverno',
    slug: 'inverno',
    description: 'Produtos para os dias mais frios.',
    itemCount: 0,
    imageUrl: SEASONAL_IMAGE_MAP.inverno,
    ctaLabel: 'Ver produtos',
    badge: 'Temporada',
    products: [],
  },
  {
    id: 'seasonal-dia-dos-pais',
    title: 'Dia dos Pais',
    slug: 'dia-dos-pais',
    description: 'Sugestões de presentes para os pais.',
    itemCount: 0,
    imageUrl: SEASONAL_IMAGE_MAP['dia-dos-pais'],
    ctaLabel: 'Ver produtos',
    badge: 'Temporada',
    products: [],
  },
  {
    id: 'seasonal-natal',
    title: 'Natal',
    slug: 'natal',
    description: 'Decoração, presentes e utilidades natalinas.',
    itemCount: 0,
    imageUrl: SEASONAL_IMAGE_MAP.natal,
    ctaLabel: 'Ver produtos',
    badge: 'Temporada',
    products: [],
  },
]

/**
 * Camada de dados real para a Home Page (Supabase remoto).
 */
export async function getHomePageData(authContext: AuthContext): Promise<HomePageData> {
  const canViewPrices = Boolean(authContext?.canViewPrices)
  const userStatus = authContext?.company?.status ?? (authContext?.user ? 'pending' : 'visitor')
  const supabase = await createClient()

  // 1. Categorias Ativas no Supabase
  const { data: dbCategoriesData } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')

  const dbCategories = (dbCategoriesData ?? []) as Array<{ id: string; name: string; slug: string }>

  const featuredCategories: CategoryCardData[] = dbCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    itemCount: 0,
    imageUrl: getCategoryProductFallbackImage(c.slug),
  }))

  // 2. Marcas Ativas no Supabase (As 20 mais famosas)
  const { data: dbBrandsData } = await supabase
    .from('brands')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')

  const dbBrands = (dbBrandsData ?? []) as Array<{ id: string; name: string; slug: string }>

  const BRAND_CATEGORIES: Record<string, string> = {
    'PLASUTIL': 'Utilidades Plásticas',
    'ARQPLAST': 'Móveis & Organizadores',
    'JAGUAR': 'Plásticos & Lar',
    'BANDEIRANTES': 'Brinquedos & Lazer',
    'RISCHIOTO': 'Utilidades & Lar',
    'PLASMONT': 'Plásticos & Bazar',
    'PLASNEW': 'Utilidades Domésticas',
    'STARTOOLS': 'Ferramentas & Ferragens',
    'ORIGINAL LINE': 'Bazar & Cozinha',
    'SAO BERNARDO': 'Caixas Organizadoras',
    'ERCAPLAST': 'Plásticos & Organizadores',
    'VASO BELLO': 'Jardinagem & Decoração',
    'METALTRU': 'Aramados & Organização',
    'STOLF': 'Utensílios de Madeira',
    'KEITA': 'Utensílios de Cozinha',
    'PLAST LEO': 'Proteção & Lar',
    'MAXXIMO': 'Bazar & Utilidades',
    'LIG BRINK': 'Brinquedos & Infantil',
    'GOYAMA': 'Potes & Utilidades',
    'AMIGOLD': 'Utilidades & Presentes',
  }

  const BRAND_LOGOS: Record<
    string,
    { url: string; background?: string }
  > = {
    AMIGOLD: { url: '/logo_Amigold.svg' },
    ARQPLAST: { url: '/logo_Arqplast.png', background: '#111111' },
    BANDEIRANTE: { url: '/logo_Bandeirante.png' },
    BANDEIRANTES: { url: '/logo_Bandeirante.png' },
    ERCAPLAST: { url: '/logo_Ercaplast.png' },
    JAGUAR: { url: '/Jaguar_logo.png' },
    MAXXIMO: { url: '/logo_Maxximo.svg' },
    METALTRU: { url: '/logo_Metaltru.png' },
    'ORIGINAL LINE': { url: '/logo_originalline.png' },
    PLASUTIL: { url: '/logo_Plasútil.png' },
    STOLF: { url: '/logo_stolf.png' },
    'VASO BELLO': { url: '/logo_vasobello.png', background: '#111111' },
  }

  const normalizeBrandName = (name: string) =>
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim()

  const brands: BrandItem[] = dbBrands.flatMap((b) => {
    const normalizedName = normalizeBrandName(b.name)
    const logo = BRAND_LOGOS[normalizedName]
    if (!logo) return []

    return [
      {
        id: b.id,
        name: b.name,
        slug: b.slug,
        initials: b.name.slice(0, 2).toUpperCase(),
        category: BRAND_CATEGORIES[normalizedName] || 'Atacado B2B',
        logoUrl: logo.url,
        logoBackground: logo.background,
      },
    ]
  })

  // Helper para buscar produtos e transformar
  async function fetchProductsGroup(
    conditionColumn?: string,
    conditionValue?: boolean,
    selectedIds?: string[],
  ): Promise<CatalogProduct[]> {
    let query = supabase
      .from('products')
      .select(
        `
        id,
        sku,
        name,
        slug,
        unit,
        min_quantity,
        multiple_quantity,
        category_id,
        brand_id,
        categories!category_id (id, name, slug, is_active),
        brands!brand_id (id, name, slug, is_active),
        product_images (url, is_primary, position),
        product_variants (id, is_active)
        `,
      )
      .eq('is_active', true)
      .eq('is_published', true)
      .limit(selectedIds?.length ? Math.min(selectedIds.length, 12) : 6)

    if (conditionColumn && conditionValue !== undefined) {
      query = query.eq(conditionColumn, conditionValue)
    }

    if (selectedIds?.length) {
      query = query.in('id', selectedIds)
    }

    const { data } = await query
    const rawProds = (data ?? []) as unknown as Array<{
      id: string
      sku: string
      name: string
      slug: string
      unit: string
      min_quantity: number
      multiple_quantity: number | null
      categories: { id: string; name: string; slug: string; is_active: boolean } | null
      brands: { id: string; name: string; slug: string; is_active: boolean } | null
      product_images: Array<{ url: string; is_primary: boolean; position: number }> | null
      product_variants: Array<{ id: string; is_active: boolean }> | null
    }>

    const products = await Promise.all(
      rawProds.map(async (p) => {
        const uploadedImages = (p.product_images ?? [])
          .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || (a.position ?? 0) - (b.position ?? 0))
          .map((img) => getProductImageUrl(img.url))
        const images = withCategoryProductFallback(uploadedImages, p.categories?.slug)

        const primaryVar = (p.product_variants ?? []).find((v) => v.is_active)
        let priceInfo: PriceInfo | undefined = undefined

        if (canViewPrices && primaryVar?.id) {
          const { data: pr } = (await (supabase.rpc as any)('get_effective_price_for_session', { p_variant_id: primaryVar.id })) as {
            data: Array<{ unit_price: number; promotional_price: number | null; effective_price: number; is_on_promotion: boolean }> | null
          }
          if (pr && pr.length > 0) {
            priceInfo = {
              unit_price: pr[0].unit_price,
              promotional_price: pr[0].promotional_price,
              effective_price: pr[0].effective_price,
              is_on_promotion: pr[0].is_on_promotion,
            }
          }
        }

        return {
          id: p.id,
          sku: p.sku,
          name: p.name,
          slug: p.slug,
          primary_variant_id: primaryVar?.id ?? null,
          images,
          unit: p.unit,
          min_quantity: p.min_quantity,
          multiple_quantity: p.multiple_quantity ?? 1,
          category: p.categories && p.categories.is_active ? { id: p.categories.id, name: p.categories.name, slug: p.categories.slug } : null,
          brand: p.brands && p.brands.is_active ? { id: p.brands.id, name: p.brands.name, slug: p.brands.slug } : null,
          price: priceInfo,
        }
      }),
    )

    if (selectedIds?.length) {
      const positionById = new Map(selectedIds.map((id, index) => [id, index]))
      products.sort(
        (a, b) =>
          (positionById.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
          (positionById.get(b.id) ?? Number.MAX_SAFE_INTEGER),
      )
    }

    return products
  }

  const [newArrivals, bestSellers, weeklyOpportunities] = await Promise.all([
    fetchProductsGroup('is_new_arrival', true),
    fetchProductsGroup('is_featured', true),
    fetchProductsGroup(),
  ])

  const { data: dbBannersData } = await supabase
    .from('banners')
    .select('*')
    .eq('is_active', true)
    .order('position', { ascending: true })

  const dbBanners = dbBannersData ?? []
  const secondaryBannerRow = dbBanners.find(
    (banner) => banner.subtitle === '__secondary__',
  )
  const heroBannerRows = dbBanners.filter(
    (banner) => banner.subtitle !== '__secondary__',
  )

  const heroBanners: HeroBannerItem[] = heroBannerRows.length > 0 
    ? heroBannerRows.map((b, index) => ({
        id: b.id,
        title: getStoreBannerTitle(b.title, index),
        subtitle: b.subtitle || '',
        description: '',
        primaryCta: {
          label: b.link_url ? 'Saiba Mais' : 'Explorar Catálogo',
          href: getStoreBannerHref(b.link_url),
        },
        desktopImage: b.image_url,
        mobileImage: b.mobile_image_url || b.image_url,
        theme: 'dark',
      })) 
    : [
        {
          id: 'banner-1',
          title: 'Soluções Completas em Atacado B2B',
          subtitle: 'CONDIÇÕES ESPECIAIS B2B',
          description: 'Compre direto da distribuidora com preços exclusivos por tabela comercial e condições de pagamento flexíveis.',
          primaryCta: { label: 'Explorar Catálogo Real', href: '/catalogo' },
          desktopImage: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=1200&auto=format&fit=crop',
          mobileImage: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=600&auto=format&fit=crop',
          theme: 'dark',
        },
      ]

  const secondaryBanner: SecondaryBannerItem | null = secondaryBannerRow
    ? {
        id: secondaryBannerRow.id,
        title: getStoreBannerTitle(secondaryBannerRow.title, 0),
        imageUrl: secondaryBannerRow.image_url,
        mobileImageUrl:
          secondaryBannerRow.mobile_image_url || secondaryBannerRow.image_url,
        href: getStoreBannerHref(secondaryBannerRow.link_url),
      }
    : null

  const { data: dbCollectionsData } = await supabase
    .from('collections')
    .select(
      `
      id,
      name,
      slug,
      description,
      banner_url,
      collection_products(product_id, position)
      `,
    )
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(4)

  const dbCollections = (dbCollectionsData ?? []) as Array<{
    id: string
    name: string
    slug: string
    description: string | null
    banner_url: string | null
    collection_products: Array<{ product_id: string; position: number }> | null
  }>

  const collections: CollectionCampaign[] =
    dbCollections.length > 0
      ? await Promise.all(
          dbCollections.map(async (collection) => {
            const productIds = [...(collection.collection_products ?? [])]
              .sort((a, b) => a.position - b.position)
              .map((item) => item.product_id)
              .slice(0, 12)

            return {
              id: collection.id,
              title: collection.name,
              slug: collection.slug,
              description: collection.description ?? '',
              itemCount: productIds.length,
              imageUrl:
                collection.banner_url ??
                SEASONAL_IMAGE_MAP[collection.slug] ??
                '/placeholder-category.png',
              ctaLabel: 'Ver produtos',
              badge: 'Temporada',
              products: await fetchProductsGroup(undefined, undefined, productIds),
            }
          }),
        )
      : DEFAULT_SEASONAL_COLLECTIONS.map((collection, index) => ({
          ...collection,
          products:
            index === 0
              ? newArrivals
              : index === 1
                ? bestSellers
                : index === 2
                  ? weeklyOpportunities
                  : newArrivals,
          itemCount:
            index === 0
              ? newArrivals.length
              : index === 1
                ? bestSellers.length
                : index === 2
                  ? weeklyOpportunities.length
                  : newArrivals.length,
        }))

  const benefits: BenefitItem[] = [
    { id: 'b-1', title: 'Faturamento B2B', description: 'Boleto bancário e crédito para empresas cadastradas', iconName: 'Boxes' },
    { id: 'b-2', title: 'Entrega para Todo o Brasil', description: 'Logística integrada e transportadoras parceiras', iconName: 'Truck' },
    { id: 'b-3', title: 'Atendimento Especializado', description: 'Vendedores dedicados para o seu segmento', iconName: 'Headset' },
  ]

  return {
    heroBanners,
    secondaryBanner,
    benefits,
    featuredCategories,
    newArrivals,
    bestSellers,
    weeklyOpportunities,
    collections,
    brands,
    testimonials: [],
    metrics: [
      { label: 'Produtos no Catálogo', value: '+5.000', hint: 'Variedade para o seu estoque' },
      { label: 'Categorias Comerciais', value: '+100', hint: 'Segmentos variados' },
      { label: 'Entrega Nacional', value: '100%', hint: 'Logística para todo o Brasil' },
      { label: 'Atendimento B2B', value: 'Dedicado', hint: 'Suporte na montagem do pedido' },
    ],
    canViewPrices,
    userStatus,
  }
}
