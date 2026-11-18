import { APP_INSTITUTION } from '@/config/app';
import { base64ToBytes } from '@/lib/utils/base64';

import { describeAuthError } from '../auth/errors';
import type { ProfileRow } from '../supabase/database.types';
import { getSupabase } from '../supabase/client';
import { fail, notConfigured, ok, type ServiceResult } from '../types';

import type { LearnerProfile, ProfileService } from './types';

const AVATAR_BUCKET = 'avatars';
/** Signed avatar URLs are short-lived; the profile is re-read on each app start. */
const AVATAR_URL_TTL_SECONDS = 60 * 60 * 24;

const LOAD_ERROR = 'Your profile could not be loaded. Please try again.';
const SAVE_ERROR = 'Your profile could not be saved. Please try again.';
const AVATAR_ERROR = 'Your profile picture could not be uploaded. Please try a smaller image.';

function failure<T>(error: unknown, fallback: string): ServiceResult<T> {
  const { code, message } = describeAuthError(error, fallback);
  // Only surface connectivity specifically; everything else gets the context message.
  return fail<T>(code, code === 'offline' ? message : fallback, error);
}

async function toProfile(row: ProfileRow): Promise<LearnerProfile> {
  let avatarUrl: string | null = null;
  const supabase = getSupabase();
  if (row.avatar_url && supabase) {
    const { data } = await supabase.storage.from(AVATAR_BUCKET).createSignedUrl(row.avatar_url, AVATAR_URL_TTL_SECONDS);
    avatarUrl = data?.signedUrl ?? null;
  }
  return {
    id: row.id,
    displayName: row.display_name,
    institution: row.institution,
    programme: row.programme,
    yearOfStudy: row.year_of_study,
    avatarUrl,
    profileComplete: row.profile_completed_at !== null,
  };
}

const EXTENSIONS: Record<string, string> = { 'image/png': 'png', 'image/webp': 'webp', 'image/jpeg': 'jpg' };

/**
 * profiles table (RLS: a learner can read/update only their own row; the row
 * is created by the handle_new_user trigger) + private `avatars` bucket.
 */
export const supabaseProfileService: ProfileService = {
  async getProfile(userId) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured();
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) return failure(error, LOAD_ERROR);
    return ok(data ? await toProfile(data) : null);
  },

  async saveProfile(userId, input, options = {}) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured();
    const { data, error } = await supabase
      .from('profiles')
      .update({
        display_name: input.displayName.trim(),
        programme: input.programme?.trim() || null,
        year_of_study: input.yearOfStudy,
        ...(options.markComplete ? { profile_completed_at: new Date().toISOString() } : {}),
      })
      .eq('id', userId)
      .select('*')
      .single();
    if (error) return failure(error, SAVE_ERROR);
    // The institution is fixed: fill it in for profiles that have none, never overwriting a stored value.
    if (data.institution === null) {
      const filled = await supabase
        .from('profiles')
        .update({ institution: APP_INSTITUTION })
        .eq('id', userId)
        .is('institution', null)
        .select('*')
        .maybeSingle();
      if (!filled.error && filled.data) return ok(await toProfile(filled.data));
    }
    return ok(await toProfile(data));
  },

  async setAvatar(userId, file) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured();
    if (!file.base64) return fail('validation', AVATAR_ERROR);

    const contentType = file.mimeType && EXTENSIONS[file.mimeType] ? file.mimeType : 'image/jpeg';
    const path = `${userId}/avatar-${Date.now()}.${EXTENSIONS[contentType]}`;
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(path, base64ToBytes(file.base64), { contentType, upsert: true });
    if (uploadError) return failure(uploadError, AVATAR_ERROR);

    const { data: previous } = await supabase.from('profiles').select('avatar_url').eq('id', userId).maybeSingle();
    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: path })
      .eq('id', userId)
      .select('*')
      .single();
    if (error) return failure(error, AVATAR_ERROR);
    if (previous?.avatar_url && previous.avatar_url !== path) {
      void supabase.storage.from(AVATAR_BUCKET).remove([previous.avatar_url]); // best effort
    }
    return ok(await toProfile(data));
  },

  async removeAvatar(userId) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured();
    const { data: previous } = await supabase.from('profiles').select('avatar_url').eq('id', userId).maybeSingle();
    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', userId)
      .select('*')
      .single();
    if (error) return failure(error, SAVE_ERROR);
    if (previous?.avatar_url) void supabase.storage.from(AVATAR_BUCKET).remove([previous.avatar_url]);
    return ok(await toProfile(data));
  },
};
