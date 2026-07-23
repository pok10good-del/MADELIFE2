BEGIN;

alter table public.stories
  add column episode_number integer not null default 1,
  add column read_at timestamptz;

alter table public.stories
  add constraint stories_episode_number_positive
    check (episode_number >= 1);

create index stories_user_episode_idx on public.stories (user_id, episode_number);

COMMIT;
