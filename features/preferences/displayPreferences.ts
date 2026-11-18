/**
 * Display preferences, shared by every screen through one tiny external store:
 *   theme         Light / Dark / System (Profile › Appearance & motion)
 *   highContrast  high-contrast colour roles
 *   reduceMotion  the app's own Reduce Motion switch (in addition to the phone's setting)
 *   ambientArt    show the ambient mathematical art on sign in, onboarding, Home and empty states
 * Lesson content, graphs and controls never depend on these.
 *
 * Persistence:
 *   - This device (AsyncStorage, which is localStorage on web) holds the latest
 *     choice, so the app opens in the right theme even offline or signed out.
 *     Root layout awaits `hydrateDisplayPreferences()` before showing any screen,
 *     and on web the stored value is read synchronously, so there is no flash.
 *   - Signed-in learners also keep theme, high contrast and Reduce Motion in
 *     their account (user_preferences); usePreferenceSync reconciles the two by
 *     `changedAt`. Ambient art has no account column and stays per device.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import type { ThemePreference } from '@/theme/themes';

export interface DisplayPreferences {
  theme: ThemePreference;
  highContrast: boolean;
  reduceMotion: boolean;
  ambientArt: boolean;
}

/** The preferences that are also stored in the learner's account. */
export type AccountDisplayKey = 'theme' | 'highContrast' | 'reduceMotion';
const ACCOUNT_KEYS: readonly AccountDisplayKey[] = ['theme', 'highContrast', 'reduceMotion'];

export const DEFAULT_DISPLAY: DisplayPreferences = {
  theme: 'light',
  highContrast: false,
  reduceMotion: false,
  ambientArt: true,
};
export const DISPLAY_PREFERENCES_KEY = 'mathart.display.v1';

interface Stored extends DisplayPreferences {
  /** When an account-synced preference was last chosen (ISO); null if never chosen on this device. */
  changedAt: string | null;
}

const THEMES: readonly ThemePreference[] = ['light', 'dark', 'system'];

function parse(raw: string | null): Stored {
  if (!raw) return { ...DEFAULT_DISPLAY, changedAt: null };
  try {
    const parsed = JSON.parse(raw) as Partial<Stored>;
    return {
      theme: THEMES.includes(parsed.theme as ThemePreference)
        ? (parsed.theme as ThemePreference)
        : DEFAULT_DISPLAY.theme,
      highContrast: parsed.highContrast === true,
      reduceMotion: parsed.reduceMotion === true,
      ambientArt: parsed.ambientArt !== false,
      changedAt: typeof parsed.changedAt === 'string' ? parsed.changedAt : null,
    };
  } catch {
    return { ...DEFAULT_DISPLAY, changedAt: null };
  }
}

/** Web: localStorage can be read before the first render, so the first frame already has the saved theme. */
function readSync(): Stored | null {
  try {
    const storage = (globalThis as { localStorage?: Storage }).localStorage;
    return storage ? parse(storage.getItem(DISPLAY_PREFERENCES_KEY)) : null;
  } catch {
    return null;
  }
}

const initial = readSync();
let current: Stored = initial ?? { ...DEFAULT_DISPLAY, changedAt: null };
let hydrated = initial !== null;
let hydrating: Promise<void> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function persist() {
  void AsyncStorage.setItem(DISPLAY_PREFERENCES_KEY, JSON.stringify(current)).catch(() => undefined);
}

/** Loads the saved preferences once. Safe to call many times; resolves immediately when already loaded. */
export function hydrateDisplayPreferences(): Promise<void> {
  if (hydrated) return Promise.resolve();
  hydrating ??= AsyncStorage.getItem(DISPLAY_PREFERENCES_KEY)
    .then((raw) => {
      current = parse(raw);
    })
    .catch(() => undefined)
    .finally(() => {
      hydrated = true;
      emit();
    });
  return hydrating;
}

/** A learner's choice on this device: applied at once, saved here, and synced to the account by usePreferenceSync. */
export function setDisplayPreference<K extends keyof DisplayPreferences>(key: K, value: DisplayPreferences[K]): void {
  if (current[key] === value) return;
  const synced = (ACCOUNT_KEYS as readonly string[]).includes(key);
  current = { ...current, [key]: value, ...(synced ? { changedAt: new Date().toISOString() } : {}) };
  persist();
  emit();
}

/** The account-synced part, with when it was last chosen on this device. */
export function getAccountDisplayPreferences(): Pick<DisplayPreferences, AccountDisplayKey> & {
  changedAt: string | null;
} {
  return {
    theme: current.theme,
    highContrast: current.highContrast,
    reduceMotion: current.reduceMotion,
    changedAt: current.changedAt,
  };
}

/** Applies preferences that came from the account (or marks a successful upload) without counting as a new choice. */
export function applyAccountDisplayPreferences(
  values: Pick<DisplayPreferences, AccountDisplayKey>,
  changedAt: string,
): void {
  current = { ...current, ...values, changedAt };
  persist();
  emit();
}

/** For tests: forget the cached preferences so the next reader loads them again. */
export function resetDisplayPreferencesForTests(): void {
  current = { ...DEFAULT_DISPLAY, changedAt: null };
  hydrated = false;
  hydrating = null;
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  void hydrateDisplayPreferences();
  return () => {
    listeners.delete(listener);
  };
};

const snapshot = () => current;
const hydratedSnapshot = () => hydrated;

export function useDisplayPreferences(): DisplayPreferences {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}

/** False until the saved preferences have been read (root layout waits, so no screen shows the wrong theme). */
export function useDisplayPreferencesHydrated(): boolean {
  return useSyncExternalStore(subscribe, hydratedSnapshot, hydratedSnapshot);
}

/** Subscribe outside React (preference sync). */
export function onDisplayPreferencesChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
