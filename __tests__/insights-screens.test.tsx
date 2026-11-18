import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { integrationTopic } from '@/content/topics/integration';
import {
  devActivityLog,
  devArtProjects,
  devGameSessions,
  devQuestionAttempts,
} from '@/services/repositories/learning/devLearning';
import { devLessonProgress } from '@/services/repositories/lessonProgress/devLessonProgress';
import { seedSignedInLearner } from '@/test-utils/auth';

jest.setTimeout(300_000);

const topic = integrationTopic;
const substitution = topic.units[2]!;
const understanding = topic.units[0]!;
const subItem = (topic.practiceItems ?? []).find(
  (i) => i.unitId === substitution.id && i.technique === 'u-substitution' && !i.withheldFromLearners,
)!;

let learnerId = '';
let seq = 0;
const id = () => `7f1c3f5e-0000-4000-8000-${String(++seq).padStart(12, '0')}`;

beforeEach(async () => {
  await AsyncStorage.clear();
  learnerId = (await seedSignedInLearner()).id;
});

async function seed() {
  for (const step of understanding.steps.filter((s) => s.required)) {
    await devLessonProgress.completeSection(learnerId, understanding.id, step.key);
  }
  await devLessonProgress.completeSection(learnerId, substitution.id, 'concept');
  for (const correct of [false, false, false]) {
    await devQuestionAttempts.record(learnerId, {
      id: id(),
      topicId: topic.id,
      unitId: substitution.id,
      questionId: subItem.id,
      retryOfId: null,
      learnerAnswer: { answer: 'x^2', steps: ['u = x^2 + 2'], outcome: 'incorrect' },
      isCorrect: correct,
      hintsUsed: 2,
      hintLevelsViewed: [1, 2],
      viewedSteps: false,
      viewedAnswer: false,
    });
  }
  await devGameSessions.save(learnerId, {
    id: id(),
    topicId: topic.id,
    gameId: 'reverse-the-derivative',
    levelReached: 2,
    score: 60,
    xpEarned: 12,
    hintsUsed: 0,
    completed: true,
    events: { retries: 0 },
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
  });
  await devArtProjects.save(learnerId, {
    id: id(),
    topicId: topic.id,
    activityId: 'equation-art-studio',
    title: 'Bridge sketch',
    composition: {},
    isCompleted: false,
  });
  await devActivityLog.record(learnerId, {
    id: id(),
    type: 'explore',
    refId: 'family-of-curves',
    topicId: topic.id,
    summary: 'Explored Family of Curves',
    xp: 5,
    metadata: {},
  });
}

describe('Progress', () => {
  test('overview with no record: nothing started, nothing invented', async () => {
    await renderRouter('./app', { initialUrl: '/progress' });
    expect(await screen.findByLabelText('0 of 4 topics started')).toBeOnTheScreen();
    expect(screen.getByLabelText('Nothing to review')).toBeOnTheScreen();
    expect(screen.getAllByText('No practice checked yet')).toHaveLength(4);
    expect(screen.queryByText('Worth doing next')).toBeNull();
    expect(screen.queryByText(/mastery/i)).toBeNull();
  });

  test('overview with real data: totals, a rule-based insight, and a card that opens the full report', async () => {
    await seed();
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/progress' });
    expect(await screen.findByLabelText('1 of 4 topics started')).toBeOnTheScreen();
    expect(screen.getByText('Worth doing next')).toBeOnTheScreen();
    expect(screen.getByText('Review Substitution · Integration')).toBeOnTheScreen();
    expect(screen.getByText('1 of 7 subtopics completed')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'View progress details for Integration' }));
    expect(await screen.findByText('Lesson completion')).toBeOnTheScreen();
  });

  test('with no record the topic report says how to begin, and shows no invented numbers', async () => {
    await renderRouter('./app', { initialUrl: '/progress/integration' });
    expect(await screen.findByText(/Start a lesson in Integration to begin tracking progress/)).toBeOnTheScreen();
    expect(screen.queryByText(/Coming soon/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Start Understanding Integration' })).toBeOnTheScreen();
  });

  test('real data: completion, all seven subtopics, practice separate from completion, games, next steps', async () => {
    await seed();
    await renderRouter('./app', { initialUrl: '/progress/integration' });
    expect(await screen.findByText('Lesson completion')).toBeOnTheScreen();
    expect(screen.getByLabelText('1/7 Lessons completed')).toBeOnTheScreen();
    for (const [i, unit] of topic.units.entries()) {
      expect(screen.getByLabelText(new RegExp(`^${i + 1}\\. ${unit.title}\\.`))).toBeOnTheScreen();
    }
    expect(
      screen.getByLabelText(/^3\. Substitution\. Needs attention\. 0% of 3 checked answers were correct\./),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText('0% Accuracy. of 3 checked answers')).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Choose U\. Not played yet\./)).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Reverse the Derivative\. Best score 60/)).toBeOnTheScreen();
    expect(screen.getByText('Review Substitution')).toBeOnTheScreen();
    expect(screen.getByText('Try Substitution Highlighter')).toBeOnTheScreen();
    expect(screen.getByText(/Complete more practice to see improvement trends/)).toBeOnTheScreen();
    expect(screen.getByText(/never used for progress or standing/)).toBeOnTheScreen();
  });

  test('a recommendation opens the right screen', async () => {
    await seed();
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/progress/integration' });
    await user.press(await screen.findByRole('button', { name: 'Open Substitution Highlighter' }));
    expect(await screen.findByText('EXPLORE · SUBSTITUTION')).toBeOnTheScreen();
  });
});

