"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

interface NavItem {
  label: string;
  href: string;
}

interface MobileMenuProps {
  navItems: NavItem[];
}

export function MobileMenu({ navItems }: MobileMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        aria-label={isOpen ? "Fechar menu principal" : "Abrir menu principal"}
        className="p-2.5 text-brand-heading hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-brand-primary rounded-lg transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Navigation Drawer */}
      <div
        id="mobile-navigation"
        className={`fixed top-0 right-0 bottom-0 z-50 w-full max-w-xs bg-brand-darkSurface text-brand-champagneLight p-6 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navegação mobile"
      >
        <div>
          {/* Header inside drawer */}
          <div className="flex items-center justify-between pb-6 border-b border-stone-800">
            <Logo variant="dark" />
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar menu"
              className="p-2 text-brand-champagne/80 hover:text-white rounded-lg focus-visible:outline-2 focus-visible:outline-brand-primary"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Links list */}
          <nav className="mt-8 flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-brand-champagneLight hover:text-brand-primary py-2 transition-colors border-b border-stone-800/40"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Drawer Footer Actions */}
        <div className="pt-6 border-t border-stone-800 space-y-4">
          <Button
            href="/contato#contato"
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => setIsOpen(false)}
          >
            Agendar horário
          </Button>

          <a
            href={siteConfig.telephoneHref}
            className="flex items-center justify-center gap-2 text-sm text-brand-champagne/80 hover:text-brand-primary py-2 transition-colors"
          >
            <Phone className="w-4 h-4 text-brand-primary" />
            <span>{siteConfig.telephone}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
