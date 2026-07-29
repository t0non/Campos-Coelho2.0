import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CheckCircle2 } from "lucide-react";

interface ServiceBenefitsProps {
  benefits: string[];
  serviceName: string;
}

export function ServiceBenefits({ benefits, serviceName }: ServiceBenefitsProps) {
  return (
    <Section variant="light" padding="default" className="border-b border-brand-border/40">
      <Container size="large">
        <SectionHeading
          kicker="VANTAGENS E RESULTADOS"
          title={`Benefícios do serviço de ${serviceName}`}
          subtitle="Conheça os principais aspectos positivos percebidos durante e após a realização do atendimento."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-brand-surface p-6 rounded-xl border border-brand-border/70 shadow-sm flex items-start gap-4 hover:border-brand-primary/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-brand-muted flex items-center justify-center text-brand-primary shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-sm text-brand-heading font-medium leading-relaxed">
                {benefit}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
