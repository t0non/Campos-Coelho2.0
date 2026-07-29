import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { siteConfig } from "@/config/site";
import { Phone } from "lucide-react";

export function FinalCTA() {
  return (
    <Section variant="dark" padding="large" className="text-center overflow-hidden bg-brand-dark">
      {/* Decorative ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

      <Container size="medium" className="relative z-10 space-y-6">
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-medium text-brand-cream tracking-tight leading-tight max-w-3xl mx-auto">
          Seu próximo momento de cuidado pode começar agora
        </h2>

        <p className="text-base sm:text-lg text-brand-cream/80 max-w-xl mx-auto leading-relaxed">
          Fale com o Shaiff Cabeleireiros, consulte os horários disponíveis e encontre o atendimento ideal para você.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            href={siteConfig.whatsappHref || undefined}
            external
            variant="primary"
            size="lg"
            className="w-full sm:w-auto transition-all duration-300 hover:scale-105"
          >
            <WhatsAppIcon className="w-4 h-4 mr-2" />
            <span>Agendar no WhatsApp</span>
          </Button>
        </div>

        <div className="pt-6 text-xs text-brand-cream/60 uppercase tracking-widest font-medium">
          Shaiff Cabeleireiros • Santa Efigênia, Belo Horizonte
        </div>
      </Container>
    </Section>
  );
}
