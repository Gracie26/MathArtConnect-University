// RNTL 14 render() is async; expo-router's renderRouter returns that promise.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { screen, userEvent } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { seedSignedInLearner, TEST_LEARNER } from '@/test-utils/auth';

// Full-router renders are slow on a cold module cache, so allow more than the 5 s default.
jest.setTimeout(60_000);

beforeEach(async () => {
  await AsyncStorage.clear();
  await seedSignedInLearner();
});

describe('app shell (signed-in learner, development backend)', () => {
  test('Home greets the learner and shows real Integration data, never placeholder progress', async () => {
    await renderRouter('./app', { initialUrl: '/' });

    expect(
      await screen.findByText(/^Good (morning|afternoon|evening), Ada$/, {}, { timeout: 20_000 }),
    ).toBeOnTheScreen();
    expect(
      await screen.findByLabelText('Start Understanding Integration, Integration', {}, { timeout: 20_000 }),
    ).toBeOnTheScreen();
    expect(screen.getByText('START LEARNING')).toBeOnTheScreen();
    expect(screen.getByText('0% complete')).toBeOnTheScreen();
    expect(screen.getByLabelText('Study streak: 0 days in a row')).toBeOnTheScreen();
    expect(screen.getByLabelText('0 XP earned')).toBeOnTheScreen();
    // No mastery score: practice accuracy waits for enough checked answers.
    expect(screen.getByLabelText('Practice accuracy appears after 5 checked answers; 0 so far')).toBeOnTheScreen();
    expect(screen.queryByText(/mastery/i)).toBeNull();
    // Quick actions were removed from Home; the Practice hub and Games are linked from Learn.
    expect(screen.queryByText('Quick actions')).toBeNull();
    // Nothing started and nothing to review: no next-step or review card.
    expect(screen.queryByText('Next best step')).toBeNull();
    expect(screen.queryByText(/^Review \d+ mistake/)).toBeNull();
    expect(screen.getByText('No activity yet')).toBeOnTheScreen();
    // The old mock values are gone.
    expect(screen.queryByText('Derivatives')).toBeNull();
    expect(screen.queryByText('72% complete')).toBeNull();
    expect(screen.queryByText(/Grace/)).toBeNull();
    expect(screen.queryByText(/In development/)).toBeNull();
  });

  test('Learn links to the Practice hub and all games', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/learn' });

    expect(await screen.findByLabelText('Practice hub', {}, { timeout: 20_000 })).toBeOnTheScreen();
    await user.press(await screen.findByLabelText('All games', {}, { timeout: 20_000 }));
    expect(
      await screen.findByText('Short challenges that put ideas into play.', {}, { timeout: 20_000 }),
    ).toBeOnTheScreen();
  });

  test('avatar opens Profile with account details and links to Appearance & Motion', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/' });

    await user.press(await screen.findByLabelText('Open profile and settings'));
    expect(await screen.findByText(TEST_LEARNER.email)).toBeOnTheScreen();
    expect(screen.getByLabelText('Institution, University of Namibia')).toBeOnTheScreen();
    // The programme is shown in full: an accessible label with the whole value, and text that wraps.
    expect(screen.getByLabelText('Programme / Course, BSc')).toBeOnTheScreen();
    expect(screen.getByText('BSc').props.numberOfLines).toBeUndefined();
    expect(screen.getByLabelText('Year of study, 1st year')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Appearance & Motion' }));
    expect(await screen.findByText('Motion and background')).toBeOnTheScreen();
  });

  test('appearance defaults to Light and can switch to Dark', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/settings' });

    expect(await screen.findByLabelText('Light appearance')).toBeChecked();
    await user.press(screen.getByLabelText('Dark appearance'));
    expect(screen.getByLabelText('Dark appearance')).toBeChecked();
  });

  test.each([
    ['/learn', 'Your topics'],
    ['/explore', 'Visual Calculus Lab'],
    ['/create', 'Create mathematics visually.'],
    ['/progress', 'Your learning at a glance.'],
    ['/my-work', 'My learning history: attempts, mistakes, games and saved creations.'],
    // Review Mistakes opens Review My Work on its Needs review filter.
    ['/mistakes', 'My learning history: attempts, mistakes, games and saved creations.'],
    ['/games', 'Short challenges that put ideas into play.'],
    ['/practice', 'Hints and walkthroughs are app guidance, not official UNAM or lecturer solutions.'],
    ['/notifications', 'Reminders and updates about your learning.'],
    ['/terms', 'Draft / pending final research and legal review'],
    ['/privacy', 'Draft / pending final research and legal review'],
  ])('route %s renders', async (url, text) => {
    await renderRouter('./app', { initialUrl: url });
    expect(await screen.findByText(text)).toBeOnTheScreen();
  });
});
