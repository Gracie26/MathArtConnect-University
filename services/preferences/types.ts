import type { ThemePreference } from '@/theme/themes';

import type { ServiceResult } from '../types';

/** The display preferences kept in the learner's account (user_preferences). */
export interface AccountPreferenceValues {
  theme: ThemePreference;
  highContrast: boolean;
  reduceMotion: boolean;
}

export interface AccountPreferences extends AccountPreferenceValues {
  /** When the row last changed (server time, ISO). */
  updatedAt: string;
  /**
   * False while the row still holds the defaults created with the account
   * (never changed), so a fresh account never overrides this device's choice.
   */
  chosen: boolean;
}

export interface PreferencesRepository {
  /** The learner's saved preferences; null when the account has no preferences row. */
  get(userId: string): Promise<ServiceResult<AccountPreferences | null>>;
  /** Saves the values; returns the stored row (null when the account has no row). */
  save(userId: string, values: AccountPreferenceValues): Promise<ServiceResult<AccountPreferences | null>>;
}
