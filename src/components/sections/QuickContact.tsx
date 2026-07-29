import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { Phone, MessageSquareText } from "lucide-react";

export function QuickContact() {
  return (
    <Section id="contato" variant="muted" padding="default" className="border-b border-brand-border/40 bg-white">
      <Container size="large">
        <SectionHeading
          kicker="FALE COM O SHAIFF"
          title="Consulte os horários disponíveis"
          subtitle="Entre em contato com o Shaiff Cabeleireiros para consultar a disponibilidade do serviço desejado e solicitar seu agendamento."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Option 1: Phone call */}
          <div className="bg-white p-8 rounded-2xl border border-brand-border/60 shadow-sm flex flex-col justify-between text-center hover:border-brand-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="w-14 h-14 mx-auto rounded-full bg-brand-cream border border-brand-primary/20 flex items-center justify-center text-brand-primary mb-4 shadow-xs">
                <Phone className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-xl font-medium text-brand-heading mb-2">
                Ligar para o salão
              </h3>
              <p className="text-sm text-brand-bodyText/80 mb-4">
                Fale diretamente com nossa equipe de atendimento por telefone.
              </p>
              <div className="text-xl font-bold text-brand-primary font-mono mb-6">
                {siteConfig.telephone}
              </div>
            </div>

            <Button
              href={siteConfig.telephoneHref}
              external
              variant="primary"
              size="lg"
              className="w-full"
            >
              <Phone className="w-4 h-4 mr-2" />
              <span>Ligar agora</span>
            </Button>
          </div>

          {/* Option 2: WhatsApp Request */}
          <div className="bg-white p-8 rounded-2xl border border-brand-border/60 shadow-sm flex flex-col justify-between text-center hover:border-brand-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="w-14 h-14 mx-auto rounded-full bg-brand-cream border border-brand-primary/20 flex items-center justify-center text-brand-primary mb-4 shadow-xs">
                <MessageSquareText className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-xl font-medium text-brand-heading mb-2">
                Enviar uma mensagem
              </h3>
              <p className="text-sm text-brand-bodyText/80 mb-6 leading-relaxed">
                Chame no WhatsApp e informe o serviço que você procura para agendar.
              </p>
            </div>

            <Button 
              href={siteConfig.whatsappHref || undefined} 
              external 
              variant="secondary" 
              size="lg" 
              className="w-full"
            >
              Agendar no WhatsApp
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
