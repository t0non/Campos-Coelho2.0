import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { MapPin, Phone, ExternalLink, Navigation } from "lucide-react";

export function LocationSection() {
  const directionsUrl = "https://www.google.com/maps/dir/?api=1&destination=Rua+Padre+Rolim,+715+-+Santa+Efig%C3%AAnia,+Belo+Horizonte+-+MG";

  return (
    <Section id="localizacao" variant="light" padding="default" className="border-b border-brand-border/40 bg-[#FAF6F0]">
      <Container size="large">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Address and Info */}
          <div className="lg:col-span-6 space-y-6">
            <SectionHeading
              kicker="LOCALIZAÇÃO"
              title="Shaiff Cabeleireiros em Santa Efigênia, Belo Horizonte"
              align="left"
              className="mb-4"
            />

            <p className="text-base text-brand-bodyText leading-relaxed">
              O <strong>Shaiff Cabeleireiros</strong> está localizado na Rua Padre Rolim, dentro do Condomínio Edifício Angelini Center, no bairro Santa Efigênia, em Belo Horizonte.
            </p>

            <div className="bg-white p-6 rounded-2xl border border-brand-border/60 shadow-sm space-y-4 text-sm text-brand-bodyText hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="block text-brand-heading font-semibold text-base mb-1">
                    Endereço Completo
                  </strong>
                  <p>{siteConfig.address}</p>
                  <p>{siteConfig.building}</p>
                  <p>
                    {siteConfig.neighborhood}, {siteConfig.city} - {siteConfig.state}
                  </p>
                  <p>CEP {siteConfig.postalCode}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-brand-border/40">
                <Phone className="w-5 h-5 text-brand-primary shrink-0" />
                <div>
                  <span className="text-xs text-brand-secondary font-medium block">Telefone</span>
                  <a
                    href={siteConfig.telephoneHref}
                    className="text-base font-semibold text-brand-heading hover:text-brand-primary transition-colors"
                  >
                    {siteConfig.telephone}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                href={siteConfig.googleBusinessProfile}
                external
                variant="primary"
                size="md"
              >
                <span>Ver perfil no Google</span>
                <ExternalLink className="w-4 h-4 ml-1" />
              </Button>
              <Button
                href={siteConfig.telephoneHref}
                external
                variant="outline"
                size="md"
              >
                <span>Ligar para o Shaiff</span>
              </Button>
            </div>
          </div>

          {/* Right Column: Interactive Map & Responsive Navigation Button */}
          <div className="lg:col-span-6 flex flex-col">
            {/* Mobile Button (above map) */}
            <div className="block lg:hidden mb-4">
              <Button
                href={directionsUrl}
                external
                variant="primary"
                size="lg"
                className="w-full justify-center shadow-sm"
              >
                <Navigation className="w-4 h-4 mr-2" />
                <span>Calcular rota</span>
              </Button>
            </div>

            {/* Interactive Google Map */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-brand-border/60 shadow-lg">
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-brand-border/40 relative">
                <iframe
                  title="Mapa de localização do Shaiff Cabeleireiros"
                  src="https://maps.google.com/maps?q=Rua+Padre+Rolim,+715,+Santa+Efigenia,+Belo+Horizonte+-+MG&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Desktop Button (below map) */}
            <div className="hidden lg:block mt-4">
              <Button
                href={directionsUrl}
                external
                variant="primary"
                size="lg"
                className="w-full justify-center shadow-sm"
              >
                <Navigation className="w-4 h-4 mr-2" />
                <span>Calcular rota</span>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
