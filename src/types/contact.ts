export type ContactPeriod = "Manhã" | "Tarde" | "Sem preferência";

export type ContactPreference = "Ligação" | "Tanto faz";

export interface ContactFormData {
  name: string;
  phone: string;
  email?: string;
  serviceSlug: string;
  preferredPeriod: ContactPeriod;
  preferredDate?: string;
  contactPreference?: ContactPreference;
  message?: string;
  privacyConsent: boolean;
  companyWebsite?: string; // Honeypot field - MUST be empty
}

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  entry_page?: string;
  referrer?: string;
}

export interface ContactPayload extends ContactFormData {
  requestId: string;
  submittedAt: string;
  sourcePath: string;
  attribution: AttributionData;
}

export interface FieldErrors {
  name?: string;
  phone?: string;
  email?: string;
  serviceSlug?: string;
  preferredPeriod?: string;
  preferredDate?: string;
  message?: string;
  privacyConsent?: string;
  companyWebsite?: string;
}

export type ApiResponseCode =
  | "SUCCESS"
  | "VALIDATION_ERROR"
  | "SPAM_DETECTED"
  | "CONTACT_CHANNEL_NOT_CONFIGURED"
  | "INTERNAL_ERROR";

export interface ApiResponse {
  success: boolean;
  code: ApiResponseCode;
  message: string;
  requestId?: string;
  fieldErrors?: FieldErrors;
}
