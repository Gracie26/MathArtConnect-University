import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, screen, userEvent, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { router } from 'expo-router';
import { renderRouter } from 'expo-router/testing-library';

import { INTEGRATION_ACTIVITIES } from '@/content/topics/integration/activities';
import { FLOW_CONFIGS } from '@/content/topics/integration/create';
import { integrationTopic } from '@/content/topics/integration';
import {
  devActivityLog,
  devArtProjects,
  devGameSessions,
  devQuestionAttempts,
  devXpTotal,
} from '@/services/repositories/learning/devLearning';
import { seedSignedInLearner } from '@/test-utils/auth';

// Full-router renders compile the whole app on a cold cache.
jest.setTimeout(300_000);

let learnerId = '';

beforeEach(async () => {
  await AsyncStorage.clear();
  learnerId = (await seedSignedInLearner()).id;
});

describe('tabs', () => {
  test('Explore lists the Integration tools by subtopic', async () => {
    await renderRouter('./app', { initialUrl: '/explore' });
    expect(await screen.findByText('Visual Calculus Lab')).toBeOnTheScreen();
    for (const title of [
      'Family of Curves',
      'Power Rule Machine',
      'Substitution Highlighter',
      'Transformation Lab',
      'Fraction Decomposer',
      'Trig/Algebraic Transformation Lab',
      'Choose U Lab',
      'Repeated-Parts Flow',
      'Pattern Explorer',
      'Reduction Flow',
    ]) {
      expect(screen.getByText(title)).toBeOnTheScreen();
    }
    expect(screen.getByText('Partial Fractions')).toBeOnTheScreen();
  });

  test('Create groups graph art, structure maps and solution flows', async () => {
    await renderRouter('./app', { initialUrl: '/create' });
    expect(await screen.findByText('Create mathematics visually.')).toBeOnTheScreen();
    expect(screen.getByText('Graph art')).toBeOnTheScreen();
    expect(screen.getByText('Mathematical structure maps')).toBeOnTheScreen();
    expect(screen.getByText('Solution flows')).toBeOnTheScreen();
    for (const a of INTEGRATION_ACTIVITIES.filter((x) => x.kind === 'studio')) {
      expect(screen.getByText(a.title)).toBeOnTheScreen();
    }
  });
});

describe('lesson chips open real activities', () => {
  test('Explore → Substitution Highlighter', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration/substitution?step=explore' });
    expect(screen.queryByText('Coming in a later update')).toBeNull();
    await user.press(await screen.findByLabelText(/^Open Substitution Highlighter\./));
    expect(await screen.findByText('EXPLORE · SUBSTITUTION')).toBeOnTheScreen();
    expect(screen.getByText('1. Tap the parts of the integral')).toBeOnTheScreen();
  });

  test.each([
    ['understanding-integration', 'play', 'Reverse the Derivative'],
    ['partial-fractions', 'create', 'Decomposition Map'],
    ['integration-by-parts', 'create', 'Solution Flow Builder'],
    ['algebraic-and-trigonometric-substitution', 'play', 'Transformation Challenge'],
  ])('%s %s lists %s', async (slug, step, title) => {
    await renderRouter('./app', { initialUrl: `/topic/integration/${slug}?step=${step}` });
    expect(await screen.findByLabelText(new RegExp(`^Open ${title}\\.`))).toBeOnTheScreen();
    expect(screen.queryByText('Coming in a later update')).toBeNull();
  });

  test('the topic page Play card lists the games', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration' });
    await user.press(await screen.findByLabelText(/^Play: 7 activities\./));
    expect(await screen.findByLabelText(/^Open Pattern Detective\./)).toBeOnTheScreen();
  });
});

describe('every activity route renders', () => {
  // The header shows the title while the module loads, so check for the activity's own content.
  const contentOf = (kind: string) =>
    kind === 'lab' ? /^EXPLORE · / : kind === 'game' ? /^(Start playing|How to play)$/ : /^CREATE · /;
  test.each(INTEGRATION_ACTIVITIES.map((a) => [a.id, a.kind]))('%s', async (id, kind) => {
    await renderRouter('./app', { initialUrl: `/topic/integration/activity/${id}` });
    expect((await screen.findAllByText(contentOf(kind), {}, { timeout: 10_000 })).length).toBeGreaterThan(0);
    expect(screen.queryByText('This activity is not available.')).toBeNull();
  });
});

