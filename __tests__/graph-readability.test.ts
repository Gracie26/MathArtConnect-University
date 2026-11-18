/**
 * Graph readability (Math view / Art view): readable ticks, the Cartesian grid,
 * 3D axes with their scale, and inspecting an arrow, facet or critical point
 * in the Topic 4 studios. Pure functions only; the screens are covered in
 * pda-screens.test.tsx.
 */
import {
  defaultSelection,
  fieldArrows,
  newPaProject,
  normalisePaProject,
  paArtMath,
  paArtScene,
  paInspect,
  pickAt,
  stepSelection,
  surfaceFacets,
  landscapeCriticals,
} from '@/lib/art/paArt';
import { RN_STUDIOS } from '@/content/topics/differential/activities';
import { newRnProject, normaliseRnProject, rnArtScene } from '@/lib/art/rnArt';
import { boxTicks, fmt } from '@/lib/explore/rn';
import { niceStep, niceTicks, tickLabel, withMathAxes } from '@/lib/figures/ticks';
import { parseTex } from '@/lib/math/tex';

const field = () => newPaProject({ studio: 'gradientField', starter: 'saddle', question: '' }, 'G');
const facets = () => newPaProject({ studio: 'facetedSurface', starter: 'paraboloid', question: '' }, 'F');
const landscape = () => newPaProject({ studio: 'landscape', starter: 'twoPeaks', question: '' }, 'L');

describe('ticks', () => {
  test('steps are 1, 2 or 5 × 10ⁿ', () => {
    expect(niceStep(4)).toBe(1);
    expect(niceStep(10)).toBe(2);
    expect(niceStep(25)).toBe(5);
    expect(niceStep(0.4)).toBeCloseTo(0.1);
    expect(niceStep(0)).toBe(1);
  });

  test('labels use a true minus sign, drop trailing zeros and never show −0', () => {
    expect(tickLabel(-2, 1)).toBe('−2');
    expect(tickLabel(0.5, 0.5)).toBe('0.5');
    expect(tickLabel(-0.0000001, 0.5)).toBe('0');
    expect(tickLabel(1.0, 0.2)).toBe('1');
  });

  test('ticks fall strictly inside the range, at whole steps, leaving out the origin', () => {
    expect(niceTicks(-2, 2).map((t) => t.label)).toEqual(['−1', '1']);
    expect(niceTicks(-3, 3).map((t) => t.at)).toEqual([-2, -1, 1, 2]);
    expect(niceTicks(0, 10).every((t) => t.at > 0 && t.at < 10)).toBe(true);
  });

  test('withMathAxes adds both axes, the origin, ticks and an optional grid', () => {
    const scene = withMathAxes({
      view: { xMin: -3, xMax: 3, yMin: -3, yMax: 3 },
      aspect: 1,
      axes: { x: true, y: true },
      items: [],
    });
    expect(scene.axes).toMatchObject({ x: true, y: true, origin: true, grid: true });
    expect(scene.axes.xTicks?.length).toBeGreaterThan(2);
    expect(scene.axes.yTicks?.length).toBeGreaterThan(2);
    const plain = withMathAxes({ ...scene, axes: { x: true, y: true } }, { grid: false });
    expect(plain.axes.grid).toBe(false);
    // An axis the figure hides on purpose stays hidden.
    expect(withMathAxes({ ...scene, axes: { x: true, y: false } }).axes.y).toBe(false);
  });

  test('3D boxes are labelled with their range at both ends of each axis', () => {
    const labels = boxTicks({ x: [-2, 2], y: [-1, 3], z: [0, 5] }, { azimuth: -0.6, elevation: 0.5 }).flatMap((i) =>
      i.k === 'label' ? [i.text] : [],
    );
    expect(labels).toEqual(expect.arrayContaining(['−2', '2', '−1', '3', '0', '5']));
  });
});

