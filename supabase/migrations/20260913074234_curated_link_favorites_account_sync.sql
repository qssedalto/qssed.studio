create table if not exists public.curated_link_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now(),
  constraint curated_link_favorites_pkey primary key (user_id, url),
  constraint curated_link_favorites_url_check check (
    char_length(url) between 1 and 1024
    and url ~* '^https://'
  )
);

alter table public.curated_link_favorites enable row level security;

revoke all on table public.curated_link_favorites from anon;
grant select, insert, delete on table public.curated_link_favorites to authenticated;
grant select, insert, update, delete on table public.curated_link_favorites to service_role;

create policy "curated favorites read own"
on public.curated_link_favorites
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "curated favorites insert own"
on public.curated_link_favorites
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "curated favorites delete own"
on public.curated_link_favorites
for delete
to authenticated
using ((select auth.uid()) = user_id);
