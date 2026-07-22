BEGIN;

alter table public.stories
  add column regret_point text not null,
  add column generated_title text,
  add column generated_content text,
  add column generated_start_age integer,
  add column generated_end_age integer,
  add column generated_themes text[];

alter table public.stories
  add constraint stories_generated_age_range
    check (
      generated_start_age is null
      or (generated_end_age is not null and generated_end_age > generated_start_age)
    );

alter table public.stories
  add constraint stories_generated_themes_count
    check (
      generated_themes is null
      or array_length(generated_themes, 1) between 1 and 2
    );

alter table public.stories
  drop constraint stories_status_allowed;

alter table public.stories
  add constraint stories_status_allowed
    check (status in ('pending', 'processing', 'active', 'completed', 'failed'));

COMMIT;
