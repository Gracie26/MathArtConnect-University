-- =============================================================================
-- MathArt Connect: initial schema
-- -----------------------------------------------------------------------------
-- Design notes
--   * User data tables use UUID primary keys. Attempt/session rows accept a
--     client-generated UUID so offline retries are idempotent upserts.
--   * Content catalogue tables (learning_topics, learning_units, achievements)
--     use stable text slugs as keys, because lesson content lives in versioned
--     TypeScript modules (content/) and must reference the same identifiers.
--   * Individual questions, games and creative activities are defined in
--     content code and referenced by text id (question_id, game_id,
--     activity_id). There is deliberately no questions table to avoid
--     duplicating content in two places.
--   * Email is NOT copied into profiles: it already lives in auth.users and
--     duplicating it creates drift and extra personal data (privacy by design).
--   * Research participation is separate from having an account. It defaults
--     to false and can only be changed server-side (no client UPDATE grant)
--     until the ethics-approved consent flow is implemented.
--   * Row Level Security is enabled on every table.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Shared helpers
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Enumerations
-- -----------------------------------------------------------------------------
create type public.progress_status as enum ('not_started', 'in_progress', 'completed');

create type public.activity_type as enum (
  'lesson', 'explore', 'practice', 'quiz', 'game', 'art', 'reflection', 'review'
);

create type public.theme_preference as enum ('system', 'light', 'dark');

create type public.hint_preference as enum ('on_request', 'always_offer', 'minimal');

create type public.difficulty_preference as enum ('adaptive', 'gentle', 'standard', 'challenging');

-- =============================================================================
-- Content catalogue
-- =============================================================================

