# Documentação da Plataforma B2B Campos & Coelho

**Apresentação, funcionalidades e orientações de utilização**

---

**Versão da plataforma:** 1.0 – Homologação
**Data da documentação:** 03 de agosto de 2026
**Empresa:** Distribuidora Campos & Coelho Ltda
**Responsável pelo desenvolvimento:** Eduardo Soares Tonon
**CNPJ:** 64.510.611/0001-62

> Após a aprovação e publicação definitiva, a versão poderá ser alterada para **Versão 1.0 – Produção**.

---

## Sumário

1. Visão Geral
2. Como a Plataforma Funciona
3. Perfis de Acesso
4. Funcionalidades do Site
5. Painel Administrativo
6. Manual Rápido
7. Tecnologias Utilizadas
8. Segurança
9. Versionamento, Backup e Recuperação
10. Status da Entrega
11. Suporte e Manutenção
12. Acessos e Titularidade
13. Checklist de Homologação
14. Encerramento

---

## 1. Visão Geral

A plataforma foi desenvolvida para dar à Campos & Coelho uma operação comercial digital própria, pensada especificamente para o modelo de negócio de atacado (venda para empresas, não para o consumidor final).

Ela foi construída para:

- **Organizar e apresentar o catálogo** de produtos de forma clara, com fotos, categorias e marcas.
- **Permitir o cadastro de clientes empresariais** (lojistas, revendedores) diretamente pelo site, com CNPJ.
- **Controlar o acesso aos preços** — só empresas com cadastro aprovado veem valores e conseguem fazer pedidos.
- **Facilitar a gestão do dia a dia**: produtos, estoque, clientes e pedidos, tudo em um painel administrativo único.
- **Preparar a base** para a operação comercial digital da empresa, com espaço para crescer em funcionalidades futuras.

---

## 2. Como a Plataforma Funciona

O fluxo principal da plataforma segue estes passos:

```
Visitante acessa o catálogo
        ↓
Realiza o cadastro empresarial (CNPJ, dados da empresa, responsável)
        ↓
O cadastro é analisado pela equipe Campos & Coelho
        ↓
Cliente aprovado realiza login
        ↓
Os preços são liberados para esse cliente
        ↓
O cliente adiciona produtos ao carrinho
        ↓
O pedido segue o fluxo comercial definido pela empresa
```

Enquanto o cadastro não é aprovado, o visitante pode navegar pelo catálogo, mas não vê preços — aparece uma chamada para fazer login ou se cadastrar.

---

## 3. Perfis de Acesso

A plataforma reconhece diferentes tipos de usuário, cada um com um nível de acesso apropriado.

> **Cadastro (CNPJ)**: é o "documento de identidade" da empresa cliente dentro do sistema — só depois que ele existe é que a empresa pode ver preços e comprar.

| Perfil | O que pode ver | O que pode fazer |
|---|---|---|
| **Visitante** (sem login) | Catálogo, sem preços | Navegar, buscar produtos, iniciar cadastro |
| **Cliente com cadastro pendente** | Catálogo, sem preços | Acompanhar o status do próprio cadastro |
| **Cliente aprovado** | Catálogo com preços | Ver preços, montar carrinho, acompanhar pedidos, gerenciar dados da própria conta |
| **Cliente recusado ou suspenso** | Catálogo, sem preços | Ver o motivo da recusa/suspensão informado pela empresa |
| **Vendedor** | Catálogo com preços, clientes vinculados a ele | Consultar clientes sob sua responsabilidade |
| **Administrador** | Acesso completo | Gerenciar produtos, categorias, marcas, estoque, clientes, pedidos, banners, campanhas e configurações |

---

## 4. Funcionalidades do Site

### Página inicial
Apresenta banners de destaque, campanhas sazonais (ex.: "Dia dos Pais") e produtos em destaque, organizados por categoria.

