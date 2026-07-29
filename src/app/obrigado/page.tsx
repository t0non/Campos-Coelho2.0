import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { CheckCircle2, Phone, ArrowLeft } from "lucide-react";
import { ObrigadoDetails } from "@/components/contact/ObrigadoDetails";

export const metadata: Metadata = {
  title: "Solicitação Recebida",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ObrigadoPage() {
  return (
    <Section variant="dark" padding="large" className="text-center overflow-hidden min-h-[70vh] flex items-center justify-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-3xl pointer-events-none" />

      <Container size="medium" className="relative z-10 space-y-6 py-8">
        <div className="w-16 h-16 mx-auto rounded-full bg-brand-primary/20 border border-brand-primary/40 flex items-center justify-center text-brand-primary mb-2">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="inline-block text-xs uppercase tracking-widest text-brand-primary font-semibold">
          SOLICITAÇÃO RECEBIDA
        </span>

        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-semibold text-brand-champagneLight tracking-tight leading-tight max-w-2xl mx-auto">
          Recebemos sua solicitação
        </h1>

        <p className="text-base sm:text-lg text-brand-champagne/80 max-w-xl mx-auto leading-relaxed font-sans">
          As informações foram enviadas para a equipe do Shaiff Cabeleireiros. O atendimento ainda dependerá da verificação de disponibilidade e da confirmação da equipe.
        </p>

        {/* Client-side details box */}
        <ObrigadoDetails />

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            href={siteConfig.telephoneHref}
            external
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Phone className="w-4 h-4 mr-2" />
            <span>Ligar para o Shaiff</span>
          </Button>

          <Button
            href="/"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto border-brand-champagne/40 text-brand-champagne hover:bg-brand-champagne hover:text-brand-darkSurface"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Voltar ao início</span>
          </Button>
        </div>

        <div className="pt-6 text-xs text-brand-champagne/60 uppercase tracking-widest font-medium">
          Shaiff Cabeleireiros • Santa Efigênia, Belo Horizonte
        </div>
      </Container>
    </Section>
  );
}
