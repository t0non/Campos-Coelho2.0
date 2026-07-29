import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assertAdminUser } from "@/app/admin/actions";
import { PromotionalCombo } from "@/types/promotion";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PromotionForm } from "@/components/admin/PromotionForm";

export const metadata: Metadata = {
  title: "Editar Combo Promocional | Painel Shaiff",
  robots: {
    index: false,
    follow: false,
  },
};

interface EditComboPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditComboPage({ params }: EditComboPageProps) {
  const user = await assertAdminUser();
  const { id } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("promotional_combos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const combo = data as PromotionalCombo;

  return (
    <div className="min-h-screen bg-brand-background flex flex-col font-sans">
      <AdminHeader userEmail={user.email} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-brand-heading">
            Editar Combo: {combo.title}
          </h1>
          <p className="text-xs sm:text-sm text-brand-bodyText/80 mt-1">
            Atualize as informações, preços ou imagens deste combo promocional.
          </p>
        </div>

        <PromotionForm initialData={combo} />
      </main>
    </div>
  );
}
