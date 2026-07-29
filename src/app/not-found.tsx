import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { Phone, ArrowLeft, Scissors } from "lucide-react";

export default function NotFoundPage() {
  return (
    <Section variant="dark" padding="large" className="text-center overflow-hidden min-h-[70vh] flex items-center justify-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

      <Container size="medium" className="relative z-10 space-y-6 py-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary mb-2">
          <Scissors className="w-8 h-8" />
        </div>

        <span className="inline-block text-xs uppercase tracking-widest text-brand-primary font-semibold">
          PÁGINA NÃO ENCONTRADA
        </span>

        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold text-brand-champagneLight tracking-tight leading-tight max-w-xl mx-auto">
          Este endereço não levou ao Shaiff
        </h1>

        <p className="text-base sm:text-lg text-brand-champagne/80 max-w-lg mx-auto leading-relaxed font-sans">
          A página que você tentou acessar não está disponível. Você pode voltar ao início, conhecer os serviços ou entrar em contato com o salão.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/" variant="primary" size="lg" className="w-full sm:w-auto">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Voltar ao início</span>
          </Button>

          <Button href="/servicos" variant="secondary" size="lg" className="w-full sm:w-auto">
            <span>Conhecer os serviços</span>
          </Button>

          <Button
            href={siteConfig.telephoneHref}
            external
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-brand-champagne/40 text-brand-champagne hover:bg-brand-champagne hover:text-brand-darkSurface"
          >
            <Phone className="w-4 h-4 mr-2 text-brand-primary" />
            <span>Ligar para o Shaiff</span>
          </Button>
        </div>

        <div className="pt-6 text-xs text-brand-champagne/60 uppercase tracking-widest font-medium">
          Shaiff Cabeleireiros • Santa Efigênia, Belo Horizonte
        </div>
      </Container>
    </Section>
  );
}
