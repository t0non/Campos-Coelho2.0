import React from "react";
import Link from "next/link";
import { PromotionalCombo } from "@/types/promotion";
import { formatCurrencyBRL, formatBRDateTime } from "@/lib/promotions";
import { Check, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PromotionCardProps {
  combo: Partial<PromotionalCombo>;
  isPreview?: boolean;
}

export function PromotionCard({ combo, isPreview = false }: PromotionCardProps) {
  const title = combo.title || "Combo Promocional";
  const slug = combo.slug || "combo-promocional";
  const shortDescription = combo.short_description || "Descrição curta do combo promocional.";
  const badge = combo.badge;
  const originalPrice = combo.original_price;
  const promotionalPrice = combo.promotional_price ?? 0;
  const benefits = Array.isArray(combo.benefits) ? combo.benefits : [];
  const endsAt = combo.ends_at;
  const ctaLabel = combo.cta_label || "Solicitar agendamento";
  const ctaUrl = isPreview ? "#" : `/contato?combo=${encodeURIComponent(slug)}`;
  const imageUrl = combo.image_url;

  return (
    <div className="bg-brand-surface rounded-xl border border-brand-border/70 shadow-sm flex flex-col justify-between hover:border-brand-primary/60 hover:shadow-md transition-all duration-200 group overflow-hidden h-full">
      <div className="flex flex-col flex-1">
        {/* Card Image Header */}
        <div className="relative w-full aspect-[16/10] bg-brand-muted overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-brand-cream/40 text-brand-dark/40 text-xs font-mono">
              Sem Imagem
            </div>
          )}

          {/* Brown Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent opacity-90 transition-opacity duration-300" />

          {/* Badge */}
          {badge && (
            <div className="absolute top-3 left-3 bg-brand-primary text-white text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md z-10">
              {badge}
            </div>
          )}

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 w-full p-4 flex items-end">
            <h3 className="font-heading text-xl font-medium text-brand-cream leading-snug drop-shadow-md">
              {title}
            </h3>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <p className="text-xs sm:text-sm text-brand-bodyText/80 leading-relaxed mb-4 font-sans">
              {shortDescription}
            </p>

            {/* Benefits List */}
            {benefits.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-brand-border/30">
                <span className="text-[11px] font-semibold text-brand-primary uppercase tracking-wider block">
                  O que inclui:
                </span>
                <ul className="space-y-1.5 text-xs text-brand-heading">
                  {benefits.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-brand-cream flex items-center justify-center shrink-0 mt-0.5 text-brand-primary">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Offer & Validity */}
          <div className="pt-3 border-t border-brand-border/40 space-y-2">
            {endsAt && (
              <div className="flex items-center gap-1.5 text-[11px] text-brand-secondary font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>Válido até {formatBRDateTime(endsAt)}</span>
              </div>
            )}

            <div className="flex items-baseline gap-2">
              {originalPrice && originalPrice > promotionalPrice && (
                <span className="text-xs text-brand-bodyText/50 line-through font-mono">
                  {formatCurrencyBRL(originalPrice)}
                </span>
              )}
              <span className="text-2xl font-semibold text-brand-primary font-mono tracking-tight">
                {formatCurrencyBRL(promotionalPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Action */}
      <div className="px-5 pb-5 pt-2">
        <Button
          href={ctaUrl}
          variant="primary"
          size="sm"
          className="w-full text-xs justify-center"
        >
          <span>{ctaLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
