import React from "react";
import { Container } from "@/components/ui/Container";
import { MapPin, Navigation, Scissors, CalendarCheck } from "lucide-react";

const trustItems = [
  {
    icon: MapPin,
    title: "Salão em Santa Efigênia",
  },
  {
    icon: Navigation,
    title: "Localização de fácil acesso",
  },
  {
    icon: Scissors,
    title: "Serviços de cabelo e beleza",
  },
  {
    icon: CalendarCheck,
    title: "Atendimento com horário consultado",
  },
];

export function TrustStrip() {
  return (
    <div className="w-full bg-[#FAF6F0] border-b border-brand-border/40 py-5 shadow-xs">
      <Container size="large">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-brand-border/30">
          {trustItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className={`flex items-center justify-center md:justify-start gap-3 py-2 px-3 text-center md:text-left ${
                  index !== 0 ? "pt-3 md:pt-2 md:pl-6" : ""
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-brand-cream border border-brand-primary/20 flex items-center justify-center shrink-0 text-brand-primary shadow-xs">
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-brand-dark leading-snug">
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
