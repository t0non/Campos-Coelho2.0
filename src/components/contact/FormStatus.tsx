import React from "react";
import { AlertCircle, Info, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ApiResponseCode } from "@/types/contact";

interface FormStatusProps {
  code?: ApiResponseCode | null;
  message?: string | null;
}

export function FormStatus({ code, message }: FormStatusProps) {
  if (!code || !message) return null;

  const isChannelUnconfigured = code === "CONTACT_CHANNEL_NOT_CONFIGURED";

  return (
    <div
      role="alert"
      className={`p-4 rounded-xl border text-sm leading-relaxed space-y-3 ${
        isChannelUnconfigured
          ? "bg-amber-50 border-amber-200 text-amber-900"
          : "bg-red-50 border-red-200 text-red-900"
      }`}
    >
      <div className="flex items-start gap-2.5 font-medium">
        {isChannelUnconfigured ? (
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        )}
        <div>
          <p>{message}</p>
          {!isChannelUnconfigured && (
            <p className="text-xs text-red-700 mt-1">
              Não foi possível enviar agora. Você também pode ligar para o Shaiff pelo telefone{" "}
              <a
                href={siteConfig.telephoneHref}
                className="underline font-bold font-mono"
              >
                {siteConfig.telephone}
              </a>
              .
            </p>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-stone-200/60 flex items-center gap-2">
        <a
          href={siteConfig.telephoneHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Ligar para recepção: {siteConfig.telephone}</span>
        </a>
      </div>
    </div>
  );
}
