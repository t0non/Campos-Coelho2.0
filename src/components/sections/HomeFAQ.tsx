"use client";

import React, { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqItems = [
  {
    id: "faq-1",
    question: "Onde fica o Shaiff Cabeleireiros?",
    answer:
      "O Shaiff Cabeleireiros fica na Rua Padre Rolim, 715, no Condomínio Edifício Angelini Center, em Santa Efigênia, Belo Horizonte.",
  },
  {
    id: "faq-2",
    question: "Quais serviços o Shaiff oferece?",
    answer:
      "O Shaiff oferece cortes de cabelo, escova, nutrição e hidratação capilar, selagem, mechas, depilação feminina, manicure e pedicure e design de sobrancelha.",
  },
  {
    id: "faq-3",
    question: "Como posso solicitar um agendamento?",
    answer:
      "Você pode ligar para o telefone (31) 3564-0123 ou enviar uma solicitação pela página de contato do site.",
  },
  {
    id: "faq-4",
    question: "O atendimento precisa ser agendado?",
    answer:
      "A disponibilidade pode variar conforme o serviço e o dia. Entre em contato com a equipe para consultar os horários disponíveis.",
  },
  {
    id: "faq-5",
    question: "O Shaiff realiza mechas?",
    answer:
      "Sim. Mechas estão entre os serviços oferecidos pelo Shaiff Cabeleireiros. Entre em contato para consultar disponibilidade e orientações sobre o atendimento.",
  },
  {
    id: "faq-6",
    question: "O salão oferece manicure e pedicure?",
    answer:
      "Sim. O Shaiff oferece serviços de manicure e pedicure mediante consulta de disponibilidade.",
  },
];

export function HomeFAQ() {
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <Section id="faq" variant="muted" padding="default" className="border-b border-brand-border/40 bg-white">
      <Container size="medium">
        <SectionHeading
          kicker="DÚVIDAS FREQUENTES"
          title="Perguntas Frequentes"
          subtitle="Esclareça suas dúvidas principais sobre a localização, serviços e atendimento do salão."
          align="center"
        />

        <div className="space-y-4 max-w-3xl mx-auto">
          {faqItems.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-brand-border/60 overflow-hidden shadow-sm hover:border-brand-primary/40 transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(item.id)}
                  aria-expanded={isOpen}
                  aria-controls={`answer-${item.id}`}
                  className="w-full text-left p-5 font-heading text-lg font-medium text-brand-heading flex items-center justify-between gap-4 hover:text-brand-primary transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-brand-primary shrink-0 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>

                {isOpen && (
                  <div
                    id={`answer-${item.id}`}
                    className="px-5 pb-5 pt-1 text-sm sm:text-base text-brand-bodyText/90 leading-relaxed border-t border-brand-border/30 font-sans"
                  >
                    {item.answer}
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
