import { MetadataRoute } from "next";
import { createAbsoluteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const sitemapUrl = createAbsoluteUrl("/sitemap.xml");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/obrigado"],
      },
    ],
    ...(sitemapUrl ? { sitemap: sitemapUrl } : {}),
  };
}
