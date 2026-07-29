import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import {
  StepTapAnimation,
  StepPhoneAnimation,
  StepCheckAnimation,
  StepArrowFlow,
} from "./booking/BookingStepAnimations";

const steps = [
  {
    step: "Passo 1",
    animation: StepTapAnimation,
    title: "Escolha o serviço",
    description:
      "Veja os cuidados disponíveis e identifique qual atendimento você procura.",
  },
  {
    step: "Passo 2",
    animation: StepPhoneAnimation,
    title: "Entre em contato",
    description:
      "Ligue ou envie sua solicitação pela página de contato.",
  },
  {
    step: "Passo 3",
    animation: StepCheckAnimation,
    title: "Confirme o horário",
    description:
      "A equipe informa a disponibilidade e confirma os detalhes do atendimento.",
  },
];

export function BookingSteps() {
  return (
    <Section id="como-agendar" variant="light" padding="default" className="border-b border-brand-border/40 relative overflow-hidden bg-[#FAF6F0]">
      {/* Removed animations since icons are now static */}

      <Container size="large">
        <SectionHeading
          kicker="SEU HORÁRIO NO SHAIFF"
          title="Agendar é simples"
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => {
            const AnimationComponent = item.animation;
            const isLastStep = index === steps.length - 1;

            return (
              <div
                key={index}
                className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-border/60 shadow-sm flex flex-col justify-between text-center relative group hover:border-brand-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <span className="inline-block px-3 py-1 bg-brand-cream border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider rounded-full mb-4">
                    {item.step}
                  </span>

                  <AnimationComponent />

                  <h3 className="font-heading text-xl font-medium text-brand-heading mb-2">
                    {item.title}
                  </h3>

                  <p className="text-sm text-brand-bodyText/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Transition Arrow between Step 1 -> 2 and Step 2 -> 3 */}
                {!isLastStep && <StepArrowFlow />}
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button
            href="https://wa.me/553135640123?text=Ol%C3%A1!%20Vim%20pelo%20site%20do%20Shaiff%20Cabeleireiros%20e%20gostaria%20de%20agendar%20um%20hor%C3%A1rio."
            external
            variant="primary"
            size="lg"
          >
            <WhatsAppIcon className="w-4 h-4 mr-2" />
            Solicitar agendamento
          </Button>
        </div>
      </Container>
    </Section>
  );
}
