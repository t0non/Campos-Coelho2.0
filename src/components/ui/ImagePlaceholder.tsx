import React from "react";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  imagePath?: string;
  serviceName: string;
  className?: string;
  aspectRatio?: "square" | "video" | "wide";
}

export function ImagePlaceholder({
  imagePath = "/images/shaiff/servico.png",
  serviceName,
  className,
  aspectRatio = "video",
}: ImagePlaceholderProps) {
  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-[16/9]",
    wide: "aspect-[21/9]",
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl overflow-hidden border border-brand-border/80 bg-brand-surface p-3 shadow-md",
        className
      )}
    >
      <div
        className={cn(
          "w-full rounded-xl bg-gradient-to-br from-stone-100 via-stone-50 to-amber-50 flex flex-col items-center justify-center p-6 text-center border border-brand-border/40 relative overflow-hidden",
          aspectClasses[aspectRatio]
        )}
      >
        <div className="w-14 h-14 rounded-full bg-brand-muted flex items-center justify-center text-brand-primary mb-3">
          <Camera className="w-7 h-7" />
        </div>
        <h3 className="font-heading text-lg font-medium text-brand-heading mb-1">
          {serviceName}
        </h3>
        <p className="text-xs text-brand-bodyText/70 max-w-xs leading-relaxed">
          Atendimento no Shaiff Cabeleireiros • Santa Efigênia, BH
        </p>
        <div className="mt-3 px-3 py-1 bg-white/90 border border-brand-border rounded text-[11px] font-mono text-brand-bodyText/60">
          [ Espaço para foto real do serviço: {imagePath} ]
        </div>
      </div>
    </div>
  );
}
