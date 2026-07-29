import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { siteConfig } from "@/config/site";
import { MapPin, Clock, Sparkles, Phone } from "lucide-react";

export function Hero() {
  return (
    <Section variant="light" padding="large" className="overflow-hidden border-b border-brand-border/60 bg-white relative animate-in fade-in duration-700">
      {/* Background Image with elegant light overlay for maximum readability and standard styling */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat bg-center z-0"
        style={{ backgroundImage: `url('/images/shaiff/background-sessao-1.png')` }}
        aria-hidden="true"
      />
      {/* Homogeneous light overlay to wash out harsh gradients and enhance readability */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-0" />

      <Container size="large" className="relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <div className="max-w-3xl space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-cream border border-brand-primary/20 text-brand-primary text-sm sm:text-base font-light tracking-wide uppercase transition-transform duration-300 hover:scale-105" style={{ fontFamily: "'Inter', 'Manrope', sans-serif" }}>
            <span>Salão de beleza em Santa Efigênia, BH</span>
          </div>

          <h1 className="font-heading text-[38px] sm:text-[44px] md:text-[52px] lg:text-[60px] font-normal text-brand-dark tracking-[-0.02em] leading-[1.08] lg:leading-[1.10]">
            Cuidado profissional para seus cabelos e sua beleza
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-brand-dark/85 font-sans leading-relaxed">
            No Shaiff Cabeleireiros, você encontra serviços de cabelo e beleza em um espaço acolhedor, bem localizado no Angelini Center e preparado para cuidar de cada detalhe do seu atendimento.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Button
              href={siteConfig.whatsappHref || undefined}
              external
              variant="primary"
              size="lg"
              className="w-full sm:w-auto shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <WhatsAppIcon className="w-4 h-4 mr-2" />
              Agendar no WhatsApp
            </Button>
          </div>

          {/* Support Text */}
          <p className="text-xs text-brand-dark/70 italic font-sans pt-1">
            Atendimento na Rua Padre Rolim, no Condomínio Edifício Angelini Center, em Santa Efigênia.
          </p>

          {/* Google Review Badge */}
          <div className="pt-6 border-t border-brand-border/60">
            <div className="inline-flex items-center gap-4 bg-white border border-brand-primary/20 p-3.5 rounded-2xl max-w-md shadow-md">
              {/* Google Brand & Stars Column */}
              <div className="flex flex-col items-center justify-center shrink-0">
                {/* Google Logo */}
                <svg className="w-6 h-6" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69a5.74 5.74 0 0 1-2.5 3.77v3.13h4.05c2.37-2.18 3.73-5.39 3.73-8.75z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-4.05-3.13c-1.12.75-2.56 1.2-3.91 1.2-3.02 0-5.57-2.04-6.48-4.78H1.31v3.23A12 12 0 0 0 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.52 14.38A7.2 7.2 0 0 1 5.1 12c0-.82.14-1.62.4-2.38V6.39H1.31A12 12 0 0 0 0 12c0 1.98.48 3.86 1.31 5.61l4.21-3.23z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.22 0 12 0A12 12 0 0 0 1.31 6.39l4.21 3.23c.91-2.74 3.46-4.78 6.48-4.78z"
                  />
                </svg>
                {/* 5 Stars */}
                <div className="flex gap-0.5 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="w-px h-12 bg-brand-border/60 self-center shrink-0" />

              {/* Info Column */}
              <div className="flex flex-col">
                <span className="font-heading text-sm font-bold text-brand-dark leading-tight">
                  Salão mais bem avaliado da região
                </span>
                <span className="text-xs text-brand-dark/70 font-sans mt-0.5 leading-relaxed">
                  Excelente • 5.0 estrelas no Google (+200 clientes)
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
