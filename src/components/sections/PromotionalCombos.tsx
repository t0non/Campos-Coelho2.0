import React from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PromotionGrid } from "@/components/promotions/PromotionGrid";
import { PromotionalCombo } from "@/types/promotion";
import { createClient } from "@/lib/supabase/server";
import { isValidActiveCombo } from "@/lib/promotions";

export async function PromotionalCombos() {
  let activeCombos: PromotionalCombo[] = [];

  try {
    const supabase = await createClient();
    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from("promotional_combos")
      .select("*")
      .eq("is_active", true)
      .or(`starts_at.is.null,starts_at.lte.${nowIso}`)
      .or(`ends_at.is.null,ends_at.gte.${nowIso}`)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error && data) {
      activeCombos = (data as PromotionalCombo[]).filter(isValidActiveCombo);
    }
  } catch (err) {
    // Fail gracefully without disrupting main site
    activeCombos = [];
  }

  // Mandatory Requirement #10 & #15: Zero active combos -> Omit section completely from DOM
  if (activeCombos.length === 0) {
    return null;
  }

  return (
    <Section variant="light" padding="default" className="border-b border-brand-border/40 bg-brand-cream/10">
      <Container size="large">
        <SectionHeading
          kicker="COMBOS ESPECIAIS"
          title="Cuidados completos em condições especiais"
          subtitle="Conheça os combos disponíveis no Shaiff Cabeleireiros e consulte os horários para aproveitar as condições promocionais."
          align="center"
        />

        <div className="mt-10">
          <PromotionGrid combos={activeCombos} />
        </div>
      </Container>
    </Section>
  );
}
