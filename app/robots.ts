import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/utils/site-url'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/vendedor/',
        '/minha-conta/',
        '/carrinho',
        '/checkout/',
        '/login',
        '/cadastro',
        '/recuperar-senha',
        '/api/',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
