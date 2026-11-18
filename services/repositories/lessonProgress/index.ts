import { isDevAuthBackend } from '../../auth';
import type { LessonProgressRepository } from '../types';

import { devLessonProgress } from './devLessonProgress';
import { supabaseLessonProgress } from './supabaseLessonProgress';

/** Follows the auth backend: device-only storage for dev accounts, Supabase otherwise. */
export const lessonProgressRepository: LessonProgressRepository = isDevAuthBackend
  ? devLessonProgress
  : supabaseLessonProgress;