### Banners e campanhas
A equipe administrativa pode trocar as imagens do carrossel principal e criar campanhas temáticas (com imagem, nome e lista de produtos) diretamente pelo painel, sem depender de alteração de código.

### Catálogo, busca, filtros, categorias e marcas
O catálogo completo pode ser navegado por categoria ou marca, e há uma busca por nome, SKU (código do produto) ou palavra-chave. Filtros ajudam o visitante a refinar por categoria, marca e faixa de produtos em destaque.

### Página individual de produto
Mostra fotos, nome, código, categoria e — para clientes aprovados — o preço e a quantidade mínima de compra. Para quem ainda não tem cadastro aprovado, aparece um convite para login ou cadastro no lugar do preço.

### Cadastro empresarial
Feito em três etapas simples: (1) dados da empresa e do responsável, (2) perfil comercial e endereço, (3) documentos e criação de senha. O cliente acompanha o status do cadastro (pendente, aprovado, recusado) diretamente na própria conta.

### Login e recuperação de acesso
O login pode ser feito por e-mail ou CNPJ. Existe uma tela de recuperação de senha, que envia instruções por e-mail.

### Exibição de preços para clientes aprovados
Os preços só aparecem para empresas com cadastro aprovado — essa é uma regra de segurança de negócio, validada tanto na tela quanto no banco de dados.

### Carrinho
O cliente aprovado pode adicionar produtos, ajustar quantidades e remover itens. O carrinho é salvo automaticamente e continua disponível mesmo se o cliente sair e voltar depois.

### Área do cliente ("Minha Conta")
Reúne os dados cadastrais da empresa, o histórico de pedidos e a opção de logout.

### Responsividade
O site foi testado e funciona em celular, tablet e computador, adaptando o layout para cada tamanho de tela.

---

## 5. Painel Administrativo

O painel administrativo é o centro de controle da operação, acessível apenas por usuários com perfil de administrador.

| Área | O que faz |
|---|---|
| **Dashboard** | Visão geral: total de produtos ativos, cadastros pendentes, pedidos em andamento e banners ativos |
| **Produtos** | Cadastrar, editar e importar produtos em planilha; buscar e filtrar por categoria, marca e situação |
| **Categorias** | Criar e editar as categorias do catálogo |
| **Marcas** | Criar e editar as marcas exibidas no catálogo |
| **Estoque** | Consultar e ajustar a quantidade disponível de cada produto |
| **Tabelas de preços** | Gerenciar diferentes tabelas comerciais e os preços vinculados a cada uma |
| **Clientes** | Consultar empresas cadastradas, ver documentos enviados e aprovar ou recusar cadastros |
| **Pedidos** | Consultar pedidos e acompanhar cada etapa do atendimento |
| **Banners e campanhas** | Trocar as imagens de destaque da página inicial e montar campanhas temáticas |
| **Administradores** | Cadastrar novos acessos administrativos |
| **Configurações** | Ajustes gerais da operação comercial |
| **Logout** | Encerrar a sessão administrativa com segurança |

> **Sobre remoção de produtos**: hoje o painel permite editar, publicar/despublicar e ajustar o estoque de cada produto individualmente. Uma ação de **arquivamento ou desativação individual de produto** está prevista como aprimoramento operacional futuro (ver seção 10).

---

## 6. Manual Rápido

Orientações objetivas para as tarefas mais comuns do dia a dia.

**Fazer login**
1. Acesse a página de login.
2. Informe e-mail e senha (ou CNPJ e senha).
3. Clique em "Entrar".

**Editar um produto**
1. No menu, acesse "Produtos".
2. Localize o produto pela busca ou pelos filtros.
3. Clique em "Editar", ajuste as informações e salve.

**Atualizar estoque**
1. No menu, acesse "Estoque".
2. Localize o produto.
3. Ajuste a quantidade disponível.

