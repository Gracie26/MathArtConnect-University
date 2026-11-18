/**
 * Topic 2 art: every template is generated from Chapter 2 mathematics, the
 * "Math behind my art" values agree with the mathematics, creative-extension
 * settings never change the mathematics, and projects survive a save.
 */
import { AREA_ACTIVITIES, AREA_STUDIOS } from '@/content/topics/area/activities';
import { riemannSum, simpson } from '@/lib/figures/scene';
import {
  AREA_FUNCTIONS,
  AREA_TEMPLATES,
  type AreaLayer,
  DEFAULT_CREATIVE,
  describeArtwork,
  duplicateLayer,
  hasCreativeLayout,
  layerMath,
  layerShapes,
  mosaicHeight,
  moveLayer,
  newLayer,
  normaliseLayer,
  projectFromTemplate,
  shapeBounds,
  templateById,
  TRAIL_CEILING,
  trailT,
  viewWindow,
} from '@/lib/art/areaArt';

const PALETTE = 6;
const valueOf = (layer: AreaLayer, label: string) => {
  const row = layerMath(layer).rows.find((r) => r.label === label);
  return Number(
    row?.tex
      .split('=')
      .at(-1)
      ?.replace(/[^0-9.\-e]/g, ''),
  );
};

describe('templates', () => {
  test('the five mosaic and five accumulation templates the design calls for exist', () => {
    expect(AREA_TEMPLATES.filter((t) => t.studio === 'mosaic').map((t) => t.title)).toEqual([
      'Staircase Wave',
      'Area Skyline',
      'Midpoint Mosaic',
      'Layered Riemann Landscape',
      'Integral City',
    ]);
    expect(AREA_TEMPLATES.filter((t) => t.studio === 'accumulation').map((t) => t.title)).toEqual([
      'Accumulation Flow',
      'Mean Value Bands',
      'Convergence Trail',
      'Asymptote Trail',
      'Twin Comparison Trails',
    ]);
  });

  test('every template is visibly different: different layers, shapes and footprint', () => {
    const signatures = AREA_TEMPLATES.map((t) => {
      const project = projectFromTemplate(t, t.title);
      const shapes = project.layers.flatMap((l) => layerShapes(l, PALETTE));
      const b = shapeBounds(shapes);
      return `${project.layers.map((l) => `${l.kind}:${l.fnId}`).join('|')}#${shapes.length}#${(b.xMax - b.xMin).toFixed(2)}x${(b.yMax - b.yMin).toFixed(2)}`;
    });
    expect(new Set(signatures).size).toBe(AREA_TEMPLATES.length);
    for (const t of AREA_TEMPLATES) {
      const shapes = projectFromTemplate(t, t.title).layers.flatMap((l) => layerShapes(l, PALETTE));
      expect(shapes.length).toBeGreaterThan(10);
    }
  });

  test('every Create activity opens a studio on an existing template', () => {
    const studios = AREA_ACTIVITIES.filter((a) => a.kind === 'studio');
    expect(studios).toHaveLength(8);
    for (const a of studios) {
      const config = AREA_STUDIOS[a.id];
      expect(config).toBeDefined();
      expect(templateById(config!.starter)?.studio).toBe(config!.studio);
      expect(a.createType).toBe('areaArt');
      expect(a.evidenceBasis?.length).toBeGreaterThan(0);
    }
  });

  test('Integral City splits one interval: the districts add up to the whole integral (Theorem 2.2.4 (iii))', () => {
    const city = projectFromTemplate(templateById('integral-city')!, 'City');
    const total = city.layers.reduce((s, l) => s + valueOf(l, 'Sum'), 0);
    expect(total).toBeCloseTo(9, 3);
  });
});

