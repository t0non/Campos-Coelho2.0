import { siteConfig } from "@/config/site";
import { getSiteUrl, createAbsoluteUrl } from "@/lib/site-url";

export const seoConfig = {
  siteName: siteConfig.businessName,
  alternateName: siteConfig.alternateName,
  defaultTitle: `${siteConfig.businessName} | Salão de Beleza em Santa Efigênia, BH`,
  titleTemplate: `%s | ${siteConfig.businessName}`,
  defaultDescription:
    "Conheça o Shaiff Cabeleireiros, salão de beleza em Santa Efigênia, Belo Horizonte. Consulte os serviços disponíveis e solicite seu atendimento.",
  locale: "pt_BR",
  language: "pt-BR",
  publisher: siteConfig.businessName,
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || undefined,
  },
};

export function getCanonicalUrl(path: string): string | undefined {
  const abs = createAbsoluteUrl(path);
  return abs || undefined;
}
