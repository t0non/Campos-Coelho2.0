import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.businessName,
    short_name: siteConfig.alternateName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#FBEDDF",
    theme_color: "#2B231B",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
