import React from "react";
import { serializeJsonLd } from "@/lib/schema";

interface JsonLdProps {
  graph: Array<Record<string, unknown> | null | undefined>;
}

export function JsonLd({ graph }: JsonLdProps) {
  // Filter out null or undefined elements
  const validGraph = graph.filter(
    (item): item is Record<string, unknown> => item !== null && item !== undefined
  );

  if (validGraph.length === 0) {
    return null;
  }

  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": validGraph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLdData) }}
    />
  );
}
