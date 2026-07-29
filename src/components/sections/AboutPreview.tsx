import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { CheckCircle2, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function AboutPreview() {
  const highlights = [
    "Diferentes serviços de cabelo e beleza em um só lugar",
    "Atendimento pontual no Condomínio Edifício Angelini Center",
    "Estrutura moderna, climatizada e higienizada",
    "Fácil localização em Santa Efigênia, BH",
  ];

  return (
    <Section id="sobre" variant="muted" padding="default" className="border-b border-brand-border/40 bg-[#FAF6F0]">
      <Container size="large">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Visual / Image display with real space photo */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden relative bg-stone-100 border border-brand-border/50 group shadow-xl transition-transform duration-500 hover:scale-[1.01]">
              <Image
                src="/images/shaiff/espaco/espaco1.webp"
                alt="Ambiente interno do Shaiff Cabeleireiros em Santa Efigênia, BH"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <SectionHeading
              kicker="CONHEÇA O SHAIFF"
              title="Um espaço completo para cuidar da sua beleza"
              align="left"
              className="mb-4"
            />

            <div className="space-y-4 text-brand-bodyText text-base leading-relaxed">
              <p>
                O <strong>Shaiff Cabeleireiros</strong> está localizado no tradicional bairro Santa Efigênia, em Belo Horizonte, reunindo serviços completos de cabelo e estética em um ambiente climatizado e preparado para o seu bem-estar.
              </p>
              <p>
                Nossa missão é proporcionar praticidade e excelência em cada atendimento, oferecendo tratamentos capilares, manicure, depilação e sobrancelhas no mesmo local.
              </p>
            </div>

            {/* Highlights List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {highlights.map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-brand-border/40 shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-brand-primary shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-brand-dark leading-snug">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button
                href={siteConfig.whatsappHref || undefined}
                external
                variant="primary"
                size="md"
              >
                <WhatsAppIcon className="w-4 h-4 mr-2" />
                <span>Agendar no WhatsApp</span>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
