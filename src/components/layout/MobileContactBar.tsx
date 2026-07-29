"use client";

import React from "react";
import { Phone, Calendar } from "lucide-react";
import { siteConfig } from "@/config/site";
import { trackEvent } from "@/lib/analytics";

export function MobileContactBar() {
  return (
    <div
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-brand-darkSurface/95 backdrop-blur-md border-t border-stone-800 p-3 shadow-2xl"
    >
      <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
        <a
          href={siteConfig.telephoneHref}
          onClick={() => trackEvent("click_phone", { location: "mobile_contact_bar" })}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-brand-champagneLight font-medium text-sm rounded-lg border border-stone-700 transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary"
          aria-label={`Ligar para o salão ${siteConfig.telephone}`}
        >
          <Phone className="w-4 h-4 text-brand-primary" />
          <span>Ligar</span>
        </a>

        <a
          href="/contato"
          onClick={() => trackEvent("click_schedule", { location: "mobile_contact_bar" })}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-primary hover:bg-brand-primaryHover text-white font-medium text-sm rounded-lg shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label="Ir para agendamento de horário"
        >
          <Calendar className="w-4 h-4" />
          <span>Agendar</span>
        </a>
      </div>
    </div>
  );
}
