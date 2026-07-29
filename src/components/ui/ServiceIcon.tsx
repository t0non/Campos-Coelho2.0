import React from "react";
import {
  Scissors,
  Wind,
  Droplets,
  Sparkles,
  ShieldCheck,
  Heart,
  Gem,
  Eye,
  Sparkle,
  LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceIconProps extends LucideProps {
  name: string;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Scissors,
  Wind,
  Droplets,
  Sparkles,
  ShieldCheck,
  Heart,
  Gem,
  Eye,
  Sparkle,
};

export function ServiceIcon({ name, className, ...props }: ServiceIconProps) {
  const IconComponent = iconMap[name] || Sparkles;

  return <IconComponent className={cn("w-6 h-6 text-brand-primary", className)} {...props} />;
}
