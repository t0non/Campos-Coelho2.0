import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { Service } from "@/types/site";
import { Phone, Calendar } from "lucide-react";

interface ServiceCTAProps {
  service: Service;
}

export function ServiceCTA({ service }: ServiceCTAProps) {
  return (
    <Section variant="dark" padding="large" className="text-center overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

      <Container size="medium" className="relative z-10 space-y-6">
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-medium text-brand-champagneLight tracking-tight leading-tight max-w-3xl mx-auto">
          Consulte um horário para {service.name.toLowerCase()}
        </h2>

        <p className="text-base sm:text-lg text-brand-champagne/80 max-w-xl mx-auto leading-relaxed">
          Entre em contato com o Shaiff Cabeleireiros para verificar a disponibilidade e solicitar seu atendimento em Santa Efigênia, Belo Horizonte.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
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

        <div className="pt-6 text-xs text-brand-champagne/60 uppercase tracking-widest font-medium">
          Shaiff Cabeleireiros • Santa Efigênia, Belo Horizonte
        </div>
      </Container>
    </Section>
  );
}
