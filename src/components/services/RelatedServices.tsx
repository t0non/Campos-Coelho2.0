import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { siteConfig } from "@/config/site";
import { ArrowRight } from "lucide-react";

interface RelatedServicesProps {
  relatedSlugs: string[];
}

export function RelatedServices({ relatedSlugs }: RelatedServicesProps) {
  const relatedServices = siteConfig.services.filter((s) =>
    relatedSlugs.includes(s.slug)
  );

  if (relatedServices.length === 0) return null;

  return (
    <Section variant="light" padding="default" className="border-b border-brand-border/40">
      <Container size="large">
        <SectionHeading
          kicker="CONFIRA TAMBÉM"
          title="Outros Serviços do Shaiff"
          subtitle="Conheça cuidados complementares oferecidos no mesmo espaço."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedServices.map((service) => (
            <div
              key={service.id}
              className="bg-brand-surface p-6 rounded-xl border border-brand-border/70 shadow-sm flex flex-col justify-between hover:border-brand-primary/50 transition-colors group"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-brand-muted flex items-center justify-center mb-4 text-brand-primary group-hover:scale-105 transition-transform duration-200">
                  <ServiceIcon name={service.icon} />
                </div>
                <h3 className="font-heading text-xl font-medium text-brand-heading mb-2">
                  {service.name}
                </h3>
                <p className="text-xs sm:text-sm text-brand-bodyText/80 leading-relaxed mb-4">
                  {service.shortDescription}
                </p>
              </div>

              <div className="pt-4 border-t border-brand-border/40 flex items-center justify-between">
                <Link
                  href={`/servicos/${service.slug}`}
                  className="text-xs font-semibold text-brand-primary hover:underline inline-flex items-center gap-1"
                >
                  <span>Conhecer o serviço</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
