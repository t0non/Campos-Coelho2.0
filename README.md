# Shaiff Cabeleireiros — Landing Page & Painel de Combos

Landing Page institucional de alta performance para o **Shaiff Cabeleireiros**, localizada em Santa Efigênia, Belo Horizonte - MG.

Desenvolvido com **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS** e **Supabase**.

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos
- Node.js 20+
- Conta no Supabase (para ambiente de banco de dados e autenticação)

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` baseado no `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-privada
```

> ⚠️ **Segurança**: A chave `SUPABASE_SERVICE_ROLE_KEY` é estritamente privada do servidor e NUNCA deve ser exposta ao navegador.

### 3. Configurar o Banco de Dados no Supabase
1. Acesse o painel do seu projeto no Supabase -> **SQL Editor**.
2. Abra e execute o arquivo de migração: `supabase/migrations/20260727_promotional_combos.sql`.
3. Este script cria:
   - Tabela `admin_users` e `promotional_combos`.
   - Triggers de `updated_at`.
   - Políticas de Row Level Security (RLS).
   - Bucket no Supabase Storage (`promotional-combos`) com limite de 5MB.

### 4. Criar o Primeiro Administrador
1. No Supabase Dashboard, acesse **Authentication** -> **Users** -> **Add User** -> **Create User**.
2. Informe o e-mail e senha desejados para a administradora.
3. Obtenha o `UUID` do usuário criado.
4. No **SQL Editor**, vincule a conta à tabela de administradores:

```sql
INSERT INTO public.admin_users (id, email, role)
VALUES ('SEU_UUID_AQUI', 'email@shaiff.com.br', 'admin');
```

### 5. Iniciar o Servidor Local
```bash
npm run dev
```
Acesse `http://localhost:3000` para o site público e `http://localhost:3000/admin` para o painel de combos.

---

## 🧪 Comandos de QA e Verificação

```bash
# Executar Linter
npm run lint

# Verificar Tipos TypeScript
npm run typecheck

# Executar Testes Unitários
npm test

# Executar Build de Produção
npm run build
```

---

## 📖 Documentação do Painel
Consulte `docs/PAINEL-DE-COMBOS.md` para o guia passo a passo em linguagem amigável voltado para a cliente.
