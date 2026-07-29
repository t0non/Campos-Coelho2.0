import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  dark?: boolean;
}

export function Breadcrumbs({ items, className, dark = false }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("py-2", className)}>
      <ol className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm font-medium">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    dark ? "text-stone-600" : "text-stone-400"
                  )}
                  aria-hidden="true"
                />
              )}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    "font-semibold",
                    dark ? "text-brand-champagneLight" : "text-brand-heading"
                  )}
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors hover:underline",
                    dark
                      ? "text-brand-champagne/70 hover:text-brand-primary"
                      : "text-brand-bodyText/70 hover:text-brand-primary"
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
