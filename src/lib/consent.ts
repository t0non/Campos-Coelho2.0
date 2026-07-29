export interface CookieConsentState {
  necessary: true;
  analytics: boolean;
  decided: boolean;
  updatedAt?: string;
}

const STORAGE_KEY = "shaiff_cookie_consent";

export const defaultConsentState: CookieConsentState = {
  necessary: true,
  analytics: false,
  decided: false,
};

export function getStoredConsent(): CookieConsentState {
  if (typeof window === "undefined") return defaultConsentState;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultConsentState;
    const parsed = JSON.parse(raw);
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      decided: Boolean(parsed.decided),
      updatedAt: parsed.updatedAt,
    };
  } catch (err) {
    return defaultConsentState;
  }
}

export function saveConsent(analytics: boolean): CookieConsentState {
  const newState: CookieConsentState = {
    necessary: true,
    analytics,
    decided: true,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      // Dispatch custom event for reactive updates across components
      window.dispatchEvent(new CustomEvent("shaiff_consent_changed", { detail: newState }));
    } catch (err) {
      // Ignore storage errors
    }
  }

  return newState;
}
