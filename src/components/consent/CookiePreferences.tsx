"use client";

import React, { useState, useEffect } from "react";
import { getStoredConsent, saveConsent } from "@/lib/consent";
import { trackEvent } from "@/lib/analytics";
import { X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CookiePreferencesProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CookiePreferences({ isOpen, onClose }: CookiePreferencesProps) {
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const consent = getStoredConsent();
      setAnalytics(consent.analytics);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveConsent(analytics);
    trackEvent("consent_update", { analytics_allowed: analytics });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-preferences-title"
    >
      <div className="w-full max-w-lg bg-brand-surface rounded-2xl border border-brand-border p-6 shadow-2xl space-y-6 text-brand-bodyText">
        <div className="flex items-center justify-between pb-4 border-b border-brand-border/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand-primary" />
            <h2 id="cookie-preferences-title" className="font-heading text-xl font-medium text-brand-heading">
              Preferências de Cookies
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de preferências"
            className="p-1 text-stone-400 hover:text-brand-heading rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Necessary Cookies Option */}
          <div className="p-4 bg-brand-muted/60 rounded-xl border border-brand-border/40 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-brand-heading">Cookies Necessários</span>
              <span className="text-xs font-semibold uppercase text-brand-primary bg-brand-muted px-2 py-0.5 rounded">
                Sempre Ativos
              </span>
            </div>
            <p className="text-xs text-brand-bodyText/80 leading-relaxed">
              Essenciais para a navegação, segurança e funcionamento das rotas e formulários do site.
            </p>
          </div>

          {/* Analytics Cookies Option */}
          <div className="p-4 bg-brand-surface rounded-xl border border-brand-border/70 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="pref-analytics" className="font-semibold text-brand-heading cursor-pointer">
                Medição e Publicidade
              </label>
              <input
                id="pref-analytics"
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="w-4 h-4 text-brand-primary border-brand-border rounded focus:ring-brand-primary"
              />
            </div>
            <p className="text-xs text-brand-bodyText/80 leading-relaxed">
              Permitem mensuração de acessos e desempenho de campanhas de forma anônima, sem armazenar dados pessoais.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-3 border-t border-brand-border/40">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={handleSave}>
            Salvar preferências
          </Button>
        </div>
      </div>
    </div>
  );
}