**Cadastrar categoria**
1. No menu, acesse "Categorias".
2. Clique em "Nova Categoria" e preencha nome e posição de exibição.

**Cadastrar marca**
1. No menu, acesse "Marcas".
2. Clique em "Nova Marca" e informe o nome (e logo, se houver).

**Consultar clientes**
1. No menu, acesse "Clientes".
2. Use os filtros de status (pendente, aprovado, recusado, suspenso) para localizar a empresa desejada.

**Aprovar um cadastro**
1. Em "Clientes", clique em "Analisar" na empresa desejada.
2. Escreva uma mensagem explicando a aprovação (obrigatório).
3. Clique em "Aprovar Cadastro".

**Consultar pedidos**
1. No menu, acesse "Pedidos".
2. Use a busca por número ou os filtros de status.

**Sair da conta**
1. Clique no botão "Sair da Conta", disponível no topo do painel (desktop e celular).
2. Você será redirecionado para a tela de login.

*(Local reservado para inserção das capturas de tela numeradas — ver lista de screenshots ao final deste documento.)*

---

## 7. Tecnologias Utilizadas

Em linguagem simples, sem entrar em detalhes técnicos desnecessários:

| Tecnologia | O que é, em uma frase |
|---|---|
| **TypeScript e JavaScript** | As linguagens de programação usadas para construir o sistema. |
| **Next.js e React** | A estrutura (framework) que organiza como as páginas do site são construídas e exibidas. |
| **Supabase e PostgreSQL** | O serviço responsável por guardar os dados (produtos, clientes, pedidos) e cuidar do login dos usuários. |
| **Vercel** | O serviço que hospeda o site atualmente, usado para testes e homologação. |
| **Hostinger** | O ambiente definitivo previsto após a aprovação, sujeito à compatibilidade do plano contratado. |

A plataforma está atualmente publicada na Vercel como ambiente de testes, apresentação e homologação. Após a aprovação da Campos & Coelho, será realizada a configuração do ambiente definitivo e a publicação na Hostinger, mediante confirmação de que o plano contratado é compatível com a estrutura técnica da aplicação.

---

## 8. Segurança

A plataforma foi construída com camadas de proteção pensadas para o tipo de operação que a Campos & Coelho realiza:

- **Autenticação de usuários**: cada pessoa acessa com login e senha próprios; não existe senha compartilhada.
- **Separação de permissões por perfil**: um cliente não consegue acessar telas de administrador, e vice-versa — isso é verificado tanto na tela quanto no servidor.
- **Proteção de páginas privadas**: áreas como carrinho, checkout, conta do cliente e painel administrativo exigem login; tentativas de acesso direto sem login são redirecionadas para a tela de entrada.
- **Regras de segurança no banco de dados**: existe uma camada de proteção diretamente no banco de dados (chamada tecnicamente de *RLS — Row Level Security*, ou "segurança em nível de linha"), que impede que um usuário veja ou altere dados que não são dele, mesmo em caso de falha na tela.
- **Proteção das credenciais do sistema**: as chaves e senhas que o sistema usa para se conectar ao banco de dados e a outros serviços ficam guardadas de forma protegida, nunca expostas publicamente.
- **Bloqueio de acesso administrativo**: só contas cadastradas como administrador acessam o painel — qualquer outra tentativa é redirecionada automaticamente.
- **Cuidados com dados pessoais e LGPD**: o sistema tem uma política de privacidade publicada, um canal de contato para pedidos relacionados a dados pessoais, e coleta apenas as informações necessárias para a operação comercial.

O sistema possui diferentes camadas de proteção e segue boas práticas de segurança. Como qualquer aplicação online, requer atualizações, monitoramento e manutenção contínua.

---

## 9. Versionamento, Backup e Recuperação

### A) Código do sistema