describe('Math behind my art', () => {
  test('a mosaic reports Δx, the Riemann sum and the signed area', () => {
    const layer = { ...newLayer('mosaic', 'exp'), n: 10, rule: 'right' } as AreaLayer;
    if (layer.kind !== 'mosaic') throw new Error('mosaic');
    const math = layerMath(layer);
    expect(math.rows.map((r) => r.label)).toEqual([
      'Function',
      'Interval',
      'Rectangles',
      'Width',
      'Heights from',
      'Sum',
      'Signed area',
    ]);
    expect(valueOf(layer, 'Width')).toBeCloseTo(0.2, 6);
    expect(valueOf(layer, 'Sum')).toBeCloseTo(riemannSum(Math.exp, 0, 2, 10, 'right'), 3);
    expect(math.rows.find((r) => r.label === 'Sum')?.tex).toMatch(/\\sum_\{i=1\}\^\{10\} f\(x_\{i\}\)/);
    expect(math.explanation).toMatch(/right endpoints/);
  });

  test('mean value bands have exactly the area under the curve', () => {
    const layer = { ...newLayer('mosaic', 'sqrt'), n: 4, rule: 'mean' } as AreaLayer;
    expect(valueOf(layer, 'Sum')).toBeCloseTo(16 / 3, 3);
    expect(layerMath(layer).explanation).toMatch(/Mean Value Theorem for Integrals/);
  });

  test('accumulation reports A(x) and the slope A′(x) = f(x)', () => {
    const layer = newLayer('accumulation', 'line');
    if (layer.kind !== 'accumulation') throw new Error('accumulation');
    const at = { ...layer, a: 0, b: 2, x: 1.5 };
    const rows = layerMath(at).rows;
    expect(rows.find((r) => r.label === 'Area so far')?.tex).toMatch(/= 2\.25$/);
    expect(rows.find((r) => r.label === 'Slope of A')?.tex).toMatch(/= 3$/);
  });

  test('trails settle on the limit for a convergent integral and escape for a divergent one', () => {
    const fn = AREA_FUNCTIONS.invSquare;
    expect(fn.improper!.partial(trailT(fn, 1))).toBeCloseTo(1, 2);
    const converging = { ...newLayer('trail', 'invSquare'), reach: 1 } as AreaLayer;
    expect(layerMath(converging).rows.at(-1)?.tex).toBe('A(t) \\to 1');
    const escaping = { ...newLayer('trail', 'cubeAsym'), reach: 1 } as AreaLayer;
    const dots = layerShapes(escaping, PALETTE).filter((s) => s.t === 'dot');
    expect(dots.every((d) => d.t === 'dot' && Math.abs(d.y) <= TRAIL_CEILING)).toBe(true);
    expect(dots.length).toBeLessThan(escaping.kind === 'trail' ? escaping.dots : 0);
    expect(layerMath(escaping).explanation).toMatch(/diverges/);
  });

  test('every template layer has finite mathematics and an explanation', () => {
    for (const t of AREA_TEMPLATES) {
      for (const layer of projectFromTemplate(t, t.title).layers) {
        const math = layerMath(layer);
        expect(math.explanation.length).toBeGreaterThan(40);
        expect(math.rows.every((r) => !r.tex.includes('NaN'))).toBe(true);
      }
    }
  });
});

describe('Riemann Mosaic templates stay mathematically traceable', () => {
  const mosaicLayers = AREA_TEMPLATES.filter((t) => t.studio === 'mosaic').flatMap((t) =>
    projectFromTemplate(t, t.title).layers.map((l) => [`${t.title} · ${l.name}`, l] as const),
  );
  const signature = (l: AreaLayer) => JSON.stringify(layerShapes(l, PALETTE));

  test.each(mosaicLayers)(
    '%s: n, rule, function and interval all change the artwork and its mathematics',
    (_n, layer) => {
      if (layer.kind !== 'mosaic') throw new Error('mosaic');
      const before = signature(layer);
      const changes: AreaLayer[] = [
        normaliseLayer({ ...layer, n: layer.n + 3 }),
        normaliseLayer({ ...layer, rule: layer.rule === 'right' ? 'left' : 'right' }),
        normaliseLayer({ ...layer, fnId: layer.fnId === 'exp' ? 'square' : 'exp', a: 0, b: 2 }),
        normaliseLayer({ ...layer, b: layer.b - AREA_FUNCTIONS[layer.fnId].step }),
      ];
      for (const changed of changes) {
        expect(signature(changed)).not.toBe(before);
        expect(layerMath(changed)).not.toEqual(layerMath(layer));
      }
    },
  );

  test.each(mosaicLayers)('%s: every rectangle keeps its interval, width Δx and height f(xᵢ*)', (_n, layer) => {
    if (layer.kind !== 'mosaic') throw new Error('mosaic');
    const plain: AreaLayer = { ...layer, creative: { ...DEFAULT_CREATIVE }, style: { ...layer.style, visible: true } };
    const rects = layerShapes(plain, PALETTE).filter((s) => s.t === 'rect');
    const dx = (layer.b - layer.a) / layer.n;
    expect(rects).toHaveLength(layer.n);
    rects.forEach((r, i) => {
      if (r.t !== 'rect') return;
      expect(r.x).toBeCloseTo(layer.a + i * dx, 9);
      expect(r.w).toBeCloseTo(dx, 9);
      expect(r.h).toBeCloseTo(Math.abs(mosaicHeight(AREA_FUNCTIONS[layer.fnId], layer.a, dx, i + 1, layer.rule)), 9);
    });
  });

  test('the five mosaic templates use different compositions', () => {
    const features = AREA_TEMPLATES.filter((t) => t.studio === 'mosaic').map((t) => {
      const layers = projectFromTemplate(t, t.title).layers;
      return {
        id: t.id,
        flip: layers.some((l) => l.creative.flip),
        outline: layers.some((l) => l.creative.outline),
        windows: layers.some((l) => l.creative.windows),
        cells: layers.some((l) => (l.creative.cells ?? 1) > 1),
        points: layers.some((l) => l.kind === 'mosaic' && l.showPoints),
        sideways: layers.some((l) => l.creative.mirror === 'sideways'),
        water: layers.some((l) => l.creative.mirror === 'water'),
        ns: layers.map((l) => (l.kind === 'mosaic' ? l.n : 0)).join(','),
      };
    });
    const byId = Object.fromEntries(features.map((f) => [f.id, f]));
    expect(byId['staircase-wave']).toMatchObject({ flip: true, outline: true });
    expect(byId['area-skyline']).toMatchObject({ sideways: true, windows: false });
    expect(byId['midpoint-mosaic']).toMatchObject({ cells: true, points: true });
    expect(byId['layered-landscape']?.ns).toBe('4,8,16');
    expect(byId['integral-city']).toMatchObject({ windows: true, water: true });
    expect(new Set(features.map((f) => JSON.stringify({ ...f, id: '' }))).size).toBe(5);
  });

  test('Midpoint Mosaic marks each midpoint on the curve', () => {
    const layer = projectFromTemplate(templateById('midpoint-mosaic')!, 'M').layers[1]!;
    if (layer.kind !== 'mosaic') throw new Error('mosaic');
    const dots = layerShapes(layer, PALETTE).filter((s) => s.t === 'dot');
    const dx = (layer.b - layer.a) / layer.n;
    expect(dots).toHaveLength(layer.n);
    dots.forEach((d, i) => {
      if (d.t !== 'dot') return;
      expect(d.x).toBeCloseTo(layer.a + (i + 0.5) * dx, 9);
      expect(d.y).toBeCloseTo(AREA_FUNCTIONS[layer.fnId].f(d.x), 9);
    });
  });
});

