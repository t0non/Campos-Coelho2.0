import React from "react";
import { siteConfig } from "@/config/site";
import { MapPin, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialLinksProps {
  className?: string;
  variant?: "light" | "dark";
}

export function SocialLinks({ className, variant = "light" }: SocialLinksProps) {
  const links: Array<{ name: string; href: string; icon: React.ComponentType<{ className?: string }> }> = [];

  if (siteConfig.googleBusinessProfile) {
    links.push({
      name: "Perfil no Google",
      href: siteConfig.googleBusinessProfile,
      icon: MapPin,
    });
  }

  if (siteConfig.instagramUrl) {
    links.push({
      name: "Instagram",
      href: siteConfig.instagramUrl,
      icon: Globe,
    });
  }

  if (links.length === 0) {
    return null;
  }

  const isDark = variant === "dark";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {links.map((link) => {
        const IconComponent = link.icon;
        return (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.name}
            className={cn(
              "p-2 rounded-full transition-colors duration-200",
              isDark
                ? "bg-stone-800/80 text-brand-champagne hover:bg-brand-primary hover:text-white"
                : "bg-brand-muted text-brand-heading hover:bg-brand-primary hover:text-white"
            )}
          >
            <IconComponent className="w-4 h-4" />
          </a>
        );
      })}
    </div>
  );
}
