import React from "react";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getCanonicalUrl } from "@/config/seo";
import { createAbsoluteUrl } from "@/lib/site-url";
import { generateBreadcrumbSchema, getHairSalonId } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { MapPin, ShieldCheck, HeartHandshake } from "lucide-react";
import { GalleryPreview } from "@/components/sections/GalleryPreview";

export const metadata: Metadata = {
  title: "Sobre o Salão em Santa Efigênia, BH",
  description:
    "Conheça o Shaiff Cabeleireiros, salão de beleza localizado no Condomínio Edifício Angelini Center, em Santa Efigênia, Belo Horizonte.",
  alternates: {
    canonical: getCanonicalUrl("/sobre"),
  },
};

export default function SobrePage() {
  const pageUrl = createAbsoluteUrl("/sobre");

  const aboutPageSchema = {
    "@type": "AboutPage",
    "@id": pageUrl ? `${pageUrl}#about` : "#about",
    ...(pageUrl ? { url: pageUrl } : {}),
    "name": `Sobre | ${siteConfig.businessName}`,
    "description": siteConfig.description,
    "about": { "@id": getHairSalonId() },
    "inLanguage": "pt-BR",
  };

  const breadcrumbsSchema = generateBreadcrumbSchema([
    { name: "Início", path: "/" },
    { name: "Sobre", path: "/sobre" },
  ]);

  const breadcrumbItems = [
    { label: "Início", href: "/" },
    { label: "Sobre" },
  ];

  return (
    <>
      <JsonLd graph={[aboutPageSchema, breadcrumbsSchema]} />

      <Section variant="dark" padding="default">
        <Container size="large">
          <Breadcrumbs items={breadcrumbItems} dark className="mb-4" />

          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-brand-primary font-semibold">
              Conheça o Salão
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold text-brand-champagneLight mt-2 mb-4">
              Sobre o {siteConfig.businessName}
            </h1>
            <p className="text-base sm:text-lg text-brand-champagne/80 max-w-2xl mx-auto leading-relaxed">
              Um espaço voltado para a beleza e o bem-estar no coração do bairro Santa Efigênia, em Belo Horizonte.
            </p>
          </div>
        </Container>
      </Section>

      <Section variant="light" padding="default">
        <Container size="medium">
          <SectionHeading
            title="Atendimento e Estrutura"
            subtitle="Foco na saúde dos cabelos e no atendimento respeitoso a cada cliente."
            align="center"
          />

          <div className="space-y-6 text-brand-bodyText text-base leading-relaxed">
            <p>
              O <strong>{siteConfig.businessName}</strong> (também conhecido como <strong>{siteConfig.alternateName}</strong>) está localizado no Condomínio Edifício Angelini Center, na Rua Padre Rolim, nº 715, no bairro Santa Efigênia em Belo Horizonte.
            </p>
            <p>
              Oferecemos serviços completos de cabeleireiro — como cortes femininos, escova, nutrição e hidratação capilar, selagem e mechas — além de serviços complementares de estética, incluindo depilação feminina, manicure, pedicure e design de sobrancelha.
            </p>
            <p>
              Nossa proposta é reunir múltiplos cuidados em um só endereço, permitindo que nossos clientes realizem seus atendimentos com praticidade, pontualidade e higiene rigorosa.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-brand-surface border border-brand-border/60 rounded-xl text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-brand-muted flex items-center justify-center text-brand-primary mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-brand-heading mb-2">
                Localização Privilegiada
              </h3>
              <p className="text-xs text-brand-bodyText/80 leading-relaxed">
                Situado no Angelini Center, garantindo praticidade de acesso no bairro Santa Efigênia.
              </p>
            </div>

            <div className="p-6 bg-brand-surface border border-brand-border/60 rounded-xl text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-brand-muted flex items-center justify-center text-brand-primary mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-brand-heading mb-2">
                Biossegurança & Higiene
              </h3>
              <p className="text-xs text-brand-bodyText/80 leading-relaxed">
                Procedimentos realizados com materiais esterilizados e padrões rigorosos de higiene.
              </p>
            </div>

            <div className="p-6 bg-brand-surface border border-brand-border/60 rounded-xl text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-brand-muted flex items-center justify-center text-brand-primary mb-4">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-brand-heading mb-2">
                Atendimento Personalizado
              </h3>
              <p className="text-xs text-brand-bodyText/80 leading-relaxed">
                Avaliação cuidadosa das necessidades de cada cabelo e preferências pessoais.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button href="/contato" variant="primary" size="lg">
              Falar com o salão
            </Button>
          </div>
        </Container>
      </Section>

      {/* Galeria do Espaço */}
      <GalleryPreview />
    </>
  );
}
