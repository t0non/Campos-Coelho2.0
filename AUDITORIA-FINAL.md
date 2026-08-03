# AUDITORIA-FINAL.md
**Sistema:** Campos & Coelho Atacado (AtacadoB2B) — Next.js 16 / React 19 / Supabase
**URL de produção:** https://campos-coelho2-0-seven.vercel.app/
**Data da auditoria:** 03/08/2026
**Escopo real executado:** análise de código completa (rotas, banco, auth, APIs, env), execução local (build/typecheck/testes), testes reais no navegador em produção (público/anônimo) e verificações de segurança/RLS por código.
**Limitação declarada:** não existem credenciais de admin/vendedor/cliente disponíveis para este auditor. Fluxos autenticados foram auditados por código + testes de proteção de rota (bloqueio correto confirmado), mas não foram operados fim-a-fim com um usuário real. Ver seção "Não foi possível verificar".

---

## RESUMO EXECUTIVO

🔴 **Foi encontrado 1 problema P0 que provavelmente vai aparecer na demonstração**: a página de produto individual (`/produto/[slug]`) **não carrega em produção** — fica presa indefinidamente em um esqueleto de carregamento, para qualquer produto, para qualquer visitante. Isso não acontece no ambiente local com o mesmo código e mesmo banco, o que aponta para um problema específico do ambiente de produção (Vercel), não dos dados.

Fora esse ponto, a base pública do site (home, catálogo, busca, cadastro, login, proteção de rotas, SEO técnico básico) está sólida e funcionando como esperado.

---

## FASE 1 — INVENTÁRIO DO SISTEMA

### Stack
Next.js 16.2.12 (App Router, Turbopack) · React 19.2.4 · TypeScript 5.9 · Tailwind 4 · Supabase (`@supabase/supabase-js` 2.x + `@supabase/ssr`) · Zod · React Hook Form · Resend (e-mail transacional).

> Nota: o `AGENTS.md` do projeto avisa que esta versão do Next.js tem mudanças que quebram padrões conhecidos (Server Actions com verificação de Origin, `params`/`searchParams` como `Promise`, etc.). Isso foi levado em conta na análise.

### Perfis de usuário
| Perfil | Acesso |
|---|---|
| Visitante | Catálogo público sem preço, cadastro, login |
| `customer` (pending) | Login, mas sem preços/pedidos até aprovação |
| `customer` (approved) | Preços, pedidos, `/minha-conta` |
| `customer` (rejected/suspended) | Bloqueado, `/conta-recusada` |
| `seller` | `/vendedor`, `/admin` (acesso a clientes vinculados) |
| `admin` | Acesso total, `/admin/*` |

### Rotas mapeadas (73 rotas de página + 12 rotas de API)
- **Loja pública:** `/`, `/catalogo`, `/busca`, `/categoria/[slug]`, `/marca/[slug]`, `/produto/[slug]`, `/carrinho`, `/checkout`, `/checkout/sucesso/[orderId]`, `/politica-de-privacidade`, `/privacidade`, `/termos-de-uso`.
- **Auth:** `/login`, `/cadastro`, `/cadastro/sucesso`, `/recuperar-senha`, `/aceitar-convite`, `/conta-pendente`, `/conta-recusada`.
- **Conta do cliente:** `/minha-conta`, `/minha-conta/pedidos[/[id]]`, `/minha-conta/empresa`, `/minha-conta/enderecos`, `/minha-conta/documentos`, `/minha-conta/favoritos`.
- **Vendedor:** `/vendedor`.
- **Admin (28 páginas):** dashboard, administradores, banners, campanhas, categorias, clientes, configurações, empresas, estoque, marcas, pedidos, privacidade, produtos (listar/novo/editar/importar/remover), tabelas de preço.
- **APIs:** importação de catálogo (parse/confirm/process-batch/finalize/archive), upload de imagem de produto, upload de documento de empresa, callback/confirm de auth, health check, retenção de privacidade (protegida por `CRON_SECRET`).

### Banco de dados (Supabase/Postgres) — 27 tabelas
`profiles`, `companies`, `company_members`, `company_documents`, `addresses`, `categories`, `brands`, `products`, `product_images`, `product_variants`, `inventories`, `price_tables`, `price_table_products`, `banners`, `collections`, `collection_products`, `favorites`, `carts`, `cart_items`, `shipping_methods`, `payment_terms`, `orders`, `order_items`, `order_status_history`, `notifications`, `newsletter_leads`, `audit_logs`. RLS habilitado em todas as tabelas sensíveis. Trigger `prevent_profile_escalation` bloqueia auto-promoção de role/status/empresa fora do `service_role`.

