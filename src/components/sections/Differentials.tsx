import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HeartHandshake, Layers, Coffee, MapPin } from "lucide-react";

const differentialsList = [
  {
    number: "01",
    icon: HeartHandshake,
    title: "Atendimento atencioso",
    description:
      "Cada serviço começa entendendo o que você procura e quais são suas preferências.",
  },
  {
    number: "02",
    icon: Layers,
    title: "Serviços variados",
    description:
      "Cuidados para cabelos, unhas, sobrancelhas e beleza reunidos no mesmo espaço.",
  },
  {
    number: "03",
    icon: Coffee,
    title: "Ambiente acolhedor",
    description:
      "Um salão preparado para que seu momento de cuidado seja mais confortável e tranquilo.",
  },
  {
    number: "04",
    icon: MapPin,
    title: "Boa localização",
    description:
      "Na Rua Padre Rolim, no Angelini Center em Santa Efigênia, com acesso prático para quem está na região.",
  },
];

export function Differentials() {
  return (
    <Section variant="dark" padding="default" className="border-b border-brand-cream/10 bg-brand-dark">
      <Container size="large">
        <SectionHeading
          kicker="POR QUE ESCOLHER O SHAIFF"
          title="Cuidado, praticidade e atenção em cada atendimento"
          darkBackground
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {differentialsList.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="relative bg-stone-900/80 p-6 sm:p-7 rounded-2xl border border-brand-cream/15 flex flex-col justify-between hover:border-brand-primary/80 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group"
              >
                <div>
                  {/* Header row inside card */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-brand-cream/10 border border-brand-cream/10 flex items-center justify-center text-brand-cream group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="font-heading text-2xl font-light text-brand-cream/30 group-hover:text-brand-primary transition-colors">
                      {item.number}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg sm:text-xl font-medium text-brand-cream mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-brand-cream/75 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Subtle copper accent bottom line */}
                <div className="mt-6 pt-3 border-t border-brand-cream/10">
                  <div className="h-0.5 w-10 bg-brand-primary group-hover:w-full transition-all duration-300 rounded-full" />
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
