"use client";

import React, { useState, useEffect } from "react";
import { getStoredConsent, saveConsent } from "@/lib/consent";
import { trackEvent } from "@/lib/analytics";
import { CookiePreferences } from "./CookiePreferences";
import { Button } from "@/components/ui/Button";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const consent = getStoredConsent();
    if (!consent.decided) {
      setShowBanner(true);
    }

    const handleOpenModal = () => {
      setShowModal(true);
    };

    window.addEventListener("shaiff_open_cookie_preferences", handleOpenModal);
    return () => window.removeEventListener("shaiff_open_cookie_preferences", handleOpenModal);
  }, []);

  const handleAcceptAll = () => {
    saveConsent(true);
    trackEvent("consent_update", { analytics_allowed: true });
    setShowBanner(false);
  };

  const handleDeclineAll = () => {
    saveConsent(false);
    trackEvent("consent_update", { analytics_allowed: false });
    setShowBanner(false);
  };

  return (
    <>
      {showBanner && (
        <div
          role="region"
          aria-label="Aviso de Privacidade e Cookies"
          className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-6 bg-brand-dark/95 backdrop-blur-md text-brand-cream border-t border-brand-cream/10 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-brand-cream/90 leading-relaxed max-w-3xl text-center md:text-left">
              Utilizamos cookies necessários para o funcionamento do site e, com sua autorização, cookies de medição para entender o uso das páginas e melhorar nossas campanhas.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
              <Button type="button" variant="primary" size="sm" onClick={handleAcceptAll}>
                Aceitar medição
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={handleDeclineAll}>
                Recusar
              </Button>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="text-xs text-brand-cream/80 hover:text-brand-primary underline p-2 transition-colors"
              >
                Ver preferências
              </button>
            </div>
          </div>
        </div>
      )}

      <CookiePreferences isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
