import { isDevAuthBackend } from '../../auth';
import type {
  ActivityLogRepository,
  ArtProjectRepository,
  GameSessionRepository,
  QuestionAttemptRepository,
} from '../types';

import { devActivityLog, devArtProjects, devGameSessions, devQuestionAttempts } from './devLearning';
import {
  supabaseActivityLog,
  supabaseArtProjects,
  supabaseGameSessions,
  supabaseQuestionAttempts,
} from './supabaseLearning';

/** Each follows the auth backend: device-only storage for dev accounts, Supabase otherwise. */
export const questionAttemptRepository: QuestionAttemptRepository = isDevAuthBackend
  ? devQuestionAttempts
  : supabaseQuestionAttempts;
export const gameSessionRepository: GameSessionRepository = isDevAuthBackend ? devGameSessions : supabaseGameSessions;
export const artProjectRepository: ArtProjectRepository = isDevAuthBackend ? devArtProjects : supabaseArtProjects;
export const activityLogRepository: ActivityLogRepository = isDevAuthBackend ? devActivityLog : supabaseActivityLog;
