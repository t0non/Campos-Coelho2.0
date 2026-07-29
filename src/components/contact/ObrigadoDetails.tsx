"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface BookingSuccessData {
  requestId?: string;
  serviceName?: string;
}

export function ObrigadoDetails() {
  const [successData, setSuccessData] = useState<BookingSuccessData | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem("shaiff_booking_success");
        if (raw) {
          setSuccessData(JSON.parse(raw));
        }
      } catch (err) {
        // Fail silently
      }
    }
  }, []);

  const shortRequestId = successData?.requestId
    ? `${successData.requestId.slice(0, 8)}...`
    : null;

  return (
    <>
      {(successData?.serviceName || shortRequestId) && (
        <div className="max-w-md mx-auto p-4 rounded-xl bg-stone-900/80 border border-stone-800 text-xs sm:text-sm text-brand-champagne/90 space-y-2 text-left">
          {successData?.serviceName && (
            <div className="flex justify-between items-center border-b border-stone-800 pb-2">
              <span className="text-brand-champagne/60">Serviço solicitado:</span>
              <span className="font-semibold text-brand-champagneLight">{successData.serviceName}</span>
            </div>
          )}
          {shortRequestId && (
            <div className="flex justify-between items-center pt-1">
              <span className="text-brand-champagne/60">Código da solicitação:</span>
              <span className="font-mono text-brand-primary">{shortRequestId}</span>
            </div>
          )}
        </div>
      )}

      <div className="p-4 bg-stone-900/50 border border-stone-800 rounded-xl max-w-lg mx-auto flex items-start gap-3 text-xs text-brand-champagne/70 text-left">
        <Clock className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
        <p>
          Nossa equipe entrará em contato para alinhar os detalhes e confirmar seu horário. Caso tenha urgência, você pode ligar para o salão.
        </p>
      </div>
    </>
  );
}