- Todo o histórico de alterações do sistema fica registrado (ferramenta técnica chamada *Git*), permitindo saber exatamente o que mudou, quando e por quê.
- É possível **voltar a uma versão anterior** do sistema rapidamente, caso uma alteração cause algum problema.
- Existe um **histórico completo de publicações** — cada versão colocada no ar fica registrada.
- Antes de qualquer alteração chegar ao site principal, ela passa por um **ambiente de testes (Preview)**, separado do ambiente que os clientes usam.

### B) Banco de dados

A política de backup e retenção do banco de dados será confirmada de acordo com o plano de infraestrutura contratado.

### C) Procedimento em caso de falha

Em caso de qualquer problema identificado no sistema, o processo seguido é:

1. **Identificar** o problema relatado.
2. **Reproduzir** o problema em ambiente controlado, para confirmar a causa.
3. **Corrigir** em ambiente de teste, isolado do site em uso.
4. **Validar** que a correção resolve o problema sem gerar efeitos colaterais.
5. **Publicar** a correção no site principal.
6. Em caso de **problema crítico**, é possível **restaurar a versão anterior** rapidamente, minimizando o tempo de indisponibilidade.

---

## 10. Status da Entrega

| Entregue e validado | Em homologação | Próximas etapas |
|---|---|---|
| Catálogo, busca, filtros, categorias e marcas | Conversão do carrinho em pedido definitivo | Arquivamento/desativação individual de produto |
| Cadastro empresarial em três etapas | Condições comerciais finais do checkout | Integração com o ambiente definitivo (Hostinger) |
| Login, recuperação de senha e proteção de rotas | — | Evoluções conforme o crescimento da operação |
| Exibição de preços para clientes aprovados | — | — |
| Carrinho de compras com persistência | — | — |
| Painel administrativo completo (produtos, categorias, marcas, estoque, tabelas de preço, clientes, pedidos, banners, campanhas, administradores) | — | — |
| Aprovação/recusa de cadastros de clientes | — | — |
| Responsividade (celular, tablet, computador) | — | — |
| Logout administrativo | — | — |

**Sobre o checkout:** o checkout possui atualmente sua estrutura visual. A conversão definitiva do carrinho em pedido e as condições comerciais estão em fase de homologação. A operação será exclusivamente por retirada no estabelecimento, portanto não haverá cálculo ou seleção de frete.

**Sobre a função de remoção de produtos:** a função de arquivamento ou desativação individual de produtos está prevista como aprimoramento operacional.

---

## 11. Suporte e Manutenção

- **Correção de bugs**: falhas identificadas no funcionamento já entregue são corrigidas sem custo adicional, dentro do prazo definido em contrato.
- **Manutenção técnica**: inclui monitoramento, atualizações de segurança e ajustes necessários para manter o sistema funcionando corretamente.
- **Prazo de avaliação inicial de chamados**: até 48 horas úteis, em dias úteis (segunda a sexta-feira), das 9h às 18h. Esse é o prazo para a **avaliação inicial** do chamado — o tempo de correção definitiva pode variar conforme a complexidade do problema.
- **Diferença entre correção e nova funcionalidade**: correção é ajustar algo que já existe e não está funcionando como deveria; nova funcionalidade é adicionar algo que não fazia parte do escopo entregue — esse segundo caso é tratado como uma nova etapa do projeto.
- **Atividades sob responsabilidade da Campos & Coelho**: cadastro e atualização de produtos, aprovação de clientes, gestão de pedidos e conteúdo comercial (banners, campanhas) são atividades operacionais do dia a dia, realizadas pela própria equipe da empresa dentro do painel administrativo.

---

## 12. Acessos e Titularidade

Os ativos digitais e o código desenvolvido para este projeto pertencem à Campos & Coelho, conforme contrato.

