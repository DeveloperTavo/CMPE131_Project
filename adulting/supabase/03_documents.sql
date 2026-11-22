-- DOCUMENTS: information about each uploaded file
-- (the file itself lives in Supabase Storage)
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid()
    references public.profiles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  category text not null
    check (category in ('household', 'auto', 'health', 'finances')),
  title text not null,
  file_name text not null,
  storage_path text not null unique,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index documents_owner_created_idx
  on public.documents (owner_id, created_at desc);

alter table public.documents enable row level security;

create policy "Users can view their own documents"
  on public.documents for select
  using (auth.uid() = owner_id);

create policy "Users can add their own documents"
  on public.documents for insert
  with check (auth.uid() = owner_id);

create policy "Users can delete their own documents"
  on public.documents for delete
  using (auth.uid() = owner_id);

-- STORAGE BUCKET: private, 10 MB max, PDFs and images only
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- Each user can only touch files inside their own folder: documents/<their user id>/...
create policy "Users can upload to their own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can view their own files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "Users can delete their own files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );