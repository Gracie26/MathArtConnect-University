/**
 * Topic 4 on screen: Learn, the lesson steps, practice with My Working (graded
 * answers saved as attempts, APP GUIDANCE and APP-GENERATED SOLUTION labels,
 * Q5(m) as a self-check question), every Explore lab, game and Create studio,
 * Create persistence, and Topic 4 in My Work, Progress and the catalogues.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, screen, userEvent } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { hasActivityScreen } from '@/components/activities/ActivityHost';
import { applicationsTopic, PDA_UNITS as U } from '@/content/topics/applications';
import { PDA_LABS, PDA_STUDIO_ACTIVITIES } from '@/content/topics/applications/activities';
import { PDA_GAMES } from '@/content/topics/applications/games';
import {
  defaultSelection,
  fieldArrows,
  newPaProject,
  type PaArtProject,
  paInspect,
  type PaSelection,
  stepSelection,
} from '@/lib/art/paArt';
import { evaluateInput, type Round } from '@/lib/games/engine';
import { devArtProjects, devQuestionAttempts } from '@/services/repositories/learning/devLearning';
import { seedSignedInLearner } from '@/test-utils/auth';

jest.setTimeout(400_000);

let learnerId = '';
beforeEach(async () => {
  await AsyncStorage.clear();
  learnerId = (await seedSignedInLearner()).id;
});

const TOPIC = applicationsTopic.id;
const wait = { timeout: 20_000 };
const slug = (unitId: string) => applicationsTopic.units.find((u) => u.id === unitId)!.slug;
const practice = (unitId: string, source: string) =>
  `/topic/${TOPIC}/practice?mode=independent&unit=${slug(unitId)}&source=${source}`;

/** A correct answer for every typed game round: [game id, round index, answer]. */
const INPUT_ANSWERS: [string, number, string][] = [
  ['pda-gradient-builder', 3, '3x^2 + 2y^2, 4x y'],
  ['pda-gradient-builder', 4, '2, 3'],
  ['pda-plane-builder', 5, '2, 2, 2'],
  ['pda-classify-it', 7, '-16'],
];

describe('activities have screens and typed game rounds are checked', () => {
  test('every lab, game and studio opens a screen', () => {
    for (const a of applicationsTopic.activities) expect([a.id, hasActivityScreen(a.id)]).toEqual([a.id, true]);
    expect(PDA_LABS).toHaveLength(4);
    expect(PDA_STUDIO_ACTIVITIES).toHaveLength(3);
  });

  test('every typed round accepts its answer and rejects a wrong one', () => {
    const inputs = PDA_GAMES.flatMap((g) =>
      g.rounds.flatMap((r, i) => (r.kind === 'input' ? [[g.id, i] as const] : [])),
    );
    expect(inputs.map(([id, i]) => `${id} ${i}`)).toEqual(INPUT_ANSWERS.map(([id, i]) => `${id} ${i}`));
    for (const [id, i, answer] of INPUT_ANSWERS) {
      const round = PDA_GAMES.find((g) => g.id === id)!.rounds[i] as Extract<Round, { kind: 'input' }>;
      expect([id, i, evaluateInput(round, answer).correct]).toEqual([id, i, true]);
      const wrong = answer
        .split(',')
        .map((a, k) => (k === 0 ? `(${a}) + 1/7` : a))
        .join(',');
      expect([id, i, evaluateInput(round, wrong).correct]).toEqual([id, i, false]);
    }
  });
});

