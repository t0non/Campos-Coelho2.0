"use client";

import React, { useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { brandConfig } from "@/config/brand";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "light" | "dark" | "compact";
  size?: "small" | "medium" | "large";
  className?: string;
}

export function Logo({
  variant = "default",
  size = "medium",
  className,
}: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const isLightOnDark = variant === "light" || variant === "dark";

  const sizeMap = {
    small: { text: "text-lg", subtext: "text-[9px]", imgClass: "max-h-8" },
    medium: { text: "text-xl sm:text-2xl", subtext: "text-[10px]", imgClass: "max-h-11" },
    large: { text: "text-2xl sm:text-3xl", subtext: "text-[11px]", imgClass: "max-h-14" },
  };

  const currentSize = sizeMap[size] || sizeMap.medium;
  const logoSrc = isLightOnDark ? brandConfig.logos.lightPng : brandConfig.logos.primaryPng;

  return (
    <Link
      href="/"
      aria-label={`${siteConfig.businessName} - Início`}
      className={cn(
        "inline-flex items-center transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-brand-primary rounded p-1",
        className
      )}
    >
      {!imageError ? (
        <img
          src={logoSrc}
          alt={siteConfig.businessName}
          onError={() => setImageError(true)}
          className={cn("w-auto h-auto object-contain", currentSize.imgClass)}
        />
      ) : (
        <div className="flex flex-col">
          <span
            className={cn(
              "font-heading font-medium tracking-tight transition-colors duration-200",
              currentSize.text,
              isLightOnDark
                ? "text-brand-cream hover:text-white"
                : "text-brand-dark hover:text-brand-primary"
            )}
          >
            Shaiff <span className="text-brand-primary font-normal italic">Cabeleireiros</span>
          </span>
          {variant !== "compact" && (
            <span
              className={cn(
                "uppercase tracking-widest -mt-1 font-medium",
                currentSize.subtext,
                isLightOnDark ? "text-brand-cream/70" : "text-brand-dark/70"
              )}
            >
              Santa Efigênia
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
