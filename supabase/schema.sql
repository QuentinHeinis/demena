create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Mon déménagement',
  owner_id uuid not null references auth.users(id) on delete cascade,
  move_date date,
  destination text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null default '',
  display_name text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  invited_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role text not null check (role in ('editor', 'viewer')),
  token text not null unique default encode(gen_random_bytes(16), 'hex'),
  invited_by uuid not null references auth.users(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists workspace_invitations_pending_idx
  on public.workspace_invitations (workspace_id, lower(email)) where accepted_at is null;

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  phone text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  description text not null default '',
  category text not null default 'autre',
  priority text not null default 'moyenne' check (priority in ('basse', 'moyenne', 'haute')),
  done boolean not null default false,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  label text not null,
  amount numeric(12, 2) not null check (amount > 0),
  type text not null check (type in ('depense', 'recette')),
  category text not null default 'autre',
  date date not null default current_date,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  category text not null,
  amount numeric(12, 2) not null default 0 check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, category)
);

create table if not exists public.apartments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  address text not null default '',
  city text not null default '',
  postal_code text not null default '',
  surface numeric(8, 2),
  rooms integer,
  price numeric(12, 2) not null default 0,
  charges numeric(12, 2) not null default 0,
  deposit numeric(12, 2) not null default 0,
  kind text not null default 'location' check (kind in ('location', 'achat')),
  status text not null default 'a_visiter' check (status in ('a_visiter', 'visite_planifiee', 'visite_faite', 'interesse', 'refuse', 'accepte')),
  rating integer not null default 0 check (rating between 0 and 5),
  visit_date timestamptz,
  listing_url text not null default '',
  contact_name text not null default '',
  contact_phone text not null default '',
  contact_email text not null default '',
  pros text not null default '',
  cons text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.boxes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  label text not null,
  room text not null default '',
  status text not null default 'a_emballer' check (status in ('a_emballer', 'emballe', 'transporte', 'devide')),
  fragile boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  role text not null default 'autre',
  phone text not null default '',
  email text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  description text not null default '',
  date text not null,
  all_day boolean not null default true,
  reminder_minutes integer not null default -1 check (reminder_minutes in (-2, -1, 0, 5, 15, 60, 1440, 2880)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_workspace_id_idx on public.tasks (workspace_id);
create index if not exists transactions_workspace_id_idx on public.transactions (workspace_id);
create index if not exists transactions_workspace_id_date_idx on public.transactions (workspace_id, date);
create index if not exists budgets_workspace_id_idx on public.budgets (workspace_id);
create index if not exists apartments_workspace_id_idx on public.apartments (workspace_id);
create index if not exists boxes_workspace_id_idx on public.boxes (workspace_id);
create index if not exists contacts_workspace_id_idx on public.contacts (workspace_id);
create index if not exists calendar_events_workspace_id_idx on public.calendar_events (workspace_id);
create index if not exists workspace_members_user_id_idx on public.workspace_members (user_id);
create index if not exists workspace_invitations_email_idx on public.workspace_invitations (lower(email));

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks for each row execute function public.set_updated_at();
drop trigger if exists budgets_set_updated_at on public.budgets;
create trigger budgets_set_updated_at before update on public.budgets for each row execute function public.set_updated_at();
drop trigger if exists apartments_set_updated_at on public.apartments;
create trigger apartments_set_updated_at before update on public.apartments for each row execute function public.set_updated_at();
drop trigger if exists boxes_set_updated_at on public.boxes;
create trigger boxes_set_updated_at before update on public.boxes for each row execute function public.set_updated_at();
drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at before update on public.contacts for each row execute function public.set_updated_at();
drop trigger if exists calendar_events_set_updated_at on public.calendar_events;
create trigger calendar_events_set_updated_at before update on public.calendar_events for each row execute function public.set_updated_at();
drop trigger if exists workspaces_set_updated_at on public.workspaces;
create trigger workspaces_set_updated_at before update on public.workspaces for each row execute function public.set_updated_at();
drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at before update on public.user_settings for each row execute function public.set_updated_at();

create or replace function public.shares_workspace_with(other uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members mine
    join public.workspace_members theirs on theirs.workspace_id = mine.workspace_id
    where mine.user_id = auth.uid() and theirs.user_id = other
  );
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

create or replace function public.workspace_role(ws uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select m.role from public.workspace_members m
  where m.workspace_id = ws and m.user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_workspace_member(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.workspace_role(ws) is not null;
$$;

create or replace function public.can_write_workspace(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.workspace_role(ws) in ('owner', 'editor');
$$;

create or replace function public.is_workspace_owner(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.workspace_role(ws) = 'owner';
$$;

create or replace function public.ensure_personal_workspace()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  ws uuid;
begin
  select id into ws from public.workspaces where owner_id = auth.uid() order by created_at limit 1;

  if ws is null then
    insert into public.workspaces (name, owner_id)
    values ('Mon déménagement', auth.uid())
    returning id into ws;
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (ws, auth.uid(), 'owner')
  on conflict (workspace_id, user_id) do nothing;

  insert into public.profiles (id, email, display_name)
  values (
    auth.uid(),
    coalesce(auth.jwt() ->> 'email', ''),
    coalesce(auth.jwt() -> 'user_metadata' ->> 'display_name', '')
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(nullif(excluded.display_name, ''), public.profiles.display_name);

  insert into public.user_settings (user_id, display_name)
  values (auth.uid(), coalesce(auth.jwt() -> 'user_metadata' ->> 'display_name', ''))
  on conflict (user_id) do nothing;

  return ws;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  ws uuid;
begin
  insert into public.workspaces (name, owner_id)
  values ('Mon déménagement', new.id)
  returning id into ws;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (ws, new.id, 'owner');

  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', ''));

  insert into public.user_settings (user_id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.accept_workspace_invitation(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.workspace_invitations;
begin
  select * into inv
  from public.workspace_invitations
  where token = invite_token
    and accepted_at is null
    and expires_at > now()
    and lower(email) = lower(coalesce(auth.jwt()->>'email', ''));

  if not found then
    raise exception 'Invitation introuvable, expirée ou destinée à une autre adresse email.';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role, invited_by)
  values (inv.workspace_id, auth.uid(), inv.role, inv.invited_by)
  on conflict (workspace_id, user_id) do update set role = excluded.role;

  update public.workspace_invitations set accepted_at = now() where id = inv.id;

  return inv.workspace_id;
end;
$$;

revoke all on function public.accept_workspace_invitation(text) from public;
grant execute on function public.accept_workspace_invitation(text) to authenticated;
revoke all on function public.ensure_personal_workspace() from public;
grant execute on function public.ensure_personal_workspace() to authenticated;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invitations enable row level security;
alter table public.user_settings enable row level security;
alter table public.tasks enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.apartments enable row level security;
alter table public.boxes enable row level security;
alter table public.contacts enable row level security;
alter table public.calendar_events enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select using (
  id = auth.uid() or public.shares_workspace_with(id)
);
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "workspace_select" on public.workspaces;
create policy "workspace_select" on public.workspaces for select using (public.is_workspace_member(id));
drop policy if exists "workspace_insert" on public.workspaces;
create policy "workspace_insert" on public.workspaces for insert with check (owner_id = auth.uid());
drop policy if exists "workspace_update" on public.workspaces;
create policy "workspace_update" on public.workspaces for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "workspace_delete" on public.workspaces;
create policy "workspace_delete" on public.workspaces for delete using (owner_id = auth.uid());

drop policy if exists "members_select" on public.workspace_members;
create policy "members_select" on public.workspace_members for select using (public.is_workspace_member(workspace_id));
drop policy if exists "members_insert" on public.workspace_members;
create policy "members_insert" on public.workspace_members for insert with check (public.is_workspace_owner(workspace_id));
drop policy if exists "members_update" on public.workspace_members;
create policy "members_update" on public.workspace_members for update using (public.is_workspace_owner(workspace_id)) with check (public.is_workspace_owner(workspace_id));
drop policy if exists "members_delete" on public.workspace_members;
create policy "members_delete" on public.workspace_members for delete using (public.is_workspace_owner(workspace_id));

drop policy if exists "invitations_select" on public.workspace_invitations;
create policy "invitations_select" on public.workspace_invitations for select using (
  public.is_workspace_owner(workspace_id) or lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
);
drop policy if exists "invitations_insert" on public.workspace_invitations;
create policy "invitations_insert" on public.workspace_invitations for insert with check (
  public.is_workspace_owner(workspace_id) and invited_by = auth.uid()
);
drop policy if exists "invitations_update" on public.workspace_invitations;
create policy "invitations_update" on public.workspace_invitations for update using (public.is_workspace_owner(workspace_id)) with check (public.is_workspace_owner(workspace_id));
drop policy if exists "invitations_delete" on public.workspace_invitations;
create policy "invitations_delete" on public.workspace_invitations for delete using (public.is_workspace_owner(workspace_id));

drop policy if exists "settings_all" on public.user_settings;
create policy "settings_all" on public.user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

do $$
declare
  t text;
begin
  foreach t in array array['tasks', 'transactions', 'budgets', 'apartments', 'boxes', 'contacts', 'calendar_events'] loop
    execute format('drop policy if exists %I on public.%I', 'data_select_' || t, t);
    execute format('create policy %I on public.%I for select using (public.is_workspace_member(workspace_id))', 'data_select_' || t, t);
    execute format('drop policy if exists %I on public.%I', 'data_insert_' || t, t);
    execute format('create policy %I on public.%I for insert with check (public.can_write_workspace(workspace_id))', 'data_insert_' || t, t);
    execute format('drop policy if exists %I on public.%I', 'data_update_' || t, t);
    execute format('create policy %I on public.%I for update using (public.can_write_workspace(workspace_id)) with check (public.can_write_workspace(workspace_id))', 'data_update_' || t, t);
    execute format('drop policy if exists %I on public.%I', 'data_delete_' || t, t);
    execute format('create policy %I on public.%I for delete using (public.can_write_workspace(workspace_id))', 'data_delete_' || t, t);
  end loop;
end;
$$;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  reminder_minutes integer not null default 1440 check (reminder_minutes in (0, 60, 1440, 2880)),
  timezone text not null default 'UTC',
  device text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create table if not exists public.push_notifications_sent (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.push_subscriptions(id) on delete cascade,
  event_key text not null,
  sent_at timestamptz not null default now(),
  unique (subscription_id, event_key)
);

alter table public.push_subscriptions enable row level security;
alter table public.push_notifications_sent enable row level security;

drop trigger if exists push_subscriptions_set_updated_at on public.push_subscriptions;
create trigger push_subscriptions_set_updated_at before update on public.push_subscriptions for each row execute function public.set_updated_at();

drop policy if exists "push_subscriptions_select" on public.push_subscriptions;
create policy "push_subscriptions_select" on public.push_subscriptions for select using (auth.uid() = user_id);
drop policy if exists "push_subscriptions_insert" on public.push_subscriptions;
create policy "push_subscriptions_insert" on public.push_subscriptions for insert with check (auth.uid() = user_id);
drop policy if exists "push_subscriptions_update" on public.push_subscriptions;
create policy "push_subscriptions_update" on public.push_subscriptions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "push_subscriptions_delete" on public.push_subscriptions;
create policy "push_subscriptions_delete" on public.push_subscriptions for delete using (auth.uid() = user_id);
