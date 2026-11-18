import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';

import type { TopicDefinition } from '@/content/types';
import { useAuth } from '@/features/auth/AuthProvider';
import { lessonProgressRepository } from '@/services/repositories/lessonProgress';
import type { LessonProgressEntry } from '@/services/repositories/types';

import { computeTopicProgress, type TopicProgress } from './progress';

/**
 * Saved progress for several topics in one request (the Learn tab), reloaded
 * whenever the screen regains focus. Null while loading; on error each topic
 * shows the last known (or empty) progress.
 */
export function useTopicsProgress(topics: readonly TopicDefinition[]): Record<string, TopicProgress> | null {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LessonProgressEntry[] | null>(null);
  const unitIds = useMemo(() => topics.flatMap((t) => t.units.map((u) => u.id)), [topics]);
  const latestRequest = useRef(0);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      const request = ++latestRequest.current;
      void lessonProgressRepository.listForUnits(user.id, unitIds).then((result) => {
        if (request !== latestRequest.current) return;
        setEntries((previous) => (result.ok ? result.data : (previous ?? [])));
      });
    }, [unitIds, user]),
  );

  return useMemo(
    () => (entries === null ? null : Object.fromEntries(topics.map((t) => [t.id, computeTopicProgress(t, entries)]))),
    [entries, topics],
  );
}

/** The topic to focus on: the first one started but not finished, else the first not finished. */
export function focusTopicId(
  topics: readonly TopicDefinition[],
  progress: Record<string, TopicProgress>,
): string | null {
  const unfinished = topics.filter((t) => (progress[t.id]?.fraction ?? 0) < 1);
  return (unfinished.find((t) => progress[t.id]?.started) ?? unfinished[0] ?? topics[0])?.id ?? null;
}
