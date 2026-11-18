-- =============================================================================
-- MathArt Connect: explicit Data API privileges
-- -----------------------------------------------------------------------------
-- Newer Supabase projects no longer grant table privileges to the API roles
-- automatically for tables created in SQL, so requests failed with
-- "42501 permission denied" before row-level security was even evaluated.
-- This migration grants exactly what each RLS policy needs and nothing more.
--
--   anon           no table access (every learner feature requires sign-in)
--   authenticated  privileges matching the policies; RLS still limits every
--                  query to the learner's own rows
--   service_role   full access (server-side only; never shipped in the app)
--
-- Safe to run more than once, and on projects that did auto-grant (it then
-- tightens anon access).
-- =============================================================================

grant usage on schema public to anon, authenticated, service_role;

-- Signed-out clients: nothing.
revoke all on all tables in schema public from anon;

-- Shared content and configuration: read-only.
grant select on public.learning_topics, public.learning_units, public.achievements, public.app_config
  to authenticated;

-- Profiles: read own row (RLS); update descriptive columns only. No insert
-- (the auth trigger creates the row) and no delete (cascades from auth.users).
revoke all on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, institution, programme, year_of_study, avatar_url, learning_goal,
              onboarding_completed_at, profile_completed_at)
  on public.profiles to authenticated;

-- Preferences: read and update own row (created by the auth trigger).
grant select, update on public.user_preferences to authenticated;

-- Learner work: own rows, written by the app (offline-safe upserts).
grant select, insert, update on
  public.lesson_progress, public.practice_attempts, public.quiz_attempts,
  public.question_attempts, public.game_sessions, public.art_projects
  to authenticated;
grant delete on public.art_projects to authenticated;

-- Server-written history: read-only for learners (written by record_activity()). 
grant select on public.activity_history, public.user_achievements to authenticated;
grant select on public.v_mistakes_to_review to authenticated;

-- Server-side role keeps full access.
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
