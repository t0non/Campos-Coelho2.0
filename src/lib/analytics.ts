import { getStoredConsent } from "./consent";

export type EventName =
  | "click_phone"
  | "click_schedule"
  | "click_google_profile"
  | "click_directions"
  | "view_service"
  | "form_start"
  | "form_submit"
  | "form_success"
  | "form_error"
  | "consent_update";

export function trackEvent(
  eventName: EventName,
  parameters: Record<string, string | number | boolean | undefined> = {}
): void {
  if (typeof window === "undefined") return;

  try {
    const consent = getStoredConsent();
    
    // Always clean parameters to prevent PII leakage
    const sanitizedParams: Record<string, string | number | boolean> = {};
    
    Object.keys(parameters).forEach((key) => {
      // Exclude any keys that might contain PII
      if (
        ["name", "phone", "email", "message", "address", "companyWebsite"].includes(key)
      ) {
        return;
      }
      const val = parameters[key];
      if (val !== undefined && val !== null) {
        sanitizedParams[key] = val;
      }
    });

    sanitizedParams.page_path = window.location.pathname;

    // 1. DataLayer for Google Tag Manager (if active)
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...sanitizedParams,
    });

    // Only dispatch to direct analytics tags if user consented or if it's a consent update
    if (consent.analytics || eventName === "consent_update") {
      // 2. Direct gtag (if enabled)
      if (typeof window.gtag === "function" && process.env.NEXT_PUBLIC_DIRECT_GTAG_ENABLED === "true") {
        window.gtag("event", eventName, sanitizedParams);
      }

      // 3. Direct Meta Pixel (if enabled)
      if (typeof window.fbq === "function" && process.env.NEXT_PUBLIC_DIRECT_META_ENABLED === "true") {
        if (eventName === "form_success") {
          window.fbq("track", "Lead", {
            service: sanitizedParams.selected_service,
          });
        } else {
          window.fbq("trackCustom", eventName, sanitizedParams);
        }
      }
    }
  } catch (err) {
    // Fail silently without disrupting user experience
  }
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}