### Integrações externas
- **Supabase** (banco, auth, storage de imagens/documentos).
- **Resend** (e-mails transacionais — pedido, boas-vindas, admin criado).
- **WhatsApp** (link `wa.me` com número e mensagem pré-preenchida, presente no rodapé/header).
- **Google Maps** (link de localização no rodapé).

### Funcionalidades administrativas identificadas
CRUD de produtos (com importador de planilha em lote), categorias, marcas, tabelas de preço, banners (agora carregando os 3 banners do carrossel principal + institucionais — corrigido nesta sessão anterior), campanhas sazonais, gestão de administradores, aprovação/rejeição de empresas clientes, gestão de pedidos, estoque, configurações comerciais (frete/pagamento) e painel de conformidade LGPD.

### Itens que parecem incompletos
- Sem `eslint.config.js` — `next lint`/`eslint` não rodam (nenhum lint configurado no projeto).
- `next.config.ts` define `allowedOrigins` para Server Actions usando `NEXT_PUBLIC_SITE_URL`, mas o projeto usa `NEXT_PUBLIC_APP_URL` (nomes diferentes) — a variável nunca bate, então essa proteção de origem fica sempre inativa (ver P2 abaixo).

---

## FASE 2 — EXECUÇÃO DO PROJETO (local)

| Verificação | Resultado |
|---|---|
| `npx tsc --noEmit` (type-check) | ✅ 0 erros |
| `npm test` (testes unitários de segurança/regras de negócio) | ✅ 15/15 passando |
| `npx next build` (produção) | ✅ Compilado com sucesso, 68 rotas geradas, sem erros |
| `next lint` / `eslint` | ⚠️ Não configurado no projeto (sem `eslint.config.js`) |
| `npm run dev` local | ✅ Sobe normalmente na porta informada |
| Segredos no bundle do cliente (`.next/static`) | ✅ Nenhuma ocorrência de `SUPABASE_SECRET_KEY`, `RESEND_API_KEY` ou `CRON_SECRET` |

Nenhum erro de instalação, TypeScript ou build. O ambiente de desenvolvimento roda corretamente.

---

## FASE 3 — TESTES FUNCIONAIS (navegador, produção)

> Testado com navegação real (Chromium), leitura de console, rede e DOM. Não foi montada uma suíte formal Playwright com relatório HTML — dado o prazo do dia, os testes foram executados manualmente via automação de navegador equivalente, com evidência de cada passo. Ver "Roteiro de demonstração" para o que já foi validado ao vivo.

| Fluxo | Resultado | Evidência |
|---|---|---|
| Home carrega, sem erros de console/rede | ✅ Aprovado | Console limpo, todas requisições 200 |
| Banners do carrossel + campanha sazonal exibidos | ✅ Aprovado | Home mostra "Cozinha & Mesa" (campanha) + 4 slides institucionais |
| Catálogo lista produtos, sem imagens quebradas | ✅ Aprovado | 16 imagens verificadas, 0 quebradas |
| Busca com termo comum | ✅ Aprovado | Retorna resultados |
| Busca com termo inexistente + `<script>` no texto | ✅ Aprovado | Estado vazio correto, **sem execução de XSS** (texto tratado como string, não HTML) |
| **Página de produto individual** | 🔴 **Falhou** | Ver P0 abaixo |
| `/admin`, `/admin/administradores`, `/vendedor`, `/minha-conta`, `/carrinho`, `/checkout` sem login | ✅ Aprovado | Todas redirecionam para `/login` |
| `/login` com credenciais inválidas | ✅ Aprovado | Mensagem genérica "E-mail ou senha incorretos.", sem vazar se o e-mail existe |
| Cadastro empresarial — Etapa 1 → 2 → 3 (sem enviar) | ✅ Aprovado (parcial) | Wizard avança corretamente, campos e máscaras funcionam; envio final (upload de documento + criação de conta) não foi testado para não gerar conta real/e-mails |
| Página 404 personalizada | ✅ Aprovado | `/pagina-que-nao-existe` mostra página customizada, não o erro genérico do Next |
| `robots.txt` | ✅ Aprovado | Bloqueia `/admin/`, `/vendedor/`, `/minha-conta/`, `/carrinho`, `/checkout/`, `/login`, `/cadastro`, `/api/` |
| `sitemap.xml` | ✅ Aprovado | Gera XML com todas as URLs públicas |
| Link WhatsApp (rodapé/header) | ✅ Aprovado | `wa.me/553134419534` com mensagem pré-preenchida |
| Link "Como chegar" (Google Maps) | ✅ Aprovado | Aponta para local correto |
| Banner "Dados pendentes" (LGPD) na config do admin | ✅ Corrigido nesta sessão | `NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL` configurada na Vercel |
| Responsividade sem scroll horizontal (390px, 360px) | ✅ Aprovado | `scrollWidth === clientWidth` em ambos |

