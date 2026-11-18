/**
 * ⚠ DEVELOPMENT-ONLY account preferences, paired with the device-only auth
 * backend. Mirrors user_preferences per dev account, on this device.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ok } from '../types';

import type { AccountPreferences, PreferencesRepository } from './types';

const key = (userId: string) => `mathart.dev-preferences.v1.${userId}`;

export const devPreferences: PreferencesRepository = {
  async get(userId) {
    const raw = await AsyncStorage.getItem(key(userId));
    return ok(raw ? (JSON.parse(raw) as AccountPreferences) : null);
  },

  async save(userId, values) {
    const saved: AccountPreferences = { ...values, updatedAt: new Date().toISOString(), chosen: true };
    await AsyncStorage.setItem(key(userId), JSON.stringify(saved));
    return ok(saved);
  },
};
