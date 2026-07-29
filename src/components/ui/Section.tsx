import React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: "light" | "muted" | "dark" | "surface";
  padding?: "none" | "small" | "default" | "large";
  className?: string;
  id?: string;
}

export function Section({
  children,
  variant = "light",
  padding = "default",
  className,
  id,
  ...props
}: SectionProps) {
  const variantClasses = {
    light: "bg-white text-brand-dark",
    muted: "bg-brand-cream text-brand-dark",
    dark: "bg-brand-dark text-brand-cream",
    surface: "bg-white text-brand-dark",
  };

  const paddingClasses = {
    none: "py-0",
    small: "py-8 md:py-12",
    default: "py-12 md:py-20",
    large: "py-16 md:py-28",
  };

  return (
    <section
      id={id}
      className={cn(
        "relative w-full transition-colors duration-200",
        variantClasses[variant],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
