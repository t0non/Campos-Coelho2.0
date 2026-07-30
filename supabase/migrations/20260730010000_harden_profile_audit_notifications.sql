-- Bloqueia troca de empresa e escrita direta em registros de confiança.
-- Operações legítimas continuam disponíveis para administradores e service_role.

create or replace function public.prevent_profile_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requester_role text := coalesce(auth.jwt() ->> 'role', '');
begin
  if requester_role <> 'service_role' and not public.is_admin() then
    if new.role is distinct from old.role then
      raise exception 'Apenas administradores podem alterar a função de um perfil.';
    end if;

    if new.status is distinct from old.status then
      raise exception 'Apenas administradores podem alterar o status de um perfil.';
    end if;

    if new.company_id is distinct from old.company_id then
      raise exception 'O vínculo empresarial só pode ser alterado pelo servidor.';
    end if;
  end if;

  return new;
end;
$$;

drop policy if exists "Usuário insere notificações" on public.notifications;
drop policy if exists "Usuário insere audit logs" on public.audit_logs;

revoke insert on public.notifications from authenticated, anon;
revoke insert on public.audit_logs from authenticated, anon;

grant insert on public.notifications to service_role;
grant insert on public.audit_logs to service_role;
