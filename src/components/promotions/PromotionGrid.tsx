import React from "react";
import { PromotionalCombo } from "@/types/promotion";
import { PromotionCard } from "./PromotionCard";

interface PromotionGridProps {
  combos: PromotionalCombo[];
}

export function PromotionGrid({ combos }: PromotionGridProps) {
  if (!combos || combos.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {combos.map((combo) => (
        <PromotionCard key={combo.id} combo={combo} />
      ))}
    </div>
  );
}
