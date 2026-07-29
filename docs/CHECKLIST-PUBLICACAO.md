# Checklist de Publicação — Shaiff Cabeleireiros

Checklist técnico e operacional para ser executado antes da entrada em produção do site oficial do Shaiff Cabeleireiros.

---

## 1. Dados Comerciais e Confirmações

- [ ] Confirmar número oficial de WhatsApp para atendimento;
- [ ] Confirmar e-mail comercial oficial do salão;
- [ ] Confirmar horários exatos de funcionamento (dias da semana e sábados);
- [ ] Confirmar perfil oficial no Instagram;
- [ ] Confirmar domínio definitivo registrado;
- [ ] Confirmar formas de pagamento aceitas na recepção;
- [ ] Confirmar informações sobre estacionamento (se houver convênio);
- [ ] Confirmar nome e especialidade dos profissionais da equipe.

---

## 2. Imagens e Material Gráfico Real

- [ ] Inserir vetor do logotipo definitivo em `/images/brand/logo-shaiff.svg`;
- [ ] Inserir fotografia principal do salão em `/images/shaiff/hero-salao.webp`;
- [ ] Inserir fotografia do ambiente interno em `/images/shaiff/ambiente-interno.webp`;
- [ ] Inserir fotos da galeria de procedimentos em `/images/shaiff/galeria-01.webp` até `06.webp`;
- [ ] Inserir fotografias reais dos 8 serviços em `/images/shaiff/servicos/`;
- [ ] Otimizar todas as imagens para formato `.webp` ou `.avif` com tamanho reduzido (< 200KB cada);
- [ ] Verificar autorização de uso de imagem dos clientes fotografados.

---

## 3. Formulário de Agendamento e API

- [ ] Escolher e configurar o canal de recebimento (Webhook ou Resend E-mail);
- [ ] Preencher as variáveis `CONTACT_WEBHOOK_URL` ou `RESEND_API_KEY` + `CONTACT_RECIPIENT_EMAIL` no ambiente de hospedagem;
- [ ] Realizar teste real de envio do formulário no site;
- [ ] Verificar o recebimento da mensagem de teste na caixa de entrada/webhook;
- [ ] Testar simulação de falha de conexão e conferir a mensagem de fallback para o telefone (31) 3564-0123;
- [ ] Testar filtro de spam com preenchimento do campo oculto.

---

## 4. Ferramentas de Rastreamento e Analytics

- [ ] Definir o ID do Google Tag Manager em `NEXT_PUBLIC_GTM_ID`;
- [ ] Configurar a tag de conversão do Google Ads para o evento `form_success`;
- [ ] Configurar a tag do GA4 para medição de eventos;
- [ ] Testar a barra e o modal de consentimento de cookies;
- [ ] Garantir que nenhum dado pessoal (nome, telefone, e-mail) seja enviado nos payloads de analytics.

---

## 5. SEO, Domínio e Indexação

- [ ] Configurar a variável `NEXT_PUBLIC_SITE_URL` com a URL oficial de produção (ex: `https://shaiff.com.br`);
- [ ] Validar o mapa do site acessando `/sitemap.xml`;
- [ ] Validar o arquivo de instruções acessando `/robots.txt`;
- [ ] Validar os dados estruturados JSON-LD na ferramenta oficial da Schema.org / Google Rich Results;
- [ ] Cadastrar a propriedade no Google Search Console e enviar o `sitemap.xml`;
- [ ] Cadastrar a propriedade no Bing Webmaster Tools.

---

## 6. Deploy e Hospedagem (Vercel)

- [ ] Criar o projeto na Vercel conectado ao repositório oficial;
- [ ] Adicionar todas as variáveis de ambiente necessárias nas configurações do projeto;
- [ ] Apontar o domínio comercial alterando os servidores DNS;
- [ ] Garantir certificado SSL de segurança (HTTPS ativo);
- [ ] Executar teste final navegando via desktop e smartphone.
