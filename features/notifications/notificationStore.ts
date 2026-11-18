/**
 * Which in-app notifications the learner has read or dismissed, and their
 * in-app notification settings. Kept on this device (AsyncStorage), per
 * learner: the notifications themselves are rebuilt from the learner's
 * synced record, so only these small choices are local.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS, type NotificationSettings } from './notifications';

export interface NotificationState {
  read: string[];
  dismissed: string[];
  settings: NotificationSettings;
}

export const EMPTY_STATE: NotificationState = { read: [], dismissed: [], settings: DEFAULT_SETTINGS };

/** Older ids are dropped beyond this many, so the stored list stays small. */
const KEEP = 400;

const key = (userId: string) => `mathart.notifications.v1.${userId}`;

export async function loadNotificationState(userId: string): Promise<NotificationState> {
  try {
    const raw = await AsyncStorage.getItem(key(userId));
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<NotificationState>;
    return {
      read: Array.isArray(parsed.read) ? parsed.read.filter((x): x is string => typeof x === 'string') : [],
      dismissed: Array.isArray(parsed.dismissed)
        ? parsed.dismissed.filter((x): x is string => typeof x === 'string')
        : [],
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    return EMPTY_STATE;
  }
}

export async function saveNotificationState(userId: string, state: NotificationState): Promise<void> {
  const trimmed: NotificationState = {
    read: state.read.slice(-KEEP),
    dismissed: state.dismissed.slice(-KEEP),
    settings: state.settings,
  };
  await AsyncStorage.setItem(key(userId), JSON.stringify(trimmed));
}