| Ativo | Titularidade / situação |
|---|---|
| Domínio | A confirmar com a Campos & Coelho |
| Repositório de código | Campos & Coelho (código-fonte do projeto) |
| Vercel (hospedagem atual) | A confirmar com a Campos & Coelho |
| Hostinger (hospedagem definitiva) | A confirmar com a Campos & Coelho |
| Supabase (banco de dados) | A confirmar com a Campos & Coelho |
| Contas de anúncios | A confirmar com a Campos & Coelho |
| Google Analytics | A confirmar com a Campos & Coelho |
| Google Search Console | A confirmar com a Campos & Coelho |

Nenhuma senha, token ou chave de acesso é exibida neste documento. Os acessos devem ser entregues ou compartilhados por meio seguro, combinado diretamente entre as partes.

---

## 13. Checklist de Homologação

Use esta lista para validar a plataforma antes da aprovação final:

- [ ] Identidade visual (cores, logotipo, tipografia)
- [ ] Catálogo de produtos
- [ ] Busca de produtos
- [ ] Cadastro de novos clientes
- [ ] Acesso e login do cliente
- [ ] Exibição de preços para clientes aprovados
- [ ] Carrinho de compras
- [ ] Painel administrativo (acesso e navegação)
- [ ] Cadastro e edição de produtos
- [ ] Controle de estoque
- [ ] Gestão de clientes (aprovação/recusa)
- [ ] Funcionamento no celular
- [ ] Regras comerciais (retirada no estabelecimento, pedido mínimo)
- [ ] Checkout (em homologação)
- [ ] Ambiente definitivo (Hostinger, a configurar)

---

## 14. Encerramento

A plataforma foi estruturada desde o início pensando em crescimento. Isso significa que novas funcionalidades, integrações e melhorias podem ser incorporadas ao sistema conforme a operação da Campos & Coelho evoluir, sem a necessidade de reconstruir o que já foi entregue.

Este documento reflete o estágio atual da plataforma na data informada na capa e será atualizado conforme novas etapas forem concluídas.

---

## Lista de Screenshots (para inserção)

| # | Tela | Observações de privacidade |
|---|---|---|
| 1 | Página inicial (banners) | Pública, sem dados pessoais |
| 2 | Catálogo de produtos | Pública, sem dados pessoais |
| 3 | Página individual de produto | Pública, sem dados pessoais |
| 4 | Cadastro empresarial — etapa 1 (campos vazios) | Pública, nenhum dado real preenchido |
| 5 | Dashboard administrativo | Nome do administrador ocultado/substituído por "Administrador Campos & Coelho" |
| 6 | Listagem de produtos (admin) | Sem dados pessoais — só catálogo comercial |
| 7 | Estoque (admin) | Sem dados pessoais — só catálogo comercial |
| 8 | Listagem de clientes (admin) | Necessário ocultar CNPJ/e-mail do registro de teste antes de capturar |
| 9 | Listagem de pedidos (admin) | Sem dados pessoais no estado atual (lista vazia) |

**Limitação técnica identificada:** neste momento não há um mecanismo disponível para salvar as capturas de tela como arquivo de imagem para inserção automática no documento. As capturas foram validadas visualmente (conteúdo confirmado, dados sensíveis ocultados com sucesso via ajuste temporário de tela, sem alterar nenhum arquivo do sistema), mas precisam ser inseridas manualmente — por mim enviando as imagens para você salvar, ou por você mesmo capturando as mesmas telas seguindo esta lista.

## Informações marcadas como "a confirmar"

- Titularidade de domínio, Vercel, Hostinger, Supabase, contas de anúncios, Analytics e Search Console (seção 12).
- Política de backup e retenção do banco de dados, conforme plano de infraestrutura a ser contratado (seção 9-B).

## Divergências encontradas

- Nenhuma divergência de conteúdo entre contrato, código e funcionalidades foi encontrada além dos pontos já sinalizados como "em homologação" (checkout) e "próxima etapa" (arquivamento individual de produto) — ambos tratados com a redação que você definiu, sem classificá-los como falhas.
- Limitação técnica de salvamento de screenshots, descrita acima.