describe('Review My Work', () => {
  test('empty state', async () => {
    await renderRouter('./app', { initialUrl: '/my-work' });
    expect(await screen.findByText('You have no previous attempts yet')).toBeOnTheScreen();
  });

  test('history, mistakes, working, retry, filters and saved creations', async () => {
    await seed();
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/my-work' });
    expect(await screen.findByText('Substitution: choosing u and du (1)')).toBeOnTheScreen();
    expect(screen.getAllByText('Played Reverse the Derivative').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Saved Equation Art Studio project').length).toBeGreaterThan(0);

    await user.press(screen.getAllByRole('button', { name: 'View my working' })[0]!);
    expect(await screen.findByText('Step 1: u = x^2 + 2')).toBeOnTheScreen();
    expect(screen.getByText('My answer: x^2')).toBeOnTheScreen();
    expect(screen.getAllByRole('button', { name: 'Retry' }).length).toBeGreaterThan(0);

    await user.press(screen.getByRole('button', { name: 'Show Games' }));
    expect(await screen.findByText('Games history')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Play Reverse the Derivative again' })).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Show Create' }));
    expect(await screen.findByText('Bridge sketch')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Duplicate' }));
    expect(await screen.findByText('Bridge sketch (copy)')).toBeOnTheScreen();
    await user.press(screen.getAllByRole('button', { name: 'Delete' })[0]!);
    expect(await screen.findByText('Delete this project?')).toBeOnTheScreen();
    await user.press(screen.getAllByRole('button', { name: 'Delete' }).at(-1)!);
    await waitFor(async () => {
      const list = await devArtProjects.list(learnerId, topic.id);
      expect(list.ok && list.data).toHaveLength(1);
    });

    await user.press(screen.getByRole('button', { name: 'Show Lessons' }));
    expect(await screen.findByText('Lesson history')).toBeOnTheScreen();
    expect(screen.getAllByRole('button', { name: /^Continue: / }).length).toBeGreaterThan(0);
  });

  test('retry navigation opens the question in its lesson', async () => {
    await seed();
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/my-work?kind=practice' });
    await user.press(await screen.findByRole('button', { name: 'Open in the lesson' }));
    expect(await screen.findByText(`INTEGRATION · SUBTOPIC 3 OF 7`)).toBeOnTheScreen();
  });

  test('Review Mistakes opens the needs-review filter', async () => {
    await seed();
    await renderRouter('./app', { initialUrl: '/mistakes' });
    expect(await screen.findByRole('button', { name: 'Needs review, 1' })).toBeSelected();
  });
});

describe('Notifications', () => {
  test('the Home bell shows unread notifications', async () => {
    await seed();
    await renderRouter('./app', { initialUrl: '/' });
    const bell = await screen.findAllByLabelText(/^Notifications/, {}, { timeout: 15_000 });
    expect(bell.map((e) => e.props.accessibilityLabel)).toContainEqual(
      expect.stringMatching(/^Notifications, [0-9]+ unread$/),
    );
  });

  test('empty state', async () => {
    await renderRouter('./app', { initialUrl: '/notifications' });
    expect(await screen.findByText('You’re all caught up')).toBeOnTheScreen();
    expect(screen.getByText(/does not send phone push notifications yet/)).toBeOnTheScreen();
  });

  test('read and unread, mark as read, mark all, dismiss, settings and navigation', async () => {
    await seed();
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/notifications' });
    const heading = await screen.findByText(/^\d+ unread$/);
    const before = Number(heading.props.children.toString().split(' ')[0]);
    expect(before).toBeGreaterThan(3);

    await user.press(screen.getByRole('button', { name: /^Mark as read: You completed Understanding Integration$/ }));
    expect(await screen.findByText(`${before - 1} unread`)).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: /^Dismiss: Your Equation Art Studio project was saved$/ }));
    expect(screen.queryByText('Your Equation Art Studio project was saved')).toBeNull();

    await user.press(screen.getByRole('button', { name: /^Mark all \d+ notifications as read$/ }));
    await waitFor(() => expect(screen.queryByText(/unread$/)).toBeNull());

    // Choices are kept on the device.
    const stored = JSON.parse((await AsyncStorage.getItem(`mathart.notifications.v1.${learnerId}`)) ?? '{}');
    expect(stored.dismissed.length).toBe(1);

    await user.press(screen.getByRole('button', { name: /Lots of hints in Substitution\./ }));
    expect(await screen.findByText('EXPLORE · SUBSTITUTION')).toBeOnTheScreen();
  });

  test('settings turn a kind of in-app notification off and on', async () => {
    await seed();
    await renderRouter('./app', { initialUrl: '/notifications' });
    expect(await screen.findByText('Practice to review in Substitution')).toBeOnTheScreen();
    await act(async () => {
      fireEvent(screen.getByRole('switch', { name: 'Review reminders (in-app)' }), 'valueChange', false);
    });
    await waitFor(() => expect(screen.queryByText('Practice to review in Substitution')).toBeNull());
    expect(screen.getByText('You completed Understanding Integration')).toBeOnTheScreen();
    await act(async () => {
      fireEvent(screen.getByRole('switch', { name: 'Review reminders (in-app)' }), 'valueChange', true);
    });
    expect(await screen.findByText('Practice to review in Substitution')).toBeOnTheScreen();
  });
});