describe('games', () => {
  test('a tutorial comes before the first play, then rounds give feedback', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration/activity/reverse-the-derivative' });
    await user.press(await screen.findByRole('button', { name: 'Start playing' }));
    expect(await screen.findByLabelText('Score 0. Hints used 0.')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'x^{2}' }));
    await user.press(screen.getByRole('button', { name: 'Check' }));
    expect(await screen.findByText(/Not all of them yet/)).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'x^{2} + 10' }));
    await user.press(screen.getByRole('button', { name: 'x^{2} - 1' }));
    await user.press(screen.getByRole('button', { name: 'Check' }));
    expect(await screen.findByRole('button', { name: 'Next round' })).toBeOnTheScreen();
  });

  test('the tutorial is not repeated once seen', async () => {
    await AsyncStorage.setItem('mathart.game-tutorial-seen.v1.choose-u', '1');
    await renderRouter('./app', { initialUrl: '/topic/integration/activity/choose-u' });
    expect(await screen.findByLabelText('Score 0. Hints used 0.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Start playing' })).toBeNull();
  });
});

describe('Create: art is visible on arrival', () => {
  test.each([
    ['equation-art-studio', 'Bridge of arcs', /^Equation Art Studio: 10 visible layers\./],
    ['dynamic-pattern-studio', 'Wave lattice', /^Dynamic Pattern Studio: 6 visible layers\./],
    ['trig-pattern-studio', 'Sine and cosine layers', /^Trig Pattern Studio: 4 visible layers\./],
    ['antiderivative-curve-art', 'Sine ribbon', /^Antiderivative Curve Art: 8 visible layers\./],
    ['function-curve-composer', 'Symmetric power fan', /^Function Curve Composer: 8 visible layers\./],
    ['transformation-art', 'Substitution braid', /^Transformation Art: 4 visible layers\./],
  ])('%s opens on the course-aligned %s starter, drawn on the canvas', async (id, starter, canvas) => {
    await renderRouter('./app', { initialUrl: `/topic/integration/activity/${id}` });
    // The canvas (an image with a text summary of its layers) is there without pressing anything.
    expect(await screen.findByLabelText(canvas)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: `Use starter: ${starter}` })).toBeSelected();
    expect(screen.getByText('COURSE-ALIGNED')).toBeOnTheScreen();
    expect(screen.queryByText('✦ Creative extension')).toBeNull();
    expect(screen.getByText('Math behind my art')).toBeOnTheScreen();
    expect(screen.getAllByRole('adjustable').length).toBeGreaterThan(0);
  });

  test('creative extensions are labelled as such, separately from course-aligned starters', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration/activity/equation-art-studio' });
    expect(await screen.findByText('CREATIVE EXTENSIONS')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Use starter: Flower (creative extension)' }));
    // Shown above the canvas and in Math behind my art.
    expect(await screen.findAllByText('✦ Creative extension')).toHaveLength(2);
  });

  test('animation: choose the parameter, speed and direction; step, play, pause and reset', async () => {
    // The test setup turns Reduce Motion on; this test needs it off.
    jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(false);
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration/activity/dynamic-pattern-studio' });
    expect(await screen.findByText('q = 1')).toBeOnTheScreen();
    await user.press(screen.getByRole('radio', { name: 'Animate parameter q' }));
    await user.press(screen.getByRole('radio', { name: 'Speed fast' }));
    await user.press(screen.getByRole('radio', { name: 'Direction Increase' }));
    expect(screen.getByRole('radio', { name: 'Speed fast' })).toBeChecked();
    await user.press(screen.getByRole('button', { name: 'Step' }));
    expect(await screen.findByText('q = 2')).toBeOnTheScreen();
    expect(screen.getByText('p = 3')).toBeOnTheScreen(); // only the chosen parameter moved
    await user.press(screen.getByRole('button', { name: 'Play' }));
    expect(await screen.findByRole('button', { name: 'Pause' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Pause' }));
    await user.press(screen.getByRole('button', { name: 'Reset' }));
    expect(await screen.findByText('q = 1')).toBeOnTheScreen();
    expect(screen.getByRole('radio', { name: 'Animate all parameters' })).toBeOnTheScreen();
    jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(true);
  });

  test('with Reduce Motion on, nothing plays by itself; Step still works', async () => {
    // Reduce Motion is on in the test setup.
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration/activity/dynamic-pattern-studio' });
    expect(await screen.findByText(/Reduce Motion is on/)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Play' })).toBeNull();
    await user.press(screen.getByRole('button', { name: 'Step' }));
    expect(await screen.findByText('p = 4')).toBeOnTheScreen();
  });

  test('an equation that cannot be graphed is explained, not drawn, and cannot be saved', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration/activity/equation-art-studio' });
    await user.press(await screen.findByRole('button', { name: 'Add equation' }));
    const field = screen.getByLabelText('y =');
    await user.clear(field);
    await user.type(field, 'alert(1)');
    expect(await screen.findByText('We couldn’t graph this expression yet.')).toBeOnTheScreen();
    expect(screen.getByText(/Equations like these work: sin\(x\)/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Save layer' })).toBeDisabled();
    await user.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByLabelText(/^Equation Art Studio: 10 visible layers\./)).toBeOnTheScreen();
  });

  test('an empty canvas says why and offers a fix', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration/activity/transformation-art' });
    for (const name of ['Base curve', 'u = x − 2π/3', 'u = x − 4π/3', 'u = ax + b']) {
      await user.press(await screen.findByRole('button', { name: `Hide ${name}` }));
    }
    expect(await screen.findByText('Every layer is hidden, so the canvas is empty.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Show all layers' }));
    expect(await screen.findByLabelText(/^Transformation Art: 4 visible layers\./)).toBeOnTheScreen();
  });

  test('a slider and a starter change the picture; stamping keeps a copy of the moving curve', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration/activity/antiderivative-curve-art' });
    expect(await screen.findByLabelText(/^Antiderivative Curve Art: 8 visible layers\./)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Increase Parameter C' }));
    expect(screen.getByText('C = 2.75')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: /^Add this curve to the art \(C = 2\.75\)$/ }));
    expect(
      await screen.findByLabelText(/^Antiderivative Curve Art: 9 visible layers\..*Moving curve \(C = 2\.75\)/),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Use starter: Nested bowls' }));
    expect(await screen.findByLabelText(/^Antiderivative Curve Art: 7 visible layers\./)).toBeOnTheScreen();
  });

  test('Transformation Art applies a substitution: dashed before, transformed after', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration/activity/transformation-art' });
    await user.press(await screen.findByRole('button', { name: 'Use starter: Harmonic stack' }));
    await user.press(screen.getByRole('button', { name: 'Transformation u = x − h' }));
    await user.press(screen.getByRole('button', { name: /^Apply to Base curve/ }));
    expect(await screen.findByLabelText(/6 visible layers\..*u = x − h, y = cos\(x - h\)/)).toBeOnTheScreen();
    expect(screen.getByText('h = 1.5')).toBeOnTheScreen();
  });
});

