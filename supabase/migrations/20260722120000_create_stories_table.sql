BEGIN;

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  story_text text not null,
  birth_date date not null,
  story_start_date date not null,
  selected_paths text[] not null,
  sport_choice text,
  celebrity_name text,
  share_option text not null default 'private',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint stories_story_text_min_length
    check (char_length(story_text) >= 300),

  constraint stories_selected_paths_count
    check (array_length(selected_paths, 1) between 1 and 2),

  constraint stories_share_option_allowed
    check (share_option in ('private', 'friends', 'public')),

  constraint stories_status_allowed
    check (status in ('pending', 'processing', 'active', 'completed')),

  constraint stories_sport_choice_required
    check (
      not ('path-sports' = any(selected_paths))
      or sport_choice is not null
    ),

  constraint stories_celebrity_name_required
    check (
      not ('path-celebrity' = any(selected_paths))
      or celebrity_name is not null
    )
);

create index stories_user_id_idx on public.stories (user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger stories_set_updated_at
  before update on public.stories
  for each row
  execute function public.set_updated_at();

COMMIT;
