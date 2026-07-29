import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { createAbsoluteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [];

  // Helper to add route safely
  const addRoute = (
    path: string,
    priority: number,
    changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  ) => {
    const url = createAbsoluteUrl(path);
    if (url) {
      routes.push({
        url,
        changeFrequency,
        priority,
      });
    }
  };

  // Static Public Pages
  addRoute("/", 1.0, "monthly");
  addRoute("/servicos", 0.9, "monthly");
  addRoute("/sobre", 0.6, "yearly");
  addRoute("/contato", 0.6, "yearly");
  addRoute("/politica-de-privacidade", 0.3, "yearly");

  // Dynamic Service Detail Pages
  siteConfig.services
    .filter((s) => s.active)
    .forEach((s) => {
      addRoute(`/servicos/${s.slug}`, 0.8, "monthly");
    });

  return routes;
}
