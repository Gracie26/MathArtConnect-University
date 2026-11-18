/**
 * Topic 3 Phase D: Play, Create, Reflect and Review.
 *
 * Games: one per subtopic; every scored action is a mathematical decision,
 * every typed answer is checked by the partial-derivative engine, the same
 * option never wins repeatedly, and every game cites research with its
 * limitation. Create: four studios whose course-aligned settings decide the
 * mathematics and whose creative-extension settings do not change it.
 * Reflect: one saved, ungraded question per subtopic. Review: recap,
 * retrieval, real history and a next action, with no mastery percentages.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { screen, userEvent } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { differentialTopic, RN_UNITS as U } from '@/content/topics/differential';
import {
  RN_ACTIVITIES,
  RN_GAME_ACTIVITIES,
  RN_STUDIO_ACTIVITIES,
  RN_STUDIOS,
} from '@/content/topics/differential/activities';
import { EVIDENCE_LIMITATION, RN_ACTIVITY_EVIDENCE } from '@/content/topics/differential/evidence';
import { RN_GAMES } from '@/content/topics/differential/games';
import { SUGGESTED } from '@/content/topics/differential/practice';
import { RN_RETRIEVAL, RN_REVIEW } from '@/content/topics/differential/review';
import { hasActivityScreen } from '@/components/activities/ActivityHost';
import { checkerFor } from '@/features/practice/checkProblem';
import {
  ANIMATION_TEXT,
  FIT_VIEW,
  newRnProject,
  normaliseRnProject,
  type RnArtProject,
  rnArtMath,
  rnArtScene,
  type RnLayer,
  rnLayerMath,
  rnLayerScene,
} from '@/lib/art/rnArt';
import { evaluateInput, type Round } from '@/lib/games/engine';
import { devArtProjects, devGameSessions } from '@/services/repositories/learning/devLearning';
import { seedSignedInLearner } from '@/test-utils/auth';

jest.setTimeout(400_000);

const TOPIC = differentialTopic.id;
const wait = { timeout: 20_000 };
const slug = (unitId: string) => differentialTopic.units.find((u) => u.id === unitId)!.slug;

/** A correct answer for every typed round: [game id, round index, answer]. */
const INPUT_ANSWERS: [string, number, string][] = [
  ['rn-slice-slopes', 0, '3x^2 y^2 - 4y'],
  ['rn-slice-slopes', 1, 'e^(2x) cos(y)'],
  ['rn-slice-slopes', 5, '3e^2'],
  ['rn-hold-two-relay', 1, '3x^2 y z^2'],
  ['rn-hold-two-relay', 2, 'x z e^(yz)'],
  ['rn-order-matters', 2, '6x^2 y + 2'],
  ['rn-order-matters', 3, '-e^x sin(y)'],
  ['rn-order-matters', 5, '6x y z^2'],
  ['rn-differential-builder', 0, '2xy, x^2'],
  ['rn-differential-builder', 3, 'yz, xz, xy'],
  ['rn-path-finder', 2, '4t^3 + 18t'],
  ['rn-path-finder', 4, 'y(-sin(t)) + x cos(t) + 2t'],
  ['rn-tree-builder', 2, '2s'],
  ['rn-tree-builder', 4, '2xy s + x^2'],
  ['rn-differential-solver', 2, '1/2'],
  ['rn-differential-solver', 3, 'x/(2(x^2 + y^2))'],
  ['rn-polar-converter', 4, '-4r^2 cos(2theta)'],
];

