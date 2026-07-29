import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  kicker?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  darkBackground?: boolean;
  className?: string;
  headingLevel?: "h1" | "h2" | "h3";
}

export function SectionHeading({
  kicker,
  title,
  subtitle,
  align = "center",
  darkBackground = false,
  className,
  headingLevel: Heading = "h2",
}: SectionHeadingProps) {
  const alignClasses = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  };

  return (
    <div
      className={cn(
        "flex flex-col max-w-3xl mb-10 md:mb-14",
        alignClasses[align],
        className
      )}
    >
      {kicker && (
        <span
          className={cn(
            "inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-3 transition-colors",
            darkBackground
              ? "bg-brand-cream/10 border border-brand-cream/20 text-brand-cream"
              : "bg-brand-cream border border-brand-primary/20 text-brand-primary"
          )}
        >
          {kicker}
        </span>
      )}
      <Heading
        className={cn(
          "font-heading text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight leading-tight",
          darkBackground ? "text-brand-cream" : "text-brand-dark"
        )}
      >
        {title}
      </Heading>
      {subtitle && (
        <p
          className={cn(
            "mt-3 text-base sm:text-lg leading-relaxed font-sans max-w-2xl",
            darkBackground ? "text-brand-cream/80" : "text-brand-dark/80"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
