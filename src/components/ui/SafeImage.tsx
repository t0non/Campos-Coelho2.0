"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "./ImagePlaceholder";

interface SafeImageProps {
  src?: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  fallbackText?: string;
  aspectRatio?: "square" | "video" | "wide";
}

export function SafeImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  priority = false,
  className,
  fallbackText,
  aspectRatio = "video",
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  // If no src provided or error loading image, show fallback placeholder
  if (!src || hasError) {
    return (
      <ImagePlaceholder
        imagePath={src || "/images/shaiff/ambiente.png"}
        serviceName={fallbackText || alt}
        aspectRatio={aspectRatio}
        className={className}
      />
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-brand-cream/30", className)}>
      <img
        src={src}
        alt={alt}
        onError={() => setHasError(true)}
        className="object-cover w-full h-full transition-opacity duration-300"
      />
    </div>
  );
}
