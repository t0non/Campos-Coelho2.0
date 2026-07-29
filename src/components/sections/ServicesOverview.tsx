import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function ServicesOverview() {
  return (
    <Section id="servicos" variant="light" padding="default" className="border-b border-brand-border/40 bg-white">
      <Container size="large">
        <SectionHeading
          kicker="SERVIÇOS DO SHAIFF"
          title="Cuidados para cabelos e beleza em um só lugar"
          subtitle="Consulte os serviços disponíveis e fale com a equipe para verificar horários, orientações e disponibilidade de atendimento."
          align="center"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {siteConfig.services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-brand-border/60 shadow-sm flex flex-col justify-between hover:border-brand-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
            >
              <div className="flex flex-col flex-1">
                <div className="relative w-full aspect-[16/9] bg-brand-muted overflow-hidden">
                  <img src={service.image} alt={service.imageAlt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  {/* Brown Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/30 to-transparent opacity-90 transition-opacity duration-300" />
                  
                  {/* Title Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-4 flex items-end">
                    <h3 className="font-heading text-lg font-medium text-brand-cream leading-snug drop-shadow-md">
                      {service.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5 pb-2 flex-1">
                  <p className="text-xs text-brand-bodyText/80 leading-relaxed mb-4">
                    {service.shortDescription}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2">
                <div className="pt-3 border-t border-brand-border/40">
                  <Button
                    href={`https://wa.me/553135640123?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio%20para%20o%20servi%C3%A7o%20de%20${encodeURIComponent(service.name)}.`}
                    external
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 mr-1.5" />
                    <span>Agendar no WhatsApp</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
