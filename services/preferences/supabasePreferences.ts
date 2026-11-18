import type { UserPreferencesRow } from '../supabase/database.types';
import { getSupabase } from '../supabase/client';
import { dataFailure } from '../repositories/dataErrors';
import { notConfigured, ok } from '../types';

import type { AccountPreferences, PreferencesRepository } from './types';

const COLUMNS = 'theme, high_contrast, reduced_motion, created_at, updated_at';

type Row = Pick<UserPreferencesRow, 'theme' | 'high_contrast' | 'reduced_motion' | 'created_at' | 'updated_at'>;

const toPreferences = (row: Row): AccountPreferences => ({
  theme: row.theme,
  highContrast: row.high_contrast,
  reduceMotion: row.reduced_motion,
  updatedAt: row.updated_at,
  // The set_updated_at trigger moves updated_at on every change; equal stamps mean the defaults were never changed.
  chosen: Date.parse(row.updated_at) - Date.parse(row.created_at) > 1000,
});

/**
 * user_preferences (RLS: own row only; created with the account by the
 * handle_new_user trigger, so this only ever reads and updates).
 */
export const supabasePreferences: PreferencesRepository = {
  async get(userId) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Preferences');
    const { data, error } = await supabase.from('user_preferences').select(COLUMNS).eq('user_id', userId).maybeSingle();
    if (error) return dataFailure(error, 'load', 'preferences');
    return ok(data ? toPreferences(data) : null);
  },

  async save(userId, values) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Preferences');
    const { data, error } = await supabase
      .from('user_preferences')
      .update({ theme: values.theme, high_contrast: values.highContrast, reduced_motion: values.reduceMotion })
      .eq('user_id', userId)
      .select(COLUMNS)
      .maybeSingle();
    if (error) return dataFailure(error, 'save', 'preferences');
    return ok(data ? toPreferences(data) : null);
  },
};
