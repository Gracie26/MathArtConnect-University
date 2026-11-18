import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { listLearnerTopics } from '@/content/registry';
import { useAuth } from '@/features/auth/AuthProvider';
import { badgeNotifications } from '@/features/rewards/achievements';
import { buildProgressReport } from '@/features/insights/progressReport';
import { useLearnerRecords } from '@/features/insights/useLearnerRecord';

import { EMPTY_STATE, loadNotificationState, type NotificationState, saveNotificationState } from './notificationStore';
import {
  deriveAllNotifications,
  type LearnerNotification,
  type NotificationSettings,
  visibleNotifications,
} from './notifications';

/**
 * The learner's in-app notifications: built from their real record, filtered
 * by their settings and dismissals, with read state. Reloads on focus.
 */
export function useNotifications() {
  const { user } = useAuth();
  // Every learner topic: notifications are never limited to the first topic.
  const topics = useMemo(() => listLearnerTopics(), []);
  const { state: recordState, reload } = useLearnerRecords(topics);
  const [store, setStore] = useState<NotificationState>(EMPTY_STATE);
  const [storeError, setStoreError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      let active = true;
      void loadNotificationState(user.id).then((s) => {
        if (active) setStore(s);
      });
      return () => {
        active = false;
      };
    }, [user]),
  );

  const all = useMemo<LearnerNotification[]>(() => {
    if (recordState.status !== 'ready') return [];
    const derived = deriveAllNotifications(
      recordState.records.map(({ topic, record }) => ({ topic, record, report: buildProgressReport(topic, record) })),
    );
    const badges: LearnerNotification[] = badgeNotifications(recordState.records).map((b) => ({
      ...b,
      kind: 'achievement',
      href: '/rewards',
    }));
    return [...derived, ...badges].sort((a, b) => b.at.localeCompare(a.at));
  }, [recordState]);

  const dismissed = useMemo(() => new Set(store.dismissed), [store.dismissed]);
  const read = useMemo(() => new Set(store.read), [store.read]);
  const items = useMemo(() => visibleNotifications(all, store.settings, dismissed), [all, store.settings, dismissed]);
  const unread = items.filter((n) => !read.has(n.id)).length;

  const update = useCallback(
    (change: (s: NotificationState) => NotificationState) => {
      setStore((current) => {
        const next = change(current);
        if (user) {
          saveNotificationState(user.id, next).then(
            () => setStoreError(null),
            () => setStoreError('Your notification choices could not be saved on this device.'),
          );
        }
        return next;
      });
    },
    [user],
  );

  const markRead = (id: string) => update((s) => (s.read.includes(id) ? s : { ...s, read: [...s.read, id] }));
  const markAllRead = () => update((s) => ({ ...s, read: [...new Set([...s.read, ...items.map((n) => n.id)])] }));
  const dismiss = (id: string) =>
    update((s) => ({ ...s, dismissed: [...new Set([...s.dismissed, id])], read: [...new Set([...s.read, id])] }));
  const setSetting = (key: keyof NotificationSettings, value: boolean) =>
    update((s) => ({ ...s, settings: { ...s.settings, [key]: value } }));

  return {
    status: recordState.status,
    error: recordState.status === 'error' ? recordState.message : storeError,
    items,
    read,
    unread,
    settings: store.settings,
    markRead,
    markAllRead,
    dismiss,
    setSetting,
    reload,
  };
}
