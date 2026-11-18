/**
 * ⚠ DEVELOPMENT-ONLY learner-activity storage, paired with the device-only
 * auth backend. Everything stays on this device (AsyncStorage), mirroring the
 * Supabase repositories' behaviour, including idempotent ids and XP awarded
 * once per game session.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ok } from '../../types';
import type {
  ActivityLogRepository,
  ActivityRecord,
  ArtProjectRecord,
  ArtProjectRepository,
  GameSessionRecord,
  GameSessionRepository,
  QuestionAttemptRecord,
  QuestionAttemptRepository,
} from '../types';

const key = (store: string, userId: string) => `mathart.dev-${store}.v1.${userId}`;

async function read<T>(store: string, userId: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key(store, userId));
  return raw ? (JSON.parse(raw) as T[]) : [];
}

async function write<T>(store: string, userId: string, rows: T[]): Promise<void> {
  await AsyncStorage.setItem(key(store, userId), JSON.stringify(rows));
}

/** Insert or replace by id. */
async function upsert<T extends { id: string }>(store: string, userId: string, row: T): Promise<T> {
  const rows = await read<T>(store, userId);
  await write(store, userId, [...rows.filter((r) => r.id !== row.id), row]);
  return row;
}

export const devActivityLog: ActivityLogRepository = {
  async record(userId, event) {
    const rows = await read<ActivityRecord>('activity', userId);
    const existing = rows.find((r) => r.id === event.id);
    if (existing) return ok(existing);
    const row: ActivityRecord = { ...event, occurredAt: new Date().toISOString() };
    await write('activity', userId, [...rows, row]);
    return ok(row);
  },
  async list(userId, topicId) {
    const rows = await read<ActivityRecord>('activity', userId);
    return ok(rows.filter((r) => r.topicId === topicId).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)));
  },
};

/** XP total for the device-only backend (Home summary). */
export async function devXpTotal(userId: string): Promise<number> {
  const rows = await read<ActivityRecord>('activity', userId);
  return rows.reduce((sum, r) => sum + r.xp, 0);
}

export const devQuestionAttempts: QuestionAttemptRepository = {
  async record(userId, input) {
    const rows = await read<QuestionAttemptRecord>('attempts', userId);
    const existing = rows.find((r) => r.id === input.id);
    const row: QuestionAttemptRecord = {
      ...input,
      answeredAt: existing?.answeredAt ?? new Date().toISOString(),
      reviewResolvedAt: existing?.reviewResolvedAt ?? null,
    };
    return ok(await upsert('attempts', userId, row));
  },
  async list(userId, topicId) {
    const rows = await read<QuestionAttemptRecord>('attempts', userId);
    return ok(rows.filter((r) => r.topicId === topicId).sort((a, b) => a.answeredAt.localeCompare(b.answeredAt)));
  },
  async resolve(userId, attemptIds) {
    const rows = await read<QuestionAttemptRecord>('attempts', userId);
    const now = new Date().toISOString();
    await write(
      'attempts',
      userId,
      rows.map((r) => (attemptIds.includes(r.id) && !r.reviewResolvedAt ? { ...r, reviewResolvedAt: now } : r)),
    );
    return ok(undefined);
  },
};

export const devGameSessions: GameSessionRepository = {
  async save(userId, session) {
    const saved = await upsert('games', userId, session);
    if (session.completed && session.xpEarned > 0) {
      await devActivityLog.record(userId, {
        id: session.id,
        type: 'game',
        refId: session.gameId,
        topicId: session.topicId,
        summary: `Played ${session.gameId}`,
        xp: session.xpEarned,
        metadata: { score: session.score },
      });
    }
    return ok(saved);
  },
  async list(userId, topicId) {
    const rows = await read<GameSessionRecord>('games', userId);
    return ok(rows.filter((r) => r.topicId === topicId).sort((a, b) => b.startedAt.localeCompare(a.startedAt)));
  },
};

export const devArtProjects: ArtProjectRepository = {
  async list(userId, topicId) {
    const rows = await read<ArtProjectRecord>('art', userId);
    return ok(rows.filter((r) => r.topicId === topicId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  },
  async get(userId, id) {
    const rows = await read<ArtProjectRecord>('art', userId);
    return ok(rows.find((r) => r.id === id) ?? null);
  },
  async save(userId, project) {
    const rows = await read<ArtProjectRecord>('art', userId);
    const existing = rows.find((r) => r.id === project.id);
    const now = new Date().toISOString();
    return ok(await upsert('art', userId, { ...project, createdAt: existing?.createdAt ?? now, updatedAt: now }));
  },
  async remove(userId, id) {
    const rows = await read<ArtProjectRecord>('art', userId);
    await write(
      'art',
      userId,
      rows.filter((r) => r.id !== id),
    );
    return ok(undefined);
  },
};
