import type {
  ActivityHistoryRow,
  ArtProjectRow,
  GameSessionRow,
  QuestionAttemptRow,
} from '../../supabase/database.types';
import { getSupabase } from '../../supabase/client';
import { notConfigured, ok, type ServiceResult } from '../../types';
import { dataFailure } from '../dataErrors';
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

/** Classifies the failure (network, expired session or database) so learners get the right message. */
function failure<T>(error: unknown, operation: 'save' | 'load'): ServiceResult<T> {
  return dataFailure<T>(error, operation, 'learning history');
}

const toAttempt = (row: QuestionAttemptRow): QuestionAttemptRecord => ({
  id: row.id,
  topicId: row.topic_id,
  unitId: row.unit_id,
  questionId: row.question_id,
  retryOfId: row.retry_of_id,
  learnerAnswer: row.learner_answer,
  isCorrect: row.is_correct,
  hintsUsed: row.hints_used,
  hintLevelsViewed: row.hint_levels_viewed,
  viewedSteps: row.viewed_steps,
  viewedAnswer: row.viewed_answer,
  answeredAt: row.answered_at,
  reviewResolvedAt: row.review_resolved_at,
});

/** question_attempts (RLS: own rows; insert and update granted). */
export const supabaseQuestionAttempts: QuestionAttemptRepository = {
  async record(userId, input) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Practice history');
    const { data, error } = await supabase
      .from('question_attempts')
      .upsert(
        {
          id: input.id,
          user_id: userId,
          topic_id: input.topicId,
          unit_id: input.unitId,
          question_id: input.questionId,
          retry_of_id: input.retryOfId,
          learner_answer: input.learnerAnswer,
          is_correct: input.isCorrect,
          hints_used: input.hintsUsed,
          hint_levels_viewed: input.hintLevelsViewed,
          viewed_steps: input.viewedSteps,
          viewed_answer: input.viewedAnswer,
        },
        { onConflict: 'id' },
      )
      .select('*')
      .single();
    if (error) return failure(error, 'save');
    return ok(toAttempt(data));
  },

  async list(userId, topicId) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Practice history');
    const { data, error } = await supabase
      .from('question_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .order('answered_at', { ascending: true })
      .limit(1000);
    if (error) return failure(error, 'load');
    return ok(data.map(toAttempt));
  },

  async resolve(userId, attemptIds) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Practice history');
    if (attemptIds.length === 0) return ok(undefined);
    const { error } = await supabase
      .from('question_attempts')
      .update({ review_resolved_at: new Date().toISOString() })
      .eq('user_id', userId)
      .in('id', [...attemptIds]);
    if (error) return failure(error, 'save');
    return ok(undefined);
  },
};

const toGame = (row: GameSessionRow): GameSessionRecord => ({
  id: row.id,
  topicId: row.topic_id,
  gameId: row.game_id,
  levelReached: row.level_reached,
  score: row.score,
  xpEarned: row.xp_earned,
  hintsUsed: row.hints_used,
  completed: row.completed,
  events: row.events,
  startedAt: row.started_at,
  endedAt: row.ended_at,
});

/** game_sessions, plus XP through record_activity (the only way XP reaches the profile). */
export const supabaseGameSessions: GameSessionRepository = {
  async save(userId, session) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Games');
    const { data, error } = await supabase
      .from('game_sessions')
      .upsert(
        {
          id: session.id,
          user_id: userId,
          topic_id: session.topicId,
          game_id: session.gameId,
          level_reached: session.levelReached,
          score: session.score,
          xp_earned: session.xpEarned,
          hints_used: session.hintsUsed,
          completed: session.completed,
          events: session.events,
          started_at: session.startedAt,
          ended_at: session.endedAt,
        },
        { onConflict: 'id' },
      )
      .select('*')
      .single();
    if (error) return failure(error, 'save');
    if (session.completed && session.xpEarned > 0) {
      // The activity id is the session id, so a retried save never awards XP twice.
      const xp = await supabase.rpc('record_activity', {
        p_id: session.id,
        p_activity_type: 'game',
        p_ref_id: session.gameId,
        p_topic_id: session.topicId,
        p_summary: `Played ${session.gameId}`,
        p_xp_delta: session.xpEarned,
        p_metadata: { score: session.score },
      });
      if (xp.error) return failure(xp.error, 'save');
    }
    return ok(toGame(data));
  },

  async list(userId, topicId) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Games');
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .order('started_at', { ascending: false })
      .limit(200);
    if (error) return failure(error, 'load');
    return ok(data.map(toGame));
  },
};

const toArt = (row: ArtProjectRow): ArtProjectRecord => ({
  id: row.id,
  topicId: row.topic_id ?? '',
  activityId: row.activity_id,
  title: row.title,
  composition: row.composition,
  isCompleted: row.is_completed,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

/** art_projects (RLS: own rows; select, insert, update and delete granted). */
export const supabaseArtProjects: ArtProjectRepository = {
  async list(userId, topicId) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Your saved work');
    const { data, error } = await supabase
      .from('art_projects')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .order('updated_at', { ascending: false })
      .limit(200);
    if (error) return failure(error, 'load');
    return ok(data.map(toArt));
  },

  async get(userId, id) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Your saved work');
    const { data, error } = await supabase
      .from('art_projects')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .maybeSingle();
    if (error) return failure(error, 'load');
    return ok(data ? toArt(data) : null);
  },

  async save(userId, project) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Your saved work');
    const { data, error } = await supabase
      .from('art_projects')
      .upsert(
        {
          id: project.id,
          user_id: userId,
          topic_id: project.topicId,
          activity_id: project.activityId,
          title: project.title,
          composition: project.composition,
          is_completed: project.isCompleted,
        },
        { onConflict: 'id' },
      )
      .select('*')
      .single();
    if (error) return failure(error, 'save');
    return ok(toArt(data));
  },

  async remove(userId, id) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Your saved work');
    const { error } = await supabase.from('art_projects').delete().eq('user_id', userId).eq('id', id);
    if (error) return failure(error, 'save');
    return ok(undefined);
  },
};

const toActivity = (row: ActivityHistoryRow): ActivityRecord => ({
  id: row.id,
  type: row.activity_type,
  refId: row.ref_id,
  topicId: row.topic_id,
  summary: row.summary,
  xp: row.xp_delta,
  metadata: row.metadata,
  occurredAt: row.occurred_at,
});

/** activity_history: written only through record_activity (server time, XP and streak). */
export const supabaseActivityLog: ActivityLogRepository = {
  async record(_userId, event) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Your activity');
    const { data, error } = await supabase.rpc('record_activity', {
      p_id: event.id,
      p_activity_type: event.type,
      p_ref_id: event.refId,
      p_topic_id: event.topicId,
      p_summary: event.summary,
      p_xp_delta: event.xp,
      p_metadata: event.metadata,
    });
    if (error) return failure(error, 'save');
    return ok(toActivity(data));
  },

  async list(userId, topicId) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Your activity');
    const { data, error } = await supabase
      .from('activity_history')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .order('occurred_at', { ascending: false })
      .limit(500);
    if (error) return failure(error, 'load');
    return ok(data.map(toActivity));
  },
};
