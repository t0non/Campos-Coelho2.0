import React from "react";
import { Metadata } from "next";
import { assertAdminUser } from "@/app/admin/actions";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PromotionForm } from "@/components/admin/PromotionForm";

export const metadata: Metadata = {
  title: "Novo Combo Promocional | Painel Shaiff",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NewComboPage() {
  const user = await assertAdminUser();

  return (
    <div className="min-h-screen bg-brand-background flex flex-col font-sans">
      <AdminHeader userEmail={user.email} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-brand-heading">
            Cadastrar Novo Combo Promocional
          </h1>
          <p className="text-xs sm:text-sm text-brand-bodyText/80 mt-1">
            Preencha os campos para criar uma nova promoção no Shaiff Cabeleireiros.
          </p>
        </div>

        <PromotionForm />
      </main>
    </div>
  );
}
