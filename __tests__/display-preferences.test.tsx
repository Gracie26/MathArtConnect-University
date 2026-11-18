import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, render, renderHook, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import {
  DISPLAY_PREFERENCES_KEY,
  getAccountDisplayPreferences,
  hydrateDisplayPreferences,
  resetDisplayPreferencesForTests,
  setDisplayPreference,
} from '@/features/preferences/displayPreferences';
import { planPreferenceSync, usePreferenceSync } from '@/features/preferences/usePreferenceSync';
import { useAppTheme } from '@/hooks/useAppTheme';
import { devPreferences } from '@/services/preferences/devPreferences';
import { ThemeProvider } from '@/theme';

beforeEach(async () => {
  await AsyncStorage.clear();
  resetDisplayPreferencesForTests();
});

function Scheme() {
  const theme = useAppTheme();
  return <Text>{`scheme:${theme.scheme}`}</Text>;
}

describe('the theme choice persists', () => {
  test('choosing Dark is saved on this device and restored after a restart', async () => {
    await hydrateDisplayPreferences();
    await render(
      <ThemeProvider>
        <Scheme />
      </ThemeProvider>,
    );
    expect(screen.getByText('scheme:light')).toBeOnTheScreen();

    await act(() => setDisplayPreference('theme', 'dark'));
    expect(screen.getByText('scheme:dark')).toBeOnTheScreen();
    await waitFor(async () =>
      expect(JSON.parse((await AsyncStorage.getItem(DISPLAY_PREFERENCES_KEY)) ?? '{}').theme).toBe('dark'),
    );

    // A restart: memory is gone, the saved record is read again before anything is drawn.
    resetDisplayPreferencesForTests();
    await hydrateDisplayPreferences();
    await render(
      <ThemeProvider>
        <Scheme />
      </ThemeProvider>,
    );
    expect(screen.getAllByText('scheme:dark').length).toBeGreaterThan(0);
  });

  test('Reduce Motion and ambient art persist in the same record', async () => {
    await hydrateDisplayPreferences();
    setDisplayPreference('reduceMotion', true);
    setDisplayPreference('ambientArt', false);
    await waitFor(async () => {
      const saved = JSON.parse((await AsyncStorage.getItem(DISPLAY_PREFERENCES_KEY)) ?? '{}');
      expect(saved).toMatchObject({ reduceMotion: true, ambientArt: false });
    });
    resetDisplayPreferencesForTests();
    await hydrateDisplayPreferences();
    expect(getAccountDisplayPreferences().reduceMotion).toBe(true);
  });

  test('an older saved record without a theme still loads, with Light as the default', async () => {
    await AsyncStorage.setItem(DISPLAY_PREFERENCES_KEY, JSON.stringify({ reduceMotion: true, ambientArt: true }));
    await hydrateDisplayPreferences();
    expect(getAccountDisplayPreferences()).toMatchObject({ theme: 'light', reduceMotion: true, changedAt: null });
  });

  test('an isolated ThemeProvider (initialPreference) ignores the saved choice', async () => {
    await hydrateDisplayPreferences();
    setDisplayPreference('theme', 'dark');
    await render(
      <ThemeProvider initialPreference="light">
        <Scheme />
      </ThemeProvider>,
    );
    expect(screen.getByText('scheme:light')).toBeOnTheScreen();
  });
});

describe('which side wins when a learner signs in', () => {
  const account = (updatedAt: string, chosen = true) => ({
    theme: 'dark' as const,
    highContrast: false,
    reduceMotion: false,
    updatedAt,
    chosen,
  });

  test.each([
    ['a device that never chose takes the account choice', null, account('2026-10-01T10:00:00Z'), 'useAccount'],
    ['a newer account choice wins', '2026-10-01T09:00:00Z', account('2026-10-01T10:00:00Z'), 'useAccount'],
    [
      'a newer device choice is saved to the account',
      '2026-10-01T11:00:00Z',
      account('2026-10-01T10:00:00Z'),
      'saveToAccount',
    ],
    [
      'untouched account defaults never override the device',
      '2026-10-01T09:00:00Z',
      account('2026-10-01T10:00:00Z', false),
      'saveToAccount',
    ],
    ['nothing chosen anywhere: nothing to do', null, account('2026-10-01T10:00:00Z', false), 'none'],
    ['no account row: nothing to save to', '2026-10-01T09:00:00Z', null, 'none'],
  ] as const)('%s', (_name, changedAt, acc, plan) => {
    expect(planPreferenceSync({ changedAt }, acc)).toBe(plan);
  });

  test('signed in: a new choice is saved to the account, and the account choice is applied on another device', async () => {
    await hydrateDisplayPreferences();
    const { unmount } = await renderHook(() => usePreferenceSync('learner-1'));
    await act(() => setDisplayPreference('theme', 'dark'));
    await waitFor(async () => {
      const saved = await devPreferences.get('learner-1');
      expect(saved.ok && saved.data?.theme).toBe('dark');
    });
    await unmount();

    // "Another device": nothing chosen locally yet, so the account's Dark is applied on sign-in.
    await AsyncStorage.removeItem(DISPLAY_PREFERENCES_KEY);
    resetDisplayPreferencesForTests();
    await hydrateDisplayPreferences();
    expect(getAccountDisplayPreferences().theme).toBe('light');
    await renderHook(() => usePreferenceSync('learner-1'));
    await waitFor(() => expect(getAccountDisplayPreferences().theme).toBe('dark'));
  });
});