describe('Math view and Art view', () => {
  test('new projects open in Math view with the grid on and the mesh off', () => {
    expect(field().creative).toMatchObject({ view: 'math', grid: true, mesh: false });
  });

  test('Gradient Field Art: Math view has numbered axes and a grid; Art view has neither', () => {
    const math = paArtScene(field());
    expect(math.axes).toMatchObject({ x: true, y: true, origin: true, grid: true });
    expect(math.axes.xTicks?.map((t) => t.label)).toEqual(['−1', '1']);
    const noGrid = paArtScene({ ...field(), creative: { ...field().creative, grid: false } });
    expect(noGrid.axes.grid).toBe(false);
    const art = paArtScene({ ...field(), creative: { ...field().creative, view: 'art' } });
    expect(art.axes).toEqual({ x: false, y: false });
    // The artwork itself is the same in both views.
    const arrows = (s: typeof math) => s.items.filter((i) => i.k === 'segment').length;
    expect(arrows(art)).toBe(arrows(math));
  });

  test('Faceted Surface: Math view draws 3D axes x, y, z and their scale, never a flat grid', () => {
    const math = paArtScene(facets());
    const labels = math.items.flatMap((i) => (i.k === 'label' ? [i.text] : []));
    expect(labels).toEqual(expect.arrayContaining(['x', 'y', 'z', '−2.5', '2.5']));
    expect(math.axes.grid).toBeUndefined();
    expect(math.axes.x).toBe(false);
    const art = paArtScene({ ...facets(), creative: { ...facets().creative, view: 'art' } });
    expect(art.items.every((i) => i.k === 'polygon')).toBe(true);
  });

  test('the optional surface mesh adds curves of the true surface', () => {
    const plain = paArtScene(facets()).items.filter((i) => i.k === 'polyline').length;
    const meshed = paArtScene({ ...facets(), creative: { ...facets().creative, mesh: true } }).items.filter(
      (i) => i.k === 'polyline',
    ).length;
    expect(meshed).toBeGreaterThan(plain);
  });

  test('view, grid and mesh are saved and read back; older projects open in Math view', () => {
    const p = { ...facets(), creative: { ...facets().creative, view: 'art' as const, grid: false, mesh: true } };
    expect(normalisePaProject(JSON.parse(JSON.stringify(p)))?.creative).toMatchObject({
      view: 'art',
      grid: false,
      mesh: true,
    });
    const old = JSON.parse(JSON.stringify(field()));
    delete old.creative.view;
    delete old.creative.grid;
    delete old.creative.mesh;
    expect(normalisePaProject(old)?.creative).toMatchObject({ view: 'math', grid: true, mesh: false });
    expect(normalisePaProject({ ...old, creative: { ...old.creative, view: 'blueprint' } })?.creative.view).toBe(
      'math',
    );
  });
});

describe('inspecting the artwork', () => {
  test('a tapped arrow shows its point, ∇f = (2x, −2y) and |∇f|', () => {
    const p = field();
    const target = fieldArrows(p).find((a) => a.i === 1 && a.j === 7)!;
    const sel = pickAt(p, target.x + 0.05, target.y - 0.05);
    expect(sel).toEqual({ kind: 'cell', i: 1, j: 7 });
    const info = paInspect(p, sel)!;
    expect(target.gx).toBeCloseTo(2 * target.x, 6);
    expect(target.gy).toBeCloseTo(-2 * target.y, 6);
    expect(info.title).toBe(`Arrow at (${fmt(target.x)}, ${fmt(target.y)})`);
    expect(info.rows.map((r) => r[0])).toEqual(['Point', 'Gradient', 'Length']);
    expect(info.rows[2]![1]).toBe(`|\\nabla f| = ${fmt(Math.hypot(target.gx, target.gy))}`);
    expect(info.spoken).toMatch(/^Arrow at x .+ Gradient components f x .+ Length/);
  });

  test('the selected arrow is highlighted and marked in Math view', () => {
    const p = field();
    const sel = defaultSelection(p);
    const items = paArtScene(p, sel).items;
    expect(items.some((i) => i.k === 'segment' && i.tone === 'text')).toBe(true);
    expect(items.some((i) => i.k === 'point' && i.tone === 'text')).toBe(true);
    expect(paArtScene(p).items.some((i) => i.k === 'point' && i.tone === 'text')).toBe(false);
  });

  test('a tapped facet is the front one under the tap; its readout is the tangent plane at P', () => {
    const p = facets();
    const front = surfaceFacets(p).at(-1)!;
    const cx = front.points.reduce((s, q) => s + q[0], 0) / 4;
    const cy = front.points.reduce((s, q) => s + q[1], 0) / 4;
    const sel = pickAt(p, cx, cy);
    expect(sel).toEqual({ kind: 'cell', i: front.i, j: front.j });
    // z = 1 − (x² + 4y²)/10: fx = −x/5, fy = −4y/5.
    expect(front.c).toBeCloseTo(1 - (front.a ** 2 + 4 * front.b ** 2) / 10, 9);
    expect(front.fx).toBeCloseTo(-front.a / 5, 6);
    expect(front.fy).toBeCloseTo((-4 * front.b) / 5, 6);
    const info = paInspect(p, sel)!;
    expect(info.rows.map((r) => r[0])).toEqual(['P', 'Partial derivatives', 'Tangent plane', 'Normal direction']);
    expect(info.rows[3]![1]).toBe(`(${fmt(front.fx)}, ${fmt(front.fy)}, -1)`);
    expect(info.rows[2]![1]).toMatch(/= 0$/);
    // The facet is outlined, P is marked and the normal is drawn.
    const items = paArtScene(p, sel).items;
    expect(items.some((i) => i.k === 'polyline' && i.tone === 'text')).toBe(true);
    expect(items.some((i) => i.k === 'segment' && i.tone === 'asymptote')).toBe(true);
  });

  test('a tap outside every facet selects nothing', () => {
    expect(pickAt(facets(), 50, 50)).toBeNull();
  });

  test('step buttons move one cell and stay inside the grid', () => {
    const p = field();
    expect(stepSelection(p, { kind: 'cell', i: 0, j: 0 }, -1, 1)).toEqual({ kind: 'cell', i: 0, j: 1 });
    expect(stepSelection(p, { kind: 'cell', i: 8, j: 8 }, 1, 1)).toEqual({ kind: 'cell', i: 8, j: 8 });
  });

  test('Landscape Designer: a critical point shows d, the second partials and its type', () => {
    const p = landscape();
    const found = landscapeCriticals(p.course.features);
    const sel = pickAt(p, found[0]!.x + 0.1, found[0]!.y);
    expect(sel).toEqual({ kind: 'critical', index: 0 });
    const info = paInspect(p, sel)!;
    expect(info.rows.map((r) => r[0])).toEqual(['Point', 'Second partials', 'd', 'Type']);
    expect(info.rows[2]![1]).toBe(`d = ${fmt(found[0]!.d)}`);
    // Stepping cycles through the critical points.
    expect(stepSelection(p, { kind: 'critical', index: found.length - 1 }, 1, 0)).toEqual({
      kind: 'critical',
      index: 0,
    });
    // Away from every critical point, the point itself is inspected.
    const far = pickAt(p, -2.9, 2.9);
    expect(far?.kind).toBe('point');
    expect(paInspect(p, far)!.spoken).toMatch(/Not a critical point/);
  });

  test('"Math behind my art" uses the selected arrow or facet and the learner’s settings', () => {
    const p = field();
    const sel = { kind: 'cell' as const, i: 2, j: 3 };
    const a = fieldArrows(p).find((x) => x.i === 2 && x.j === 3)!;
    const rows = paArtMath(p, sel).rows;
    expect(rows[1]!.label).toBe(`Selected arrow, at (${fmt(a.x)}, ${fmt(a.y)})`);
    expect(rows[2]!.label).toBe('Your settings (Math view, size 80%)');
    expect(rows[2]!.tex).toContain(`${p.course.density} \\times ${p.course.density}`);
    const f = facets();
    expect(paArtMath(f, { kind: 'cell', i: 0, j: 0 }).rows[1]!.label).toMatch(/^Selected facet, at P = /);
  });

  test('every readout and "Math behind my art" row is valid TeX with no stray control characters', () => {
    for (const p of [field(), facets(), landscape()]) {
      const sels = [defaultSelection(p), pickAt(p, 0.3, -0.4), { kind: 'cell' as const, i: 0, j: 0 }];
      const texts = [
        ...sels.flatMap((sel) => paInspect(p, sel)?.rows.map((r) => r[1]) ?? []),
        ...paArtMath(p, defaultSelection(p)).rows.map((r) => r.tex),
      ];
      expect(texts.length).toBeGreaterThan(2);
      for (const tex of texts) {
        expect(tex).not.toMatch(/[\t\n\r]/);
        expect(() => parseTex(tex)).not.toThrow();
      }
    }
  });
});

