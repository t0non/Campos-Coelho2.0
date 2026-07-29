import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Info } from "lucide-react";

interface ServiceConsiderationsProps {
  considerations: string[];
}

export function ServiceConsiderations({ considerations }: ServiceConsiderationsProps) {
  return (
    <Section variant="muted" padding="small" className="border-b border-brand-border/40">
      <Container size="medium">
        <div className="bg-brand-surface p-6 sm:p-8 rounded-xl border border-amber-800/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-4 text-brand-primary">
            <Info className="w-5 h-5 shrink-0" />
            <h3 className="font-heading text-lg font-medium text-brand-heading">
              Informações importantes (Antes de agendar)
            </h3>
          </div>

          <ul className="space-y-3 text-xs sm:text-sm text-brand-bodyText leading-relaxed">
            {considerations.map((item, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0 mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
