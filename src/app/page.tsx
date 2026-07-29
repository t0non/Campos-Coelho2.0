import React from "react";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getCanonicalUrl } from "@/config/seo";
import { generateFAQSchema, getHairSalonId, generateHairSalonSchema, generateWebSiteSchema } from "@/lib/schema";
import { createAbsoluteUrl } from "@/lib/site-url";
import { JsonLd } from "@/components/seo/JsonLd";

import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { FeaturedServices } from "@/components/sections/FeaturedServices";
import { AboutPreview } from "@/components/sections/AboutPreview";
import { Differentials } from "@/components/sections/Differentials";
import { ServicesOverview } from "@/components/sections/ServicesOverview";
import { PromotionalCombos } from "@/components/sections/PromotionalCombos";
import { GalleryPreview } from "@/components/sections/GalleryPreview";
import { Testimonials } from "@/components/sections/Testimonials";
import { BookingSteps } from "@/components/sections/BookingSteps";
import { LocationSection } from "@/components/sections/LocationSection";
import { HomeFAQ } from "@/components/sections/HomeFAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { QuickContact } from "@/components/sections/QuickContact";

export const metadata: Metadata = {
  title: "Salão de Beleza em Santa Efigênia, BH",
  description:
    "Conheça o Shaiff Cabeleireiros, salão de beleza em Santa Efigênia, Belo Horizonte. Cortes, escova, mechas, cuidados capilares, manicure, pedicure e outros serviços.",
  alternates: {
    canonical: getCanonicalUrl("/"),
  },
};

const homeFaqs = [
  {
    question: "Onde fica o Shaiff Cabeleireiros?",
    answer:
      "O Shaiff Cabeleireiros fica na Rua Padre Rolim, 715, no Condomínio Edifício Angelini Center, em Santa Efigênia, Belo Horizonte.",
  },
  {
    question: "Quais serviços o Shaiff oferece?",
    answer:
      "O Shaiff oferece cortes de cabelo, escova, nutrição e hidratação capilar, selagem, mechas, depilação feminina, manicure e pedicure e design de sobrancelha.",
  },
  {
    question: "Como posso solicitar um agendamento?",
    answer:
      "Você pode ligar para o telefone (31) 3564-0123 ou enviar uma solicitação pela página de contato do site.",
  },
  {
    question: "O atendimento precisa ser agendado?",
    answer:
      "A disponibilidade pode variar conforme o serviço e o dia. Entre em contato com a equipe para consultar os horários disponíveis.",
  },
  {
    question: "O Shaiff realiza mechas?",
    answer:
      "Sim. Mechas estão entre os serviços oferecidos pelo Shaiff Cabeleireiros. Entre em contato para consultar disponibilidade e orientações sobre o atendimento.",
  },
  {
    question: "O salão oferece manicure e pedicure?",
    answer:
      "Sim. O Shaiff oferece serviços de manicure e pedicure mediante consulta de disponibilidade.",
  },
];

export default function HomePage() {
  const homeUrl = createAbsoluteUrl("/");
  const webPageSchema = {
    "@type": "WebPage",
    "@id": homeUrl ? `${homeUrl}#webpage` : "#webpage",
    ...(homeUrl ? { url: homeUrl } : {}),
    "name": `${siteConfig.businessName} | Salão de Beleza em Santa Efigênia, BH`,
    "description": siteConfig.description,
    "about": { "@id": getHairSalonId() },
    "inLanguage": "pt-BR",
  };

  const faqSchema = generateFAQSchema(homeFaqs);
  const hairSalonSchema = generateHairSalonSchema();
  const webSiteSchema = generateWebSiteSchema();

  return (
    <>
      <JsonLd graph={[webPageSchema, faqSchema, hairSalonSchema, webSiteSchema]} />

      {/* 1. Hero */}
      <Hero />

      {/* 2. Faixa de confiança e localização */}
      <TrustStrip />

      {/* 3. Serviços em destaque */}
      <FeaturedServices />

      {/* 4. Apresentação do salão */}
      <AboutPreview />

      {/* 5. Diferenciais */}
      <Differentials />

      {/* 6. Todos os serviços */}
      <ServicesOverview />

      {/* 7. Combos Promocionais */}
      <PromotionalCombos />

      {/* 8. Galeria preparada para fotos reais */}
      <GalleryPreview />

      {/* 8. Avaliações (Testimonials) */}
      <Testimonials />

      {/* 9. Como agendar */}
      <BookingSteps />

      {/* 9. Seção de contato rápido */}
      <QuickContact />

      {/* 10. Localização */}
      <LocationSection />

      {/* 11. Perguntas frequentes */}
      <HomeFAQ />

      {/* 12. CTA final */}
      <FinalCTA />
    </>
  );
}