describe('Topic 3 studios: Math view and Art view', () => {
  const project = (id: string) => newRnProject(RN_STUDIOS[id]!, 'T');

  test('Domain Region and Coordinate Grid show numbered axes in Math view, none in Art view', () => {
    for (const id of ['rn-domain-region-studio', 'rn-coordinate-grid-studio']) {
      const p = project(id);
      expect(p.display).toBe('math');
      const math = rnArtScene(p);
      expect(math.axes.xTicks?.length).toBeGreaterThan(1);
      expect(math.axes.yTicks?.length).toBeGreaterThan(1);
      expect(math.axes.origin).toBe(true);
      const art = rnArtScene({ ...p, display: 'art' });
      expect(art.axes).toEqual({ x: false, y: false });
      expect(art.items.length).toBe(math.items.length);
    }
  });

  test('ticks follow zoom and pan, so the numbers match what is on screen', () => {
    const p = project('rn-coordinate-grid-studio');
    const zoomed = rnArtScene({ ...p, view: { zoom: 4, panX: 0.5, panY: 0 } });
    const { xMin, xMax } = zoomed.view;
    expect(zoomed.axes.xTicks!.every((t) => t.at > xMin && t.at < xMax)).toBe(true);
  });

  test('Surface Slice shows the x, y and z axes with their range in Math view only', () => {
    const p = project('rn-surface-slice-studio');
    const labels = (s: ReturnType<typeof rnArtScene>) => s.items.flatMap((i) => (i.k === 'label' ? [i.text] : []));
    expect(labels(rnArtScene(p))).toEqual(expect.arrayContaining(['x', 'y', 'z']));
    expect(labels(rnArtScene({ ...p, display: 'art' }))).not.toContain('z');
  });

  test('the chain tree is a diagram: no axes in either view', () => {
    const p = project('rn-chain-network-studio');
    expect(rnArtScene(p).axes.xTicks).toBeUndefined();
    expect(rnArtScene(p).axes.x).toBe(false);
  });

  test('saved Topic 3 projects keep their view; older ones open in Math view', () => {
    const p = { ...project('rn-domain-region-studio'), display: 'art' as const };
    expect(normaliseRnProject(JSON.parse(JSON.stringify(p)))?.display).toBe('art');
    const old = JSON.parse(JSON.stringify(p));
    delete old.display;
    expect(normaliseRnProject(old)?.display).toBe('math');
  });
});
