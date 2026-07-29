import React from "react";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getCanonicalUrl } from "@/config/seo";
import { createAbsoluteUrl } from "@/lib/site-url";
import { generateBreadcrumbSchema, getHairSalonId } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

import { LocationSection } from "@/components/sections/LocationSection";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { ArrowRight, HelpCircle, MessageCircle, CalendarCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Serviços em Santa Efigênia, BH",
  description:
    "Conheça os serviços do Shaiff Cabeleireiros em Santa Efigênia, Belo Horizonte: cortes, escova, hidratação, selagem, mechas, depilação, manicure, pedicure e sobrancelhas.",
  alternates: {
    canonical: getCanonicalUrl("/servicos"),
  },
};

export default function ServicosPage() {
  const pageUrl = createAbsoluteUrl("/servicos");

  const collectionPageSchema = {
    "@type": "CollectionPage",
    "@id": pageUrl ? `${pageUrl}#collection` : "#collection",
    ...(pageUrl ? { url: pageUrl } : {}),
    "name": `Serviços | ${siteConfig.businessName}`,
    "description":
      "Catálogo de serviços de cabelo e beleza oferecidos pelo Shaiff Cabeleireiros no bairro Santa Efigênia em Belo Horizonte.",
    "about": { "@id": getHairSalonId() },
    "inLanguage": "pt-BR",
  };

  const itemListSchema = {
    "@type": "ItemList",
    "name": "Lista de Serviços do Shaiff Cabeleireiros",
    "itemListElement": siteConfig.services
      .filter((s) => s.active)
      .map((s, index) => {
        const sUrl = createAbsoluteUrl(`/servicos/${s.slug}`);
        return {
          "@type": "ListItem",
          "position": index + 1,
          "name": s.name,
          "description": s.shortDescription,
          ...(sUrl ? { "url": sUrl } : {}),
        };
      }),
  };

  const breadcrumbsSchema = generateBreadcrumbSchema([
    { name: "Início", path: "/" },
    { name: "Serviços", path: "/servicos" },
  ]);

  return (
    <>
      <JsonLd graph={[collectionPageSchema, itemListSchema, breadcrumbsSchema]} />

      {/* 1. Internal Hero */}
      <Section variant="dark" padding="default" className="border-b border-stone-800 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

        <Container size="medium" className="relative z-10 space-y-6">
          <span className="inline-block text-xs uppercase tracking-widest text-brand-primary font-semibold">
            SERVIÇOS DO SHAIFF
          </span>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold text-brand-champagneLight tracking-tight leading-tight">
            Cuidados para cabelos e beleza em Santa Efigênia
          </h1>

          <p className="text-base sm:text-lg text-brand-champagne/80 max-w-2xl mx-auto leading-relaxed">
            O Shaiff Cabeleireiros reúne diferentes serviços para cuidar dos cabelos, unhas, sobrancelhas e da sua rotina de beleza em um único endereço, em Santa Efigênia, Belo Horizonte.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Button href="#lista-de-servicos" variant="primary" size="lg">
              Ver serviços
            </Button>
            <Button href="/contato" variant="outline" size="lg" className="border-brand-champagne/40 text-brand-champagne hover:bg-brand-champagne hover:text-brand-darkSurface">
              Solicitar agendamento
            </Button>
          </div>

          <p className="text-xs text-brand-champagne/60 font-mono pt-2">
            R. Padre Rolim, 715, Santa Efigênia, Belo Horizonte.
          </p>
        </Container>
      </Section>

      {/* 2. Services Catalogue Grid */}
      <Section id="lista-de-servicos" variant="light" padding="default" className="border-b border-brand-border/40">
        <Container size="large">
          <SectionHeading
            title="Conheça os serviços disponíveis"
            subtitle="Selecione um serviço para conhecer seus principais cuidados, informações e formas de solicitar um horário."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {siteConfig.services.map((service) => (
              <div
                key={service.id}
                id={service.slug}
                className="bg-brand-surface p-6 rounded-xl border border-brand-border/70 shadow-sm flex flex-col justify-between hover:border-brand-primary/60 hover:shadow-md transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-brand-muted flex items-center justify-center text-brand-primary group-hover:scale-105 transition-transform duration-200">
                      <ServiceIcon name={service.icon} />
                    </div>
                    {service.featured && (
                      <span className="text-[10px] uppercase font-semibold text-brand-primary bg-brand-muted px-2 py-0.5 rounded">
                        Destaque
                      </span>
                    )}
                  </div>

                  <h2 className="font-heading text-xl font-semibold text-brand-heading mb-2">
                    {service.name}
                  </h2>

                  <p className="text-xs sm:text-sm text-brand-bodyText/80 leading-relaxed mb-6">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-border/40">
                  <Button
                    href={`/servicos/${service.slug}`}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs justify-between group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary transition-colors"
                  >
                    <span>Conhecer o serviço</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 3. How to Choose Service Section */}
      <Section variant="muted" padding="default" className="border-b border-brand-border/40">
        <Container size="large">
          <SectionHeading
            title="Não sabe qual serviço escolher?"
            subtitle="Cada cabelo e cada necessidade podem pedir cuidados diferentes. Entre em contato com o Shaiff, explique o que você procura e consulte a disponibilidade do atendimento mais adequado."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-brand-surface p-6 rounded-xl border border-brand-border/70 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-brand-muted flex items-center justify-center text-brand-primary">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-brand-heading">
                Conte o que você procura
              </h3>
              <p className="text-xs sm:text-sm text-brand-bodyText/80 leading-relaxed">
                Explique qual resultado, cuidado ou serviço deseja realizar no salão.
              </p>
            </div>

            <div className="bg-brand-surface p-6 rounded-xl border border-brand-border/70 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-brand-muted flex items-center justify-center text-brand-primary">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-brand-heading">
                Tire suas dúvidas
              </h3>
              <p className="text-xs sm:text-sm text-brand-bodyText/80 leading-relaxed">
                Consulte informações sobre o atendimento antes de confirmar seu horário.
              </p>
            </div>

            <div className="bg-brand-surface p-6 rounded-xl border border-brand-border/70 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-brand-muted flex items-center justify-center text-brand-primary">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-brand-heading">
                Verifique a disponibilidade
              </h3>
              <p className="text-xs sm:text-sm text-brand-bodyText/80 leading-relaxed">
                A equipe informa os horários disponíveis para o serviço escolhido.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Button href="/contato" variant="primary" size="lg">
              Falar com o Shaiff
            </Button>
          </div>
        </Container>
      </Section>

      {/* 4. Location */}
      <LocationSection />

      {/* 5. Final CTA */}
      <FinalCTA />
    </>
  );
}
