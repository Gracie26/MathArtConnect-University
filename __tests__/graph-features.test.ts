/**
 * "How to read this graph" (Create): features computed from the layer's own equation. Intercepts are
 * reported only where they exist, asymptotes are not mistaken for roots, and symmetry is detected.
 */
import { layerFeatures } from '@/lib/graph/features';
import { DEFAULT_VIEW, newLayer } from '@/lib/graph/project';
import type { Parameter } from '@/lib/graph/sample';

const cartesian = (expression: string, parameters: Parameter[] = []) =>
  layerFeatures(newLayer('cartesian', expression, 'f'), parameters, DEFAULT_VIEW);

const close = (values: number[], expected: number[]) => {
  expect(values).toHaveLength(expected.length);
  values.forEach((v, i) => expect(v).toBeCloseTo(expected[i] as number, 6));
};

describe('cartesian layers', () => {
  test('a parabola: y-intercept, two x-intercepts, even symmetry and its range in view', () => {
    const f = cartesian('y = x^2 - 4');
    expect(f).toMatchObject({ kind: 'cartesian', yIntercept: -4, symmetry: 'even' });
    if (f?.kind !== 'cartesian') throw new Error('expected cartesian');
    close(f.xIntercepts, [-2, 2]);
    expect(f.range?.min).toBeCloseTo(-4, 6);
  });

  test('sin x is odd and meets the x-axis at multiples of π', () => {
    const f = cartesian('sin(x)');
    if (f?.kind !== 'cartesian') throw new Error('expected cartesian');
    expect(f.symmetry).toBe('odd');
    expect(f.yIntercept).toBeCloseTo(0, 9);
    close(f.xIntercepts, [-Math.PI, 0, Math.PI]);
  });

  test('1/x has no y-intercept and no x-intercept; the jump at 0 is not a root', () => {
    const f = cartesian('1/x');
    expect(f).toMatchObject({ yIntercept: 'undefined', xIntercepts: [], symmetry: 'odd' });
  });

  test('tan x: roots at multiples of π, never at its asymptotes', () => {
    const f = cartesian('tan(x)');
    if (f?.kind !== 'cartesian') throw new Error('expected cartesian');
    close(f.xIntercepts, [-Math.PI, 0, Math.PI]);
  });

  test('e^x never meets the x-axis and has y-intercept 1', () => {
    expect(cartesian('e^x')).toMatchObject({ yIntercept: 1, xIntercepts: [], symmetry: null });
  });

  test('a parameter moves the features: x^2 + C with C = 1 has no x-intercepts', () => {
    const C: Parameter = { name: 'C', value: 1, min: -3, max: 3, step: 0.5 };
    expect(cartesian('x^2 + C', [C])).toMatchObject({ yIntercept: 1, xIntercepts: [] });
    const f = cartesian('x^2 + C', [{ ...C, value: -1 }]);
    if (f?.kind !== 'cartesian') throw new Error('expected cartesian');
    close(f.xIntercepts, [-1, 1]);
  });

  test('a domain restriction that excludes 0 hides the y-intercept', () => {
    const layer = { ...newLayer('cartesian', 'x^2', 'f'), domain: { start: 1, end: 3 } };
    expect(layerFeatures(layer, [], DEFAULT_VIEW)).toMatchObject({ yIntercept: null, xIntercepts: [] });
  });

  test('an invalid equation gives no features instead of guesses', () => {
    expect(cartesian('y = x +')).toBeNull();
  });
});

describe('polar layers', () => {
  test('a rose r = cos 3θ reaches distance 1 and is symmetric about the x-axis', () => {
    const f = layerFeatures(newLayer('polar', 'r = cos(3θ)', 'rose'), [], DEFAULT_VIEW);
    expect(f).toMatchObject({ kind: 'polar', symmetricAboutXAxis: true });
    if (f?.kind !== 'polar') throw new Error('expected polar');
    expect(f.maxDistance).toBeCloseTo(1, 6);
  });

  test('r = sin θ is not symmetric about the x-axis', () => {
    expect(layerFeatures(newLayer('polar', 'r = sin(θ)', 'circle'), [], DEFAULT_VIEW)).toMatchObject({
      symmetricAboutXAxis: false,
    });
  });
});
