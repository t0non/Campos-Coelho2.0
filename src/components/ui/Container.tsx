import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  size?: "small" | "medium" | "large" | "full";
}

export function Container({
  as: Component = "div",
  children,
  className,
  size = "large",
  ...props
}: ContainerProps) {
  const sizeClasses = {
    small: "max-w-4xl",
    medium: "max-w-5xl",
    large: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
