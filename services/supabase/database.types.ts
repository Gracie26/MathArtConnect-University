/**
 * Database types for the Supabase client.
 *
 * HAND-WRITTEN to mirror supabase/migrations/20261009000000_initial_schema.sql
 * until a real Supabase project exists. In the backend phase, replace this
 * file with generated output:
 *
 *   npx supabase gen types typescript --project-id <ref> > services/supabase/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';
export type ActivityType = 'lesson' | 'explore' | 'practice' | 'quiz' | 'game' | 'art' | 'reflection' | 'review';
export type ThemePreferenceDb = 'system' | 'light' | 'dark';
export type HintPreference = 'on_request' | 'always_offer' | 'minimal';
export type DifficultyPreference = 'adaptive' | 'gentle' | 'standard' | 'challenging';

/** Builds the Row / Insert / Update triple supabase-js expects. */
type TableDef<Row, Required extends keyof Row> = {
  Row: Row;
  Insert: Pick<Row, Required> & Partial<Omit<Row, Required>>;
  Update: Partial<Row>;
  Relationships: [];
};

export type LearningTopicRow = {
  id: string;
  family: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  content_version: string;
  is_active: boolean;
  is_demo: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type LearningUnitRow = {
  id: string;
  topic_id: string;
  title: string;
  summary: string | null;
  sort_order: number;
  sections: string[];
  estimated_minutes: number | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
};

export type AchievementRow = {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  xp_reward: number;
  criteria: Json;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AppConfigRow = {
  key: string;
  value: Json;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileRow = {
  id: string;
  display_name: string | null;
  institution: string | null;
  programme: string | null;
  year_of_study: number | null;
  avatar_url: string | null;
  learning_goal: string | null;
  xp: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  onboarding_completed_at: string | null;
  /** Set when first-run profile setup is finished (migration 20261010000000). */
  profile_completed_at: string | null;
  research_participant: boolean;
  research_consent_given: boolean;
  research_consent_version: string | null;
  research_consent_date: string | null;
  research_withdrawn_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UserPreferencesRow = {
  user_id: string;
  theme: ThemePreferenceDb;
  text_scale: number;
  reduced_motion: boolean;
  high_contrast: boolean;
  daily_goal_minutes: number;
  hint_preference: HintPreference;
  difficulty_preference: DifficultyPreference;
  notify_study_reminders: boolean;
  notify_streak: boolean;
  notify_achievements: boolean;
  reminder_time: string | null;
  created_at: string;
  updated_at: string;
};

export type LessonProgressRow = {
  id: string;
  user_id: string;
  unit_id: string;
  section_key: string;
  status: ProgressStatus;
  time_spent_seconds: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PracticeAttemptRow = {
  id: string;
  user_id: string;
  topic_id: string;
  unit_id: string | null;
  practice_set_id: string;
  questions_total: number;
  questions_correct: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
};

export type QuizAttemptRow = {
  id: string;
  user_id: string;
  topic_id: string;
  unit_id: string | null;
  quiz_id: string;
  questions_total: number;
  questions_correct: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type QuestionAttemptRow = {
  id: string;
  user_id: string;
  topic_id: string;
  unit_id: string | null;
  question_id: string;
  practice_attempt_id: string | null;
  quiz_attempt_id: string | null;
  retry_of_id: string | null;
  learner_answer: Json | null;
  is_correct: boolean;
  hints_used: number;
  hint_levels_viewed: number[];
  viewed_steps: boolean;
  viewed_answer: boolean;
  time_spent_seconds: number | null;
  saved_to_review: boolean;
  review_resolved_at: string | null;
  answered_at: string;
  created_at: string;
  updated_at: string;
};

export type GameSessionRow = {
  id: string;
  user_id: string;
  topic_id: string;
  game_id: string;
  level_reached: number;
  score: number;
  xp_earned: number;
  hints_used: number;
  completed: boolean;
  events: Json;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ArtProjectRow = {
  id: string;
  user_id: string;
  topic_id: string | null;
  activity_id: string;
  title: string;
  composition: Json;
  conditions_met: Json;
  is_completed: boolean;
  thumbnail_path: string | null;
  created_at: string;
  updated_at: string;
};

export type ActivityHistoryRow = {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  ref_id: string | null;
  topic_id: string | null;
  summary: string | null;
  xp_delta: number;
  metadata: Json;
  occurred_at: string;
  created_at: string;
};

export type UserAchievementRow = {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  created_at: string;
};

export type MistakeToReviewRow = Pick<
  QuestionAttemptRow,
  | 'id'
  | 'user_id'
  | 'topic_id'
  | 'unit_id'
  | 'question_id'
  | 'learner_answer'
  | 'is_correct'
  | 'hints_used'
  | 'hint_levels_viewed'
  | 'viewed_steps'
  | 'viewed_answer'
  | 'saved_to_review'
  | 'answered_at'
>;

export type Database = {
  public: {
    Tables: {
      learning_topics: TableDef<LearningTopicRow, 'id' | 'family' | 'title'>;
      learning_units: TableDef<LearningUnitRow, 'id' | 'topic_id' | 'title'>;
      achievements: TableDef<AchievementRow, 'id' | 'title' | 'description'>;
      app_config: TableDef<AppConfigRow, 'key' | 'value'>;
      profiles: TableDef<ProfileRow, 'id'>;
      user_preferences: TableDef<UserPreferencesRow, 'user_id'>;
      lesson_progress: TableDef<LessonProgressRow, 'user_id' | 'unit_id' | 'section_key'>;
      practice_attempts: TableDef<PracticeAttemptRow, 'user_id' | 'topic_id' | 'practice_set_id'>;
      quiz_attempts: TableDef<QuizAttemptRow, 'user_id' | 'topic_id' | 'quiz_id'>;
      question_attempts: TableDef<QuestionAttemptRow, 'user_id' | 'topic_id' | 'question_id' | 'is_correct'>;
      game_sessions: TableDef<GameSessionRow, 'user_id' | 'topic_id' | 'game_id'>;
      art_projects: TableDef<ArtProjectRow, 'user_id' | 'activity_id' | 'composition'>;
      activity_history: TableDef<ActivityHistoryRow, 'user_id' | 'activity_type'>;
      user_achievements: TableDef<UserAchievementRow, 'user_id' | 'achievement_id'>;
    };
    Views: {
      v_mistakes_to_review: { Row: MistakeToReviewRow; Relationships: [] };
    };
    Functions: {
      record_activity: {
        Args: {
          p_id: string;
          p_activity_type: ActivityType;
          p_ref_id?: string | null;
          p_topic_id?: string | null;
          p_summary?: string | null;
          p_xp_delta?: number;
          p_metadata?: Json;
        };
        Returns: ActivityHistoryRow;
      };
    };
    Enums: {
      progress_status: ProgressStatus;
      activity_type: ActivityType;
      theme_preference: ThemePreferenceDb;
      hint_preference: HintPreference;
      difficulty_preference: DifficultyPreference;
    };
    CompositeTypes: Record<string, never>;
  };
};
