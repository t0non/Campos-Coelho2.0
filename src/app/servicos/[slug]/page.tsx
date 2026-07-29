import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { getCanonicalUrl } from "@/config/seo";
import { createAbsoluteUrl } from "@/lib/site-url";
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateServiceSchema,
  getHairSalonId,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

import { ServiceHero } from "@/components/services/ServiceHero";
import { ServiceBenefits } from "@/components/services/ServiceBenefits";
import { ServiceProcess } from "@/components/services/ServiceProcess";
import { ServiceSuitableFor } from "@/components/services/ServiceSuitableFor";
import { ServiceConsiderations } from "@/components/services/ServiceConsiderations";
import { RelatedServices } from "@/components/services/RelatedServices";
import { ServiceFAQ } from "@/components/services/ServiceFAQ";
import { ServiceCTA } from "@/components/services/ServiceCTA";
import { LocationSection } from "@/components/sections/LocationSection";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

interface ServicePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return siteConfig.services
    .filter((service) => service.active)
    .map((service) => ({
      slug: service.slug,
    }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = siteConfig.services.find(
    (s) => s.slug === slug && s.active
  );

  if (!service) {
    return {
      title: "Serviço não encontrado",
    };
  }

  return {
    title: service.metadataTitle,
    description: service.metadataDescription,
    keywords: [
      service.primaryKeyword,
      ...service.secondaryKeywords,
      "Shaiff Cabeleireiros",
      "Santa Efigênia BH",
    ],
    alternates: {
      canonical: getCanonicalUrl(`/servicos/${service.slug}`),
    },
    openGraph: {
      title: service.metadataTitle,
      description: service.metadataDescription,
      locale: "pt_BR",
      type: "article",
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = siteConfig.services.find(
    (s) => s.slug === slug && s.active
  );

  if (!service) {
    notFound();
  }

  const pageUrl = createAbsoluteUrl(`/servicos/${service.slug}`);

  const webPageSchema = {
    "@type": "WebPage",
    "@id": pageUrl ? `${pageUrl}#webpage` : "#webpage",
    ...(pageUrl ? { url: pageUrl } : {}),
    "name": service.metadataTitle,
    "description": service.metadataDescription,
    "about": { "@id": getHairSalonId() },
    "inLanguage": "pt-BR",
  };

  const serviceSchema = generateServiceSchema(service);

  const breadcrumbsSchema = generateBreadcrumbSchema([
    { name: "Início", path: "/" },
    { name: "Serviços", path: "/servicos" },
    { name: service.name, path: `/servicos/${service.slug}` },
  ]);

  const faqSchema = generateFAQSchema(service.frequentlyAskedQuestions);

  return (
    <>
      <JsonLd graph={[webPageSchema, serviceSchema, breadcrumbsSchema, faqSchema]} />

      {/* 1. Hero with Breadcrumbs, H1 and Direct AI Answer */}
      <ServiceHero service={service} />

      {/* 2. Benefits */}
      <ServiceBenefits benefits={service.benefits} serviceName={service.name} />

      {/* 3. Process / How it works */}
      <ServiceProcess steps={service.howItWorks} serviceName={service.name} />

      {/* 4. Suitable For */}
      <ServiceSuitableFor suitableFor={service.suitableFor} serviceName={service.name} />

      {/* 5. Important Considerations */}
      <ServiceConsiderations considerations={service.considerations} />

      {/* 6. Image Placeholder section */}
      <Section variant="light" padding="small" className="border-b border-brand-border/40">
        <Container size="medium">
          <ImagePlaceholder
            imagePath={service.image}
            serviceName={service.name}
            aspectRatio="video"
          />
        </Container>
      </Section>

      {/* 7. Related Services */}
      <RelatedServices relatedSlugs={service.relatedSlugs} />

      {/* 8. Local Location Section */}
      <LocationSection />

      {/* 9. FAQs */}
      <ServiceFAQ faqs={service.frequentlyAskedQuestions} serviceName={service.name} />

      {/* 10. Final CTA */}
      <ServiceCTA service={service} />
    </>
  );
}
