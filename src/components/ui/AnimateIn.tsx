"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type AnimationVariant =
  | "fade-up"
  | "fade-in"
  | "fade-left"
  | "fade-right"
  | "scale-up";

interface AnimateInProps {
  children: React.ReactNode;
  variant?: AnimationVariant;
  delay?: number; // ms
  duration?: number; // ms
  className?: string;
  threshold?: number;
  as?: React.ElementType;
}

export function AnimateIn({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 600,
  className,
  threshold = 0.12,
  as: Tag = "div",
}: AnimateInProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const baseStyles: React.CSSProperties = {
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    transitionProperty: "opacity, transform",
    willChange: "opacity, transform",
  };

  const hiddenStyles: Record<AnimationVariant, React.CSSProperties> = {
    "fade-up":    { opacity: 0, transform: "translateY(28px)" },
    "fade-in":    { opacity: 0, transform: "none" },
    "fade-left":  { opacity: 0, transform: "translateX(28px)" },
    "fade-right": { opacity: 0, transform: "translateX(-28px)" },
    "scale-up":   { opacity: 0, transform: "scale(0.94)" },
  };

  const visibleStyles: React.CSSProperties = { opacity: 1, transform: "none" };

  return (
    <Tag
      ref={ref}
      className={cn(className)}
      style={{
        ...baseStyles,
        ...(visible ? visibleStyles : hiddenStyles[variant]),
      }}
    >
      {children}
    </Tag>
  );
}
