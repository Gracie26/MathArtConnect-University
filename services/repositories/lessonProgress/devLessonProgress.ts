/**
 * ⚠ DEVELOPMENT-ONLY progress storage, paired with the device-only auth
 * backend. Progress stays on this device.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ok } from '../../types';
import type { LessonProgressEntry, LessonProgressRepository } from '../types';

const key = (userId: string) => `mathart.dev-lesson-progress.v1.${userId}`;

async function readAll(userId: string): Promise<LessonProgressEntry[]> {
  const raw = await AsyncStorage.getItem(key(userId));
  return raw ? (JSON.parse(raw) as LessonProgressEntry[]) : [];
}

export const devLessonProgress: LessonProgressRepository = {
  async listForUnits(userId, unitIds) {
    const all = await readAll(userId);
    return ok(all.filter((entry) => unitIds.includes(entry.unitId)));
  },

  async completeSection(userId, unitId, sectionKey) {
    const all = await readAll(userId);
    const existing = all.find((e) => e.unitId === unitId && e.sectionKey === sectionKey);
    const entry: LessonProgressEntry = {
      unitId,
      sectionKey,
      status: 'completed',
      completedAt: existing?.completedAt ?? new Date().toISOString(),
    };
    const next = [...all.filter((e) => e !== existing), entry];
    await AsyncStorage.setItem(key(userId), JSON.stringify(next));
    return ok(entry);
  },
};
