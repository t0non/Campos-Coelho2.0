export function getSiteUrl(): string | null {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!envUrl || envUrl.trim() === "") {
    if (process.env.NODE_ENV === "development") {
      return "http://localhost:3000";
    }
    return null;
  }

  let cleaned = envUrl.trim();
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = `https://${cleaned}`;
  }

  // Remove trailing slash
  return cleaned.replace(/\/+$/, "");
}

export function normalizePath(path: string): string {
  if (!path) return "/";
  let cleaned = path.trim();
  if (!cleaned.startsWith("/")) {
    cleaned = `/${cleaned}`;
  }
  if (cleaned.length > 1 && cleaned.endsWith("/")) {
    cleaned = cleaned.slice(0, -1);
  }
  return cleaned;
}

export function createAbsoluteUrl(path: string): string | null {
  const siteUrl = getSiteUrl();
  if (!siteUrl) return null;
  const normalized = normalizePath(path);
  return `${siteUrl}${normalized === "/" ? "" : normalized}`;
}