---

## PROBLEMAS ENCONTRADOS

### 🔴 P0-1 — Página de produto individual não carrega em produção
- **Prioridade:** P0 (impede a apresentação)
- **Página/fluxo:** `/produto/[slug]` (qualquer produto)
- **Descrição:** Ao abrir qualquer página de produto em produção, a página fica presa permanentemente no esqueleto de carregamento (`loading.tsx`) e nunca renderiza o conteúdo real (nome, imagem, preço/CTA, descrição).
- **Passos para reproduzir:**
  1. Acessar https://campos-coelho2-0-seven.vercel.app/catalogo
  2. Clicar em qualquer produto (testado com 2 produtos diferentes de categorias diferentes)
  3. Aguardar 10+ segundos
- **Resultado atual:** Skeleton (`animate-pulse`) infinito. Nenhum erro no console do navegador. Requisição HTTP principal retorna 200.
- **Resultado esperado:** Conteúdo completo do produto (galeria, nome, preço ou CTA de login, descrição, especificações).
- **Evidência:** DOM capturado mostra `<template id="B:1">` + blocos `animate-pulse` mesmo após reload forçado e 10s de espera. Testado em 2 produtos distintos — mesmo comportamento nos dois.
- **Causa provável:** O código local (mesmo commit, mesmo banco de dados de produção) **renderiza corretamente** quando testado via `next dev` local — a query ao Supabase para o mesmo produto responde em <1s isoladamente. Isso descarta problema de dados/RLS/lentidão de query como causa isolada, e aponta para algo específico do ambiente de execução em produção na Vercel (streaming/Suspense da rota sob Turbopack + `force-dynamic`, possível timeout de função serverless, ou diferença de runtime entre local e Vercel). **Precisa de acesso aos Runtime Logs da Vercel para essa rota para confirmar a causa exata** — não consegui acessar esses logs nesta sessão.
- **Arquivos relacionados:** `app/(loja)/produto/[slug]/page.tsx`, `app/(loja)/produto/[slug]/loading.tsx`, `lib/data/products.ts` (`getProductBySlug`, `getRelatedProducts`, `getFrequentlyBoughtTogether`).
- **Solução recomendada:** Verificar os Runtime Logs da Vercel no momento do acesso a essa rota (procurar timeout, erro silencioso ou função presa); considerar isolar `getRelatedProducts`/`getFrequentlyBoughtTogether` em `Promise.all` com timeout, ou mover para Suspense próprio (streaming granular) em vez de bloquear a página inteira.
- **Risco de corrigir:** Baixo a médio — dependendo da causa raiz, pode exigir só ajuste de código (baixo risco) ou investigação de configuração de runtime na Vercel (sem risco de dado, mas pode exigir redeploy).
- **Status:** **Confirmado** (reproduzido em 2 produtos distintos, com reload forçado, e contrastado com sucesso local).

---

