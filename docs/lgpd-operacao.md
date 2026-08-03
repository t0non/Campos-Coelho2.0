# Operacao de privacidade e LGPD

Este documento complementa os controles implementados no site. Adequacao a LGPD e um processo continuo e tambem depende de decisoes administrativas, contratos e treinamento.

## Antes de publicar

1. Preencher no ambiente de producao:
   - `NEXT_PUBLIC_CONTROLLER_LEGAL_NAME`: razao social completa do controlador.
   - `NEXT_PUBLIC_CONTROLLER_CNPJ`: CNPJ do controlador.
   - `NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL`: canal acompanhado pela pessoa responsavel por privacidade.
   - `CRON_SECRET`: segredo longo e aleatorio usado exclusivamente pela rotina de retencao.
2. Aplicar a migracao `20260803090000_lgpd_privacy_governance.sql` no Supabase vinculado.
3. Confirmar que o envio transacional esta ativo para os protocolos e respostas do titular.
4. Fazer um pedido de teste em `/privacidade` e concluir o protocolo em `/admin/privacidade`.
5. Confirmar que a rotina `/api/privacy/retention` esta sendo executada diariamente pelo provedor de hospedagem.

## Responsabilidades internas

- Definir formalmente quem e o controlador e se a empresa deve indicar encarregado. Se houver encarregado, publicar sua identidade ou identificacao e contato conforme a regulamentacao aplicavel.
- Manter inventario das atividades de tratamento: finalidade, categoria de dado, titulares, base legal, operador, compartilhamento, prazo e controles de seguranca.
- Documentar a avaliacao de legitimo interesse usada na prevencao a fraude e analise cadastral.
- Revisar contratos e termos de Vercel, Supabase, Resend, WhatsApp e outros fornecedores que tratem dados em nome da empresa, inclusive transferencias internacionais.
- Limitar o acesso administrativo por funcao, revisar usuarios periodicamente e remover acessos que nao sejam mais necessarios.
- Orientar a equipe a nunca copiar CPF, documentos ou dados de clientes para planilhas, e-mail pessoal ou aplicativos nao aprovados.

## Atendimento ao titular

- Novos pedidos entram em `/admin/privacidade` com protocolo e prazo interno.
- Antes de entregar, corrigir ou eliminar dados, confirmar a identidade por um canal que ja esteja cadastrado. Nunca pedir senha.
- Registrar no resumo da resposta o que foi verificado e realizado, sem copiar documentos pessoais para o campo.
- Quando uma eliminacao nao puder ser integral por obrigacao legal ou defesa de direitos, explicar quais dados permanecem, a justificativa e o criterio de prazo.
- Pedidos concluidos enviam resposta ao e-mail informado quando o provedor transacional esta configurado.

## Incidentes de seguranca

- Manter um canal interno para que funcionarios comuniquem imediatamente perda, acesso indevido, envio ao destinatario errado ou exposicao de dados.
- Preservar registro de cada incidente por pelo menos cinco anos, incluindo data de conhecimento, dados afetados, titulares, riscos, medidas e decisoes de notificacao.
- Quando o incidente puder causar risco ou dano relevante, avaliar a comunicacao a ANPD e aos titulares dentro do prazo regulamentar de tres dias uteis.
- A comunicacao ao titular deve usar linguagem simples e informar dados afetados, riscos, medidas de protecao e contato para suporte.

## Revisao periodica

- Mensalmente: verificar protocolos de privacidade em aberto e falhas da rotina de retencao.
- Trimestralmente: revisar administradores, vendedores e acessos a documentos.
- Semestralmente: revisar fornecedores, inventario de dados, prazos de retencao e textos publicos.
- Antes de instalar analytics, pixels ou publicidade: mapear finalidade e base legal, atualizar o aviso e implementar escolha previa para recursos opcionais.

## Fontes oficiais usadas

- Lei 13.709/2018 (LGPD): https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm
- Direitos dos titulares: https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares
- Cookies e protecao de dados: https://www.gov.br/anpd/pt-br/assuntos/noticias-periodo-eleitoral/anpd-lanca-guia-orientativo-201ccookies-e-protecao-de-dados-pessoais201d
- Comunicacao de incidente: https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis
- Atuacao do encarregado: https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-lanca-guia-sobre-atuacao-do-encarregado
