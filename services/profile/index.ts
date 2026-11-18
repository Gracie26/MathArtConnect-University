import { isDevAuthBackend } from '../auth';

import { devProfileService } from './devProfileService';
import { supabaseProfileService } from './supabaseProfileService';
import type { ProfileService } from './types';

/** Follows the auth backend: device-only storage for dev accounts, Supabase otherwise. */
export const profileService: ProfileService = isDevAuthBackend ? devProfileService : supabaseProfileService;

export * from './types';
