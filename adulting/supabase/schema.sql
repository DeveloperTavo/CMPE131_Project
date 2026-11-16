-- PROFILES: one row for each user
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  notify_email boolean not null default true,
  notify_sms boolean not null default false,
  timezone text not null default 'America/Los_Angeles',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- When someone signs up, automatically create their profile row
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- TASKS: one row for each reminder
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid()
    references public.profiles(id) on delete cascade,
  category text not null
    check (category in ('household', 'auto', 'health', 'finances')),
  title text not null,
  notes text,
  due_at timestamptz not null,
  frequency text not null default 'once'
    check (frequency in ('once', 'daily', 'weekly', 'monthly', 'yearly')),
  remind_before_minutes integer not null default 0,
  notify_email boolean not null default true,
  notify_sms boolean not null default false,
  status text not null default 'pending'
    check (status in ('pending', 'completed')),
  completed_at timestamptz,
  last_reminded_at timestamptz,
  created_at timestamptz not null default now()
);

create index tasks_owner_due_idx on public.tasks (owner_id, due_at);

alter table public.tasks enable row level security;

create policy "Users can view their own tasks"
  on public.tasks for select
  using (auth.uid() = owner_id);

create policy "Users can create their own tasks"
  on public.tasks for insert
  with check (auth.uid() = owner_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = owner_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = owner_id);