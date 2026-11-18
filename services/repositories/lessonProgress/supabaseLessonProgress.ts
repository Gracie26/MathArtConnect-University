import { getSupabase } from '../../supabase/client';
import { notConfigured, ok, type ServiceResult } from '../../types';
import { dataFailure } from '../dataErrors';
import type { LessonProgressEntry, LessonProgressRepository } from '../types';

/** Classifies the failure (network, expired session or database) so learners get the right message. */
function failure<T>(error: unknown, operation: 'save' | 'load'): ServiceResult<T> {
  return dataFailure<T>(error, operation, 'lesson progress');
}

const toEntry = (row: {
  unit_id: string;
  section_key: string;
  status: LessonProgressEntry['status'];
  completed_at: string | null;
}): LessonProgressEntry => ({
  unitId: row.unit_id,
  sectionKey: row.section_key,
  status: row.status,
  completedAt: row.completed_at,
});

/** lesson_progress table (RLS: own rows only; (user, unit, step) is unique). */
export const supabaseLessonProgress: LessonProgressRepository = {
  async listForUnits(userId, unitIds) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Progress');
    if (unitIds.length === 0) return ok([]);
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('unit_id, section_key, status, completed_at')
      .eq('user_id', userId)
      .in('unit_id', [...unitIds]);
    if (error) return failure(error, 'load');
    return ok(data.map(toEntry));
  },

  async completeSection(userId, unitId, sectionKey) {
    const supabase = getSupabase();
    if (!supabase) return notConfigured('Progress');
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('lesson_progress')
      .upsert(
        { user_id: userId, unit_id: unitId, section_key: sectionKey, status: 'completed', completed_at: now },
        { onConflict: 'user_id,unit_id,section_key' },
      )
      .select('unit_id, section_key, status, completed_at')
      .single();
    if (error) return failure(error, 'save');
    return ok(toEntry(data));
  },
};
