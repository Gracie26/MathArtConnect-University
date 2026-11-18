/**
 * Profile polish: no route-group names in navigation, every Profile row opens
 * a working screen (no dead items), and the in-app display preferences
 * (Reduce motion, ambient art) work and are remembered.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, screen, userEvent } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import { readFileSync } from 'fs';

import {
  DEFAULT_DISPLAY,
  resetDisplayPreferencesForTests,
  setDisplayPreference,
} from '@/features/preferences/displayPreferences';
import { seedSignedInLearner } from '@/test-utils/auth';

jest.setTimeout(400_000);

const wait = { timeout: 20_000 };

beforeEach(async () => {
  await AsyncStorage.clear();
  resetDisplayPreferencesForTests();
  await seedSignedInLearner();
});

describe('navigation labels', () => {
  const layout = (path: string) => readFileSync(`app/${path}`, 'utf8');

  test('every stack names its back button "Back", and the tab group is titled Home, never "(tabs)"', () => {
    const appLayout = layout('(app)/_layout.tsx');
    const rootLayout = layout('_layout.tsx');
    expect(appLayout).toMatch(/headerBackTitle: 'Back'/);
    expect(rootLayout).toMatch(/headerBackTitle: 'Back'/);
    expect(appLayout).toMatch(/name="\(tabs\)"[^>]*title: 'Home'/);
    expect(rootLayout).toMatch(/name="\(app\)"[^>]*title: 'Home'/);
  });

  test('screens opened from Profile never show a route-group name', async () => {
    await renderRouter('./app', { initialUrl: '/about' });
    expect(await screen.findByText(/Designed to support Calculus learning/, {}, wait)).toBeOnTheScreen();
    expect(screen.queryByText(/\((tabs|app|auth)\)/)).toBeNull();
    expect(screen.queryByText(/_layout|\.tsx/)).toBeNull();
  });
});

describe('Profile', () => {
  test('rows are grouped Account, Learning, Preferences, Support & Information, with Sign Out apart', async () => {
    await renderRouter('./app', { initialUrl: '/profile' });
    for (const title of ['Account', 'Learning', 'Preferences', 'Support & Information']) {
      expect(await screen.findByText(new RegExp(`^${title}$`, 'i'), {}, wait)).toBeOnTheScreen();
    }
    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeOnTheScreen();
    // No placeholder or "coming soon" rows.
    expect(screen.queryByText(/coming soon|placeholder|in development/i)).toBeNull();
  });

  // [row, destination path, text that only the destination shows]
  const ROWS: [string, string, RegExp][] = [
    ['Edit Profile', '/edit-profile', /./],
    ['Account & Security', '/account', /./],
    ['Change Password', '/change-password', /./],
    ['My Work', '/my-work', /./],
    // Review Mistakes is My Work opened on its "Needs review" filter.
    ['Review Mistakes', '/my-work', /./],
    ['Rewards & Weekly Goals', '/rewards', /./],
    ['Notifications', '/notifications', /./],
    ['Appearance & Motion', '/settings', /^Motion and background$/],
    ['About MathArt Connect', '/about', /Designed to support Calculus learning/],
    ['Help', '/help', /^How is my working checked\?$/],
    ['Terms of Use', '/terms', /./],
    ['Privacy Policy', '/privacy', /./],
  ];

  test.each(ROWS)('"%s" opens %s, a real screen', async (row, path, marker) => {
    const user = userEvent.setup();
    const view = await renderRouter('./app', { initialUrl: '/profile' });
    await user.press(await screen.findByRole('button', { name: new RegExp(`^${row.replace(/[&?]/g, '\\$&')}`) }, wait));
    expect(view.getPathname()).toBe(path);
    if (row === 'Review Mistakes') expect(view.getSearchParams()).toMatchObject({ filter: 'review' });
    expect(await screen.findAllByText(marker, {}, wait)).not.toHaveLength(0);
    expect(screen.queryByText('This page does not exist.')).toBeNull();
  });

  test('Replay Introduction opens the onboarding in replay mode', async () => {
    const user = userEvent.setup();
    const view = await renderRouter('./app', { initialUrl: '/profile' });
    await user.press(await screen.findByRole('button', { name: 'Replay Introduction' }, wait));
    expect(view.getPathname()).toBe('/onboarding');
    expect(view.getSearchParams()).toMatchObject({ replay: '1' });
  });
});

describe('Appearance & Motion', () => {
  test('Reduce motion and ambient art switch, and are remembered on this device', async () => {
    await renderRouter('./app', { initialUrl: '/settings' });
    const reduce = await screen.findByLabelText('Reduce motion', {}, wait);
    const ambient = screen.getByLabelText('Ambient mathematical art');
    expect(reduce.props.value).toBe(DEFAULT_DISPLAY.reduceMotion);
    expect(ambient.props.value).toBe(DEFAULT_DISPLAY.ambientArt);

    await act(async () => {
      fireEvent(reduce, 'valueChange', true);
    });
    await act(async () => {
      fireEvent(screen.getByLabelText('Ambient mathematical art'), 'valueChange', false);
    });
    expect(screen.getByLabelText('Reduce motion').props.value).toBe(true);
    expect(screen.getByLabelText('Ambient mathematical art').props.value).toBe(false);
    const stored = JSON.parse((await AsyncStorage.getItem('mathart.display.v1')) ?? '{}');
    expect(stored).toMatchObject({ reduceMotion: true, ambientArt: false });
    await act(async () => {
      setDisplayPreference('reduceMotion', false);
      setDisplayPreference('ambientArt', true);
    });
  });

  test('the Home backdrop row opens Rewards, where backdrops are chosen', async () => {
    const user = userEvent.setup();
    const view = await renderRouter('./app', { initialUrl: '/settings' });
    await user.press(await screen.findByRole('button', { name: /^Choose a Home backdrop/ }, wait));
    expect(view.getPathname()).toBe('/rewards');
  });
});
