import { isDevAuthBackend } from '../auth';

import { devPreferences } from './devPreferences';
import { supabasePreferences } from './supabasePreferences';
import type { PreferencesRepository } from './types';

/** Follows the auth backend: device-only storage for dev accounts, Supabase otherwise. */
export const preferencesRepository: PreferencesRepository = isDevAuthBackend ? devPreferences : supabasePreferences;

export * from './types';
