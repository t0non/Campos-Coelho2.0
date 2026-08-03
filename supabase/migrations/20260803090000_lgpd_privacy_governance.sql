-- GovernanÃ§a de privacidade e atendimento aos titulares (LGPD).

alter table public.companies
  add column if not exists business_type text,
  add column if not exists estimated_order_volume text;

alter table public.company_documents
  add column if not exists retention_until timestamptz;

alter table public.newsletter_leads
  add column if not exists consent_at timestamptz,
  add column if not exists consent_source text,
  add column if not exists privacy_policy_version text,
  add column if not exists unsubscribed_at timestamptz;

-- Registros antigos sem prova de consentimento ficam inativos. Uma nova
-- inscricao explicita pelo site reativa o endereco e grava data, origem e versao.
update public.newsletter_leads
set unsubscribed_at = coalesce(unsubscribed_at, now())
where consent_at is null;

create table if not exists public.privacy_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  document_type text not null check (document_type in ('terms_of_use', 'privacy_notice', 'declaration_of_truth')),
  document_version text not null,
  source text not null default 'company_registration',
  acknowledged_at timestamptz not null default now(),
  unique (profile_id, document_type, document_version)
);

create table if not exists public.privacy_requests (
  id uuid primary key default gen_random_uuid(),
  protocol text not null unique,
  request_type text not null check (
    request_type in (
      'confirmation_access',
      'correction',
      'deletion_anonymization',
      'portability',
      'consent_revocation',
      'processing_information',
      'automated_decision_review',
      'other'
    )
  ),
  requester_name text not null,
  requester_email text not null,
  company_cnpj text,
  relationship text not null check (relationship in ('customer', 'representative', 'lead', 'former_customer', 'other')),
  message text not null,
  status text not null default 'received' check (status in ('received', 'identity_check', 'in_progress', 'completed', 'rejected')),
  due_at timestamptz not null,
  resolved_at timestamptz,
  response_summary text,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists privacy_requests_status_due_idx
  on public.privacy_requests (status, due_at, created_at);

create index if not exists company_documents_retention_idx
  on public.company_documents (retention_until)
  where retention_until is not null;

alter table public.privacy_acknowledgements enable row level security;
alter table public.privacy_requests enable row level security;

drop policy if exists "Titular le os proprios comprovantes de ciencia" on public.privacy_acknowledgements;
create policy "Titular le os proprios comprovantes de ciencia"
  on public.privacy_acknowledgements for select
  using (auth.uid() = profile_id or public.is_admin());

drop policy if exists "Admin gerencia solicitacoes de privacidade" on public.privacy_requests;
create policy "Admin gerencia solicitacoes de privacidade"
  on public.privacy_requests for all
  using (public.is_admin())
  with check (public.is_admin());

revoke all on public.privacy_acknowledgements from public, anon;
revoke all on public.privacy_requests from public, anon;
grant select on public.privacy_acknowledgements to authenticated;
grant select, insert, update on public.privacy_acknowledgements to service_role;
grant select, insert, update on public.privacy_requests to service_role;
grant select, update on public.privacy_requests to authenticated;

-- Remove das auditorias antigas a cÃ³pia ampla do formulÃ¡rio. O evento e sua data
-- continuam preservados; dados cadastrais ficam apenas nas tabelas prÃ³prias.
update public.audit_logs
set payload = jsonb_build_object(
  'minimized_at', now(),
  'reason', 'data_minimization'
)
where action = 'public_registration_submitted'
  and payload is not null;
