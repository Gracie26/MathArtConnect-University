/**
 * Cross-topic screens with Topic 3 registered: Learn, Practice, My Work,
 * Progress, Notifications, Explore and Create all work for Topics 1–3, and a
 * Topic 3 attempt shows up in My Work and Progress for the right topic.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { screen, userEvent } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { listLearnerTopics } from '@/content/registry';
import { differentialTopic } from '@/content/topics/differential';
import { devQuestionAttempts } from '@/services/repositories/learning/devLearning';
import { seedSignedInLearner } from '@/test-utils/auth';

jest.setTimeout(400_000);

const wait = { timeout: 20_000 };
const titles = listLearnerTopics().map((t) => t.title);

let learnerId = '';
beforeEach(async () => {
  await AsyncStorage.clear();
  learnerId = (await seedSignedInLearner()).id;
});

test('Topic 3 is registered after Topics 1 and 2 (Topic 4 follows it)', () => {
  expect(listLearnerTopics().map((t) => t.id)).toEqual([
    'integration',
    'integration-area',
    'differential-calculus-rn',
    'partial-derivative-applications',
  ]);
  expect(titles[2]).toBe(differentialTopic.title);
});

test('Learn lists every topic', async () => {
  await renderRouter('./app', { initialUrl: '/learn' });
  for (const title of titles) expect((await screen.findAllByText(title, {}, wait))[0]).toBeOnTheScreen();
  // The topic in focus (Topic 1 for a new learner) is the full card; the others are compact rows.
  expect(screen.getByText('CALCULUS II · TOPIC 1')).toBeOnTheScreen();
  for (const n of [2, 3, 4]) expect(screen.getByText(`TOPIC ${n}`)).toBeOnTheScreen();
});

test('Progress lists Topic 3 alongside Topics 1 and 2', async () => {
  await renderRouter('./app', { initialUrl: '/progress' });
  expect(await screen.findAllByText('Not started yet', {}, wait)).toHaveLength(titles.length);
  for (const title of titles) expect(screen.getByText(title)).toBeOnTheScreen();
  for (const n of [1, 2, 3, 4]) expect(screen.getByText(`TOPIC ${n}`)).toBeOnTheScreen();
});

test('Explore and Create list Topic 3 activities', async () => {
  await renderRouter('./app', { initialUrl: '/explore' });
  // Explore shows one topic at a time: choose Topic 3 with the topic switcher.
  await userEvent.setup().press(await screen.findByRole('tab', { name: /^Topic 3: / }, wait));
  expect((await screen.findAllByText('Interactive Figure 3.2', {}, wait))[0]).toBeOnTheScreen();
  await renderRouter('./app', { initialUrl: '/create' });
  expect((await screen.findAllByText('Domain Region Studio', {}, wait))[0]).toBeOnTheScreen();
});

test('Notifications opens with every topic registered', async () => {
  await renderRouter('./app', { initialUrl: '/notifications' });
  expect(await screen.findByText('Reminders and updates about your learning.', {}, wait)).toBeOnTheScreen();
  expect(await screen.findByText('You’re all caught up', {}, wait)).toBeOnTheScreen();
});

test('a Topic 3 practice attempt appears in My Work under Topic 3', async () => {
  const user = userEvent.setup();
  const unit = differentialTopic.units[0]!;
  await renderRouter('./app', {
    initialUrl: `/topic/${differentialTopic.id}/practice?mode=independent&unit=${unit.slug}&source=tutorial-3`,
  });
  await screen.findByText('Tutorial 3 · Q1(i)', {}, wait);
  await user.press(screen.getAllByRole('button', { name: 'Start working' })[0]!);
  await user.type(screen.getByLabelText(/^Final answer/), '31');
  await user.press(screen.getByRole('button', { name: 'Check answer' }));
  expect(await screen.findByText(/Correct/, {}, wait)).toBeOnTheScreen();
  const attempts = await devQuestionAttempts.list(learnerId, differentialTopic.id);
  expect(attempts.ok && attempts.data.map((a) => [a.questionId, a.isCorrect])).toEqual([['tut3-q1-i', true]]);

  await renderRouter('./app', { initialUrl: `/my-work?topic=${differentialTopic.id}` });
  expect((await screen.findAllByText(/Evaluating functions of two variables/, {}, wait))[0]).toBeOnTheScreen();
});
