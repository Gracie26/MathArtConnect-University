/**
 * Rewards and ambient art on screen: the Rewards screen, weekly goals that can
 * be switched off and stay off after reopening, a milestone moment that is
 * shown once and awards no XP, and ambient art that ignores touch, is hidden
 * from screen readers, and stays still under Reduce Motion.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo } from 'react-native';
import { act, fireEvent, screen, userEvent } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { applicationsTopic } from '@/content/topics/applications';
import { devQuestionAttempts, devXpTotal } from '@/services/repositories/learning/devLearning';
import { seedSignedInLearner, seedSignedOutLearner } from '@/test-utils/auth';

jest.setTimeout(400_000);

const wait = { timeout: 20_000 };
let learnerId = '';

const correctAnswer = (id: string) =>
  devQuestionAttempts.record(learnerId, {
    id,
    topicId: applicationsTopic.id,
    unitId: 'pda-gradient',
    questionId: id,
    retryOfId: null,
    learnerAnswer: '1, 4',
    isCorrect: true,
    hintsUsed: 0,
    hintLevelsViewed: [],
    viewedSteps: false,
    viewedAnswer: false,
  });

const ambient = () => screen.getAllByTestId(/^ambient-art-/, { includeHiddenElements: true });

describe('signed in', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    learnerId = (await seedSignedInLearner()).id;
  });

  test('the Rewards screen shows personal bests, weekly goals, every badge and the backdrops', async () => {
    await renderRouter('./app', { initialUrl: '/rewards' });
    expect(await screen.findByText('Personal bests', {}, wait)).toBeOnTheScreen();
    expect(screen.getByText('Weekly goals')).toBeOnTheScreen();
    expect(screen.getByText('Practice sessions')).toBeOnTheScreen();
    expect(screen.getByText('Gradient Explorer')).toBeOnTheScreen();
    expect(screen.getByText('Classification Expert')).toBeOnTheScreen();
    expect(screen.getByText('Home backdrops')).toBeOnTheScreen();
    expect(screen.getAllByRole('button', { name: 'Locked' })).toHaveLength(3);
    expect(screen.queryByText(/leaderboard|rank/i)).toBeNull();
  });

  test('weekly goals can be switched off, and the choice persists after reopening', async () => {
    const first = await renderRouter('./app', { initialUrl: '/rewards' });
    const toggle = await screen.findByRole('switch', { name: 'Show weekly goals on Home' }, wait);
    await act(async () => {
      fireEvent(toggle, 'valueChange', false);
    });
    await first.unmount();
    await renderRouter('./app', { initialUrl: '/' });
    expect(await screen.findByText(/^Badges · 0 of \d+$/, {}, wait)).toBeOnTheScreen();
    expect(screen.queryByText(/^Weekly goals ·/)).toBeNull();
    const stored = JSON.parse((await AsyncStorage.getItem(`mathart.rewards.v1.${learnerId}`)) ?? '{}');
    expect(stored.weeklyGoals).toBe(false);
  });

  test('a new badge is celebrated once on Home, and no XP is awarded for it', async () => {
    const user = userEvent.setup();
    // First visit: nothing earned yet; the reward state is initialised quietly.
    const first = await renderRouter('./app', { initialUrl: '/' });
    expect(await screen.findByText(/^Badges · 0 of \d+$/, {}, wait)).toBeOnTheScreen();
    await first.unmount();
    const xpBefore = await devXpTotal(learnerId);
    await correctAnswer('tut5-q2-i');

    const second = await renderRouter('./app', { initialUrl: '/' });
    expect(await screen.findByText('New badge: First Practice', {}, wait)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Great' }));
    expect(screen.queryByText('New badge: First Practice')).toBeNull();
    await second.unmount();

    await renderRouter('./app', { initialUrl: '/' });
    expect(await screen.findByText(/^Badges · 1 of \d+$/, {}, wait)).toBeOnTheScreen();
    expect(screen.queryByText('New badge: First Practice')).toBeNull();
    expect(await devXpTotal(learnerId)).toBe(xpBefore);
  });

  test('a badge earned before rewards were first opened is not celebrated (no flood of moments)', async () => {
    await correctAnswer('tut5-q2-i');
    await renderRouter('./app', { initialUrl: '/' });
    expect(await screen.findByText(/^Badges · 1 of \d+$/, {}, wait)).toBeOnTheScreen();
    expect(screen.queryByText(/^New badge:/)).toBeNull();
  });

  test('Home ambient art ignores touch and is hidden from screen readers; it is still under Reduce Motion', async () => {
    await renderRouter('./app', { initialUrl: '/' });
    await screen.findByText(/^Badges ·/, {}, wait);
    const [art] = ambient();
    expect(art!.props.pointerEvents).toBe('none');
    expect(art!.props.accessibilityElementsHidden).toBe(true);
    expect(art!.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(art!.props.testID).toBe('ambient-art-still');
    // The Continue Learning card behind which nothing is drawn stays pressable.
    expect(screen.getAllByRole('button').length).toBeGreaterThan(3);
  });

  test('without Reduce Motion the ambient art moves', async () => {
    const spy = jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    try {
      await renderRouter('./app', { initialUrl: '/' });
      await screen.findByText(/^Badges ·/, {}, wait);
      expect(await screen.findByTestId('ambient-art-moving', { includeHiddenElements: true }, wait)).toBeTruthy();
    } finally {
      spy.mockResolvedValue(true);
    }
  });
});

describe('signed out', () => {
  test('sign in shows ambient art behind the form without blocking it', async () => {
    await AsyncStorage.clear();
    await seedSignedOutLearner();
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/sign-in' });
    expect(await screen.findByText('Welcome back', {}, wait)).toBeOnTheScreen();
    expect(ambient()[0]!.props.pointerEvents).toBe('none');
    // The form still takes input and presses.
    await user.press(screen.getByRole('button', { name: 'Sign In' }));
    expect(await screen.findByText('Enter your email address.', {}, wait)).toBeOnTheScreen();
  });
});
