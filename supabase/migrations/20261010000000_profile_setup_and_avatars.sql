-- =============================================================================
-- MathArt Connect: profile setup completion + private avatar storage
-- -----------------------------------------------------------------------------
--   * profiles.profile_completed_at marks that the learner finished the
--     "Tell us about you" step, so it is shown once (not on every sign-in).
--   * Avatars live in a PRIVATE storage bucket. profiles.avatar_url stores the
--     object path ("<user id>/<file>"), and the app requests short-lived
--     signed URLs to display it. Learners can only touch their own folder.
--   * Research participation columns already exist on profiles (initial
--     schema) and stay server-controlled; nothing here changes consent.
-- =============================================================================

alter table public.profiles
  add column if not exists profile_completed_at timestamptz;

comment on column public.profiles.profile_completed_at is
  'Set when the learner completes first-run profile setup. Null = show setup.';
comment on column public.profiles.onboarding_completed_at is
  'Reserved. Intro onboarding completion is tracked on the device, not here.';

-- Column-level grant: learners may set their own completion timestamp.
grant update (profile_completed_at) on public.profiles to authenticated;

-- -----------------------------------------------------------------------------
-- Avatar storage (private bucket, owner-only access)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "own avatar read" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "own avatar insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "own avatar update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "own avatar delete" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
