import React from "react";
import { ComboStatus } from "@/types/promotion";

interface PromotionStatusProps {
  status: ComboStatus;
}

export function PromotionStatus({ status }: PromotionStatusProps) {
  const statusStyles: Record<ComboStatus, string> = {
    Ativo: "bg-emerald-100 text-emerald-800 border-emerald-300",
    Programado: "bg-amber-100 text-amber-800 border-amber-300",
    Encerrado: "bg-stone-200 text-stone-700 border-stone-300",
    Rascunho: "bg-blue-100 text-blue-800 border-blue-300",
    Inativo: "bg-rose-100 text-rose-800 border-rose-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}
