import React from "react";
import { Button, ButtonProps } from "@/components/ui/Button";
import { Phone, Calendar } from "lucide-react";
import { siteConfig } from "@/config/site";

interface ContactButtonProps extends Omit<ButtonProps, "href" | "children" | "type"> {
  label?: string;
  type?: "schedule" | "call";
}

export function ContactButton({
  label,
  type = "schedule",
  variant = "primary",
  size = "md",
  ...props
}: ContactButtonProps) {
  if (type === "call") {
    return (
      <Button
        href={siteConfig.telephoneHref}
        external
        variant={variant}
        size={size}
        aria-label={`Ligar para ${siteConfig.businessName}: ${siteConfig.telephone}`}
        {...props}
      >
        <Phone className="w-4 h-4" />
        <span>{label || siteConfig.telephone}</span>
      </Button>
    );
  }

  // Schedule button (pointing to #contato since WhatsApp is unconfirmed)
  return (
    <Button
      href="/contato#contato"
      variant={variant}
      size={size}
      aria-label="Agendar horário de atendimento"
      {...props}
    >
      <Calendar className="w-4 h-4" />
      <span>{label || "Agendar horário"}</span>
    </Button>
  );
}
