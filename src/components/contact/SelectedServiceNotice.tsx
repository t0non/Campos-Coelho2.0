import React from "react";
import { CheckCircle2 } from "lucide-react";

interface SelectedServiceNoticeProps {
  serviceName: string;
}

export function SelectedServiceNotice({ serviceName }: SelectedServiceNoticeProps) {
  if (!serviceName) return null;

  return (
    <div className="p-3.5 bg-brand-muted/80 border border-brand-primary/30 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-medium text-brand-heading">
      <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0" />
      <span>
        Serviço selecionado: <strong className="text-brand-primary font-semibold">{serviceName}</strong>
      </span>
    </div>
  );
}
