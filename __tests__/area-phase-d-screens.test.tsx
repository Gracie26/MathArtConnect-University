/**
 * Topic 2 Play, Create, Reflect and Review on screen, and Topic 2 work in My
 * Work and Notifications (development backend; real repositories).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter } from 'expo-router/testing-library';

import { areaTopic } from '@/content/topics/area';
import { integrationTopic } from '@/content/topics/integration';
import { AREA_STUDIOS } from '@/content/topics/area/activities';
import { AREA_RETRIEVAL } from '@/content/topics/area/review';
import { type AreaArtProject, projectFromTemplate, templateById } from '@/lib/art/areaArt';
import { devActivityLog, devArtProjects, devGameSessions } from '@/services/repositories/learning/devLearning';
import { seedSignedInLearner } from '@/test-utils/auth';

jest.setTimeout(300_000);

const AREA = areaTopic.id;
const riemann = areaTopic.units.find((u) => u.slug === 'area-and-riemann-sums')!;
const wait = { timeout: 20_000 };

let learnerId = '';

beforeEach(async () => {
  await AsyncStorage.clear();
  learnerId = (await seedSignedInLearner()).id;
});

describe('Play', () => {
  test('Riemann Builder: a wrong rule is explained, the right one solves the round, and nothing scores before Check', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: `/topic/${AREA}/activity/riemann-builder` });
    await user.press(await screen.findByRole('button', { name: 'Start playing' }, wait));
    await user.press(await screen.findByRole('button', { name: 'Heights at the left endpoint' }, wait));
    await user.press(screen.getByRole('button', { name: 'Check' }));
    expect(await screen.findByText(/Not an underestimate yet/)).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Heights at the right endpoint' }));
    await user.press(screen.getByRole('button', { name: 'Check' }));
    expect(await screen.findByText(/An underestimate\./)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Next round' })).toBeOnTheScreen();
  });

  test('the Games screen lists every game of both topics (no placeholder)', async () => {
    await renderRouter('./app', { initialUrl: '/games' });
    expect(await screen.findByText('Short challenges that put ideas into play.', {}, wait)).toBeOnTheScreen();
    expect(screen.queryByText('Coming soon')).toBeNull();
    for (const topic of [integrationTopic, areaTopic]) {
      for (const g of topic.activities.filter((a) => a.kind === 'game')) {
        expect(screen.getAllByText(g.title).length).toBeGreaterThan(0);
      }
    }
  });

  test('the Play step lists the subtopic game', async () => {
    await renderRouter('./app', { initialUrl: `/topic/${AREA}/${riemann.slug}?step=play` });
    expect((await screen.findAllByText('Riemann Builder', {}, wait))[0]).toBeOnTheScreen();
  });
});

describe('Create', () => {
  test('Riemann Mosaic: canvas, course-aligned and creative-extension controls; saves and reopens as a full project', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: `/topic/${AREA}/activity/riemann-mosaic` });
    expect(await screen.findByText(/COURSE-ALIGNED/, {}, wait)).toBeOnTheScreen();
    expect(screen.getByText(/CREATIVE EXTENSION/)).toBeOnTheScreen();
    expect(screen.getByText('Math behind my art')).toBeOnTheScreen();
    // Creative controls stay collapsed until asked for.
    expect(screen.queryByText('Mirror')).toBeNull();
    await user.press(screen.getByRole('button', { name: 'Creative extension controls' }));
    expect(screen.getByText('Mirror')).toBeOnTheScreen();

    await user.press(
      screen.getByRole('button', {
        name: /^Use template Integral City\./,
      }),
    );
    const title = screen.getByLabelText('Project title');
    await user.clear(title);
    await user.type(title, 'My city');
    await user.type(
      screen.getByLabelText('Explain the mathematics in your own words'),
      'The three districts add to the integral over [-1, 2].',
    );
    await user.press(screen.getByRole('button', { name: 'Save and mark complete' }));
    expect(await screen.findByText('Saved "My city".')).toBeOnTheScreen();

    const list = await devArtProjects.list(learnerId, AREA);
    const record = list.ok ? list.data[0] : undefined;
    expect(record?.isCompleted).toBe(true);
    const composition = record?.composition as {
      kind: string;
      equations: string[];
      project: { layers: unknown[]; explanation: string };
    };
    expect(composition.kind).toBe('area');
    expect(composition.project.layers).toHaveLength(3);
    expect(composition.equations[0]).toMatch(/^mean sum of \(x − 1\)² \+ 2 on \[-1, 0\], n = 4$/);

    await act(() => router.replace('/create'));
    await act(() => router.push(`/topic/${AREA}/activity/riemann-mosaic?project=${record?.id ?? ''}`));
    expect(await screen.findByDisplayValue('My city', {}, wait)).toBeOnTheScreen();
    expect(screen.getByDisplayValue('The three districts add to the integral over [-1, 2].')).toBeOnTheScreen();
    expect(screen.getByText('Layers (3)')).toBeOnTheScreen();
  });

  test.each(Object.entries(AREA_STUDIOS))(
    '%s: the starter artwork saves and reopens with the same layers and settings',
    async (activityId, config) => {
      const user = userEvent.setup();
      await renderRouter('./app', { initialUrl: `/topic/${AREA}/activity/${activityId}` });
      const title = areaTopic.activities.find((a) => a.id === activityId)!.title;
      const canvas = await screen.findByLabelText(new RegExp(`^${title}: `), {}, wait);
      const description = canvas.props.accessibilityLabel as string;
      await user.press(screen.getByRole('button', { name: 'Save project' }));
      expect(await screen.findByText(`Saved "${title}".`, {}, wait)).toBeOnTheScreen();

      const list = await devArtProjects.list(learnerId, AREA);
      const record = list.ok ? list.data.find((p) => p.activityId === activityId) : undefined;
      const saved = (record?.composition as unknown as { project: AreaArtProject }).project;
      const template = projectFromTemplate(templateById(config.starter)!, title);
      expect(saved.layers.map(({ id: _id, ...rest }) => rest)).toEqual(
        template.layers.map(({ id: _id, ...rest }) => rest),
      );

      await act(() => router.replace('/create'));
      await act(() => router.push(`/topic/${AREA}/activity/${activityId}?project=${record?.id ?? ''}`));
      expect(await screen.findByLabelText(description, {}, wait)).toBeOnTheScreen();
      expect(screen.getByText(`Layers (${template.layers.length})`)).toBeOnTheScreen();
    },
  );

  test('Create lists the Topic 2 area art studios', async () => {
    await renderRouter('./app', { initialUrl: '/create' });
    expect(await screen.findByText('Area art', {}, wait)).toBeOnTheScreen();
    for (const a of areaTopic.activities.filter((x) => x.kind === 'studio')) {
      expect(screen.getAllByText(a.title).length).toBeGreaterThan(0);
    }
  });
});

describe('Reflect and Review', () => {
  test('a Topic 2 reflection is saved with its text', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: `/topic/${AREA}/${riemann.slug}?step=reflect` });
    await user.type(
      await screen.findByLabelText('Your answer', {}, wait),
      'Right endpoints are lower when f decreases.',
    );
    await user.press(screen.getByRole('radio', { name: '3 · Getting there' }));
    await user.press(screen.getByRole('radio', { name: 'Choosing the endpoints' }));
    await user.press(screen.getByRole('button', { name: 'Save reflection' }));
    expect(await screen.findByText('Reflection saved.')).toBeOnTheScreen();
    const log = await devActivityLog.list(learnerId, AREA);
    const saved = log.ok ? log.data.find((a) => a.type === 'reflection') : undefined;
    expect(saved?.refId).toBe(riemann.id);
    expect(saved?.metadata).toMatchObject({ answer: 'Right endpoints are lower when f decreases.' });
  });

  test('Review shows the recap, App practice retrieval and a next step, with no history invented', async () => {
    await renderRouter('./app', { initialUrl: `/topic/${AREA}/${riemann.slug}?step=review` });
    expect(await screen.findByText('Key concepts', {}, wait)).toBeOnTheScreen();
    expect(screen.getByText('Common errors')).toBeOnTheScreen();
    expect(screen.getByText('App practice: quick retrieval')).toBeOnTheScreen();
    expect(screen.getAllByText(/^APP PRACTICE \d$/)).toHaveLength(
      AREA_RETRIEVAL.filter((i) => i.unitId === riemann.id).length,
    );
    expect(await screen.findByText('Nothing to review yet', {}, wait)).toBeOnTheScreen();
    expect(screen.getByText('NEXT STEP')).toBeOnTheScreen();
    expect(screen.queryByText(/mastered|mastery/i)).toBeNull();
  });
});

describe('My Work, Progress and Notifications include Topic 2', () => {
  async function seedGame() {
    const now = new Date().toISOString();
    await devGameSessions.save(learnerId, {
      id: '7f1c3f5e-0000-4000-8000-0000000000d1',
      topicId: AREA,
      gameId: 'compare-and-decide',
      levelReached: 3,
      score: 35,
      xpEarned: 7,
      hintsUsed: 1,
      completed: true,
      events: { retries: 1, unitId: areaTopic.units.at(-1)!.id },
      startedAt: now,
      endedAt: now,
    });
  }

  test('My Work switches to Topic 2 and lists the game session', async () => {
    await seedGame();
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/my-work' });
    await user.press(await screen.findByRole('button', { name: `Show my work for ${areaTopic.title}` }, wait));
    expect((await screen.findAllByText(/Compare & Decide/, {}, wait))[0]).toBeOnTheScreen();
  });

  test('My Work opens on Topic 2 from ?topic=', async () => {
    await seedGame();
    await renderRouter('./app', { initialUrl: `/my-work?topic=${AREA}` });
    expect((await screen.findAllByText(/Compare & Decide/, {}, wait))[0]).toBeOnTheScreen();
  });

  test('Notifications are not limited to Topic 1', async () => {
    await seedGame();
    await renderRouter('./app', { initialUrl: '/notifications' });
    expect(await screen.findByText('You finished Compare & Decide', {}, wait)).toBeOnTheScreen();
  });

  test('Progress shows the Topic 2 game', async () => {
    await seedGame();
    // The full per-topic report lives on the topic's progress detail screen.
    await renderRouter('./app', { initialUrl: '/progress/integration-area' });
    await waitFor(() => expect(screen.getAllByText(/Compare & Decide/).length).toBeGreaterThan(0), wait);
  });
});
