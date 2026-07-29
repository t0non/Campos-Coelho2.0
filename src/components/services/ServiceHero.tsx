import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { siteConfig } from "@/config/site";
import { Service } from "@/types/site";
import { Phone, Calendar } from "lucide-react";

interface ServiceHeroProps {
  service: Service;
}

export function ServiceHero({ service }: ServiceHeroProps) {
  const breadcrumbItems = [
    { label: "Início", href: "/" },
    { label: "Serviços", href: "/servicos" },
    { label: service.name },
  ];

  return (
    <Section variant="dark" padding="default" className="border-b border-stone-800 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

      <Container size="large" className="relative z-10">
        <Breadcrumbs items={breadcrumbItems} dark className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary text-xs font-semibold uppercase tracking-widest">
              <ServiceIcon name={service.icon} className="w-3.5 h-3.5" />
              <span>Shaiff Cabeleireiros • Santa Efigênia, BH</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-medium text-brand-champagneLight tracking-tight leading-tight">
              {service.name} em Santa Efigênia, Belo Horizonte
            </h1>

            {/* AI Search & User Direct Response text */}
            <p className="text-base sm:text-lg text-brand-champagne/90 leading-relaxed font-sans bg-stone-900/60 p-4 rounded-xl border border-stone-800/80">
              {service.introductoryText}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Button
                href={`/contato?servico=${service.slug}`}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Calendar className="w-4 h-4 mr-2" />
                <span>Solicitar agendamento</span>
              </Button>

              <Button
                href={siteConfig.telephoneHref}
                external
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-brand-champagne/40 text-brand-champagne hover:bg-brand-champagne hover:text-brand-darkSurface"
              >
                <Phone className="w-4 h-4 mr-2 text-brand-primary" />
                <span>Ligar agora</span>
              </Button>
            </div>

            <p className="text-xs text-brand-champagne/60 italic">
              Consulte a disponibilidade e os horários para realizar seu atendimento no Shaiff Cabeleireiros.
            </p>
          </div>

          <div className="lg:col-span-5">
            {/* Visual Image / Placeholder for Service */}
            <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900/80 p-3 shadow-xl">
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 flex flex-col items-center justify-center p-6 text-center border border-stone-800">
                <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center mb-4 text-brand-primary">
                  <ServiceIcon name={service.icon} className="w-8 h-8" />
                </div>
                <h3 className="font-heading text-xl font-medium text-brand-champagneLight mb-1">
                  {service.name}
                </h3>
                <p className="text-xs text-brand-champagne/70 max-w-xs leading-relaxed">
                  Condomínio Edifício Angelini Center • Santa Efigênia
                </p>
                <div className="mt-4 px-3 py-1 bg-stone-950/80 border border-stone-700/60 rounded text-[11px] font-mono text-brand-champagne/50">
                  [ Espaço reservado para foto real do serviço ]
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
