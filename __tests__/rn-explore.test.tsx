/**
 * Topic 3 Explore (Phase C): one lab per subtopic, each reproducing its worked
 * example's printed numbers, with real surfaces and slices, and every lab
 * opening on screen and recording exploration in the learning history.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { screen, userEvent } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { differentialTopic } from '@/content/topics/differential';
import { RN_LABS } from '@/content/topics/differential/activities';
import { hasActivityScreen } from '@/components/activities/ActivityHost';
import {
  compileFn,
  CUBE_VIEW,
  DEFAULT_CAMERA,
  definedCells,
  domainCells,
  projector,
  spaceCurve,
  surfaceFaces,
} from '@/lib/explore/rn';
import { seedSignedInLearner } from '@/test-utils/auth';

jest.setTimeout(400_000);

const TOPIC = differentialTopic.id;
const wait = { timeout: 20_000 };

describe('Explore labs', () => {
  test('nine labs, one in each subtopic’s Explore step, each with a screen', () => {
    expect(RN_LABS).toHaveLength(9);
    for (const unit of differentialTopic.units) {
      const explore = unit.steps.find((s) => s.key === 'explore')!;
      expect(explore.availability.status).toBe('available');
      expect(explore.required).toBe(false);
      const activities = explore.blocks.flatMap((b) => (b.type === 'activities' ? b.activities : []));
      expect(activities.map((a) => a.unitId)).toEqual([unit.id]);
    }
    for (const lab of RN_LABS) {
      expect(hasActivityScreen(lab.id)).toBe(true);
      expect(lab.sections.every((s) => (differentialTopic.sections ?? []).some((x) => x.id === s))).toBe(true);
    }
    expect(RN_LABS.map((l) => l.title)).toContain('Interactive Figure 3.1');
    expect(RN_LABS.map((l) => l.title)).toContain('Interactive Figure 3.2');
  });
});

describe('the labs reproduce the notes’ numbers', () => {
  test('Example 3.2.2: fx(1, ln 2) = 4 ln 2 + 2 and fy(1, ln 2) = 2', () => {
    const F = compileFn('x e^(x^2 y)', ['x', 'y']);
    const p = { x: 1, y: Math.LN2 };
    expect(F.d(p, 'x')).toBeCloseTo(4 * Math.LN2 + 2, 10);
    expect(F.d(p, 'y')).toBeCloseTo(2, 10);
  });

  test('Example 3.2.4: fxy(−1, 2) = −28, in both orders', () => {
    const F = compileFn('3x y^2 - 2y + 5x^2 y^2', ['x', 'y']);
    expect(F.d2({ x: -1, y: 2 }, 'x', 'y')).toBeCloseTo(-28, 5);
    expect(F.d2({ x: -1, y: 2 }, 'y', 'x')).toBeCloseTo(-28, 5);
  });

  test('Example 3.4.1: dw/dt at t = 0 is −2 (through the intermediate variables)', () => {
    const W = compileFn('x^2 y - y^2', ['t'], { x: 'sin(t)', y: 'e^t' });
    expect(W.d({ t: 0 }, 't')).toBeCloseTo(-2, 10);
  });

  test('Example 3.4.2: ∂w/∂s and ∂w/∂t agree with the printed formulas', () => {
    const W = compileFn('2xy', ['s', 't'], { x: 's^2 + t^2', y: 's/t' });
    for (const [s, t] of [
      [1, 1],
      [0.7, 1.6],
      [-1.2, 0.5],
    ] as const) {
      expect(W.d({ s, t }, 's')).toBeCloseTo((6 * s * s + 2 * t * t) / t, 9);
      expect(W.d({ s, t }, 't')).toBeCloseTo((2 * s * t * t - 2 * s ** 3) / (t * t), 9);
    }
  });

  test('Example 3.4.7: the polar form equals wxx + wyy', () => {
    const W = compileFn('x^3 y', ['x', 'y']);
    const P = compileFn('x^3 y', ['r', 'θ'], { x: 'r cos(theta)', y: 'r sin(theta)' });
    for (const [r, theta] of [
      [1.2, 0.6],
      [0.5, 2.3],
    ] as const) {
      const [x, y] = [r * Math.cos(theta), r * Math.sin(theta)];
      const cart = W.d2({ x, y }, 'x', 'x') + W.d2({ x, y }, 'y', 'y');
      const p = { r, θ: theta };
      const polar = P.d2(p, 'r', 'r') + P.d(p, 'r') / r + P.d2(p, 'θ', 'θ') / (r * r);
      expect(polar).toBeCloseTo(cart, 5);
    }
  });
});

describe('surfaces and domains are real', () => {
  test('Example 3.1.1(i): the domain excludes the disc x² + y² < 9 and the line x = 0', () => {
    const F = compileFn('sqrt(x^2 + y^2 - 9)/x', ['x', 'y']);
    const f = (x: number, y: number) => F.value({ x, y });
    expect(Number.isFinite(f(1, 1))).toBe(false);
    expect(Number.isFinite(f(0, 4))).toBe(false);
    expect(f(4, 0)).toBeCloseTo(Math.sqrt(7) / 4, 10);
    // The domain is drawn as one shape (a single path, cheap on phones) made of the defined cells.
    const shapes = domainCells(f, [-5, 5], [-5, 5], 20);
    expect(shapes).toHaveLength(1);
    const cells = shapes[0]!.k === 'polygons' ? shapes[0]!.polys : [];
    expect(cells.length).toBeGreaterThan(100);
    expect(cells.length).toBeLessThan(400);
  });

  test('sampled grids are cached: the formula is evaluated once per function and grid', () => {
    let calls = 0;
    const f = (x: number, y: number) => {
      calls++;
      return x + y;
    };
    const first = definedCells(f, [0, 1], [0, 1], 10, 'test-cache');
    const evaluated = calls;
    const second = definedCells(f, [0, 1], [0, 1], 10, 'test-cache');
    expect(evaluated).toBe(100);
    expect(calls).toBe(100);
    expect(second).toBe(first);
  });

  test('a surface projects to faces inside the figure view, ordered far to near', () => {
    const f = (x: number, y: number) => 3 * x - x * x * y * y + 2 * x ** 3 * y;
    const box = {
      x: [-1.5, 1.5] as [number, number],
      y: [-1.5, 1.5] as [number, number],
      z: [-15, 15] as [number, number],
    };
    const faces = surfaceFaces(f, box, DEFAULT_CAMERA, { n: 12 });
    expect(faces.length).toBeGreaterThan(100);
    for (const face of faces) {
      if (face.k !== 'polygon') throw new Error('expected polygons');
      for (const [u, v] of face.points) {
        expect(u).toBeGreaterThanOrEqual(CUBE_VIEW.xMin);
        expect(u).toBeLessThanOrEqual(CUBE_VIEW.xMax);
        expect(v).toBeGreaterThanOrEqual(CUBE_VIEW.yMin);
        expect(v).toBeLessThanOrEqual(CUBE_VIEW.yMax);
      }
    }
    // A slice is drawn on the surface itself: its points are the projections of (t, b, f(t, b)).
    const P = projector(box, DEFAULT_CAMERA);
    const slice = spaceCurve((s) => [-1.5 + 3 * s, 0.5, f(-1.5 + 3 * s, 0.5)], box, DEFAULT_CAMERA, { steps: 4 });
    if (slice.k !== 'polyline') throw new Error('expected a polyline');
    const [u, v] = P(0, 0.5, f(0, 0.5));
    expect(slice.points[2]![0]).toBeCloseTo(u, 10);
    expect(slice.points[2]![1]).toBeCloseTo(v, 10);
  });
});

describe('every lab opens and records exploration', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    await seedSignedInLearner();
  });

  test.each(RN_LABS.map((l) => [l.title, l.id] as const))('%s', async (title, id) => {
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/activity/${id}` });
    expect((await screen.findAllByText(title, {}, wait))[0]).toBeOnTheScreen();
    expect(screen.getAllByRole('image').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /^Open section 3/ }).length).toBeGreaterThan(0);
  });

  test('Interactive Figure 3.1: choosing paths records the exploration', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: `/topic/${TOPIC}/activity/rn-chain-tree-one` });
    await user.press(await screen.findByRole('button', { name: 'Path through x' }, wait));
    await user.press(screen.getByRole('button', { name: 'Path through y' }));
    await user.press(screen.getByRole('button', { name: 'Both paths' }));
    expect(await screen.findByText('Explored · saved to your learning history', {}, wait)).toBeOnTheScreen();
  });
});
