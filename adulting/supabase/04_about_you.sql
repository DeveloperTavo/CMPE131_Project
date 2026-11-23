-- ABOUT_YOU: answers to the "About You" questions (one row per user)
create table public.about_you (
  user_id uuid primary key default auth.uid()
    references public.profiles(id) on delete cascade,

  -- Home
  home_type text check (home_type in ('apartment', 'house', 'condo', 'other')),
  home_ownership text check (home_ownership in ('own', 'rent')),
  has_hvac boolean not null default false,
  has_yard boolean not null default false,
  has_pets boolean not null default false,

  -- Vehicles (up to 3, e.g. '2018 Toyota Camry')
  vehicles text[] not null default '{}',

  -- Health
  sees_dentist boolean not null default false,
  wears_glasses boolean not null default false,
  takes_medication boolean not null default false,
  has_kids boolean not null default false,

  -- Finances
  pays_rent_or_mortgage boolean not null default false,
  has_car_insurance boolean not null default false,
  has_credit_cards boolean not null default false,
  has_subscriptions boolean not null default false,
  files_taxes boolean not null default false,

  updated_at timestamptz not null default now()
);

alter table public.about_you enable row level security;

create policy "Users can view their own answers"
  on public.about_you for select
  using (auth.uid() = user_id);

create policy "Users can add their own answers"
  on public.about_you for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own answers"
  on public.about_you for update
  using (auth.uid() = user_id);