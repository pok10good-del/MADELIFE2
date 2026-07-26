BEGIN;

alter table public.stories
  add column generation_started_at timestamptz,
  add column generation_error text;

-- Atomically claims a story for background job processing.
-- Succeeds (returns the row) only when the row is still 'pending', or is
-- 'processing' but has been stuck for more than 60 minutes (stale job,
-- safe to reclaim). Any other state (fresh 'processing', 'completed',
-- 'failed') returns no rows, which the caller treats as a 409 conflict.
create or replace function public.claim_story_for_processing(p_story_id uuid)
returns setof public.stories
language sql
as $$
  update public.stories
  set status = 'processing',
      generation_started_at = now(),
      generation_error = null
  where id = p_story_id
    and (
      status = 'pending'
      or (status = 'processing' and generation_started_at < now() - interval '60 minutes')
    )
  returning *;
$$;

COMMIT;
