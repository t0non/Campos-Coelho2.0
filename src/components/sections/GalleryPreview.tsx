import React from "react";
import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";

const spacePhotos = [
  { id: 1, title: "Recepção e Fachada do Salão", path: "/images/shaiff/espaco/espaco1.webp" },
  { id: 2, title: "Ambiente Interno e Bancadas", path: "/images/shaiff/espaco/espaco2.webp" },
  { id: 3, title: "Estações de Atendimento", path: "/images/shaiff/espaco/espaco3.webp" },
  { id: 4, title: "Área de Lavatório Capilar", path: "/images/shaiff/espaco/espaco4.webp" },
  { id: 5, title: "Espaço de Maquiagem e Sobrancelha", path: "/images/shaiff/espaco/espaco5.webp" },
  { id: 6, title: "Espaço Manicure e Pedicure", path: "/images/shaiff/espaco/espaco6.webp" },
  { id: 7, title: "Produtos e Cuidados Especiais", path: "/images/shaiff/espaco/espaco7.webp" },
  { id: 8, title: "Ambiente Climatizado e Acolhedor", path: "/images/shaiff/espaco/espaco8.webp" },
  { id: 9, title: "Detalhes do Espaço Shaiff", path: "/images/shaiff/espaco/espaco9.webp" },
];

export function GalleryPreview() {
  return (
    <Section id="sobre-galeria" variant="muted" padding="default" className="border-b border-brand-border/40 overflow-hidden py-12">
      <Container size="large" className="mb-8">
        <SectionHeading
          kicker="NOSSO ESPAÇO"
          title="Conheça a estrutura do Shaiff Cabeleireiros"
          subtitle="Ambiente climatizado, moderno e preparado para o seu atendimento em Santa Efigênia, BH."
          align="center"
        />
      </Container>

      {/* Infinite Continuous Marquee Slider - ONLY IMAGES (No Lightbox/No Click) */}
      <div className="relative flex overflow-hidden group w-full py-2">
        <div className="flex animate-marquee shrink-0 gap-5 group-hover:[animation-play-state:paused] transition-all">
          {spacePhotos.concat(spacePhotos).map((photo, idx) => (
            <div
              key={`photo-1-${idx}`}
              className="w-[280px] sm:w-[340px] md:w-[380px] aspect-[4/3] relative rounded-2xl overflow-hidden shadow-md border border-brand-border/60 shrink-0 transition-transform duration-300 hover:scale-[1.02]"
            >
              <Image
                src={photo.path}
                alt={`Foto do Espaço - ${photo.title}`}
                fill
                sizes="(max-width: 640px) 280px, (max-width: 768px) 340px, 380px"
                className="object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <div className="flex animate-marquee shrink-0 gap-5 group-hover:[animation-play-state:paused] transition-all" aria-hidden="true">
          {spacePhotos.concat(spacePhotos).map((photo, idx) => (
            <div
              key={`photo-2-${idx}`}
              className="w-[280px] sm:w-[340px] md:w-[380px] aspect-[4/3] relative rounded-2xl overflow-hidden shadow-md border border-brand-border/60 shrink-0 transition-transform duration-300 hover:scale-[1.02]"
            >
              <Image
                src={photo.path}
                alt={`Foto do Espaço - ${photo.title}`}
                fill
                sizes="(max-width: 640px) 280px, (max-width: 768px) 340px, 380px"
                className="object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Centered CTA Button under the sliding images */}
      <Container size="large" className="mt-10 text-center">
        <Button
          href={siteConfig.whatsappHref || undefined}
          external
          variant="primary"
          size="lg"
          className="transition-all duration-300 hover:scale-105 shadow-md"
        >
          <WhatsAppIcon className="w-5 h-5 mr-2" />
          <span>Falar com o Salão no WhatsApp</span>
        </Button>
      </Container>
    </Section>
  );
}