describe('Play', () => {
  test('one game in each subtopic’s Play step, each with a screen', () => {
    expect(RN_GAMES).toHaveLength(9);
    expect(RN_GAMES.map((g) => g.unitId)).toEqual(differentialTopic.units.map((u) => u.id));
    for (const unit of differentialTopic.units) {
      const play = unit.steps.find((s) => s.key === 'play')!;
      expect(play.availability.status).toBe('available');
      const games = play.blocks.flatMap((b) => (b.type === 'activities' ? b.activities : []));
      expect(games.map((g) => g.kind)).toEqual(['game']);
      expect(hasActivityScreen(games[0]!.id)).toBe(true);
    }
  });

  test('every game cites research for its design principle, with the limitation, and claims no effect', () => {
    for (const g of RN_GAME_ACTIVITIES) {
      const evidence = RN_ACTIVITY_EVIDENCE[g.id]!;
      expect(evidence.length).toBeGreaterThan(0);
      for (const e of evidence) {
        expect(e.citation).toMatch(/\(20\d\d\)/);
        expect(e.principle.length).toBeGreaterThan(20);
      }
    }
    expect(EVIDENCE_LIMITATION).toMatch(/does not establish the effectiveness/);
    const text = JSON.stringify(RN_GAMES);
    expect(text).not.toMatch(/improve[sd]? (your )?(performance|grades|results)|proven|guarantee/i);
  });

  test('every select round has exactly one right answer (or a valid set), and the same option never wins repeatedly', () => {
    for (const game of RN_GAMES) {
      const winners: string[] = [];
      const positions: number[] = [];
      for (const round of game.rounds) {
        if (round.kind !== 'select') continue;
        const right = round.choices.filter((c) => c.correct);
        if (round.multiple) expect(right.length).toBeGreaterThan(1);
        else expect(right).toHaveLength(1);
        expect(round.choices.some((c) => !c.correct)).toBe(true);
        for (const c of round.choices) expect(c.feedback.length).toBeGreaterThan(5);
        winners.push(...right.map((c) => c.text ?? c.tex ?? ''));
        if (!round.multiple) positions.push(round.choices.findIndex((c) => c.correct));
      }
      expect(new Set(winners).size).toBe(winners.length);
      if (positions.length > 1) expect(new Set(positions).size).toBeGreaterThan(1);
    }
  });

  test('every typed round accepts its answer and rejects a wrong one', () => {
    const inputs = RN_GAMES.flatMap((g) =>
      g.rounds.flatMap((r, i) => (r.kind === 'input' ? [[g.id, i, r] as const] : [])),
    );
    expect(inputs).toHaveLength(INPUT_ANSWERS.length);
    for (const [id, i, answer] of INPUT_ANSWERS) {
      const round = RN_GAMES.find((g) => g.id === id)!.rounds[i] as Extract<Round, { kind: 'input' }>;
      expect([id, i, evaluateInput(round, answer).correct]).toEqual([id, i, true]);
      const wrong = answer
        .split(',')
        .map((a, k) => (k === 0 ? `(${a}) + 1/7` : a))
        .join(',');
      expect([id, i, evaluateInput(round, wrong).correct]).toEqual([id, i, false]);
    }
  });

  test('stages, match and order rounds are well formed', () => {
    for (const game of RN_GAMES) {
      for (const round of game.rounds) {
        if (round.kind === 'stages')
          for (const s of round.stages) expect(s.choices.filter((c) => c.correct)).toHaveLength(1);
        if (round.kind === 'match') expect(new Set(round.pairs.map((p) => p.id)).size).toBe(round.pairs.length);
        if (round.kind === 'order') expect(round.cards.length).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

describe('Create', () => {
  const withLayer = (p: RnArtProject, change: (l: RnLayer) => RnLayer): RnArtProject => ({
    ...p,
    layers: p.layers.map((l) => (l.id === p.selectedId ? change(l) : l)),
  });

  test('four studios, opened from every subtopic, each with a starter, a question and evidence', () => {
    expect(new Set(Object.values(RN_STUDIOS).map((s) => s.studio))).toEqual(
      new Set(['domainRegion', 'surfaceSlice', 'chainNetwork', 'coordinateGrid']),
    );
    expect(RN_STUDIO_ACTIVITIES.map((a) => a.unitId)).toEqual(differentialTopic.units.map((u) => u.id));
    for (const a of RN_STUDIO_ACTIVITIES) {
      expect(RN_STUDIOS[a.id]).toBeDefined();
      expect(hasActivityScreen(a.id)).toBe(true);
      expect(RN_ACTIVITY_EVIDENCE[a.id]!.map((e) => e.type)).toContain('art-integration');
    }
  });

  test('every starter is a composition of real mathematics, every layer explained in "Math behind my art"', () => {
    let layered = 0;
    for (const [id, config] of Object.entries(RN_STUDIOS)) {
      const project = newRnProject(config, id);
      if (project.layers.length > 1) layered++;
      expect(new Set(project.layers.map((l) => l.id)).size).toBe(project.layers.length);
      // Count drawn shapes, with each cell of a merged domain shape counted on its own.
      const drawn = rnArtScene(project).items.reduce((n, i) => n + (i.k === 'polygons' ? i.polys.length : 1), 0);
      expect([id, drawn > 5]).toEqual([id, true]);
      for (const layer of project.layers) {
        const math = rnLayerMath(project.studio, layer);
        expect(math.rows.length).toBeGreaterThan(0);
        expect(math.explanation.length).toBeGreaterThan(40);
      }
    }
    expect(layered).toBeGreaterThanOrEqual(6);
  });

  test('creative-extension settings change the look, never the mathematics', () => {
    for (const config of Object.values(RN_STUDIOS)) {
      const plain = newRnProject(config, 'a');
      const styled = withLayer(plain, (l) => ({
        ...l,
        opacity: 0.4,
        creative: { copies: 4, scheme: 'warm', weight: 2, surface: false },
      }));
      expect(rnArtMath(styled)).toEqual(rnArtMath(plain));
    }
  });

  test('hidden layers are not drawn, and every layer can be shown again', () => {
    const project = newRnProject(RN_STUDIOS['rn-coordinate-grid-studio']!, 'g');
    const all = rnArtScene(project).items.length;
    const hidden = { ...project, layers: project.layers.map((l, i) => (i === 0 ? { ...l, visible: false } : l)) };
    expect(rnArtScene(hidden).items.length).toBeLessThan(all);
    const none = { ...project, layers: project.layers.map((l) => ({ ...l, visible: false })) };
    expect(rnArtScene(none).items).toEqual([]);
  });

  test('zoom and move only frame the artwork; Fit shows all of it', () => {
    const project = newRnProject(RN_STUDIOS['rn-polar-grid-studio']!, 'p');
    const fit = rnArtScene(project);
    const zoomed = rnArtScene({ ...project, view: { zoom: 2, panX: 0.5, panY: -0.25 } });
    expect(zoomed.items).toEqual(fit.items);
    expect(zoomed.view.xMax - zoomed.view.xMin).toBeCloseTo((fit.view.xMax - fit.view.xMin) / 2, 9);
    expect((zoomed.view.xMin + zoomed.view.xMax) / 2).toBeGreaterThan((fit.view.xMin + fit.view.xMax) / 2);
    expect(rnArtScene({ ...project, view: { ...FIT_VIEW } }).view).toEqual(fit.view);
  });

  test('animation moves the picture through the mathematics, without changing the mathematics', () => {
    for (const config of Object.values(RN_STUDIOS)) {
      const project = newRnProject(config, 'a');
      const a = JSON.stringify(rnArtScene(project, 0.1).items);
      const b = JSON.stringify(rnArtScene(project, 0.6).items);
      expect([config.studio, a === b]).toEqual([config.studio, false]);
      expect(rnArtMath({ ...project, animate: true })).toEqual(rnArtMath(project));
    }
    expect(Object.keys(ANIMATION_TEXT)).toHaveLength(4);
  });

  test('Domain Region colours only the domain of Example 3.1.1(i)', () => {
    const project = newRnProject(RN_STUDIOS['rn-domain-region-studio']!, 'd');
    const ex311 = project.layers.find((l) => l.course.source === 'ex311')!;
    const items = rnLayerScene(project.studio, ex311).items;
    // Each colour band is one shape (two shapes in all), drawn as a single path on the phone.
    expect(items.every((i) => i.k === 'polygons')).toBe(true);
    expect(items.length).toBeLessThanOrEqual(2);
    for (const item of items) {
      if (item.k !== 'polygons') continue;
      for (const cell of item.polys) {
        const [cx, cy] = cell.reduce(([a, b], [x, y]) => [a + x / 4, b + y / 4], [0, 0]);
        expect(cx * cx + cy * cy).toBeGreaterThanOrEqual(9 - 1e-9);
        expect(cx).not.toBe(0);
      }
    }
  });

  test('zooming or moving reuses each layer’s drawing; only changed layers are redrawn', () => {
    const project = newRnProject(RN_STUDIOS['rn-surface-slice-studio']!, 's');
    const fit = rnArtScene(project);
    const zoomed = rnArtScene({ ...project, view: { zoom: 2, panX: 0.3, panY: 0 } });
    // Same drawn items (same objects), different frame.
    expect(zoomed.items.every((item, i) => item === fit.items[i])).toBe(true);
    expect(zoomed.view).not.toEqual(fit.view);
    const restyled = { ...project, layers: [project.layers[0]!, { ...project.layers[1]!, opacity: 0.5 }] };
    const after = rnArtScene(restyled);
    expect(after.items[0]).toBe(fit.items[0]);
  });

  test('Chain Network lights exactly the paths of the chosen variable', () => {
    const one = newRnProject(RN_STUDIOS['rn-chain-network-studio']!, 'c');
    expect(rnArtMath(one).rows[1]!.tex).toContain('2 \\text{ product');
    const two = newRnProject(RN_STUDIOS['rn-chain-network-two']!, 'c');
    const ex344 = (direction: 'x' | 'y') =>
      rnArtMath(withLayer(two, (l) => ({ ...l, course: { ...l.course, source: 'ex344', direction } })));
    expect(ex344('x').rows[1]!.tex).toContain('2 \\text{ product');
    expect(ex344('y').rows[1]!.tex).toContain('3 \\text{ product');
  });

  test('projects saved before layers existed reopen as one layer', () => {
    const old = {
      version: 1,
      studio: 'surfaceSlice',
      title: 'Old slices',
      course: { source: 'ex321', count: 5, direction: 'x', value: 0 },
      creative: { copies: 2, scheme: 'warm', weight: 1.5 },
      explanation: 'Each line holds y constant.',
    };
    const project = normaliseRnProject(old)!;
    expect(project.version).toBe(2);
    expect(project.layers).toHaveLength(1);
    expect(project.layers[0]!.course.count).toBe(5);
    expect(project.layers[0]!.creative).toMatchObject({ copies: 2, scheme: 'warm', weight: 1.5, surface: true });
    expect(project.explanation).toBe('Each line holds y constant.');
    expect(normaliseRnProject(project)).toEqual(project);
    expect(normaliseRnProject(null)).toBeNull();
  });
});

describe('Reflect and Review', () => {
  test('one reflection question per subtopic, saved and never graded', () => {
    const questions = differentialTopic.units.map((u) => {
      const reflect = u.steps.find((s) => s.key === 'reflect')!;
      const block = reflect.blocks[0]!;
      expect(block.type).toBe('reflect');
      return block.type === 'reflect' ? block.question : '';
    });
    expect(new Set(questions).size).toBe(9);
    expect(Object.keys(RN_REVIEW)).toHaveLength(9);
  });

  test('Review has concepts, formulas, conditions, errors, retrieval and the learner’s history, with no mastery percentages', () => {
    for (const unit of differentialTopic.units) {
      const review = unit.steps.find((s) => s.key === 'review')!;
      const types = review.blocks.map((b) => b.type);
      expect(types).toEqual(['summary', 'formulaList', 'summary', 'callout', 'practiceGroup', 'review']);
      expect(JSON.stringify(review.blocks)).not.toMatch(/mastery|\d+ ?%/i);
    }
  });

  test('retrieval questions are app practice, checked, and kept out of the locked practice counts', () => {
    expect(RN_RETRIEVAL).toHaveLength(9);
    expect(differentialTopic.practiceItems).toHaveLength(169);
    const practiceIds = new Set((differentialTopic.practiceItems ?? []).map((i) => i.id));
    for (const item of RN_RETRIEVAL) {
      expect(item.sourceType).toBe('app-practice');
      expect(practiceIds.has(item.id)).toBe(false);
      const answers = SUGGESTED.get(item.id)!.answers!;
      expect([item.id, checkerFor(item)!.checkAnswer(answers.join(', ')).status]).toEqual([item.id, 'correct']);
    }
  });

  test('Clairaut’s conditions are referred to, not restated or corrected (MR3-02)', () => {
    const text = RN_REVIEW[U.higherOrder].conditions.join(' ');
    expect(text).toMatch(/read its conditions in §3\.2\.3/);
  });
});

describe('on screen', () => {
  let learnerId = '';
  beforeEach(async () => {
    await AsyncStorage.clear();
    learnerId = (await seedSignedInLearner()).id;
  });

  test('Domain Detective: a wrong point is explained, the right one solves the round', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/activity/rn-domain-detective` });
    await user.press(await screen.findByRole('button', { name: 'Start playing' }, wait));
    // A single choice is checked as soon as it is chosen.
    await user.press(await screen.findByRole('button', { name: '(1, 3)' }, wait));
    expect(await screen.findByText(/x − y = −2 < 0/)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: '(3, 1)' }));
    expect(await screen.findByText(/f\(3, 1\) = √2/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Next round' })).toBeOnTheScreen();
    expect(await devGameSessions.list(learnerId, TOPIC)).toMatchObject({ ok: true });
  });

  test('Domain Region Studio: layers, course-aligned and creative-extension controls; saves and reopens', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/activity/rn-domain-region-studio` });
    expect(await screen.findByText(/COURSE-ALIGNED/, {}, wait)).toBeOnTheScreen();
    expect(screen.getByText(/CREATIVE EXTENSION/)).toBeOnTheScreen();
    expect(screen.getByText('Math behind my art')).toBeOnTheScreen();
    expect(screen.getByText('Layers (2)')).toBeOnTheScreen();
    // Layers: hide the ring bands, duplicate them, then show the original again.
    await user.press(screen.getByRole('button', { name: 'Hide layer Ring bands' }));
    expect(screen.getByText(/Ring bands \(hidden\)$/)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Show layer Ring bands' }));
    await user.press(screen.getByRole('button', { name: 'Duplicate layer Ring bands' }));
    expect(screen.getByText('Layers (3)')).toBeOnTheScreen();
    // View and animation controls.
    await user.press(screen.getByRole('button', { name: 'Zoom in' }));
    await user.press(screen.getByRole('button', { name: 'Fit the whole artwork in view' }));
    await user.press(screen.getByRole('button', { name: 'Animate the artwork' }));
    // With Reduce Motion on, the studio keeps the artwork still and says so; otherwise it plays.
    const pause = screen.queryByRole('button', { name: 'Pause the animation' });
    if (pause) await user.press(pause);
    else {
      expect(screen.getByText(/Reduce Motion is on/)).toBeOnTheScreen();
      await user.press(screen.getByRole('button', { name: 'Animate the artwork' }));
    }
    // Creative extension on the selected (duplicated) layer.
    await user.press(screen.getByRole('button', { name: 'Creative extension controls' }));
    await user.press(screen.getByRole('button', { name: '4 rotated copies' }));
    const title = screen.getByLabelText('Project title');
    await user.clear(title);
    await user.type(title, 'Rings');
    await user.type(
      screen.getByLabelText('Explain the mathematics in your own words'),
      'Only points with x² + y² ≥ 9 and x ≠ 0 are coloured.',
    );
    await user.press(screen.getByRole('button', { name: 'Save and mark complete' }));
    expect(await screen.findByText('Saved "Rings".', {}, wait)).toBeOnTheScreen();
    const list = await devArtProjects.list(learnerId, TOPIC);
    expect(list.ok && list.data.map((p) => [p.activityId, p.title, p.isCompleted])).toEqual([
      ['rn-domain-region-studio', 'Rings', true],
    ]);
    const saved = list.ok
      ? (list.data[0]!.composition as {
          kind: string;
          project: { version: number; layers: { name: string; creative: { copies: number } }[] };
        })
      : null;
    expect(saved?.kind).toBe('rn');
    expect(saved?.project.version).toBe(2);
    expect(saved?.project.layers.map((l) => [l.name, l.creative.copies])).toEqual([
      ['Example 3.1.1(i) bands', 1],
      ['Ring bands', 1],
      ['Ring bands (copy)', 4],
    ]);
    // Reopen it from My saved projects.
    await user.press(await screen.findByLabelText('My saved projects, 1', {}, wait));
    await user.press(await screen.findByRole('button', { name: 'Open' }, wait));
    expect(await screen.findByDisplayValue('Rings', {}, wait)).toBeOnTheScreen();
    expect(screen.getByText('Layers (3)')).toBeOnTheScreen();
  });

  test('every Topic 3 studio opens on its starter artwork', async () => {
    for (const a of RN_STUDIO_ACTIVITIES) {
      const view = await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/activity/${a.id}` });
      expect(await screen.findByText('Math behind my art', {}, wait)).toBeOnTheScreen();
      expect(screen.getAllByRole('image').length).toBeGreaterThan(0);
      await view.unmount();
    }
  });

  test('a Topic 3 reflection is saved', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/${slug(U.partials)}?step=reflect` });
    await user.type(
      await screen.findByLabelText('Your answer', {}, wait),
      'It is the slope of the slice y = b at x = a.',
    );
    await user.press(screen.getByRole('radio', { name: '3 · Getting there' }));
    await user.press(screen.getByRole('radio', { name: 'Holding y constant' }));
    await user.press(screen.getByRole('button', { name: 'Save reflection' }));
    expect(await screen.findByText('Reflection saved.', {}, wait)).toBeOnTheScreen();
  });

  test('Review shows the recap, retrieval and a next step, with no history invented', async () => {
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/${slug(U.chainTwo)}?step=review` });
    expect(await screen.findByText('Key concepts', {}, wait)).toBeOnTheScreen();
    expect(screen.getByText('Common errors')).toBeOnTheScreen();
    expect(screen.getByText('App practice: quick retrieval')).toBeOnTheScreen();
    expect(await screen.findByText('Nothing to review yet', {}, wait)).toBeOnTheScreen();
    expect(screen.getByText('NEXT STEP')).toBeOnTheScreen();
  });

  test('the Games and Create catalogues list Topic 3 next to Topics 1 and 2', async () => {
    await renderRouter('./app', { initialUrl: '/games' });
    expect((await screen.findAllByText('Domain Detective', {}, wait))[0]).toBeOnTheScreen();
    expect(RN_ACTIVITIES.filter((a) => a.kind === 'game')).toHaveLength(9);
  });
});
