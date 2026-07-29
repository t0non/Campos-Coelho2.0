import { AttributionData } from "@/types/contact";

const STORAGE_KEY = "shaiff_attribution_data";

export function captureAttribution(): void {
  if (typeof window === "undefined") return;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const existing = getStoredAttribution();

    const newAttribution: AttributionData = {
      utm_source: urlParams.get("utm_source") || existing.utm_source || undefined,
      utm_medium: urlParams.get("utm_medium") || existing.utm_medium || undefined,
      utm_campaign: urlParams.get("utm_campaign") || existing.utm_campaign || undefined,
      utm_content: urlParams.get("utm_content") || existing.utm_content || undefined,
      utm_term: urlParams.get("utm_term") || existing.utm_term || undefined,
      gclid: urlParams.get("gclid") || existing.gclid || undefined,
      gbraid: urlParams.get("gbraid") || existing.gbraid || undefined,
      wbraid: urlParams.get("wbraid") || existing.wbraid || undefined,
      entry_page: existing.entry_page || window.location.pathname,
      referrer: existing.referrer || (document.referrer ? document.referrer.slice(0, 200) : undefined),
    };

    // Limit value lengths
    Object.keys(newAttribution).forEach((key) => {
      const k = key as keyof AttributionData;
      if (newAttribution[k] && typeof newAttribution[k] === "string") {
        newAttribution[k] = (newAttribution[k] as string).slice(0, 150);
      }
    });

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newAttribution));
  } catch (err) {
    // Fail silently in environments where storage is restricted
  }
}

export function getStoredAttribution(): AttributionData {
  if (typeof window === "undefined") return {};

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as AttributionData;
  } catch (err) {
    return {};
  }
}