describe('Create: save, reopen, duplicate and delete', () => {
  test('a renamed composition with moved polar flowers reopens with the same layers, parameters and positions', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration/activity/equation-art-studio' });
    await user.press(await screen.findByRole('button', { name: 'Use starter: Flower garden (creative extension)' }));
    await user.press(screen.getByRole('button', { name: 'Increase Parameter a' }));
    const title = screen.getByLabelText('Project title');
    await user.clear(title);
    await user.type(title, 'My garden');
    await user.press(screen.getByRole('button', { name: 'Save project' }));
    expect(await screen.findByText('Saved "My garden".')).toBeOnTheScreen();
    const before = screen.getByLabelText(/^My garden: 7 visible layers\./).props.accessibilityLabel as string;
    expect(before).toMatch(/Left flower, r = cos\(a θ\) for scaled by 0\.8, centred at \(−2\.5, 0\.4\)/);

    const list = await devArtProjects.list(learnerId, 'integration');
    const id = list.ok ? list.data[0]!.id : '';
    // Leave the activity, then open the saved project again from its link.
    await act(() => router.replace('/create'));
    await act(() => router.push(`/topic/integration/activity/equation-art-studio?project=${id}`));
    expect(await screen.findByLabelText(before)).toBeOnTheScreen();
    expect(screen.getByDisplayValue('My garden')).toBeOnTheScreen();
    expect(screen.getByText('a = 5')).toBeOnTheScreen();
    expect(screen.getAllByText(/Drawn at x = −2\.5 \+ 0\.8·r\(θ\)cos\(θ\)/).length).toBeGreaterThan(0);
  });

  test('a graph project is saved with its equations and reopens', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration/activity/equation-art-studio' });
    expect(await screen.findByRole('button', { name: 'Add equation' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Save project' }));
    expect(await screen.findByText(/^Saved "/)).toBeOnTheScreen();

    const saved = await devArtProjects.list(learnerId, 'integration');
    expect(saved.ok && saved.data).toHaveLength(1);
    const record = saved.ok ? saved.data[0]! : null;
    const composition = record?.composition as { kind: string; equations: string[]; canvasState: unknown } | undefined;
    expect(composition?.kind).toBe('graph');
    expect(composition?.equations.length).toBeGreaterThan(0);
    expect(composition?.canvasState).toBeTruthy();

    await user.press(screen.getByRole('button', { name: /^My saved projects, 1$/ }));
    await user.press(await screen.findByRole('button', { name: 'Duplicate' }));
    await waitFor(async () => {
      const list = await devArtProjects.list(learnerId, 'integration');
      expect(list.ok && list.data.map((p) => p.title).some((t) => t.endsWith('(copy)'))).toBe(true);
    });

    // Delete asks for confirmation; the dialog's Delete button is the last one.
    await waitFor(() => expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(2));
    await user.press(screen.getAllByRole('button', { name: 'Delete' })[0]!);
    expect(await screen.findByText('Delete this project?')).toBeOnTheScreen();
    await user.press(screen.getAllByRole('button', { name: 'Delete' }).at(-1)!);
    await waitFor(async () => {
      const list = await devArtProjects.list(learnerId, 'integration');
      expect(list.ok && list.data).toHaveLength(1);
    });
  });

  test('a saved project opens from its link', async () => {
    const id = '7f1c3f5e-0000-4000-8000-000000000001';
    await devArtProjects.save(learnerId, {
      id,
      topicId: 'integration',
      activityId: 'decomposition-map',
      title: 'Saved map',
      composition: {
        version: 1,
        kind: 'flow',
        subtopicId: 'integration-partial-fractions',
        activityType: 'structure',
        project: {
          title: 'Saved map',
          exampleId: FLOW_CONFIGS['decomposition-map']!.examples[0]!.id,
          placed: [],
          verified: false,
          layout: 'vertical',
          accent: 0,
          dashedLinks: false,
          notes: {},
          math: { answers: {}, explanation: '' },
        },
        equations: [],
        parameters: [],
        restrictions: [],
        canvasState: {},
        learnerExplanation: '',
      },
      isCompleted: false,
    });
    await renderRouter('./app', { initialUrl: `/topic/integration/activity/decomposition-map?project=${id}` });
    expect(await screen.findByDisplayValue('Saved map')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Check order' })).toBeOnTheScreen();
  });
});

describe('Reflect and Review', () => {
  test('a reflection is saved to the learner history (not a test, no mastery)', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/topic/integration/substitution?step=reflect' });
    await user.type(await screen.findByLabelText('Your answer'), 'Because du must appear.');
    await user.press(screen.getByRole('radio', { name: '4 · Confident' }));
    const unit = integrationTopic.units.find((u) => u.slug === 'substitution')!;
    const reflect = unit.steps.flatMap((s) => s.blocks).find((b) => b.type === 'reflect');
    const difficulty = reflect && reflect.type === 'reflect' ? reflect.difficulties[0]! : '';
    await user.press(screen.getByRole('radio', { name: difficulty }));
    await user.press(screen.getByRole('button', { name: 'Save reflection' }));
    expect(await screen.findByText('Reflection saved.')).toBeOnTheScreen();

    const log = await devActivityLog.list(learnerId, 'integration');
    const saved = log.ok ? log.data.find((a) => a.type === 'reflection') : undefined;
    expect(saved?.refId).toBe(unit.id);
    expect(saved?.metadata).toMatchObject({ confidence: 4, difficulty, answer: 'Because du must appear.' });
  });

  test('Review is empty without history, and shows real mistakes when there are some', async () => {
    await renderRouter('./app', { initialUrl: '/topic/integration/substitution?step=review' });
    expect(await screen.findByText('Nothing to review yet')).toBeOnTheScreen();
  });

  test('Review shows a saved mistake with retry and concept actions', async () => {
    const unit = integrationTopic.units.find((u) => u.slug === 'substitution')!;
    const item = (integrationTopic.practiceItems ?? []).find((i) => i.unitId === unit.id && !i.withheldFromLearners)!;
    await devQuestionAttempts.record(learnerId, {
      id: '7f1c3f5e-0000-4000-8000-000000000002',
      topicId: 'integration',
      unitId: unit.id,
      questionId: item.id,
      retryOfId: null,
      learnerAnswer: { answer: 'wrong' },
      isCorrect: false,
      hintsUsed: 1,
      hintLevelsViewed: [1],
      viewedSteps: false,
      viewedAnswer: false,
    });
    await renderRouter('./app', { initialUrl: '/topic/integration/substitution?step=review' });
    expect((await screen.findAllByRole('button', { name: /Retry/ })).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /^Review concept/ }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: 'Open worked example' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /^Open Explore tool: / }).length).toBeGreaterThan(0);
    expect(screen.getByLabelText('1 to review')).toBeOnTheScreen();
    expect(screen.queryByText('Nothing to review yet')).toBeNull();
  });
});

describe('persistence (device backend)', () => {
  test('a finished game session awards its XP once', async () => {
    const session = {
      id: '7f1c3f5e-0000-4000-8000-000000000003',
      topicId: 'integration',
      gameId: 'rule-builder',
      levelReached: 2,
      score: 50,
      xpEarned: 10,
      hintsUsed: 0,
      completed: true,
      events: { retries: 0 },
      startedAt: '2026-10-10T10:00:00Z',
      endedAt: '2026-10-10T10:05:00Z',
    };
    await devGameSessions.save(learnerId, session);
    await devGameSessions.save(learnerId, session);
    expect(await devXpTotal(learnerId)).toBe(10);
    const list = await devGameSessions.list(learnerId, 'integration');
    expect(list.ok && list.data).toHaveLength(1);
  });
});
