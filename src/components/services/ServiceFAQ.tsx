"use client";

import React, { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceFAQProps {
  faqs: Array<{ question: string; answer: string }>;
  serviceName: string;
}

export function ServiceFAQ({ faqs, serviceName }: ServiceFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <Section variant="muted" padding="default" className="border-b border-brand-border/40">
      <Container size="medium">
        <SectionHeading
          kicker="DÚVIDAS FREQUENTES"
          title={`Perguntas frequentes sobre ${serviceName.toLowerCase()}`}
          align="center"
        />

        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-brand-surface rounded-xl border border-brand-border/70 overflow-hidden shadow-sm transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  aria-controls={`svc-faq-${index}`}
                  className="w-full text-left p-5 font-heading text-lg font-medium text-brand-heading flex items-center justify-between gap-4 hover:text-brand-primary transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-brand-primary shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                {isOpen && (
                  <div
                    id={`svc-faq-${index}`}
                    className="px-5 pb-5 pt-1 text-sm text-brand-bodyText leading-relaxed border-t border-brand-border/30 font-sans"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
