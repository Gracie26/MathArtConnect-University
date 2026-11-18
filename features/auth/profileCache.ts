import AsyncStorage from '@react-native-async-storage/async-storage';

import type { LearnerProfile } from '@/services/profile';

/**
 * Last known profile per learner, so a returning learner who opens the app
 * offline still lands on Home instead of being sent back to profile setup.
 * Holds only the minimal profile fields; cleared on sign-out.
 */
const key = (userId: string) => `mathart.profile-cache.v1.${userId}`;

export async function readCachedProfile(userId: string): Promise<LearnerProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(key(userId));
    return raw ? (JSON.parse(raw) as LearnerProfile) : null;
  } catch {
    return null;
  }
}

export async function writeCachedProfile(profile: LearnerProfile): Promise<void> {
  try {
    // Signed avatar URLs expire; do not cache them.
    await AsyncStorage.setItem(key(profile.id), JSON.stringify({ ...profile, avatarUrl: null }));
  } catch {
    // Cache is an optimisation only.
  }
}

export async function clearCachedProfile(userId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key(userId));
  } catch {
    // ignore
  }
}