describe('creative extension', () => {
  test('flip, outlines, windows, mosaic cells and water change only the look', () => {
    const base = { ...newLayer('mosaic', 'shifted'), n: 5 } as AreaLayer;
    const styled: AreaLayer = {
      ...base,
      creative: { ...base.creative, repeat: 2, flip: true, windows: true, cells: 4, mirror: 'water' },
    };
    expect(layerMath(styled)).toEqual(layerMath(base));
    expect(hasCreativeLayout(styled)).toBe(true);
    expect(hasCreativeLayout(base)).toBe(false);
    // The second copy is turned over below the axis.
    const shapes = layerShapes(styled, PALETTE);
    expect(shapes.some((s) => s.t === 'rect' && s.y < 0 && s.opacity > 0.5)).toBe(true);
  });

  test('mirror, repeat, spacing, gaps and colours change the picture but never the mathematics', () => {
    const base = { ...newLayer('mosaic', 'cos'), n: 6 } as AreaLayer;
    const styled: AreaLayer = {
      ...base,
      creative: { mirror: 'both', repeat: 3, spacing: 0.4, colourMode: 'alternate', gap: 0.2, weight: 2 },
      style: { ...base.style, colour: 3, opacity: 0.4 },
    };
    expect(layerMath(styled)).toEqual(layerMath(base));
    expect(layerShapes(styled, PALETTE).length).toBe(layerShapes(base, PALETTE).length * 4 * 3);
  });

  test('hidden layers draw nothing; zoom narrows the window', () => {
    const layer = newLayer('mosaic');
    expect(layerShapes({ ...layer, style: { ...layer.style, visible: false } }, PALETTE)).toEqual([]);
    const fit = shapeBounds(layerShapes(layer, PALETTE));
    const zoomed = viewWindow(fit, { zoom: 2, panX: 0, panY: 0 });
    expect(zoomed.xMax - zoomed.xMin).toBeCloseTo((fit.xMax - fit.xMin) / 2, 9);
  });
});

describe('layers and persistence', () => {
  test('course settings are clamped to valid mathematics', () => {
    const layer = newLayer('mosaic', 'sqrt');
    if (layer.kind !== 'mosaic') throw new Error('mosaic');
    const fixed = normaliseLayer({ ...layer, a: -5, b: -6, n: 500 });
    if (fixed.kind !== 'mosaic') throw new Error('mosaic');
    expect(fixed.a).toBe(0);
    expect(fixed.b).toBeGreaterThan(fixed.a);
    expect(fixed.n).toBe(60);
  });

  test('duplicate, reorder and describe', () => {
    const a = newLayer('mosaic');
    const b = duplicateLayer(a);
    expect(b.id).not.toBe(a.id);
    expect(moveLayer([a, b], a.id, 1).map((l) => l.id)).toEqual([b.id, a.id]);
    const project = projectFromTemplate(templateById('staircase-wave')!, 'Waves');
    expect(describeArtwork(project)).toMatch(
      /^Waves: 8 left rectangles under sin x .* repeated 4 times; 8 right rectangles under sin x .* repeated 4 times\.$/,
    );
    const city = projectFromTemplate(templateById('integral-city')!, 'City');
    expect(describeArtwork(city)).toMatch(/reflected in water/);
  });

  test('a project is plain JSON and survives a save and reopen unchanged', () => {
    for (const t of AREA_TEMPLATES) {
      const project = { ...projectFromTemplate(t, t.title), explanation: 'Each tile is f at a midpoint times Δx.' };
      const reopened = JSON.parse(JSON.stringify(project)) as typeof project;
      expect(reopened).toEqual(project);
      expect(reopened.layers.map((l) => layerMath(l))).toEqual(project.layers.map((l) => layerMath(l)));
    }
  });

  test('the numerical area matches the notes for Example 2.2.2', () => {
    expect(simpson(AREA_FUNCTIONS.shifted.f, -1, 2)).toBeCloseTo(9, 9);
  });
});
