"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { ContactFormData, FieldErrors, ApiResponseCode } from "@/types/contact";
import { validateContactForm, formatPhone } from "@/lib/contact-validation";
import { getStoredAttribution } from "@/lib/attribution";
import { trackEvent } from "@/lib/analytics";
import { FormField } from "./FormField";
import { FormStatus } from "./FormStatus";
import { SelectedServiceNotice } from "./SelectedServiceNotice";
import { Button } from "@/components/ui/Button";
import { Send, Loader2 } from "lucide-react";

interface ContactFormProps {
  preselectedServiceSlug?: string;
  preselectedCombo?: {
    title: string;
    slug: string;
  };
}

export function ContactForm({ preselectedServiceSlug, preselectedCombo }: ContactFormProps) {
  const router = useRouter();
  const formStartedRef = useRef(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [selectedCombo, setSelectedCombo] = useState<{ title: string; slug: string } | undefined>(
    preselectedCombo
  );

  // Determine initial service slug
  const validServiceSlugs = siteConfig.services
    .filter((s) => s.active)
    .map((s) => s.slug);
  
  const initialSlug =
    preselectedServiceSlug && validServiceSlugs.includes(preselectedServiceSlug)
      ? preselectedServiceSlug
      : "";

  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    phone: "",
    email: "",
    serviceSlug: initialSlug,
    preferredPeriod: "Sem preferência",
    preferredDate: "",
    contactPreference: "Tanto faz",
    message: "",
    privacyConsent: false,
    companyWebsite: "", // Honeypot
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiCode, setApiCode] = useState<ApiResponseCode | null>(null);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  // Today's date string YYYY-MM-DD for date picker min
  const todayStr = new Date().toISOString().split("T")[0];

  // Selected service display name
  const selectedServiceObj = siteConfig.services.find(
    (s) => s.slug === formData.serviceSlug
  );

  const handleFirstInteraction = () => {
    if (!formStartedRef.current) {
      formStartedRef.current = true;
      trackEvent("form_start", { selected_service: formData.serviceSlug });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    handleFirstInteraction();
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "phone") {
      setFormData((prev) => ({ ...prev, phone: formatPhone(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear specific field error when user types
    if (errors[name as keyof FieldErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiCode(null);
    setApiMessage(null);

    // Client-side validation
    const { isValid, errors: valErrors } = validateContactForm(formData);
    if (!isValid) {
      setErrors(valErrors);
      trackEvent("form_error", {
        error_code: "CLIENT_VALIDATION_ERROR",
        selected_service: formData.serviceSlug,
        stage: "client",
      });

      // Focus first invalid field
      const firstErrorKey = Object.keys(valErrors)[0];
      if (firstErrorKey) {
        const el = document.getElementById(firstErrorKey);
        if (el) el.focus();
      }
      return;
    }

    setIsSubmitting(true);
    trackEvent("form_submit", { selected_service: formData.serviceSlug });

    try {
      const attribution = getStoredAttribution();
      const payload = {
        ...formData,
        comboSlug: selectedCombo?.slug,
        attribution,
        sourcePath: typeof window !== "undefined" ? window.location.pathname : "/contato",
      };

      const res = await fetch("/api/contato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        trackEvent("form_success", {
          selected_service: formData.serviceSlug,
          request_id: json.requestId,
          lead_type: "booking_request",
        });

        // Store confirmation data securely in sessionStorage (No PII)
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "shaiff_booking_success",
            JSON.stringify({
              requestId: json.requestId,
              serviceName: selectedServiceObj ? selectedServiceObj.name : "Serviço Geral",
            })
          );
        }

        router.push("/obrigado");
      } else {
        setApiCode(json.code || "INTERNAL_ERROR");
        setApiMessage(json.message || "Ocorreu um erro ao enviar sua solicitação.");

        if (json.fieldErrors) {
          setErrors(json.fieldErrors);
        }

        trackEvent("form_error", {
          error_code: json.code || "SERVER_ERROR",
          selected_service: formData.serviceSlug,
          stage: "server",
        });
      }
    } catch (err) {
      setApiCode("INTERNAL_ERROR");
      setApiMessage(
        "Não foi possível conectar ao servidor no momento. Por favor, tente ligar para a nossa recepção."
      );
      trackEvent("form_error", {
        error_code: "NETWORK_ERROR",
        selected_service: formData.serviceSlug,
        stage: "network",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-brand-surface p-6 sm:p-8 rounded-xl border border-brand-border/70 shadow-sm space-y-6">
      <div className="space-y-2 text-left">
        <h2 className="font-heading text-2xl font-medium text-brand-heading">
          Solicitar Agendamento
        </h2>
        <p className="text-xs sm:text-sm text-brand-bodyText/80 leading-relaxed font-sans">
          Informe seus dados e o atendimento que você deseja. A equipe consultará a disponibilidade e entrará em contato.
        </p>
      </div>

      {selectedCombo && (
        <div className="bg-brand-cream border border-brand-primary/30 p-3.5 rounded-lg flex items-center justify-between text-xs sm:text-sm text-brand-dark">
          <div>
            <span className="font-semibold text-brand-primary block">Combo promocional selecionado:</span>
            <span className="font-medium">{selectedCombo.title}</span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedCombo(undefined)}
            className="text-xs text-brand-secondary hover:text-brand-primary underline shrink-0 ml-2"
          >
            Remover seleção
          </button>
        </div>
      )}

      {selectedServiceObj && !selectedCombo && (
        <SelectedServiceNotice serviceName={selectedServiceObj.name} />
      )}

      <FormStatus code={apiCode} message={apiMessage} />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Invisible Honeypot Field */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="companyWebsite">Website</label>
          <input
            type="text"
            id="companyWebsite"
            name="companyWebsite"
            tabIndex={-1}
            autoComplete="off"
            value={formData.companyWebsite}
            onChange={handleChange}
          />
        </div>

        {/* Row 1: Name and Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="name" label="Seu Nome" required error={errors.name}>
            <input
              ref={nameInputRef}
              type="text"
              id="name"
              name="name"
              required
              autoComplete="name"
              maxLength={100}
              placeholder="Digite seu nome completo"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
            />
          </FormField>

          <FormField id="phone" label="Telefone com DDD" required error={errors.phone}>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              autoComplete="tel"
              inputMode="tel"
              placeholder="(31) 99999-9999"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors font-mono"
            />
          </FormField>
        </div>

        {/* Row 2: Email and Service */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="email"
            label="E-mail (opcional)"
            error={errors.email}
            helpText="Para receber a cópia do contato caso deseje"
          >
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              maxLength={160}
              placeholder="seuemail@exemplo.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
            />
          </FormField>

          <FormField
            id="serviceSlug"
            label="Serviço de interesse"
            required
            error={errors.serviceSlug}
          >
            <select
              id="serviceSlug"
              name="serviceSlug"
              required
              aria-invalid={Boolean(errors.serviceSlug)}
              aria-describedby={errors.serviceSlug ? "serviceSlug-error" : undefined}
              value={formData.serviceSlug}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
            >
              <option value="">Selecione um serviço</option>
              {siteConfig.services
                .filter((s) => s.active)
                .map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              <option value="ainda-nao-sei">Ainda não sei qual escolher</option>
            </select>
          </FormField>
        </div>

        {/* Row 3: Period and Preferred Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            id="preferredPeriod"
            label="Melhor período"
            required
            error={errors.preferredPeriod}
          >
            <select
              id="preferredPeriod"
              name="preferredPeriod"
              required
              aria-invalid={Boolean(errors.preferredPeriod)}
              aria-describedby={errors.preferredPeriod ? "preferredPeriod-error" : undefined}
              value={formData.preferredPeriod}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
            >
              <option value="Manhã">Manhã</option>
              <option value="Tarde">Tarde</option>
              <option value="Sem preferência">Sem preferência</option>
            </select>
          </FormField>

          <FormField
            id="preferredDate"
            label="Data de preferência (opcional)"
            error={errors.preferredDate}
            helpText="Preferência sujeita à disponibilidade"
          >
            <input
              type="date"
              id="preferredDate"
              name="preferredDate"
              min={todayStr}
              aria-invalid={Boolean(errors.preferredDate)}
              aria-describedby={errors.preferredDate ? "preferredDate-error" : undefined}
              value={formData.preferredDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
            />
          </FormField>
        </div>

        {/* Preference of contact */}
        <FormField id="contactPreference" label="Como prefere o retorno? (opcional)">
          <div className="flex items-center gap-6 pt-1">
            <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-brand-bodyText cursor-pointer">
              <input
                type="radio"
                name="contactPreference"
                value="Ligação"
                checked={formData.contactPreference === "Ligação"}
                onChange={handleChange}
                className="w-4 h-4 text-brand-primary border-brand-border focus:ring-brand-primary"
              />
              <span>Ligação por telefone</span>
            </label>
            <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-brand-bodyText cursor-pointer">
              <input
                type="radio"
                name="contactPreference"
                value="Tanto faz"
                checked={formData.contactPreference === "Tanto faz"}
                onChange={handleChange}
                className="w-4 h-4 text-brand-primary border-brand-border focus:ring-brand-primary"
              />
              <span>Tanto faz</span>
            </label>
          </div>
        </FormField>

        {/* Message */}
        <FormField
          id="message"
          label="Conte um pouco sobre o atendimento que procura (opcional)"
          error={errors.message}
        >
          <div className="relative">
            <textarea
              id="message"
              name="message"
              rows={3}
              maxLength={800}
              placeholder="Exemplo: gostaria de consultar disponibilidade para mechas e tirar algumas dúvidas antes de agendar."
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "message-error" : undefined}
              value={formData.message}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors font-sans resize-y"
            />
            <div className="text-[11px] text-brand-bodyText/60 text-right mt-1 font-mono">
              {(formData.message || "").length} / 800
            </div>
          </div>
        </FormField>

        {/* Consent Checkbox */}
        <div className="space-y-1 pt-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="privacyConsent"
              name="privacyConsent"
              required
              checked={formData.privacyConsent}
              onChange={handleChange}
              aria-invalid={Boolean(errors.privacyConsent)}
              className="w-4 h-4 mt-0.5 text-brand-primary border-brand-border rounded focus:ring-brand-primary shrink-0"
            />
            <span className="text-xs text-brand-bodyText leading-relaxed">
              Li e concordo com a{" "}
              <Link
                href="/politica-de-privacidade"
                target="_blank"
                className="text-brand-primary underline hover:text-brand-primaryHover"
              >
                Política de Privacidade
              </Link>{" "}
              e autorizo o uso dos meus dados para que o Shaiff Cabeleireiros entre em contato sobre esta solicitação. *
            </span>
          </label>
          {errors.privacyConsent && (
            <p role="alert" className="text-xs font-medium text-red-600 font-sans">
              {errors.privacyConsent}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-3">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting}
            className="w-full justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Enviando solicitação...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                <span>Solicitar agendamento</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
