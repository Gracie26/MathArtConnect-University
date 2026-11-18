import { useEffect } from 'react';

import { type AccountPreferences, type AccountPreferenceValues, preferencesRepository } from '@/services/preferences';

import {
  applyAccountDisplayPreferences,
  getAccountDisplayPreferences,
  hydrateDisplayPreferences,
  onDisplayPreferencesChange,
} from './displayPreferences';

export type PreferenceSyncPlan = 'useAccount' | 'saveToAccount' | 'none';

/**
 * Which side wins when a learner signs in (pure, unit-tested):
 *   - an account row never changed from its defaults never overrides this device;
 *   - otherwise the more recent choice wins (device `changedAt` vs row `updated_at`);
 *   - a device that never chose anything takes the account's choice.
 */
export function planPreferenceSync(
  local: { changedAt: string | null },
  account: AccountPreferences | null,
): PreferenceSyncPlan {
  const localAt = local.changedAt ? Date.parse(local.changedAt) : null;
  if (account?.chosen) {
    const accountAt = Date.parse(account.updatedAt);
    if (localAt === null || accountAt > localAt) return 'useAccount';
    return localAt > accountAt ? 'saveToAccount' : 'none';
  }
  return localAt !== null && account ? 'saveToAccount' : 'none';
}

const valuesOf = (p: AccountPreferenceValues): AccountPreferenceValues => ({
  theme: p.theme,
  highContrast: p.highContrast,
  reduceMotion: p.reduceMotion,
});

/**
 * Keeps the signed-in learner's theme, high contrast and Reduce Motion in
 * their account: reconciles once on sign-in, then saves each new choice.
 * Failures are silent; the device copy stays newer and is saved next time.
 */
export function usePreferenceSync(userId: string | null): void {
  useEffect(() => {
    if (!userId) return;
    let active = true;
    let queue: Promise<void> = Promise.resolve();
    let seen = getAccountDisplayPreferences().changedAt;

    const adopt = (values: AccountPreferenceValues, updatedAt: string) => {
      seen = updatedAt;
      applyAccountDisplayPreferences(values, updatedAt);
    };

    const save = () => {
      queue = queue.then(async () => {
        const sent = getAccountDisplayPreferences();
        const result = await preferencesRepository.save(userId, valuesOf(sent));
        if (!active || !result.ok || !result.data) return;
        // A newer choice made meanwhile is saved by its own turn in the queue.
        if (getAccountDisplayPreferences().changedAt !== sent.changedAt) return;
        adopt(valuesOf(sent), result.data.updatedAt);
      });
    };

    void (async () => {
      await hydrateDisplayPreferences();
      seen = getAccountDisplayPreferences().changedAt;
      const result = await preferencesRepository.get(userId);
      if (!active || !result.ok) return;
      const plan = planPreferenceSync(getAccountDisplayPreferences(), result.data);
      if (plan === 'useAccount' && result.data) adopt(valuesOf(result.data), result.data.updatedAt);
      else if (plan === 'saveToAccount') save();
    })();

    const unsubscribe = onDisplayPreferencesChange(() => {
      const { changedAt } = getAccountDisplayPreferences();
      if (changedAt === seen) return; // ambient art, or a value that came from the account
      seen = changedAt;
      save();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [userId]);
}
