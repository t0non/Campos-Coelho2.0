alter table public.audit_logs
  drop constraint if exists audit_logs_actor_id_fkey;

alter table public.audit_logs
  add constraint audit_logs_actor_id_fkey
  foreign key (actor_id)
  references public.profiles(id)
  on delete set null;