### 🟡 P2-1 — Proteção de origem das Server Actions está inativa
- **Prioridade:** P2 (risco relevante, mas não há evidência de exploração; existe defesa em profundidade por outros meios)
- **Página/fluxo:** Todas as Server Actions (`'use server'`) do site
- **Descrição:** `next.config.ts` define `allowedOrigins` a partir de `process.env.NEXT_PUBLIC_SITE_URL`, mas o projeto usa `NEXT_PUBLIC_APP_URL` como nome real da variável (confirmado em `.env.local` e em `lib/utils/site-url.ts`). Como `NEXT_PUBLIC_SITE_URL` nunca está definida, a configuração de `allowedOrigins` fica sempre vazia — ou seja, essa camada extra de proteção contra CSRF em Server Actions nunca é aplicada.
- **Passos para reproduzir:** Ler `next.config.ts:25-31` e comparar com `.env.local`/`lib/utils/site-url.ts:6-9`.
- **Resultado atual:** `allowedOrigins` nunca é setado.
- **Resultado esperado:** `allowedOrigins` deveria conter o domínio de produção.
- **Causa:** Nome de variável divergente — foi um erro meu (Claude) ao implementar esse ajuste numa sessão anterior desta mesma conversa, sem perceber que o projeto usa `NEXT_PUBLIC_APP_URL`, não `NEXT_PUBLIC_SITE_URL`.
- **Arquivos:** `next.config.ts`, `lib/utils/site-url.ts`.
- **Solução recomendada:** Trocar a checagem em `next.config.ts` para usar a mesma cadeia de fallback de `lib/utils/site-url.ts` (`NEXT_PUBLIC_SITE_URL` **ou** `NEXT_PUBLIC_APP_URL`).
- **Risco de corrigir:** Muito baixo — é uma linha de configuração, não afeta funcionalidade existente.
- **Status:** Confirmado.

---

### 🔵 P3-1 — Sem ESLint configurado
- **Prioridade:** P3 (qualidade técnica)
- **Descrição:** O projeto não tem `eslint.config.js`; `next lint` e `eslint` falham por falta de configuração. Isso não afeta o usuário final, mas reduz a rede de segurança contra bugs introduzidos em código novo.
- **Solução recomendada:** Adicionar `eslint.config.js` com o preset do Next.js (`eslint-config-next`) quando houver tempo, fora da urgência de hoje.
- **Risco de corrigir:** Baixo, mas pode revelar avisos em código existente que consomem tempo para revisar — não é urgente para hoje.
- **Status:** Confirmado, não bloqueante.

---

### ⚪ Observação sem status confirmado — Clique por coordenada não avançou o wizard de cadastro
Durante o teste do formulário de cadastro (`/cadastro`), dois cliques simulados por coordenada no botão "Continuar" não avançaram a etapa, enquanto um clique disparado via JavaScript (`button.click()`) funcionou imediatamente. Não há certeza se isso é uma limitação da ferramenta de automação usada nesta auditoria ou um problema real de captura de clique no botão (ex.: elemento sobreposto). **Recomendo validar manualmente**, clicando fisicamente no botão "Continuar" em um clique único, em vez de duplo-clique ou clique muito rápido.
**Status: não reproduzido com certeza — requer teste manual real antes da apresentação.**

---

## TABELA DE FUNCIONALIDADES TESTADAS

| Funcionalidade | Status |
|---|---|
| Home (renderização, banners, campanha) | Aprovada |
| Catálogo (listagem, imagens) | Aprovada |
| Busca (resultado normal, vazio, XSS) | Aprovada |
| Página de produto individual | **Falhou** |
| Login (erro de credenciais) | Aprovada |
| Login (sucesso) | Não foi possível testar (sem credenciais) |
| Logout | Não foi possível testar (sem sessão) |
| Recuperação de senha | Não foi possível testar (dispara e-mail real) |
| Cadastro empresarial — Etapas 1–3 (preenchimento) | Aprovada |
| Cadastro empresarial — envio final + upload de documentos | Não foi possível testar (cria conta real + dispara e-mails) |
| Proteção de rotas privadas (admin/vendedor/conta/carrinho/checkout) | Aprovada |
| Painel admin (todas as 28 páginas) | Não foi possível testar (sem credenciais admin) |
| Painel vendedor | Não foi possível testar (sem credenciais) |
| Checkout / finalização de pedido | Não foi possível testar (exige login + carrinho) |
| robots.txt / sitemap.xml | Aprovada |
| Página 404 | Aprovada |
| Link WhatsApp / Google Maps | Aprovada |
| Responsividade (360px, 390px) | Aprovada (sem scroll horizontal) |
| Responsividade (768px, 1366px, 1440px) | Não testado nesta sessão (tempo) |
| Acessibilidade automatizada (axe) | Não foi possível testar (ferramenta não disponível neste ambiente) |
| Lighthouse (performance/SEO/a11y) | Não foi possível testar (ferramenta não disponível neste ambiente) |
| Segurança: segredos no bundle do cliente | Aprovada (nenhum encontrado) |
| Segurança: RLS habilitado nas tabelas sensíveis | Aprovada (por leitura de código/migrations) |

