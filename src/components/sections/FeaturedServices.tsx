import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { ArrowRight, Calendar } from "lucide-react";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

export function FeaturedServices() {
  const featuredServices = siteConfig.services.filter(
    (service) => service.active && service.featured
  );

  return (
    <Section id="servicos-destaque" variant="light" padding="default" className="border-b border-brand-border/40 bg-white">
      <Container size="large">
        <AnimateIn variant="fade-up">
          <SectionHeading
            kicker="CUIDADOS PARA CADA MOMENTO"
            title="Encontre o serviço ideal para você"
            subtitle="Do corte ao cuidado com cabelos, unhas e sobrancelhas, o Shaiff reúne diferentes serviços para facilitar sua rotina de beleza em um único endereço."
            align="center"
          />
        </AnimateIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredServices.map((service, index) => (
            <AnimateIn key={service.id} variant="fade-up" delay={index * 100}>
              <div
                className="bg-white rounded-2xl border border-brand-border/60 shadow-sm flex flex-col justify-between hover:border-brand-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden h-full"
              >
                <div className="flex flex-col flex-1">
                  <div className="relative w-full aspect-[4/3] bg-brand-muted overflow-hidden">
                    <img src={service.image} alt={service.imageAlt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    {/* Brown Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/30 to-transparent opacity-90 transition-opacity duration-300" />
                    
                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 w-full p-5">
                      <h3 className="font-heading text-xl font-medium text-brand-cream drop-shadow-md leading-tight">
                        {service.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-6 pb-2 flex-1">
                    <p className="text-sm text-brand-bodyText/80 leading-relaxed mb-4">
                      {service.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2">
                   <div className="pt-4 border-t border-brand-border/40">
                     <Button
                       href={`https://wa.me/553135640123?text=Ol%C3%A1!%20Gostaria%20de%20agendar%20um%20hor%C3%A1rio%20para%20o%20servi%C3%A7o%20de%20${encodeURIComponent(service.name)}.`}
                       external
                       variant="primary"
                       size="sm"
                       className="w-full text-xs"
                     >
                       <WhatsAppIcon className="w-3.5 h-3.5 mr-1" />
                       <span>Agendar no WhatsApp</span>
                     </Button>
                   </div>
                 </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </Container>
    </Section>
  );
}
