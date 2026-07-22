BEGIN;

alter table public.stories enable row level security;

create policy "stories_select_own"
  on public.stories
  for select
  using (auth.uid() = user_id);

create policy "stories_insert_own"
  on public.stories
  for insert
  with check (auth.uid() = user_id);

create policy "stories_update_own"
  on public.stories
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

COMMIT;