---

## FLUXOS QUE PRECISAM SER DEMONSTRADOS MANUALMENTE
1. **Login real com conta admin/vendedor/cliente** — eu não tenho nenhuma credencial.
2. **Painel administrativo completo** (produtos, pedidos, clientes, estoque, tabelas de preço) — depende de login.
3. **Fluxo de compra completo** (adicionar ao carrinho → checkout → confirmação) — depende de login e de cliente aprovado.
4. **Envio final do cadastro empresarial** (upload de documentos + criação de senha) — evitei rodar para não criar conta real/disparar e-mails sem necessidade.
5. **Recuperação de senha** — evitei disparar e-mail real de reset.
6. **Botão "Continuar" do cadastro** — clicar fisicamente uma vez para confirmar que responde ao clique real do mouse (ver observação acima).

## O QUE NÃO FOI POSSÍVEL VERIFICAR E POR QUÊ
- Qualquer fluxo autenticado (admin, vendedor, cliente aprovado) — sem credenciais de teste.
- Lighthouse / axe — ferramentas não disponíveis neste ambiente de auditoria.
- Testes em 768px/1366px/1440px — não executados por tempo, mas o layout é responsivo por Tailwind em todo o restante do site testado, risco baixo.
- Runtime Logs da Vercel (necessários para confirmar a causa raiz exata do P0-1) — sem acesso a essa interface nesta sessão.
- Upload real de arquivo/imagem em produção — evitado para não gravar arquivos de teste permanentes no Storage.

---

## OS CINCO MAIORES RISCOS PARA A APRESENTAÇÃO DE HOJE
1. **Clicar em qualquer produto vai travar a tela** (P0-1) — este é o maior risco. Qualquer clique em "ver produto" no catálogo ou na home vai mostrar um carregamento infinito na frente do cliente.
2. **Login ao vivo é território não testado por mim** — recomendo você mesmo validar o login com a conta que for usar na demo, antes da reunião.
3. **Fluxo de checkout completo não foi validado ponta a ponta** por depender de login.
4. **Envio final do cadastro (com upload de documento) não foi testado** — se for parte do roteiro de demo, valide manualmente antes.
5. **Sem Lighthouse/axe rodado** — não há como garantir hoje que não existam problemas de performance ou acessibilidade não capturados nos testes manuais.

---

## ROTEIRO DE DEMONSTRAÇÃO (usando só fluxos aprovados)
1. Mostrar a **home** — banners, campanha sazonal, categorias, produtos em destaque.
2. Mostrar o **catálogo** — filtros por categoria/marca, busca funcionando.
3. Mostrar a **busca** com um termo real do catálogo.
4. Mostrar o **cadastro empresarial** até a etapa 3 (sem enviar) — explicando o fluxo de aprovação.
5. Mostrar a **tentativa de login com senha errada** — mensagem de erro clara.
6. Mostrar que **rotas administrativas são bloqueadas** para quem não é admin (tentar acessar `/admin` deslogado).
7. Mostrar o **link do WhatsApp** e **localização no Google Maps**.
8. **Evitar clicar em qualquer produto individual** até o P0-1 ser corrigido.

---

## CHECKLIST FINAL DE PUBLICAÇÃO
- [ ] **P0-1 corrigido e reverificado em produção** (bloqueador)
- [x] Build de produção sem erros
- [x] Type-check sem erros
- [x] Testes unitários passando
- [x] Segredos não expostos no bundle do cliente
- [x] Rotas privadas protegidas
- [x] robots.txt / sitemap.xml corretos
- [x] Página 404 personalizada
- [ ] Login validado manualmente com conta real antes da reunião
- [ ] Fluxo de checkout validado manualmente com conta real
- [ ] P2-1 (allowedOrigins) corrigido — não bloqueante, mas recomendado

---

## RECOMENDAÇÃO OBJETIVA

# 🔴 NÃO APTO (até o P0-1 ser corrigido)

Com o P0-1 resolvido e um teste manual rápido de login + checkout com conta real, o sistema passa a **apto com ressalvas** — o restante do site (institucional, catálogo, cadastro, segurança de rotas) está sólido.

---

*Relatório gerado por auditoria automatizada com testes reais em produção. Fase 9 (correções) não foi iniciada — aguardando aprovação para prosseguir, começando pelo P0-1.*
