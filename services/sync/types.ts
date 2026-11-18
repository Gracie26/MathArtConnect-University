/**
 * Offline outbox contract (implemented in Phase 5).
 *
 * Learner writes are queued locally with a client UUID, then flushed to
 * Supabase when online. Because every write is an idempotent upsert keyed by
 * that UUID, a retry never double-counts research data.
 */
export type OutboxOperation =
  | 'lesson_progress.upsert'
  | 'practice_attempts.upsert'
  | 'quiz_attempts.upsert'
  | 'question_attempts.upsert'
  | 'game_sessions.upsert'
  | 'art_projects.upsert'
  | 'activity.record';

export interface OutboxItem {
  id: string;
  operation: OutboxOperation;
  payload: unknown;
  createdAt: string;
  attempts: number;
  lastError?: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'pending' | 'offline' | 'error' | 'not_configured';

export interface SyncService {
  enqueue(operation: OutboxOperation, payload: unknown): Promise<void>;
  flush(): Promise<void>;
  pendingCount(): Promise<number>;
  getStatus(): SyncStatus;
  subscribe(listener: (status: SyncStatus) => void): () => void;
}
