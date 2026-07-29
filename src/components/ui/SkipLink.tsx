import React from "react";

export function SkipLink() {
  return (
    <a
      href="#conteudo-principal"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-primary focus:text-white focus:font-semibold focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
    >
      Pular para o conteúdo principal
    </a>
  );
}
