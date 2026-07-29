import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { UserCheck } from "lucide-react";

interface ServiceSuitableForProps {
  suitableFor: string[];
  serviceName: string;
}

export function ServiceSuitableFor({ suitableFor, serviceName }: ServiceSuitableForProps) {
  return (
    <Section variant="light" padding="default" className="border-b border-brand-border/40">
      <Container size="medium">
        <SectionHeading
          kicker="INDICAÇÕES DO SERVIÇO"
          title="Para quem este atendimento pode ser indicado?"
          subtitle={`Veja os principais perfis de clientes que costumam procurar o serviço de ${serviceName.toLowerCase()}.`}
          align="center"
        />

        <div className="space-y-4 max-w-2xl mx-auto">
          {suitableFor.map((item, index) => (
            <div
              key={index}
              className="bg-brand-surface p-5 rounded-xl border border-brand-border/60 shadow-sm flex items-center gap-4 hover:border-brand-primary/40 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-brand-muted flex items-center justify-center text-brand-primary shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-brand-heading leading-relaxed">
                {item}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
