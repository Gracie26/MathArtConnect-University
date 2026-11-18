import type {
  ActivityType,
  Json,
  LearningTopicRow,
  LearningUnitRow,
  LessonProgressRow,
  UserAchievementRow,
  UserPreferencesRow,
} from '../supabase/database.types';
import type { ServiceResult } from '../types';

import type { DashboardData } from '@/types/dashboard';

/**
 * Data-access contracts. Screens and features depend on these interfaces,
 * never on supabase-js directly, so storage can be swapped or mocked and
 * offline behaviour can be added in one place (services/sync).
 *
 * All learner-data writes carry a client-generated UUID (`id`) so retries
 * from the offline outbox are idempotent.
 */

// Profiles: see services/profile (ProfileService), which pairs with the auth backend.

export type PreferencesUpdate = Partial<Omit<UserPreferencesRow, 'user_id' | 'created_at' | 'updated_at'>>;

export interface PreferencesRepository {
  getMyPreferences(): Promise<ServiceResult<UserPreferencesRow | null>>;
  updateMyPreferences(update: PreferencesUpdate): Promise<ServiceResult<UserPreferencesRow>>;
}

export interface ContentCatalogRepository {
  getActiveTopic(): Promise<ServiceResult<LearningTopicRow | null>>;
  listUnits(topicId: string): Promise<ServiceResult<LearningUnitRow[]>>;
}

/** One lesson step's progress for the signed-in learner (lesson_progress row). */
export interface LessonProgressEntry {
  unitId: string;
  sectionKey: string;
  status: LessonProgressRow['status'];
  completedAt: string | null;
}

/**
 * Lesson-step progress. Rows are keyed (learner, unit, step); writes are
 * idempotent upserts so retries never duplicate progress.
 */
export interface LessonProgressRepository {
  listForUnits(userId: string, unitIds: readonly string[]): Promise<ServiceResult<LessonProgressEntry[]>>;
  /** Marks a step completed (never downgrades a completed step). */
  completeSection(userId: string, unitId: string, sectionKey: string): Promise<ServiceResult<LessonProgressEntry>>;
}

// -----------------------------------------------------------------------------
// Learner activity: practice attempts, games, art, explore, reflection, review.
// Each repository takes the signed-in learner's id, like lesson progress, so
// the device-only development backend can implement the same contract.
// -----------------------------------------------------------------------------

/** One checked answer to a practice question (question_attempts row). */
export interface QuestionAttemptRecord {
  id: string;
  topicId: string;
  unitId: string | null;
  questionId: string;
  /** The earlier attempt this one retries, if any. */
  retryOfId: string | null;
  learnerAnswer: Json | null;
  isCorrect: boolean;
  hintsUsed: number;
  hintLevelsViewed: number[];
  viewedSteps: boolean;
  viewedAnswer: boolean;
  answeredAt: string;
  /** Set when a later correct attempt resolves this mistake. */
  reviewResolvedAt: string | null;
}

export type QuestionAttemptInput = Omit<QuestionAttemptRecord, 'answeredAt' | 'reviewResolvedAt'>;

export interface QuestionAttemptRepository {
  record(userId: string, input: QuestionAttemptInput): Promise<ServiceResult<QuestionAttemptRecord>>;
  list(userId: string, topicId: string): Promise<ServiceResult<QuestionAttemptRecord[]>>;
  /** Marks earlier mistakes on a question as resolved (after a correct retry). */
  resolve(userId: string, attemptIds: readonly string[]): Promise<ServiceResult<void>>;
}

/** A finished (or abandoned) game (game_sessions row). */
export interface GameSessionRecord {
  id: string;
  topicId: string;
  gameId: string;
  levelReached: number;
  score: number;
  xpEarned: number;
  hintsUsed: number;
  completed: boolean;
  /** Compact per-round log: what was asked, whether it was right first time, retries, hints. */
  events: Json;
  startedAt: string;
  endedAt: string | null;
}

export interface GameSessionRepository {
  /** Saves the session and awards its XP once (idempotent by id). */
  save(userId: string, session: GameSessionRecord): Promise<ServiceResult<GameSessionRecord>>;
  list(userId: string, topicId: string): Promise<ServiceResult<GameSessionRecord[]>>;
}

/** A saved Create project (art_projects row). `composition` holds equations, parameters, restrictions and canvas state. */
export interface ArtProjectRecord {
  id: string;
  topicId: string;
  activityId: string;
  title: string;
  composition: Json;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ArtProjectInput = Omit<ArtProjectRecord, 'createdAt' | 'updatedAt'>;

export interface ArtProjectRepository {
  list(userId: string, topicId: string): Promise<ServiceResult<ArtProjectRecord[]>>;
  get(userId: string, id: string): Promise<ServiceResult<ArtProjectRecord | null>>;
  save(userId: string, project: ArtProjectInput): Promise<ServiceResult<ArtProjectRecord>>;
  remove(userId: string, id: string): Promise<ServiceResult<void>>;
}

/** A timeline event (activity_history row): explore use, reflection, review, XP. */
export interface ActivityRecord {
  id: string;
  type: ActivityType;
  refId: string | null;
  topicId: string | null;
  summary: string | null;
  xp: number;
  metadata: Json;
  occurredAt: string;
}

export type ActivityInput = Omit<ActivityRecord, 'occurredAt'>;

export interface ActivityLogRepository {
  /** Records an event and adds its XP (record_activity: server time, idempotent by id). */
  record(userId: string, event: ActivityInput): Promise<ServiceResult<ActivityRecord>>;
  list(userId: string, topicId: string): Promise<ServiceResult<ActivityRecord[]>>;
}
export interface AchievementsRepository {
  listMine(): Promise<ServiceResult<UserAchievementRow[]>>;
}

export interface DashboardRepository {
  /** Everything the Home dashboard shows, in one call. */
  getDashboard(userId: string): Promise<ServiceResult<DashboardData>>;
}
