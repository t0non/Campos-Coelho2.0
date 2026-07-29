"use client";

import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Star } from "lucide-react";
import { AnimateIn } from "@/components/ui/AnimateIn";

const testimonials = [
  {
    id: 1,
    name: "Ana Flávia Braz",
    text: "O atendimento da Ingrid foi impecável! Eu precisava de um penteado com tranças e ela entendeu o que eu queria. O preço foi super justo e amei o resultado! Indico demais.",
    image: "/images/shaiff/Ana Flávia Braz.png"
  },
  {
    id: 2,
    name: "Patricia Alves Valadares Assunção",
    text: "Sou cliente há quase dez anos! Excelente atendimento, ótima localização, equipe atenciosa, pontual e muito qualificada! Cinco estrelas com certeza!!!",
    image: "/images/shaiff/Patricia Alves Valadares Assunção.png"
  },
  {
    id: 3,
    name: "Amanda Tolomelli Brescia",
    text: "Equipe bem preparada e a Regina é a manicure mais fabulosa de todos os tempos! Sempre uma gracinha e arrasa nas unhas!",
    image: "/images/shaiff/Amanda Tolomelli Brescia.png"
  },
  {
    id: 4,
    name: "Nathalia Guedes",
    text: "Sempre muito bem recebida! Equipe maravilhosa, pessoas simpáticas, muito profissionais e agradáveis!",
    image: "/images/shaiff/Nathalia Guedes.png"
  },
  {
    id: 5,
    name: "Isadora Valadares",
    text: "Ótimo serviço, com a opção de pacotes para cabelo ou manicure e pedicure. Dispensa reserva de horário para escovas.",
    image: "/images/shaiff/Isadora Valadares.png"
  },
  {
    id: 6,
    name: "Ana Samar",
    text: "Super atendida pelo cabeleireiro Ricardo, amei tudo o atendimento, as minhas luzes 😍... Super indico!",
    image: "/images/shaiff/Ana Samar.png"
  },
  {
    id: 7,
    name: "Blenda Nogueira",
    text: "O melhor salão de Belo Horizonte, os melhores profissionais!!! Ricardo expert em mechas, preço justo e muitos mimos!!!! Estão de parabéns!!!",
    image: "/images/shaiff/Blenda Nogueira.png"
  },
  {
    id: 8,
    name: "Marina de Oliveira Pinheiro",
    text: "Sempre um excelente atendimento! Clientes há 28 anos! Recomendo muito!!!",
    image: "/images/shaiff/Marina de Oliveira Pinheiro.png"
  },
  {
    id: 9,
    name: "Bruna Abras",
    text: "Fui cortar o cabelo e não tinha horário, mas a recepcionista foi super educada e conseguiu me encaixar! Atendimento nota 1000 da recepção até o corte que eu amei 😍",
    image: "/images/shaiff/Bruna Abras.png"
  },
];

export function Testimonials() {
  return (
    <Section variant="light" padding="default" className="border-b border-brand-border/40 bg-white">
      <Container size="large">
        <AnimateIn variant="fade-up">
          <SectionHeading
            kicker="O QUE DIZEM NOSSAS CLIENTES"
            title="Avaliações de quem confia no nosso trabalho"
            subtitle="A satisfação de cada cliente é o nosso maior prêmio. Confira as experiências de quem já passou pelo Shaiff Cabeleireiros."
            align="center"
          />
        </AnimateIn>

        <div className="relative flex flex-col gap-6 mt-12 overflow-hidden w-full">
          {/* Row 1 */}
          <div className="flex overflow-hidden group gap-6">
            <div className="flex animate-marquee shrink-0 gap-6 group-hover:[animation-play-state:paused]">
              {[...testimonials.slice(0, 4), ...testimonials.slice(0, 4)].map((testimonial, idx) => (
                <TestimonialCard key={`${testimonial.id}-${idx}`} testimonial={testimonial} />
              ))}
            </div>
            <div className="flex animate-marquee shrink-0 gap-6 group-hover:[animation-play-state:paused]" aria-hidden="true">
              {[...testimonials.slice(0, 4), ...testimonials.slice(0, 4)].map((testimonial, idx) => (
                <TestimonialCard key={`${testimonial.id}-dup-${idx}`} testimonial={testimonial} />
              ))}
            </div>
          </div>

          {/* Row 2 (Reverse) */}
          <div className="flex overflow-hidden group gap-6">
            <div className="flex animate-marquee-reverse shrink-0 gap-6 group-hover:[animation-play-state:paused]">
              {[...testimonials.slice(4, 7), ...testimonials.slice(4, 7), testimonials[0]].map((testimonial, idx) => (
                <TestimonialCard key={`${testimonial.id}-${idx}`} testimonial={testimonial} />
              ))}
            </div>
            <div className="flex animate-marquee-reverse shrink-0 gap-6 group-hover:[animation-play-state:paused]" aria-hidden="true">
              {[...testimonials.slice(4, 7), ...testimonials.slice(4, 7), testimonials[0]].map((testimonial, idx) => (
                <TestimonialCard key={`${testimonial.id}-dup-${idx}`} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: any }) {
  return (
    <div className="w-[300px] sm:w-[350px] bg-white p-6 rounded-2xl border border-brand-border/60 shadow-sm flex flex-col h-full hover:shadow-xl hover:border-brand-primary/40 hover:-translate-y-1 transition-all duration-300 whitespace-normal">
      <div className="flex text-[#FABB05] mb-4 gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-current text-[#FABB05]" strokeWidth={1} />
        ))}
      </div>
      <p 
        className="text-sm text-brand-bodyText/90 leading-relaxed flex-1 mb-6"
        style={{ fontFamily: "Roboto, Arial, sans-serif" }}
      >
        &quot;{testimonial.text}&quot;
      </p>
      
      <div className="flex items-center gap-4 mt-auto pt-4 border-t border-brand-border/30">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-muted shrink-0 border border-brand-border/50">
          <img 
            src={testimonial.image} 
            alt={`Foto de ${testimonial.name}`} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="%23FBEDDF"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="%23905A24"/></svg>';
            }}
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-brand-heading">
              {testimonial.name}
            </h4>
            <svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <span className="text-xs text-brand-bodyText/60">Avaliação do Google</span>
        </div>
      </div>
    </div>
  );
}
