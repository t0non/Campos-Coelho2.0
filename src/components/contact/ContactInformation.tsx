import React from "react";
import { siteConfig } from "@/config/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Phone, MapPin, ExternalLink, Clock } from "lucide-react";
import { TrackedPhoneLink, TrackedLink } from "@/components/tracking/TrackedLink";

export function ContactInformation() {
  return (
    <div className="bg-white p-8 rounded-xl border border-brand-border shadow-sm space-y-6">
      <SectionHeading
        title="Informações de Contato"
        subtitle="Fale conosco por telefone ou venha nos visitar no bairro Santa Efigênia."
        align="left"
      />

      <div className="space-y-6 text-brand-dark text-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand-cream flex items-center justify-center text-brand-primary shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-medium text-brand-dark">
              Telefone
            </h3>
            <p className="text-xs text-brand-dark/80 mb-1">
              Atendimento e dúvidas pela recepção:
            </p>
            <TrackedPhoneLink
              href={siteConfig.telephoneHref}
              location="contact_page_info"
              className="text-lg font-semibold text-brand-primary hover:underline font-mono"
            >
              {siteConfig.telephone}
            </TrackedPhoneLink>
          </div>
        </div>

        <div className="flex items-start gap-4 pt-4 border-t border-brand-border">
          <div className="w-10 h-10 rounded-lg bg-brand-cream flex items-center justify-center text-brand-primary shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-medium text-brand-dark">
              Endereço Completo
            </h3>
            <div className="text-xs sm:text-sm text-brand-dark leading-relaxed mt-1">
              <p className="font-medium text-brand-dark">{siteConfig.address}</p>
              <p>{siteConfig.building}</p>
              <p>
                {siteConfig.neighborhood}, {siteConfig.city} - {siteConfig.state}
              </p>
              <p>CEP {siteConfig.postalCode}</p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-4 pt-4 border-t border-brand-border">
          <div className="w-10 h-10 rounded-lg bg-brand-cream flex items-center justify-center text-brand-primary shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-medium text-brand-dark">
              Atendimento
            </h3>
            <p className="text-xs sm:text-sm text-brand-dark/80 leading-relaxed mt-1">
              Atendimentos realizados mediante consulta prévia de disponibilidade de horário.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-brand-border">
        <TrackedLink
          href={siteConfig.googleBusinessProfile}
          eventName="click_google_profile"
          eventParams={{ location: "contact_page_info" }}
          external
          className="inline-flex items-center gap-2 text-xs font-semibold text-brand-primary hover:underline"
        >
          <span>Ver perfil oficial no Google</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </TrackedLink>
      </div>
    </div>
  );
}
