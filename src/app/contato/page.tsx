import React from "react";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getCanonicalUrl } from "@/config/seo";
import { createAbsoluteUrl } from "@/lib/site-url";
import { generateBreadcrumbSchema, getHairSalonId } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ContactInformation } from "@/components/contact/ContactInformation";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactProcess } from "@/components/contact/ContactProcess";
import { LocationSection } from "@/components/sections/LocationSection";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { HomeFAQ } from "@/components/sections/HomeFAQ";
import { Phone, MapPin, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contato e Agendamento | Shaiff Cabeleireiros",
  description:
    "Entre em contato com o Shaiff Cabeleireiros em Santa Efigênia, Belo Horizonte, consulte os serviços disponíveis e solicite seu atendimento.",
  alternates: {
    canonical: getCanonicalUrl("/contato"),
  },
};

import { createClient } from "@/lib/supabase/server";
import { isValidActiveCombo } from "@/lib/promotions";

interface ContatoPageProps {
  searchParams: Promise<{
    servico?: string;
    combo?: string;
  }>;
}

export default async function ContatoPage({ searchParams }: ContatoPageProps) {
  const { servico, combo } = await searchParams;

  const validSlugs = siteConfig.services
    .filter((s) => s.active)
    .map((s) => s.slug);
  const validatedSlug = servico && validSlugs.includes(servico) ? servico : undefined;

  let validatedCombo: { title: string; slug: string } | undefined = undefined;

  if (combo) {
    try {
      const supabase = await createClient();
      const nowIso = new Date().toISOString();
      const { data } = await supabase
        .from("promotional_combos")
        .select("*")
        .eq("slug", combo)
        .eq("is_active", true)
        .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
        .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
        .maybeSingle();

      if (data && isValidActiveCombo(data)) {
        validatedCombo = { title: data.title, slug: data.slug };
      }
    } catch {
      validatedCombo = undefined;
    }
  }

  const pageUrl = createAbsoluteUrl("/contato");

  const contactPageSchema = {
    "@type": "ContactPage",
    "@id": pageUrl ? `${pageUrl}#contact` : "#contact",
    ...(pageUrl ? { url: pageUrl } : {}),
    "name": `Contato e Agendamento | ${siteConfig.businessName}`,
    "description":
      "Página de contato para agendamentos e informações do Shaiff Cabeleireiros no bairro Santa Efigênia, Belo Horizonte.",
    "about": { "@id": getHairSalonId() },
    "inLanguage": "pt-BR",
  };

  const breadcrumbsSchema = generateBreadcrumbSchema([
    { name: "Início", path: "/" },
    { name: "Contato", path: "/contato" },
  ]);

  return (
    <>
      <JsonLd graph={[contactPageSchema, breadcrumbsSchema]} />

      {/* 1. Internal Hero */}
      <Section variant="dark" padding="default" className="border-b border-stone-800 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

        <Container size="medium" className="relative z-10 space-y-6">
          <span className="inline-block text-xs uppercase tracking-widest text-brand-primary font-semibold">
            FALE COM O SHAIFF
          </span>

          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold text-brand-champagneLight tracking-tight leading-tight">
            Solicite seu atendimento no Shaiff Cabeleireiros
          </h1>

          <p className="text-base sm:text-lg text-brand-champagne/80 max-w-2xl mx-auto leading-relaxed font-sans">
            Preencha o formulário para informar o serviço que você procura. A equipe do Shaiff verificará a disponibilidade e entrará em contato para confirmar os detalhes do atendimento.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-brand-champagne/90">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800">
              <MapPin className="w-4 h-4 text-brand-primary shrink-0" />
              <span>Santa Efigênia, Belo Horizonte</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800">
              <Clock className="w-4 h-4 text-brand-primary shrink-0" />
              <span>Retorno sujeito à disponibilidade</span>
            </div>
          </div>

          <div className="pt-2 flex justify-center">
            <Button
              href={siteConfig.telephoneHref}
              external
              variant="outline"
              size="md"
              className="border-brand-champagne/40 text-brand-champagne hover:bg-brand-champagne hover:text-brand-darkSurface"
            >
              <Phone className="w-4 h-4 mr-2 text-brand-primary" />
              <span>Ligar agora: {siteConfig.telephone}</span>
            </Button>
          </div>
        </Container>
      </Section>

      {/* 2. Main Contact Form & Information Section */}
      <Section id="formulario" variant="light" padding="default" className="border-b border-brand-border/40">
        <Container size="large">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Contact Information Column */}
            <div className="lg:col-span-5">
              <ContactInformation />
            </div>

            {/* Contact Form Column */}
            <div className="lg:col-span-7">
              <ContactForm 
                preselectedServiceSlug={validatedSlug} 
                preselectedCombo={validatedCombo}
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* 3. Booking Process Steps */}
      <ContactProcess />

      {/* 4. Location Details */}
      <LocationSection />

      {/* 5. Frequently Asked Questions */}
      <HomeFAQ />

      {/* 6. Final Call to Action */}
      <FinalCTA />
    </>
  );
}
