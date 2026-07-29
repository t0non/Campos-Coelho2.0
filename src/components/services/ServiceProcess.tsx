import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HowItWorksStep } from "@/types/site";

interface ServiceProcessProps {
  steps: HowItWorksStep[];
  serviceName: string;
}

export function ServiceProcess({ steps, serviceName }: ServiceProcessProps) {
  return (
    <Section variant="muted" padding="default" className="border-b border-brand-border/40">
      <Container size="large">
        <SectionHeading
          kicker="ETAPAS DO ATENDIMENTO"
          title={`Como funciona o serviço de ${serviceName}`}
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <div
              key={index}
              className="bg-brand-surface p-6 sm:p-8 rounded-xl border border-brand-border/70 shadow-sm flex flex-col justify-between text-center relative group"
            >
              <div>
                <span className="inline-block px-3 py-1 bg-brand-muted text-brand-primary text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
                  {item.step}
                </span>

                <h3 className="font-heading text-xl font-medium text-brand-heading mb-3">
                  {item.title}
                </h3>

                <p className="text-sm text-brand-bodyText/80 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
