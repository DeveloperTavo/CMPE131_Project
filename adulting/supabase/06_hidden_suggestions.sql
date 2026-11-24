-- Remembers which suggestions the user already added or hid,
-- so they don't keep showing up
alter table public.about_you
  add column hidden_suggestions text[] not null default '{}';