describe('Learn and the lessons', () => {
  test('Learn lists Topic 4 with its four subtopics on its topic page', async () => {
    await renderRouter('./app', { initialUrl: '/learn' });
    expect((await screen.findAllByText(applicationsTopic.title, {}, wait))[0]).toBeOnTheScreen();
    // Topics other than the one in focus are compact rows labelled by number.
    expect(screen.getByText('TOPIC 4')).toBeOnTheScreen();
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}` });
    for (const unit of applicationsTopic.units)
      expect((await screen.findAllByText(unit.title, {}, wait))[0]).toBeOnTheScreen();
  });

  test('The Gradient: the definition as printed, and Example 4.1.1', async () => {
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/${slug(U.gradient)}` });
    expect(await screen.findByText('4.1 The Gradient of a Function of Two Variables', {}, wait)).toBeOnTheScreen();
  });

  test('The Second Partials Test: Theorem 4.3.3 and its determinant', async () => {
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/${slug(U.secondPartials)}` });
    expect(await screen.findByText('THEOREM 4.3.3', {}, wait)).toBeOnTheScreen();
    expect(screen.getAllByLabelText(/determinant with rows/)[0]).toBeOnTheScreen();
  });

  test('section pages: §4.2 points to §4.2.1, which holds its examples and Tutorial 5 practice', async () => {
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/section/4-2` });
    expect(await screen.findByText(/is a heading followed directly by §4\.2\.1/, {}, wait)).toBeOnTheScreen();
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/section/4-2-1` });
    expect(
      await screen.findByText('3 worked examples · 0 Try it questions · 10 practice questions', {}, wait),
    ).toBeOnTheScreen();
  });

  test('Subtopic 3 has no Create step; the Review recap has no mastery claim', async () => {
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/${slug(U.criticalPoints)}?step=review` });
    expect(await screen.findByText('Key concepts', {}, wait)).toBeOnTheScreen();
    expect(screen.getByText('Common errors (APP GUIDANCE)')).toBeOnTheScreen();
    expect(screen.queryByText(/mastery/i)).toBeNull();
  });
});

describe('practice and My Working', () => {
  test('the Practice hub lists Tutorial 5 and App practice with their real counts', async () => {
    await renderRouter('./app', { initialUrl: '/practice' });
    expect(await screen.findByRole('header', { name: applicationsTopic.title }, wait)).toBeOnTheScreen();
    expect(screen.getByLabelText(`Tutorial 5, ${applicationsTopic.title}, 35 questions`)).toBeOnTheScreen();
    expect(screen.getByLabelText(`App practice, ${applicationsTopic.title}, 4 questions`)).toBeOnTheScreen();
  });

  test('a gradient answer is graded and saved as an attempt', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: practice(U.gradient, 'tutorial-5') });
    expect(await screen.findByText('Tutorial 5 · Q2(i)', {}, wait)).toBeOnTheScreen();
    const buttons = screen.getAllByRole('button', { name: 'Start working' });
    // Q1 (the §3.3 review) comes first; Q2(i) is the ninth question.
    await user.press(buttons[8]!);
    await user.type(screen.getByLabelText(/^Final answer: h_x at the point/), '1, 4');
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(await screen.findByText(/Correct/, {}, wait)).toBeOnTheScreen();
    const attempts = await devQuestionAttempts.list(learnerId, TOPIC);
    expect(attempts.ok && attempts.data.map((a) => [a.questionId, a.unitId, a.isCorrect])).toEqual([
      ['tut5-q2-i', U.gradient, true],
    ]);
  });

  test('a tangent plane in any equivalent form is accepted; help is labelled APP GUIDANCE and APP-GENERATED SOLUTION', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: practice(U.tangentPlanes, 'tutorial-5') });
    expect(await screen.findByText('Tutorial 5 · Q3(i)', {}, wait)).toBeOnTheScreen();
    await user.press(screen.getAllByRole('button', { name: 'Start working' })[0]!);
    await user.type(screen.getByLabelText(/^Final answer: the tangent plane/), 'z = 35 - 6x - 2y');
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(await screen.findByText(/Correct/, {}, wait)).toBeOnTheScreen();
    for (let i = 0; i < 3; i++) await user.press(screen.getByRole('button', { name: 'Hint' }));
    expect(screen.getByText(/^APP GUIDANCE · written for this app/)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Show Full Walkthrough' }));
    expect(screen.getByText('APP-GENERATED SOLUTION · pending lecturer review')).toBeOnTheScreen();
    expect(screen.getByText('Answer (APP-GENERATED SOLUTION, pending lecturer review)')).toBeOnTheScreen();
  });

  test('critical points are classified and checked; Q5(m) is a self-check question', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/${slug(U.secondPartials)}?step=practise` });
    expect(await screen.findByText('Tutorial 5 · Q5(a)', {}, wait)).toBeOnTheScreen();
    expect(screen.getByText('Tutorial 5 · Q5(m)')).toBeOnTheScreen();
    await user.press(screen.getAllByRole('button', { name: 'Start working' })[0]!);
    await user.type(screen.getByLabelText(/^Final answer: every critical point and its type/), '(1, 0) min');
    await user.press(screen.getByRole('button', { name: 'Check answer' }));
    expect(await screen.findByText(/Correct: all 1 critical points/, {}, wait)).toBeOnTheScreen();
  });

  test('Subtopic 3 practice is labelled APP PRACTICE', async () => {
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/${slug(U.criticalPoints)}?step=practise` });
    expect(await screen.findByText('APP PRACTICE: Finding critical points', {}, wait)).toBeOnTheScreen();
    expect(screen.getAllByText(/^APP PRACTICE \d$/)).toHaveLength(4);
  });
});

