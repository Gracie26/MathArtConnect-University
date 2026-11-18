/**
 * ⚠ DEVELOPMENT-ONLY profile storage, paired with devAuthService. Profiles
 * are kept in this device's local storage and never leave it.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { APP_INSTITUTION } from '@/config/app';

import { ok } from '../types';

import type { LearnerProfile, ProfileService } from './types';

const key = (userId: string) => `mathart.dev-profile.v1.${userId}`;

async function read(userId: string): Promise<LearnerProfile> {
  const raw = await AsyncStorage.getItem(key(userId));
  if (raw) return JSON.parse(raw) as LearnerProfile;
  // Mirrors the database trigger: every account starts with an empty profile.
  return {
    id: userId,
    displayName: null,
    institution: null,
    programme: null,
    yearOfStudy: null,
    avatarUrl: null,
    profileComplete: false,
  };
}

async function write(profile: LearnerProfile): Promise<LearnerProfile> {
  await AsyncStorage.setItem(key(profile.id), JSON.stringify(profile));
  return profile;
}

export const devProfileService: ProfileService = {
  async getProfile(userId) {
    return ok(await read(userId));
  },

  async saveProfile(userId, input, options = {}) {
    const current = await read(userId);
    return ok(
      await write({
        ...current,
        displayName: input.displayName.trim(),
        // Fixed for MathArt Connect; a stored value is kept.
        institution: current.institution ?? APP_INSTITUTION,
        programme: input.programme?.trim() || null,
        yearOfStudy: input.yearOfStudy,
        profileComplete: current.profileComplete || Boolean(options.markComplete),
      }),
    );
  },

  async setAvatar(userId, file) {
    const current = await read(userId);
    const uri = file.base64 ? `data:${file.mimeType ?? 'image/jpeg'};base64,${file.base64}` : file.uri;
    return ok(await write({ ...current, avatarUrl: uri }));
  },

  async removeAvatar(userId) {
    return ok(await write({ ...(await read(userId)), avatarUrl: null }));
  },
};
