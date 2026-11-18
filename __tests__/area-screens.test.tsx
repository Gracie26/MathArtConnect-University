/**
 * Topic 2 on screen: every source section opens as its own page with all of
 * its worked examples, figures, Try it and tutorial questions; every lesson
 * step opens; Chapter practice and Tutorial 2 practice are reachable; My
 * Working checks definite-integral working; and every Explore tool opens.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { screen, userEvent } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { areaTopic } from '@/content/topics/area';
import type { SourceSection } from '@/content/types';
import { isPracticeItemVisible } from '@/content/visibility';
import { seedSignedInLearner } from '@/test-utils/auth';

jest.setTimeout(400_000);

beforeEach(async () => {
  await AsyncStorage.clear();
  await seedSignedInLearner();
});

const sections = areaTopic.sections ?? [];
const visible = (items: SourceSection['tryIt']) =>
  items.filter((i) => isPracticeItemVisible(i, { reviewerMode: false }));
const examplesIn = (s: SourceSection) => s.blocks.filter((b) => b.type === 'workedExample').length;
/** Figure cards on the page (heading in capitals) plus figures drawn inside worked examples. */
const figuresIn = (s: SourceSection) =>
  s.blocks.filter((b) => b.type === 'figure').length +
  s.blocks.filter((b) => b.type === 'workedExample' && b.figure).length;

describe('every Chapter 2 section opens with all of its content', () => {
  test.each(sections.map((s) => [s.label, s] as const))('section %s', async (_label, section) => {
    await renderRouter('./app', { initialUrl: `/topic/integration-area/section/${section.id}` });
    expect((await screen.findAllByText(section.label))[0]).toBeOnTheScreen();
    expect(screen.getAllByRole('header', { name: section.heading })[0]).toBeOnTheScreen();
    expect(screen.queryAllByText('WORKED EXAMPLE')).toHaveLength(examplesIn(section));
    expect(screen.queryAllByRole('image', { name: /^(Figure|Illustration)/ })).toHaveLength(figuresIn(section));
    expect(screen.queryAllByRole('button', { name: 'Start working' })).toHaveLength(
      visible(section.tryIt).length + visible(section.tutorial).length,
    );
  });
});

describe('every lesson step opens', () => {
  const steps = areaTopic.units.flatMap((u) => u.steps.map((s) => [u.slug, s.key, s.title] as const));
  test.each(steps)('%s · %s', async (slug, key, title) => {
    await renderRouter('./app', { initialUrl: `/topic/integration-area/${slug}?step=${key}` });
    expect((await screen.findAllByText(title, {}, { timeout: 20_000 }))[0]).toBeOnTheScreen();
  });
});

describe('practice', () => {
  test('Tutorial 2 practice lists all 67 learner-visible parts; Chapter practice the You Try It', async () => {
    await renderRouter('./app', { initialUrl: '/topic/integration-area/practice?mode=independent&source=tutorial' });
    expect(await screen.findByText('67 questions')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Show Tutorial 2 practice' })).toBeOnTheScreen();
  });

  test('Chapter practice', async () => {
    await renderRouter('./app', { initialUrl: '/topic/integration-area/practice?mode=independent&source=chapter' });
    expect(await screen.findByText('1 question')).toBeOnTheScreen();
  });

  test('filtering by method', async () => {
    await renderRouter('./app', {
      initialUrl: '/topic/integration-area/practice?mode=independent&source=tutorial&method=midpoint-rule',
    });
    expect(await screen.findByText('6 questions')).toBeOnTheScreen();
  });

  test('the topic page links to both practice sources', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration-area' });
    // Practice is folded away on the topic page until asked for.
    await user.press(await screen.findByRole('button', { name: /^Practice\./ }));
    await user.press(await screen.findByRole('button', { name: /^Tutorial 2 practice\./ }));
    expect(await screen.findByText('67 questions')).toBeOnTheScreen();
  });

  test('You Try It in My Working: steps, hints, I’m stuck and the final answer', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration-area/the-definite-integral?step=try-it' });
    await user.press(await screen.findByRole('button', { name: 'Start working' }));
    expect(screen.getByText('MY WORKING')).toBeOnTheScreen();
    expect(screen.queryByText(/on paper/)).toBeNull();

    await user.type(screen.getByLabelText('Step 1'), 'Δx = 1/n');
    await user.press(screen.getByRole('button', { name: 'Check step 1' }));
    expect(await screen.findByText('Correct: Δx = (b − a)/n.')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Add step' }));
    await user.type(screen.getByLabelText('Step 2'), '(n+2)/(2n)');
    await user.press(screen.getByRole('button', { name: 'Check step 2' }));
    expect(await screen.findByText(/doesn't match the Riemann sum/)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Edit step 2' }));
    await user.clear(screen.getByLabelText('Step 2'));
    await user.type(screen.getByLabelText('Step 2'), '(n+1)/(2n)');
    await user.press(screen.getByRole('button', { name: 'Check step 2' }));
    expect(await screen.findByText(/this is the Riemann sum Rₙ/)).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Delete step 2' }));
    expect(screen.queryByLabelText('Step 2')).toBeNull();

    for (let i = 0; i < 3; i++) await user.press(screen.getByRole('button', { name: 'Hint' }));
    expect(screen.getByText('Hint 3 · Next action')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: "I'm stuck" }));
    expect(screen.getByRole('button', { name: 'Show Full Walkthrough' })).toBeOnTheScreen();

    await user.type(screen.getByLabelText(/^Final answer/), '1/2');
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(await screen.findByText('Correct!')).toBeOnTheScreen();
  });
});

describe('Explore tools', () => {
  test.each(areaTopic.activities.map((a) => [a.title, a.id] as const))('%s opens', async (title, id) => {
    await renderRouter('./app', { initialUrl: `/topic/integration-area/activity/${id}` });
    expect((await screen.findAllByText(title, {}, { timeout: 20_000 }))[0]).toBeOnTheScreen();
    expect(screen.queryByText('This activity is not available.')).toBeNull();
  });

  test('the Riemann Sum Explorer switches between the four rules', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration-area/activity/riemann-sum-explorer' });
    expect(await screen.findByText('Riemann Sum Explorer')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Left endpoints' }));
    expect(screen.getByLabelText(/heights read at the left endpoint/)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Midpoints' }));
    expect(screen.getByLabelText(/heights read at the midpoint/)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Sample points' }));
    expect(screen.getByLabelText(/heights read at a sample point/)).toBeOnTheScreen();
  });
});
