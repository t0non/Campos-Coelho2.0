import { siteConfig } from "@/config/site";
import { ContactFormData, FieldErrors } from "@/types/contact";

export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) {
    return digits ? `(${digits}` : "";
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function validateContactForm(data: Partial<ContactFormData>): {
  isValid: boolean;
  errors: FieldErrors;
} {
  const errors: FieldErrors = {};

  // Honeypot check
  if (data.companyWebsite && data.companyWebsite.trim() !== "") {
    errors.companyWebsite = "Spam detectado.";
  }

  // Name validation
  const name = (data.name || "").trim();
  if (!name) {
    errors.name = "Por favor, informe seu nome.";
  } else if (name.length < 2) {
    errors.name = "O nome deve ter pelo menos 2 caracteres.";
  } else if (name.length > 100) {
    errors.name = "O nome não pode exceder 100 caracteres.";
  }

  // Phone validation
  const phoneDigits = normalizePhone(data.phone || "");
  if (!phoneDigits) {
    errors.phone = "Por favor, informe seu telefone com DDD.";
  } else if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    errors.phone = "Informe um telefone válido com DDD (10 ou 11 dígitos).";
  }

  // Optional Email validation
  const email = (data.email || "").trim();
  if (email) {
    if (email.length > 160) {
      errors.email = "O e-mail não pode exceder 160 caracteres.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = "Informe um endereço de e-mail válido.";
      }
    }
  }

  // Service validation
  const validSlugs = [
    ...siteConfig.services.filter((s) => s.active).map((s) => s.slug),
    "ainda-nao-sei",
  ];
  if (!data.serviceSlug || !validSlugs.includes(data.serviceSlug)) {
    errors.serviceSlug = "Por favor, selecione um serviço válido da lista.";
  }

  // Preferred period validation
  const validPeriods = ["Manhã", "Tarde", "Sem preferência"];
  if (!data.preferredPeriod || !validPeriods.includes(data.preferredPeriod)) {
    errors.preferredPeriod = "Selecione o melhor período para atendimento.";
  }

  // Optional Message validation
  if (data.message && data.message.length > 800) {
    errors.message = "A mensagem não pode exceder 800 caracteres.";
  }

  // Privacy consent validation
  if (!data.privacyConsent) {
    errors.privacyConsent = "Você precisa concordar com a Política de Privacidade.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
