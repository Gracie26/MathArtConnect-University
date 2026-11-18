/**
 * Topic 3 on screen: every Chapter 3 section opens as its own page with all of
 * its worked examples and figures, and every lesson step opens. §3.4 is one
 * page for its four subtopics.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { differentialTopic } from '@/content/topics/differential';
import type { SourceSection } from '@/content/types';
import { seedSignedInLearner } from '@/test-utils/auth';

jest.setTimeout(400_000);

beforeEach(async () => {
  await AsyncStorage.clear();
  await seedSignedInLearner();
});

const TOPIC = differentialTopic.id;
const sections = differentialTopic.sections ?? [];
const wait = { timeout: 20_000 };
const examplesIn = (s: SourceSection) => s.blocks.filter((b) => b.type === 'workedExample').length;
/** Figure cards on the page plus figures drawn inside worked examples. */
const figuresIn = (s: SourceSection) =>
  s.blocks.filter((b) => b.type === 'figure').length +
  s.blocks.filter((b) => b.type === 'workedExample' && b.figure).length;

describe('every Chapter 3 section opens with all of its content', () => {
  test.each(sections.map((s) => [s.label, s] as const))('section %s', async (_label, section) => {
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/section/${section.id}` });
    expect((await screen.findAllByText(section.label, {}, wait))[0]).toBeOnTheScreen();
    expect(screen.getAllByRole('header', { name: section.heading })[0]).toBeOnTheScreen();
    expect(screen.queryAllByText('WORKED EXAMPLE')).toHaveLength(examplesIn(section));
    expect(screen.queryAllByRole('image', { name: /^(Figure|Illustration)/ })).toHaveLength(figuresIn(section));
  });

  test('the §3.4 page holds all seven §3.4 examples and both printed figures', () => {
    const s34 = sections.find((s) => s.label === '3.4')!;
    expect(examplesIn(s34)).toBe(7);
    expect(s34.blocks.filter((b) => b.type === 'figure').length).toBe(2);
  });
});

describe('every lesson step opens', () => {
  const steps = differentialTopic.units.flatMap((u) => u.steps.map((s) => [u.slug, s.key, s.title] as const));
  test.each(steps)('%s · %s', async (slug, key, title) => {
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/${slug}?step=${key}` });
    expect((await screen.findAllByText(title, {}, wait))[0]).toBeOnTheScreen();
  });
});

describe('the topic page', () => {
  test('lists all nine subtopics', async () => {
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}` });
    for (const unit of differentialTopic.units) {
      expect((await screen.findAllByText(unit.title, {}, wait))[0]).toBeOnTheScreen();
    }
  });
});
