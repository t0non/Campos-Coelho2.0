import { siteConfig } from "@/config/site";
import { getSiteUrl, createAbsoluteUrl } from "@/lib/site-url";
import { Service } from "@/types/site";

export function getHairSalonId(): string {
  const siteUrl = getSiteUrl();
  return siteUrl ? `${siteUrl}/#hair-salon` : "#hair-salon";
}

export function getWebSiteId(): string {
  const siteUrl = getSiteUrl();
  return siteUrl ? `${siteUrl}/#website` : "#website";
}

// 1. Central HairSalon Entity Schema
export function generateHairSalonSchema() {
  const hairSalonId = getHairSalonId();
  const siteUrl = getSiteUrl();
  const sameAsLinks = [siteConfig.googleBusinessProfile].filter(
    (link) => link && link.trim() !== ""
  );

  const offerCatalogElements = siteConfig.services
    .filter((s) => s.active)
    .map((service) => {
      const serviceUrl = createAbsoluteUrl(`/servicos/${service.slug}`);
      return {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service.name,
          "description": service.shortDescription,
          ...(serviceUrl ? { "url": serviceUrl } : {}),
          "provider": { "@id": hairSalonId },
          "areaServed": ["Santa Efigênia", "Belo Horizonte"],
        },
      };
    });

  return {
    "@type": "HairSalon",
    "@id": hairSalonId,
    "name": siteConfig.businessName,
    "alternateName": siteConfig.alternateName,
    "description": siteConfig.description,
    ...(siteUrl ? { "url": siteUrl } : {}),
    "telephone": siteConfig.telephone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": `${siteConfig.address}, ${siteConfig.building}`,
      "addressLocality": siteConfig.city,
      "addressRegion": siteConfig.state,
      "postalCode": siteConfig.postalCode,
      "addressCountry": "BR",
    },
    "areaServed": [
      {
        "@type": "AdministrativeArea",
        "name": "Santa Efigênia, Belo Horizonte",
      },
      {
        "@type": "City",
        "name": "Belo Horizonte",
      },
    ],
    "sameAs": sameAsLinks,
    "hasMap": siteConfig.googleBusinessProfile,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Serviços do Shaiff Cabeleireiros",
      "itemListElement": offerCatalogElements,
    },
  };
}

// 2. WebSite Entity Schema
export function generateWebSiteSchema() {
  const siteUrl = getSiteUrl();
  const webSiteId = getWebSiteId();
  const hairSalonId = getHairSalonId();

  return {
    "@type": "WebSite",
    "@id": webSiteId,
    ...(siteUrl ? { "url": siteUrl } : {}),
    "name": siteConfig.businessName,
    "alternateName": siteConfig.alternateName,
    "inLanguage": "pt-BR",
    "publisher": { "@id": hairSalonId },
  };
}

// 3. BreadcrumbList Schema
export function generateBreadcrumbSchema(
  items: Array<{ name: string; path?: string }>
) {
  const listElements = items.map((item, index) => {
    const itemUrl = item.path ? createAbsoluteUrl(item.path) : undefined;
    return {
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      ...(itemUrl ? { "item": itemUrl } : {}),
    };
  });

  return {
    "@type": "BreadcrumbList",
    "itemListElement": listElements,
  };
}

// 4. FAQPage Schema
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };
}

// 5. Individual Service Schema
export function generateServiceSchema(service: Service) {
  const hairSalonId = getHairSalonId();
  const serviceUrl = createAbsoluteUrl(`/servicos/${service.slug}`);
  const serviceId = serviceUrl ? `${serviceUrl}/#service` : `#service-${service.slug}`;

  return {
    "@type": "Service",
    "@id": serviceId,
    "name": service.name,
    "description": service.shortDescription,
    ...(serviceUrl ? { "url": serviceUrl } : {}),
    "provider": { "@id": hairSalonId },
    "areaServed": ["Santa Efigênia", "Belo Horizonte"],
    "serviceType": service.name,
    "mainEntityOfPage": serviceUrl || undefined,
  };
}

// Helper to serialize JSON-LD safely
export function serializeJsonLd(graphData: unknown): string {
  return JSON.stringify(graphData).replace(/</g, "\\u003c");
}
