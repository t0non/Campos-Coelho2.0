"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Início", href: "#" },
  { label: "Serviços", href: "#servicos" },
  { label: "Sobre", href: "#sobre" },
  { label: "Localização", href: "#localizacao" },
  { label: "Contato", href: "#contato" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-brand-border py-3"
          : "bg-white border-b border-brand-border/40 py-4 sm:py-5"
      )}
    >
      <Container size="large" className="relative flex items-center justify-between min-h-[44px] md:min-h-0">
        {/* Mobile Spacer to keep hamburger menu on the right */}
        <div className="md:hidden w-8" aria-hidden="true" />

        {/* Brand Logo - Centered absolutely on mobile */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0 z-10">
          <Logo variant="default" size="medium" />
        </div>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center space-x-8"
          aria-label="Navegação principal"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-brand-dark hover:text-brand-primary transition-colors focus-visible:outline-2 focus-visible:outline-brand-primary rounded"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA Button */}
        <div className="hidden md:flex items-center space-x-4">
          <Button href={siteConfig.whatsappHref || undefined} external variant="primary" size="md">
            Agendar horário
          </Button>
        </div>

        {/* Mobile Navigation Drawer Trigger */}
        <MobileMenu navItems={navItems} />
      </Container>
    </header>
  );
}
