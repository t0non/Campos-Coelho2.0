"use client";

import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { siteConfig } from "@/config/site";
import { MessageCircle, MapPin, ExternalLink } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const featuredServices = siteConfig.services.filter(
    (service) => service.active && service.featured
  );

  const openCookiePreferences = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("shaiff_open_cookie_preferences"));
    }
  };

  return (
    <footer className="bg-brand-dark text-brand-cream border-t border-brand-cream/10">
      <Container size="large" className="py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <Logo variant="light" size="medium" />
            <p className="text-sm text-brand-cream/80 leading-relaxed pt-2">
              {siteConfig.description}
            </p>
            <SocialLinks variant="dark" />
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-medium text-white tracking-wide">
              Navegação
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-brand-cream/80 hover:text-brand-primary transition-colors"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  href="/servicos"
                  className="text-brand-cream/80 hover:text-brand-primary transition-colors"
                >
                  Serviços
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre"
                  className="text-brand-cream/80 hover:text-brand-primary transition-colors"
                >
                  Sobre o Salão
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="text-brand-cream/80 hover:text-brand-primary transition-colors"
                >
                  Contato & Localização
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-de-privacidade"
                  className="text-brand-cream/80 hover:text-brand-primary transition-colors"
                >
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Featured Services */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-medium text-white tracking-wide">
              Principais Serviços
            </h3>
            <ul className="space-y-2.5 text-sm">
              {featuredServices.map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/servicos/${service.slug}`}
                    className="text-brand-cream/80 hover:text-brand-primary transition-colors"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Address & Contact */}
          <div className="space-y-4">
            <h3 className="font-heading text-lg font-medium text-white tracking-wide">
              Atendimento e Endereço
            </h3>
            <address className="not-italic text-sm text-brand-cream/80 space-y-3 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-primary shrink-0 mt-1" />
                <div>
                  <p>{siteConfig.address}</p>
                  <p>{siteConfig.building}</p>
                  <p>
                    {siteConfig.neighborhood}, {siteConfig.city} - {siteConfig.state}
                  </p>
                  <p>CEP {siteConfig.postalCode}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <MessageCircle className="w-4 h-4 text-brand-cream/60 shrink-0" />
                <a
                  href="https://wa.me/553135640123?text=Ol%C3%A1!%20Vim%20pelo%20site%20do%20Shaiff%20Cabeleireiros%20e%20gostaria%20de%20agendar%20um%20hor%C3%A1rio."
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("click_phone", { location: "footer" })}
                  className="hover:text-brand-primary transition-colors font-medium text-white font-mono"
                >
                  {siteConfig.telephone}
                </a>
              </div>

              {siteConfig.googleBusinessProfile && (
                <div className="pt-2">
                  <a
                    href={siteConfig.googleBusinessProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("click_google_profile", { location: "footer" })}
                    className="inline-flex items-center gap-1.5 text-xs text-brand-primary hover:underline font-medium"
                  >
                    <span>Ver perfil no Google</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-brand-cream/10 text-xs text-brand-cream/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p>
            © {currentYear} {siteConfig.businessName}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/politica-de-privacidade"
              className="hover:text-brand-primary transition-colors"
            >
              Termos & Privacidade
            </Link>
            <button
              type="button"
              onClick={openCookiePreferences}
              className="hover:text-brand-primary transition-colors underline"
            >
              Preferências de cookies
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}
