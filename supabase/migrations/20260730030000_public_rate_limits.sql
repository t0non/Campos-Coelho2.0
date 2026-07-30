create table if not exists public.request_rate_limits (
  key_hash text not null,
  action text not null,
  window_started_at timestamptz not null default now(),
  attempts integer not null default 1 check (attempts > 0),
  primary key (key_hash, action)
);

alter table public.request_rate_limits enable row level security;
revoke all on public.request_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.request_rate_limits to service_role;

create or replace function public.consume_public_rate_limit(
  p_key_hash text,
  p_action text,
  p_max_attempts integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempts integer;
  v_started_at timestamptz;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    return false;
  end if;

  if length(p_key_hash) <> 64
     or p_action !~ '^[a-z_]{3,40}$'
     or p_max_attempts < 1
     or p_max_attempts > 100
     or p_window_seconds < 60
     or p_window_seconds > 86400 then
    return false;
  end if;

  insert into public.request_rate_limits (key_hash, action)
  values (p_key_hash, p_action)
  on conflict (key_hash, action) do nothing;

  select attempts, window_started_at
  into v_attempts, v_started_at
  from public.request_rate_limits
  where key_hash = p_key_hash and action = p_action
  for update;

  if v_started_at <= now() - make_interval(secs => p_window_seconds) then
    update public.request_rate_limits
    set attempts = 1, window_started_at = now()
    where key_hash = p_key_hash and action = p_action;
    return true;
  end if;

  if v_attempts >= p_max_attempts then
    return false;
  end if;

  update public.request_rate_limits
  set attempts = attempts + 1
  where key_hash = p_key_hash and action = p_action;

  return true;
end;
$$;

revoke all on function public.consume_public_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_public_rate_limit(text, text, integer, integer)
  to service_role;
