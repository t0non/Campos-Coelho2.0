import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Send, Clock, CheckCircle } from "lucide-react";

export function ContactProcess() {
  const steps = [
    {
      step: "1",
      icon: Send,
      title: "Envie sua solicitação",
      description: "Preencha os campos informando seu nome, telefone e serviço desejado.",
    },
    {
      step: "2",
      icon: Clock,
      title: "Verificação de horários",
      description: "A equipe consulta a agenda do salão para verificar os horários disponíveis.",
    },
    {
      step: "3",
      icon: CheckCircle,
      title: "Retorno e confirmação",
      description: "Entramos em contato para alinhar os detalhes e confirmar seu agendamento.",
    },
  ];

  return (
    <Section variant="muted" padding="default" className="border-b border-brand-border/40">
      <Container size="large">
        <SectionHeading
          kicker="COMO FUNCIONA"
          title="Entenda o processo de agendamento"
          subtitle="Sua solicitação é enviada para a nossa equipe e o atendimento é confirmado após verificação da agenda."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.step}
                className="bg-brand-surface p-6 rounded-xl border border-brand-border/70 shadow-sm text-center flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 mx-auto rounded-full bg-brand-muted flex items-center justify-center text-brand-primary mb-4">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-lg font-medium text-brand-heading mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-bodyText/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
