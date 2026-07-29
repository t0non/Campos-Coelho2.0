import React from "react";
import { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { getCanonicalUrl } from "@/config/seo";

export const metadata: Metadata = {
  title: "Política de Privacidade e Proteção de Dados | Shaiff",
  description:
    "Política de privacidade e transparência no tratamento de dados pessoais do Shaiff Cabeleireiros, em Belo Horizonte - MG.",
  alternates: {
    canonical: getCanonicalUrl("/politica-de-privacidade"),
  },
};

export default function PoliticaPrivacidadePage() {
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Section variant="dark" padding="small">
        <Container size="large" className="text-center">
          <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-brand-champagneLight">
            Política de Privacidade e Proteção de Dados
          </h1>
          <p className="text-xs sm:text-sm text-brand-champagne/80 mt-2 font-mono">
            {siteConfig.businessName} • Última atualização: {currentDate}
          </p>
        </Container>
      </Section>

      <Section variant="light" padding="default">
        <Container size="medium" className="prose prose-stone max-w-3xl font-sans">
          <SectionHeading
            title="Transparência e Respeito à sua Privacidade"
            subtitle="Saiba como tratamos suas informações de contato e navegação em conformidade com a LGPD (Lei nº 13.709/2018)."
            align="left"
          />

          <div className="space-y-6 text-sm sm:text-base leading-relaxed text-brand-bodyText">
            <h2 className="font-heading text-xl font-semibold text-brand-heading mt-6">
              1. Coleta de Dados Pessoais
            </h2>
            <p>
              O site do <strong>{siteConfig.businessName}</strong> coleta dados pessoais exclusivamente quando você preenche voluntariamente o nosso formulário de solicitação de agendamento ou entra em contato direto por telefone.
            </p>
            <p>Os dados coletados no formulário incluem:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Nome completo:</strong> para identificação do atendimento;</li>
              <li><strong>Telefone com DDD:</strong> para retorno e alinhamento do horário;</li>
              <li><strong>E-mail (opcional):</strong> para envio de confirmações ou cópias;</li>
              <li><strong>Serviço de interesse, período e mensagem:</strong> para consultar a disponibilidade da equipe.</li>
            </ul>

            <h2 className="font-heading text-xl font-semibold text-brand-heading mt-6">
              2. Finalidade e Base Legal do Tratamento
            </h2>
            <p>
              A coleta e o processamento dessas informações têm como única finalidade consultar a disponibilidade da agenda, responder às suas dúvidas e efetuar a confirmação do seu agendamento no salão. A base legal utilizada é o seu <strong>consentimento expresso (LGPD, Art. 7º, I)</strong> fornecido ao marcar a caixa de seleção antes do envio do formulário.
            </p>

            <h2 className="font-heading text-xl font-semibold text-brand-heading mt-6">
              3. Parâmetros de Origem e Atribuição de Campanhas
            </h2>
            <p>
              Para compreender a eficácia das nossas divulgações, o site pode registrar parâmetros técnicos de navegação (como <em>UTMs</em>, <em>GCLID</em> e identificadores de anúncios) armazenados temporariamente no seu navegador. Esses dados de atribuição ajudam a identificar por qual canal ou anúncio você conheceu o salão, sem associá-los a perfis comportamentais invasivos.
            </p>

            <h2 className="font-heading text-xl font-semibold text-brand-heading mt-6">
              4. Cookies e Tecnologias de Medição
            </h2>
            <p>
              Utilizamos cookies estritamente necessários para garantir a segurança da sessão e o correto envio das solicitações. Com a sua autorização (fornecida no banner de consentimento), podemos utilizar cookies opcionais de medição para analisar o volume de visitas e melhorar o desempenho das páginas. Você pode alterar suas preferências de cookies a qualquer momento através do link disponível no rodapé do site.
            </p>

            <h2 className="font-heading text-xl font-semibold text-brand-heading mt-6">
              5. Compartilhamento e Fornecedores de Infraestrutura
            </h2>
            <p>
              O <strong>{siteConfig.businessName} não vende, não aluga e não comercializa seus dados pessoais</strong> com terceiros para fins publicitários. O envio das solicitações pode utilizar serviços seguros de infraestrutura tecnológica (como servidores web e integradores de e-mail/webhook) estritamente para viabilizar a entrega da mensagem à nossa recepção.
            </p>

            <h2 className="font-heading text-xl font-semibold text-brand-heading mt-6">
              6. Retenção e Segurança dos Dados
            </h2>
            <p>
              Seus dados de contato são mantidos apenas pelo período estritamente necessário para realizar o atendimento solicitado ou para cumprimento de obrigações legais. Adotamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acessos não autorizados.
            </p>

            <h2 className="font-heading text-xl font-semibold text-brand-heading mt-6">
              7. Importante: Agendamento Sujeito à Confirmação
            </h2>
            <p>
              O preenchimento do formulário no site constitui uma <strong>solicitação de agendamento</strong>. O horário escolhido dependerá da consulta prévia e da confirmação direta realizada pela equipe do salão.
            </p>

            <h2 className="font-heading text-xl font-semibold text-brand-heading mt-6">
              8. Direitos do Titular de Dados
            </h2>
            <p>
              Você possui o direito de confirmar a existência de tratamento, acessar, corrigir ou solicitar a exclusão dos seus dados pessoais a qualquer momento. Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato pelo telefone comercial do salão: <strong>{siteConfig.telephone}</strong> ou visite nosso espaço na {siteConfig.address}, {siteConfig.building}, {siteConfig.neighborhood}, {siteConfig.city} - {siteConfig.state}.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
