BEGIN;

create policy "stories_delete_own"
  on public.stories
  for delete
  using (auth.uid() = user_id);

COMMIT;
