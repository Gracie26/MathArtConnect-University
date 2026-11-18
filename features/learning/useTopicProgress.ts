import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';

import type { TopicDefinition } from '@/content/types';
import { useAuth } from '@/features/auth/AuthProvider';
import { lessonProgressRepository } from '@/services/repositories/lessonProgress';
import type { LessonProgressEntry } from '@/services/repositories/types';
import type { ServiceResult } from '@/services/types';

import { computeTopicProgress, type TopicProgress } from './progress';
import { recordStudyDay } from './useLearningHistory';

export type TopicProgressState =
  | { status: 'loading' }
  | { status: 'ready'; progress: TopicProgress }
  | { status: 'error'; message: string; progress: TopicProgress };

/**
 * Real, saved progress for a topic. Reloads whenever the screen regains
 * focus (e.g. returning from a lesson). Failures are reported, never hidden;
 * on error the last known progress stays visible.
 */
export function useTopicProgress(topic: TopicDefinition) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LessonProgressEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const unitIds = useMemo(() => topic.units.map((u) => u.id), [topic]);
  const latestRequest = useRef(0);

  const reload = useCallback(async () => {
    if (!user) return;
    const request = ++latestRequest.current;
    const result = await lessonProgressRepository.listForUnits(user.id, unitIds);
    if (request !== latestRequest.current) return;
    if (result.ok) {
      setEntries(result.data);
      setError(null);
    } else {
      setEntries((previous) => previous ?? []);
      setError(result.error.message);
    }
  }, [unitIds, user]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const completeStep = useCallback(
    async (unitId: string, stepKey: string): Promise<ServiceResult<LessonProgressEntry>> => {
      if (!user) return { ok: false, error: { code: 'unauthenticated', message: 'Please sign in to save progress.' } };
      const result = await lessonProgressRepository.completeSection(user.id, unitId, stepKey);
      if (result.ok) {
        setEntries((previous) => [
          ...(previous ?? []).filter((e) => !(e.unitId === unitId && e.sectionKey === stepKey)),
          result.data,
        ]);
        // Completing a lesson step is study: it counts towards the streak (no XP).
        void recordStudyDay(user.id, 'lesson', topic.id).catch(() => undefined);
      }
      return result;
    },
    [user, topic.id],
  );

  const state: TopicProgressState = useMemo(() => {
    if (entries === null) return { status: 'loading' };
    const progress = computeTopicProgress(topic, entries);
    return error ? { status: 'error', message: error, progress } : { status: 'ready', progress };
  }, [entries, error, topic]);

  return { state, reload, completeStep };
}
