/**
 * The Practice hub (/practice) lists every topic's real practice, by source,
 * mode and subtopic; Topic 2's written-comment question saves the learner's
 * response and shows it again later; and lesson progress for Topic 2 is
 * saved and kept.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { screen, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter } from 'expo-router/testing-library';
import { act } from 'react';

import { areaTopic } from '@/content/topics/area';
import { integrationTopic } from '@/content/topics/integration';
import { isPracticeItemVisible } from '@/content/visibility';
import { devQuestionAttempts } from '@/services/repositories/learning/devLearning';
import { devLessonProgress } from '@/services/repositories/lessonProgress/devLessonProgress';
import { seedSignedInLearner } from '@/test-utils/auth';

jest.setTimeout(300_000);

let learnerId = '';
beforeEach(async () => {
  await AsyncStorage.clear();
  learnerId = (await seedSignedInLearner()).id;
});

const visible = (items = [] as NonNullable<typeof areaTopic.practiceItems>) =>
  items.filter((i) => isPracticeItemVisible(i, { reviewerMode: false }));

describe('Practice hub', () => {
  test('lists Topic 1 and Topic 2 with their real question counts, not a placeholder', async () => {
    await renderRouter('./app', { initialUrl: '/practice' });
    expect(await screen.findByRole('header', { name: 'Integration' })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: areaTopic.title })).toBeOnTheScreen();
    expect(screen.queryByText(/Coming soon|Phase 6/)).toBeNull();

    const area = visible(areaTopic.practiceItems);
    expect(area.filter((i) => i.sourceType !== 'tutorial-question')).toHaveLength(1);
    expect(area.filter((i) => i.sourceType === 'tutorial-question')).toHaveLength(67);
    expect(screen.getByLabelText(`Chapter practice, ${areaTopic.title}, 1 question`)).toBeOnTheScreen();
    expect(screen.getByLabelText(`Tutorial 2 practice, ${areaTopic.title}, 67 questions`)).toBeOnTheScreen();

    const integration = visible(integrationTopic.practiceItems);
    const tutorial1 = integration.filter((i) => i.sourceType === 'tutorial-question').length;
    expect(screen.getByLabelText(`Tutorial practice, Integration, ${tutorial1} questions`)).toBeOnTheScreen();
  });

  test('opens Topic 2 Tutorial 2 practice and filters by subtopic', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/practice' });
    await user.press(await screen.findByLabelText(`Tutorial 2 practice, ${areaTopic.title}, 67 questions`));
    expect(await screen.findByText('67 questions')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Show 8. Comparison Test for Improper Integrals' }));
    expect(await screen.findByText('4 questions')).toBeOnTheScreen();
  });

  test('opens Topic 1 practice from the hub', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/practice' });
    await user.press(await screen.findByLabelText('Independent Practice, Integration'));
    expect(await screen.findByText('98 questions')).toBeOnTheScreen();
  });
});

describe('Q11(c): a written comment', () => {
  test('is a text response that is saved and shown again, with app guidance after saving', async () => {
    const user = userEvent.setup();
    const url = '/topic/integration-area/practice?mode=independent&source=tutorial&method=riemann-approximation';
    await renderRouter('./app', { initialUrl: url });
    const cards = await screen.findAllByRole('button', { name: 'Start working' });
    // Q11(c) is the last of the endpoint-rule questions in course order.
    await user.press(cards[cards.length - 1]!);
    expect(screen.getByText('MY RESPONSE')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Check answer' })).toBeNull();

    await user.type(screen.getByLabelText('Your comment'), 'R_n is below the area and L_n above; both approach 1.');
    await user.press(screen.getByRole('button', { name: 'Save my response' }));
    expect(await screen.findByText(/^Response saved/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Compare with app guidance' })).toBeOnTheScreen();

    // Leave and come back: the saved response is loaded again.
    await act(async () => router.replace('/practice'));
    await screen.findByRole('header', { name: 'Integration' }, { timeout: 20_000 });
    await act(async () => router.replace(url));
    const again = await screen.findAllByRole('button', { name: 'Start working' });
    await user.press(again[again.length - 1]!);
    expect(
      await screen.findByDisplayValue('R_n is below the area and L_n above; both approach 1.', {}, { timeout: 20_000 }),
    ).toBeOnTheScreen();
    expect(screen.getByText(/^Response saved/)).toBeOnTheScreen();
  });
});

describe('Topic 2 lesson progress', () => {
  test('Continue saves the step, and it is still done after navigating away and back', async () => {
    const user = userEvent.setup();
    const first = await renderRouter('./app', {
      initialUrl: '/topic/integration-area/area-and-riemann-sums?step=concept',
    });
    await user.press(await screen.findByRole('button', { name: /^Continue/ }));
    expect(screen.queryByText(/could not be saved|internet connection/i)).toBeNull();
    await screen.findAllByText('Riemann sums', {}, { timeout: 20_000 });
    const saved = await devLessonProgress.listForUnits(learnerId, ['area-riemann-sums']);
    expect(saved.ok && saved.data.map((e) => e.sectionKey)).toEqual(['concept']);

    // Leave and come back: the subtopic resumes at the next step (See it), so the save was kept.
    await act(async () => router.replace('/practice'));
    await screen.findByRole('header', { name: 'Integration' }, { timeout: 20_000 });
    await act(async () => router.replace('/topic/integration-area/area-and-riemann-sums'));
    expect((await screen.findAllByText('Riemann sums', {}, { timeout: 20_000 }))[0]).toBeOnTheScreen();
    expect(
      screen.queryByRole('button', { name: /^Continue/ }) ?? screen.queryByRole('button', { name: /^Next/ }),
    ).toBeOnTheScreen();
  });
});

describe('Topic 2 practice attempts', () => {
  test('a checked answer is saved as an attempt and is still there after leaving and coming back', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration-area/the-definite-integral?step=try-it' });
    await user.press(await screen.findByRole('button', { name: 'Start working' }, { timeout: 20_000 }));
    await user.type(screen.getByLabelText(/^Final answer/), '1/2');
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(await screen.findByText('Correct!')).toBeOnTheScreen();
    expect(screen.queryByText(/couldn’t save|internet connection/i)).toBeNull();

    await act(async () => router.replace('/practice'));
    await screen.findByRole('header', { name: 'Integration' }, { timeout: 20_000 });
    const attempts = await devQuestionAttempts.list(learnerId, 'integration-area');
    expect(attempts.ok && attempts.data.map((a) => [a.questionId, a.unitId, a.isCorrect])).toEqual([
      ['ch2-ex-2.2.1-yti', 'area-definite-integral', true],
    ]);
  });
});