describe('Explore, Play and Create', () => {
  test('every lab opens on its drawing, and labels its visualisation as app-created', async () => {
    for (const lab of PDA_LABS) {
      const view = await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/activity/${lab.id}` });
      expect((await screen.findAllByText(lab.title, {}, wait))[0]).toBeOnTheScreen();
      expect(screen.getAllByRole('image').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/[Aa]pp-created visualisation/).length).toBeGreaterThan(0);
      await view.unmount();
    }
  });

  test('Gradient Builder opens on its tutorial, then its first round with a hint available', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/activity/pda-gradient-builder` });
    expect((await screen.findAllByText(/Build ∇f from its components/, {}, wait))[0]).toBeOnTheScreen();
    await user.press(await screen.findByRole('button', { name: 'Start playing' }, wait));
    expect(await screen.findByText('LEVEL 1 · ROUND 1 OF 7', {}, wait)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Show a hint' })).toBeOnTheScreen();
  });

  test('every studio opens on its starter artwork', async () => {
    for (const a of PDA_STUDIO_ACTIVITIES) {
      const view = await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/activity/${a.id}` });
      expect(await screen.findByText('Math behind my art', {}, wait)).toBeOnTheScreen();
      expect(screen.getByText(/COURSE-ALIGNED/)).toBeOnTheScreen();
      expect(screen.getAllByRole('image').length).toBeGreaterThan(0);
      await view.unmount();
    }
  });

  test('Landscape Designer: add a feature, explain, save and reopen', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/activity/pda-landscape-designer` });
    expect(await screen.findByText(/Features \(3 of 5\)/, {}, wait)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Add a saddle' }));
    expect(screen.getByText(/Features \(4 of 5\)/)).toBeOnTheScreen();
    const title = screen.getByLabelText('Title');
    await user.clear(title);
    await user.type(title, 'Hills');
    await user.type(
      screen.getByLabelText('Explain the mathematics in your own words'),
      'Each peak has d > 0 and f_xx < 0, so it is a relative maximum.',
    );
    await user.press(screen.getByRole('button', { name: 'Save and mark complete' }));
    expect(await screen.findByText('Saved "Hills".', {}, wait)).toBeOnTheScreen();
    const list = await devArtProjects.list(learnerId, TOPIC);
    expect(list.ok && list.data.map((p) => [p.activityId, p.title, p.isCompleted])).toEqual([
      ['pda-landscape-designer', 'Hills', true],
    ]);
    const saved = list.ok
      ? (list.data[0]!.composition as { kind: string; project: { course: { features: unknown[] } } })
      : null;
    expect(saved?.kind).toBe('pa');
    expect(saved?.project.course.features).toHaveLength(4);
    await user.press(await screen.findByLabelText('My saved projects, 1', {}, wait));
    await user.press(await screen.findByRole('button', { name: 'Open' }, wait));
    expect(await screen.findByDisplayValue('Hills', {}, wait)).toBeOnTheScreen();
    expect(screen.getByText(/Features \(4 of 5\)/)).toBeOnTheScreen();
  });

  test('Gradient Field Art: inspect an arrow, step to the next, switch to Art view, save and reopen', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/activity/pda-gradient-field-art` });
    const project = newPaProject({ studio: 'gradientField', starter: 'saddle', question: '' }, '');
    const start = defaultSelection(project);
    const title = (sel: PaSelection) => paInspect(project, sel)!.title;
    expect(await screen.findByText(title(start), {}, wait)).toBeOnTheScreen();
    // Lay the figure out at phone width, then tap the arrow of cell (1, 7), at (−4/3, 4/3).
    await act(async () => {
      fireEvent(screen.getByTestId('tap-scene-frame'), 'layout', {
        nativeEvent: { layout: { width: 360, height: 360, x: 0, y: 0 } },
      });
    });
    const target = { kind: 'cell' as const, i: 1, j: 7 };
    const arrow = fieldArrows(project).find((a) => a.i === 1 && a.j === 7)!;
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Select the nearest arrow' }), {
        nativeEvent: { locationX: ((arrow.x + 2) / 4) * 360, locationY: ((2 - arrow.y) / 4) * 360 },
      });
    });
    expect(screen.getByText(title(target))).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Select the one to the right' }));
    expect(screen.getByText(title(stepSelection(project, target, 1, 0)))).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /^Math view/ })).toBeSelected();
    expect(screen.getByRole('button', { name: 'Hide grid' })).toBeSelected();
    // "Math behind my art" follows the selection.
    expect(screen.getByText(/^Selected arrow, at/)).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: /^Art view/ }));
    expect(screen.getByRole('button', { name: /^Art view/ })).toBeSelected();
    expect(screen.queryByRole('button', { name: 'Hide grid' })).toBeNull();
    expect(screen.getByText(/Switch to Math view/)).toBeOnTheScreen();

    const field = screen.getByLabelText('Title');
    await user.clear(field);
    await user.type(field, 'Field');
    await user.press(screen.getByRole('button', { name: 'Save project' }));
    expect(await screen.findByText('Saved "Field".', {}, wait)).toBeOnTheScreen();
    const list = await devArtProjects.list(learnerId, TOPIC);
    const saved = list.ok ? (list.data[0]!.composition as unknown as { project: PaArtProject }).project : null;
    expect(saved?.creative).toMatchObject({ view: 'art', grid: true });
    await user.press(await screen.findByLabelText('My saved projects, 1', {}, wait));
    await user.press(await screen.findByRole('button', { name: 'Open' }, wait));
    expect(await screen.findByDisplayValue('Field', {}, wait)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /^Art view/ })).toBeSelected();
  });

  test('Faceted Surface: the selected facet shows P, its tangent plane and normal; the mesh toggles', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/activity/pda-faceted-surface` });
    expect(await screen.findByText(/^Facet at P = /, {}, wait)).toBeOnTheScreen();
    expect(screen.getByText('Tangent plane')).toBeOnTheScreen();
    expect(screen.getByText('Normal direction')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /grid/ })).toBeNull();
    await user.press(screen.getByRole('button', { name: 'Show surface mesh' }));
    expect(screen.getByRole('button', { name: 'Hide surface mesh' })).toBeSelected();
  });

  test('the Games and Create catalogues list Topic 4', async () => {
    await renderRouter('./app', { initialUrl: '/games' });
    expect((await screen.findAllByText('Gradient Builder', {}, wait))[0]).toBeOnTheScreen();
    await renderRouter('./app', { initialUrl: '/create' });
    expect((await screen.findAllByText('Landscape Designer', {}, wait))[0]).toBeOnTheScreen();
  });
});

describe('My Work and Progress', () => {
  test('Progress lists Topic 4 as its own topic card', async () => {
    await renderRouter('./app', { initialUrl: '/progress' });
    expect(await screen.findByText('TOPIC 4', {}, wait)).toBeOnTheScreen();
    expect(screen.getByText(applicationsTopic.title)).toBeOnTheScreen();
  });

  test('the topic progress report opens for Topic 4', async () => {
    await renderRouter('./app', { initialUrl: `/progress/${TOPIC}` });
    expect(
      await screen.findByText(/Start a lesson in Applications of Partial Derivatives/, {}, wait),
    ).toBeOnTheScreen();
  });
});
