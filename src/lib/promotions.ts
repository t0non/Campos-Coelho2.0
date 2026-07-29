import { PromotionalCombo, ComboStatus } from "@/types/promotion";

/**
 * Formats numeric price into pt-BR currency (ex: R$ 150,00)
 */
export function formatCurrencyBRL(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

/**
 * Calculates current status of a promotional combo based on date and active state.
 * States: Rascunho, Programado, Ativo, Encerrado, Inativo.
 */
export function getComboStatus(combo: Partial<PromotionalCombo>): ComboStatus {
  if (!combo.is_active) {
    return "Rascunho";
  }

  const now = new Date();

  if (combo.starts_at) {
    const startDate = new Date(combo.starts_at);
    if (startDate > now) {
      return "Programado";
    }
  }

  if (combo.ends_at) {
    const endDate = new Date(combo.ends_at);
    if (endDate < now) {
      return "Encerrado";
    }
  }

  return "Ativo";
}

/**
 * Validates if a combo is currently public, active, and within validity dates.
 */
export function isValidActiveCombo(combo: Partial<PromotionalCombo>): boolean {
  if (!combo.is_active) return false;
  const status = getComboStatus(combo);
  return status === "Ativo";
}

/**
 * Formats ISO date to human readable Brazilian date (ex: 31/12/2026 às 23:59) in America/Sao_Paulo
 */
export function formatBRDateTime(isoDateString?: string | null): string {
  if (!isoDateString) return "";
  try {
    const date = new Date(isoDateString);
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(date);
  } catch {
    return "";
  }
}

/**
 * Converts datetime-local input (YYYY-MM-DDTHH:mm) assuming America/Sao_Paulo timezone into ISO UTC String
 */
export function parseSaoPauloToISO(dateTimeLocalString: string): string | null {
  if (!dateTimeLocalString) return null;
  try {
    // Append timezone offset for Sao Paulo (-03:00) if not provided
    const dateWithOffset = dateTimeLocalString.includes("T")
      ? `${dateTimeLocalString}:00-03:00`
      : `${dateTimeLocalString}T00:00:00-03:00`;
    return new Date(dateWithOffset).toISOString();
  } catch {
    return null;
  }
}

/**
 * Converts ISO string to datetime-local format (YYYY-MM-DDTHH:mm) for form inputs in America/Sao_Paulo
 */
export function parseISOToSaoPauloLocal(isoDateString?: string | null): string {
  if (!isoDateString) return "";
  try {
    const date = new Date(isoDateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    };
    const parts = new Intl.DateTimeFormat("en-US", options).formatToParts(date);
    const map = new Map(parts.map((p) => [p.type, p.value]));
    
    const year = map.get("year");
    const month = map.get("month");
    const day = map.get("day");
    const hour = map.get("hour");
    const minute = map.get("minute");

    return `${year}-${month}-${day}T${hour}:${minute}`;
  } catch {
    return "";
  }
}

/**
 * Generates a URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
