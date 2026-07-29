import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "dark" | "link";
  size?: "sm" | "md" | "lg";
  href?: string;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  external = false,
  children,
  className,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary disabled:opacity-50 disabled:pointer-events-none rounded-xl";

  const variantClasses = {
    primary:
      "bg-brand-primary text-white hover:bg-brand-primaryHover shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",
    secondary:
      "bg-brand-darkSurface text-brand-champagneLight hover:bg-stone-900 border border-brand-secondary/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",
    outline:
      "border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white transition-colors active:scale-[0.98]",
    ghost:
      "text-brand-heading hover:bg-brand-muted hover:text-brand-primary transition-colors",
    dark:
      "bg-stone-900 text-brand-champagneLight border border-stone-800 hover:bg-stone-800 transition-colors active:scale-[0.98]",
    link:
      "text-brand-primary hover:underline underline-offset-4 p-0 h-auto font-semibold bg-transparent border-0 shadow-none",
  };

  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-5 py-2.5 gap-2",
    lg: "text-base px-7 py-3.5 gap-2.5 font-semibold",
  };

  const combinedClasses = cn(
    baseClasses,
    variantClasses[variant],
    variant !== "link" && sizeClasses[size],
    className
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={combinedClasses}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}
