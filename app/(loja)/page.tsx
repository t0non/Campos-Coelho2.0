import type { Metadata } from 'next'
import { serializeJsonLd } from '@/lib/utils/json-ld'

export const dynamic = 'force-dynamic'
import { getAuthContext } from '@/lib/supabase/auth'
import { getHomePageData } from '@/lib/data/home'
import { HeroCarousel } from '@/components/home/hero-carousel'
import { FeaturedCategories } from '@/components/home/featured-categories'
import { ProductShowcase } from '@/components/home/product-showcase'
import { PromotionalBanner } from '@/components/home/promotional-banner'
import { InstitutionalBanners } from '@/components/home/institutional-banners'
import { CampaignGrid } from '@/components/home/campaign-grid'
import { BrandCarousel } from '@/components/home/brand-carousel'
import { BusinessRegistrationCTA } from '@/components/home/business-registration-cta'
import { InstitutionalSection } from '@/components/home/institutional-section'
import { getSiteUrl } from '@/lib/utils/site-url'
import {
  COMPANY_GOOGLE_PROFILE_URL,
  COMPANY_PHONE_DISPLAY,
} from '@/lib/config/contact'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: 'Campos & Coelho Atacado | Produtos para revenda B2B',
  description:
    'Encontre produtos para revenda, utilidades domésticas, brinquedos, cadastre seu CNPJ e consulte condições comerciais exclusivas.',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'Campos & Coelho Atacado | Plataforma de Atacado B2B',
    description:
      'Variedade para o seu negócio crescer. Cadastre seu CNPJ e acesse os preços de atacado.',
    url: siteUrl,
    siteName: 'Campos & Coelho Atacado',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default async function HomePage() {
  // Resolve contexto de autenticação no servidor
  const authContext = await getAuthContext()

  // Consome camada de abstração de dados (prepara substituição por Supabase real no futuro)
  const homeData = await getHomePageData(authContext)

  // Structured Data (Schema.org) para SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Campos & Coelho Atacado',
        url: siteUrl,
        logo: `${siteUrl}/logo_campos_coelho.png`,
        description: 'Distribuidora de produtos no atacado para lojistas e empresas.',
        telephone: COMPANY_PHONE_DISPLAY,
        sameAs: [COMPANY_GOOGLE_PROFILE_URL],
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Av. Dr. Cristiano Guimarães, 975',
          addressLocality: 'Belo Horizonte',
          addressRegion: 'MG',
          postalCode: '31720-300',
          addressCountry: 'BR',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Campos & Coelho Atacado',
        publisher: { '@id': `${siteUrl}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${siteUrl}/catalogo?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <div className="flex flex-col min-h-screen">
        {/* 1. Hero principal em carrossel */}
        <HeroCarousel banners={homeData.heroBanners} />

        {/* 2. Campanhas sazonais */}
        <CampaignGrid
          collections={homeData.collections}
          canViewPrices={homeData.canViewPrices}
        />

        {/* 3. Categorias em destaque */}
        <FeaturedCategories categories={homeData.featuredCategories} />

        {/* 4. Uma vitrine para cada categoria ativa */}
        {homeData.categoryShowcases.map((category) => (
          <ProductShowcase
            key={category.id}
            title={category.name}
            href={`/catalogo?cat=${category.slug}`}
            products={category.products}
            canViewPrices={homeData.canViewPrices}
          />
        ))}

        {/* 5. Vitrine de lançamentos */}
        <ProductShowcase
          title="Lançamentos"
          products={homeData.newArrivals}
          canViewPrices={homeData.canViewPrices}
        />

        {/* 6. Banner promocional intermediário */}
        <PromotionalBanner banner={homeData.secondaryBanner} />

        {/* 7. Vitrine de mais vendidos */}
        <ProductShowcase
          title="Mais Vendidos"
          products={homeData.bestSellers}
          canViewPrices={homeData.canViewPrices}
        />

        {/* 8. Marcas parceiras */}
        <BrandCarousel brands={homeData.brands} />

        {/* 9. Vitrine de oportunidades */}
        <ProductShowcase
          title="Oportunidades da Semana"
          products={homeData.weeklyOpportunities}
          canViewPrices={homeData.canViewPrices}
        />

        {/* 10. Banners institucionais de atendimento e localização */}
        <InstitutionalBanners banners={homeData.institutionalBanners} />

        {/* 11. Chamada para cadastro empresarial */}
        <BusinessRegistrationCTA />

        {/* 12. Conteúdo institucional */}
        <InstitutionalSection />
      </div>
    </>
  )
}
