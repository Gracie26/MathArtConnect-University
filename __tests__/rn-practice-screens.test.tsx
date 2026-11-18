/**
 * Topic 3 practice on screen: the Practice hub lists Tutorial 3, Tutorial 4
 * and App practice with their real counts; each card shows its source; a
 * checked answer is graded and saved; a written question is compared with
 * the suggested working and never graded; Advanced tutorial practice is
 * labelled; and Q17 links to its Topic 2 prerequisite.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { screen, userEvent } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { differentialTopic, RN_UNITS as U } from '@/content/topics/differential';
import { devQuestionAttempts } from '@/services/repositories/learning/devLearning';
import { seedSignedInLearner } from '@/test-utils/auth';

jest.setTimeout(400_000);

let learnerId = '';
beforeEach(async () => {
  await AsyncStorage.clear();
  learnerId = (await seedSignedInLearner()).id;
});

const TOPIC = differentialTopic.id;
const wait = { timeout: 20_000 };
const slug = (unitId: string) => differentialTopic.units.find((u) => u.id === unitId)!.slug;
const practice = (unitId: string, source: string) =>
  `/topic/${TOPIC}/practice?mode=independent&unit=${slug(unitId)}&source=${source}`;

describe('Topic 3 in the Practice hub', () => {
  test('lists Tutorial 3, Tutorial 4 and App practice with their real counts', async () => {
    await renderRouter('./app', { initialUrl: '/practice' });
    expect(await screen.findByRole('header', { name: differentialTopic.title }, wait)).toBeOnTheScreen();
    expect(screen.getByLabelText(`Tutorial 3, ${differentialTopic.title}, 125 questions`)).toBeOnTheScreen();
    expect(screen.getByLabelText(`Tutorial 4, ${differentialTopic.title}, 41 questions`)).toBeOnTheScreen();
    expect(screen.getByLabelText(`App practice, ${differentialTopic.title}, 3 questions`)).toBeOnTheScreen();
  });

  test('the Tutorial 4 filter shows only Tutorial 4 questions, each with its source', async () => {
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/practice?mode=independent&source=tutorial-4` });
    expect(await screen.findByText('41 questions', {}, wait)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Show Tutorial 4', selected: true })).toBeOnTheScreen();
  });
});

describe('Topic 3 practice cards', () => {
  test('a chain-rule answer is checked, graded and saved as an attempt', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: practice(U.chainOne, 'tutorial-4') });
    expect(await screen.findByText('6 questions', {}, wait)).toBeOnTheScreen();
    expect(screen.getByText('Tutorial 4 · Q11')).toBeOnTheScreen();
    await user.press(screen.getAllByRole('button', { name: 'Start working' })[0]!);
    await user.type(screen.getByLabelText(/^Final answer: dz\/dx/), '2x y^4 + (4x^2 y^3 - 2)(2x cos(x^2))');
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(await screen.findByText(/Correct/, {}, wait)).toBeOnTheScreen();

    const attempts = await devQuestionAttempts.list(learnerId, TOPIC);
    expect(attempts.ok && attempts.data.map((a) => [a.questionId, a.unitId, a.isCorrect])).toEqual([
      ['tut4-q11', U.chainOne, true],
    ]);
  });

  test('a wrong chain-rule answer is marked not yet right', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: practice(U.chainOne, 'tutorial-4') });
    await screen.findByText('6 questions', {}, wait);
    await user.press(screen.getAllByRole('button', { name: 'Start working' })[0]!);
    await user.type(screen.getByLabelText(/^Final answer: dz\/dx/), '2x y^4');
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(await screen.findByText(/Not yet/, {}, wait)).toBeOnTheScreen();
  });

  test('a written "show that" question is compared with the suggested working, never graded', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: practice(U.secondOrder, 'tutorial-4') });
    expect(await screen.findByText('Tutorial 4 · Q24', {}, wait)).toBeOnTheScreen();
    expect(
      screen.getAllByText(
        'Written answer: not checked automatically. Compare your working with the suggested working.',
      )[0],
    ).toBeOnTheScreen();
    await user.press(screen.getAllByRole('button', { name: 'Start working' })[0]!);
    expect(screen.getByRole('button', { name: 'Compare with guidance' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Check answer' })).toBeNull();
  });

  test('Tutorial 4 Q7 and Q8 are labelled Advanced tutorial practice', async () => {
    await renderRouter('./app', { initialUrl: practice(U.partials, 'tutorial-4') });
    expect(await screen.findByText('Tutorial 4 · Q7(i)', {}, wait)).toBeOnTheScreen();
    expect(screen.getAllByText('Advanced tutorial practice')).toHaveLength(4);
  });

  test('Q17 links to the Fundamental Theorem of Calculus in Topic 2', async () => {
    // The subtopic's Practise step lists all 20 of its questions (the Practice list is virtualised).
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/${slug(U.partials)}?step=practise` });
    expect(await screen.findByText('Tutorial 3 · Q17(i)', {}, wait)).toBeOnTheScreen();
    expect(screen.getAllByText('Revise: The Fundamental Theorem of Calculus')).toHaveLength(6);
  });

  test('App practice is labelled APP PRACTICE in the total differential subtopic', async () => {
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/${slug(U.totalDifferential)}?step=practise` });
    expect(await screen.findByText('APP PRACTICE: The total differential', {}, wait)).toBeOnTheScreen();
    expect(screen.getAllByText(/^APP PRACTICE \d$/)).toHaveLength(3);
  });
});
