import type { Metadata } from "next";
import { Raleway, Manrope } from "next/font/google";
import "@/styles/globals.css";
import { siteConfig } from "@/config/site";
import { seoConfig, getCanonicalUrl } from "@/config/seo";
import { getSiteUrl } from "@/lib/site-url";
import { generateHairSalonSchema, generateWebSiteSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileContactBar } from "@/components/layout/MobileContactBar";
import { AttributionCapture } from "@/components/tracking/AttributionCapture";
import { GoogleTagManager } from "@/components/tracking/GoogleTagManager";
import { CookieBanner } from "@/components/consent/CookieBanner";
import { SkipLink } from "@/components/ui/SkipLink";
import { WhatsAppWidget } from "@/components/ui/WhatsAppWidget";

const headingFont = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-heading",
  display: "swap",
});

const bodyFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: seoConfig.defaultTitle,
    template: seoConfig.titleTemplate,
  },
  description: seoConfig.defaultDescription,
  applicationName: siteConfig.businessName,
  publisher: siteConfig.businessName,
  formatDetection: {
    telephone: true,
    address: true,
    email: false,
  },
  alternates: {
    canonical: getCanonicalUrl("/"),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    siteName: siteConfig.businessName,
    locale: seoConfig.locale,
    type: "website",
    url: siteUrl || undefined,
  },
  twitter: {
    card: "summary_large_image",
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
  },
  verification: seoConfig.verification,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const globalSchemas = [
    generateHairSalonSchema(),
    generateWebSiteSchema(),
  ];

  return (
    <html
      lang="pt-BR"
      className={`${headingFont.variable} ${bodyFont.variable} scroll-smooth overflow-x-hidden`}
    >
      <body className="min-h-screen flex flex-col bg-brand-background text-brand-bodyText antialiased overflow-x-hidden">
        <SkipLink />
        <JsonLd graph={globalSchemas} />
        <GoogleTagManager />
        <AttributionCapture />
        <Header />
        <main id="conteudo-principal" tabIndex={-1} className="flex-1 pb-16 md:pb-0 outline-none">
          {children}
        </main>
        <Footer />
        <WhatsAppWidget />
        <CookieBanner />
      </body>
    </html>
  );
}