-- Learning topics. Exactly one may be active; the active topic is chosen
-- after the student needs assessment (limits, derivatives, applications of
-- derivatives, integration, ...).
create table public.learning_topics (
  id              text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  family          text not null check (family in (
                    'limits', 'continuity', 'derivatives', 'applications-of-derivatives',
                    'integration', 'functions-and-graphs', 'demo')),
  title           text not null,
  subtitle        text,
  description     text,
  content_version text not null default '0.0.0',
  is_active       boolean not null default false,
  is_demo         boolean not null default false,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create unique index learning_topics_single_active_idx
  on public.learning_topics (is_active) where is_active;

create table public.learning_units (
  id                text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  topic_id          text not null references public.learning_topics (id) on delete cascade,
  title             text not null,
  summary           text,
  sort_order        integer not null default 0,
  -- Ordered section keys, e.g. {introduction, why-it-matters, ...}
  sections          text[] not null default '{}',
  estimated_minutes smallint check (estimated_minutes is null or estimated_minutes > 0),
  is_demo           boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index learning_units_topic_order_idx on public.learning_units (topic_id, sort_order);

create table public.achievements (
  id          text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title       text not null,
  description text not null,
  icon        text,
  xp_reward   integer not null default 0 check (xp_reward >= 0),
  criteria    jsonb not null default '{}'::jsonb,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Remote configuration (feature flags, streak timezone, ...).
-- Readable by signed-in users; written only by administrators.
create table public.app_config (
  key         text primary key,
  value       jsonb not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- =============================================================================
-- Learner data
-- =============================================================================

create table public.profiles (
  id                       uuid primary key references auth.users (id) on delete cascade,
  display_name             text check (display_name is null or char_length(display_name) between 1 and 80),
  institution              text check (institution is null or char_length(institution) <= 120),
  programme                text check (programme is null or char_length(programme) <= 120),
  year_of_study            smallint check (year_of_study is null or year_of_study between 1 and 10),
  avatar_url               text,
  learning_goal            text check (learning_goal is null or char_length(learning_goal) <= 280),
  xp                       integer not null default 0 check (xp >= 0),
  current_streak           integer not null default 0 check (current_streak >= 0),
  longest_streak           integer not null default 0 check (longest_streak >= 0),
  last_active_date         date,
  onboarding_completed_at  timestamptz,

  -- Research participation (separate from account consent; off by default).
  research_participant     boolean not null default false,
  research_consent_given   boolean not null default false,
  research_consent_version text,
  research_consent_date    timestamptz,
  research_withdrawn_at    timestamptz,

  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),

  constraint profiles_consent_recorded check (
    not research_consent_given
    or (research_consent_version is not null and research_consent_date is not null)
  ),
  constraint profiles_participant_requires_consent check (
    not research_participant or research_consent_given
  )
);

create table public.user_preferences (
  user_id                uuid primary key references auth.users (id) on delete cascade,
  theme                  public.theme_preference not null default 'system',
  text_scale             numeric(3, 2) not null default 1.00 check (text_scale between 0.80 and 2.00),
  reduced_motion         boolean not null default false,
  high_contrast          boolean not null default false,
  daily_goal_minutes     smallint not null default 15 check (daily_goal_minutes between 5 and 240),
  hint_preference        public.hint_preference not null default 'on_request',
  difficulty_preference  public.difficulty_preference not null default 'adaptive',
  -- Notifications are opt-in.
  notify_study_reminders boolean not null default false,
  notify_streak          boolean not null default false,
  notify_achievements    boolean not null default false,
  reminder_time          time,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table public.lesson_progress (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  unit_id            text not null references public.learning_units (id) on delete cascade,
  section_key        text not null,
  status             public.progress_status not null default 'not_started',
  time_spent_seconds integer not null default 0 check (time_spent_seconds >= 0),
  started_at         timestamptz,
  completed_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (user_id, unit_id, section_key)
);

create index lesson_progress_unit_idx on public.lesson_progress (unit_id);

-- A practice session (a set of questions).
create table public.practice_attempts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  topic_id          text not null references public.learning_topics (id) on delete restrict,
  unit_id           text references public.learning_units (id) on delete set null,
  practice_set_id   text not null,
  questions_total   smallint not null default 0 check (questions_total >= 0),
  questions_correct smallint not null default 0 check (questions_correct >= 0),
  started_at        timestamptz not null default now(),
  ended_at          timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (questions_correct <= questions_total)
);

create index practice_attempts_user_started_idx on public.practice_attempts (user_id, started_at desc);
create index practice_attempts_topic_idx on public.practice_attempts (topic_id);
create index practice_attempts_unit_idx on public.practice_attempts (unit_id);

create table public.quiz_attempts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  topic_id          text not null references public.learning_topics (id) on delete restrict,
  unit_id           text references public.learning_units (id) on delete set null,
  quiz_id           text not null,
  questions_total   smallint not null default 0 check (questions_total >= 0),
  questions_correct smallint not null default 0 check (questions_correct >= 0),
  started_at        timestamptz not null default now(),
  completed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (questions_correct <= questions_total)
);

create index quiz_attempts_user_started_idx on public.quiz_attempts (user_id, started_at desc);
create index quiz_attempts_topic_idx on public.quiz_attempts (topic_id);
create index quiz_attempts_unit_idx on public.quiz_attempts (unit_id);

-- One answer to one question (from practice, a quiz, or a mistake retry).
create table public.question_attempts (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  topic_id            text not null references public.learning_topics (id) on delete restrict,
  unit_id             text references public.learning_units (id) on delete set null,
  question_id         text not null,
  practice_attempt_id uuid references public.practice_attempts (id) on delete cascade,
  quiz_attempt_id     uuid references public.quiz_attempts (id) on delete cascade,
  retry_of_id         uuid references public.question_attempts (id) on delete set null,
  learner_answer      jsonb,
  is_correct          boolean not null,
  hints_used          smallint not null default 0 check (hints_used >= 0),
  hint_levels_viewed  smallint[] not null default '{}',
  viewed_steps        boolean not null default false,
  viewed_answer       boolean not null default false,
  time_spent_seconds  integer check (time_spent_seconds is null or time_spent_seconds >= 0),
  saved_to_review     boolean not null default false,
  review_resolved_at  timestamptz,
  answered_at         timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (not (practice_attempt_id is not null and quiz_attempt_id is not null))
);

create index question_attempts_user_answered_idx on public.question_attempts (user_id, answered_at desc);
create index question_attempts_user_question_idx on public.question_attempts (user_id, question_id);
create index question_attempts_practice_idx on public.question_attempts (practice_attempt_id);
create index question_attempts_quiz_idx on public.question_attempts (quiz_attempt_id);
create index question_attempts_retry_idx on public.question_attempts (retry_of_id);
create index question_attempts_topic_idx on public.question_attempts (topic_id);
create index question_attempts_unit_idx on public.question_attempts (unit_id);
-- Fast "Review Mistakes" lookups.
create index question_attempts_open_mistakes_idx
  on public.question_attempts (user_id, answered_at desc)
  where (is_correct = false or saved_to_review = true) and review_resolved_at is null;

create table public.game_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  topic_id      text not null references public.learning_topics (id) on delete restrict,
  game_id       text not null,
  level_reached smallint not null default 0 check (level_reached >= 0),
  score         integer not null default 0 check (score >= 0),
  xp_earned     integer not null default 0 check (xp_earned >= 0),
  hints_used    smallint not null default 0 check (hints_used >= 0),
  completed     boolean not null default false,
  -- Compact gameplay event log (used for research only with consent).
  events        jsonb not null default '[]'::jsonb,
  started_at    timestamptz not null default now(),
  ended_at      timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index game_sessions_user_started_idx on public.game_sessions (user_id, started_at desc);
create index game_sessions_user_game_idx on public.game_sessions (user_id, game_id);
create index game_sessions_topic_idx on public.game_sessions (topic_id);

create table public.art_projects (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  topic_id       text references public.learning_topics (id) on delete set null,
  activity_id    text not null,
  title          text not null default 'Untitled composition' check (char_length(title) between 1 and 120),
  -- Functions, parameters and styling that reproduce the composition.
  composition    jsonb not null,
  conditions_met jsonb not null default '[]'::jsonb,
  is_completed   boolean not null default false,
  thumbnail_path text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index art_projects_user_updated_idx on public.art_projects (user_id, updated_at desc);
create index art_projects_topic_idx on public.art_projects (topic_id);

-- Append-only learning timeline. Written through public.record_activity().
create table public.activity_history (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  activity_type public.activity_type not null,
  ref_id        text,
  topic_id      text references public.learning_topics (id) on delete set null,
  summary       text check (summary is null or char_length(summary) <= 280),
  xp_delta      integer not null default 0 check (xp_delta between 0 and 500),
  metadata      jsonb not null default '{}'::jsonb,
  occurred_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index activity_history_user_occurred_idx on public.activity_history (user_id, occurred_at desc);
create index activity_history_topic_idx on public.activity_history (topic_id);

create table public.user_achievements (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null references public.achievements (id) on delete cascade,
  earned_at      timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  unique (user_id, achievement_id)
);

create index user_achievements_achievement_idx on public.user_achievements (achievement_id);

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'learning_topics', 'learning_units', 'achievements', 'app_config', 'profiles',
    'user_preferences', 'lesson_progress', 'practice_attempts', 'quiz_attempts',
    'question_attempts', 'game_sessions', 'art_projects'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- New user bootstrap: profile + default preferences
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 80), '')
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- record_activity: idempotent timeline insert + XP + streak (server time)
-- -----------------------------------------------------------------------------
create or replace function public.record_activity(
  p_id            uuid,
  p_activity_type public.activity_type,
  p_ref_id        text default null,
  p_topic_id      text default null,
  p_summary       text default null,
  p_xp_delta      integer default 0,
  p_metadata      jsonb default '{}'::jsonb
)
returns public.activity_history
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_row     public.activity_history;
  v_tz      text;
  v_today   date;
  v_xp      integer := least(greatest(coalesce(p_xp_delta, 0), 0), 500);
begin
  if v_user_id is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  insert into public.activity_history (id, user_id, activity_type, ref_id, topic_id, summary, xp_delta, metadata)
  values (p_id, v_user_id, p_activity_type, p_ref_id, p_topic_id, p_summary, v_xp, coalesce(p_metadata, '{}'::jsonb))
  on conflict (id) do nothing
  returning * into v_row;

  -- Already recorded (offline retry): return the existing row unchanged.
  if v_row.id is null then
    select * into v_row from public.activity_history where id = p_id and user_id = v_user_id;
    return v_row;
  end if;

  select coalesce((value #>> '{}'), 'Africa/Windhoek') into v_tz
  from public.app_config where key = 'streak_timezone';
  v_tz := coalesce(v_tz, 'Africa/Windhoek');
  v_today := (now() at time zone v_tz)::date;

  update public.profiles p
  set xp = p.xp + v_xp,
      current_streak = case
        when p.last_active_date = v_today then p.current_streak
        when p.last_active_date = v_today - 1 then p.current_streak + 1
        else 1
      end,
      longest_streak = greatest(p.longest_streak, case
        when p.last_active_date = v_today then p.current_streak
        when p.last_active_date = v_today - 1 then p.current_streak + 1
        else 1
      end),
      last_active_date = v_today
  where p.id = v_user_id;

  return v_row;
end;
$$;

revoke all on function public.record_activity(uuid, public.activity_type, text, text, text, integer, jsonb) from public, anon;
grant execute on function public.record_activity(uuid, public.activity_type, text, text, text, integer, jsonb) to authenticated;

-- -----------------------------------------------------------------------------
-- Views
-- -----------------------------------------------------------------------------
create view public.v_mistakes_to_review
with (security_invoker = true) as
select
  qa.id,
  qa.user_id,
  qa.topic_id,
  qa.unit_id,
  qa.question_id,
  qa.learner_answer,
  qa.is_correct,
  qa.hints_used,
  qa.hint_levels_viewed,
  qa.viewed_steps,
  qa.viewed_answer,
  qa.saved_to_review,
  qa.answered_at
from public.question_attempts qa
where (qa.is_correct = false or qa.saved_to_review = true)
  and qa.review_resolved_at is null;

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.learning_topics   enable row level security;
alter table public.learning_units    enable row level security;
alter table public.achievements      enable row level security;
alter table public.app_config        enable row level security;
alter table public.profiles          enable row level security;
alter table public.user_preferences  enable row level security;
alter table public.lesson_progress   enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.quiz_attempts     enable row level security;
alter table public.question_attempts enable row level security;
alter table public.game_sessions     enable row level security;
alter table public.art_projects      enable row level security;
alter table public.activity_history  enable row level security;
alter table public.user_achievements enable row level security;

-- Content catalogue: read-only for signed-in users.
create policy "content readable" on public.learning_topics for select to authenticated using (true);
create policy "content readable" on public.learning_units  for select to authenticated using (true);
create policy "content readable" on public.achievements    for select to authenticated using (true);
create policy "config readable"  on public.app_config      for select to authenticated using (true);

-- Profiles: read/update own row. Inserts come from the auth trigger.
create policy "own profile read"   on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "own profile update" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Column-level protection: clients may only edit descriptive profile fields.
-- XP, streaks and research-consent fields are server-controlled.
revoke update on public.profiles from anon, authenticated;
grant update (display_name, institution, programme, year_of_study, avatar_url, learning_goal, onboarding_completed_at)
  on public.profiles to authenticated;

create policy "own preferences read"   on public.user_preferences for select to authenticated
  using (user_id = (select auth.uid()));
create policy "own preferences update" on public.user_preferences for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Owner-scoped read/insert/update for learner work tables.
do $$
declare
  t text;
begin
  foreach t in array array[
    'lesson_progress', 'practice_attempts', 'quiz_attempts', 'question_attempts',
    'game_sessions', 'art_projects'
  ]
  loop
    execute format('create policy "own rows read" on public.%I for select to authenticated
                      using (user_id = (select auth.uid()))', t);
    execute format('create policy "own rows insert" on public.%I for insert to authenticated
                      with check (user_id = (select auth.uid()))', t);
    execute format('create policy "own rows update" on public.%I for update to authenticated
                      using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
  end loop;
end;
$$;

-- Learners may delete their own creative work.
create policy "own art delete" on public.art_projects for delete to authenticated
  using (user_id = (select auth.uid()));

-- Timeline and achievements: read own; writes happen server-side only.
create policy "own history read" on public.activity_history for select to authenticated
  using (user_id = (select auth.uid()));
create policy "own achievements read" on public.user_achievements for select to authenticated
  using (user_id = (select auth.uid()));
