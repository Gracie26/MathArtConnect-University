import { type PlotFrame, toCanvas, traceFunction, traceParametric } from '@/lib/art/curves';

const frame: PlotFrame = { xMin: 0, xMax: 10, yMin: -2, yMax: 2, left: 0, top: 0, width: 400, height: 100 };

describe('ambient art tracers follow the mathematics', () => {
  test('a function tracer sits on the curve, with its tangent at the true slope', () => {
    const f = (x: number) => Math.sin(x);
    const { points, angles } = traceFunction(f, frame, 1, 9, 20);
    const sx = frame.width / (frame.xMax - frame.xMin);
    const sy = frame.height / (frame.yMax - frame.yMin);
    points.forEach((p, i) => {
      const x = 1 + (8 * i) / 19;
      expect(p).toEqual(toCanvas(frame, x, f(x)));
      // Canvas angle of the tangent: slope cos x, flipped because canvas y grows downwards.
      const expected = (Math.atan2(-Math.cos(x) * sy, sx) * 180) / Math.PI;
      expect(angles[i]!).toBeCloseTo(expected, 0);
    });
  });

  test('a flow-line particle of ∇(x² − y²) stays on its hyperbola xy = constant', () => {
    const square: PlotFrame = { xMin: -3, xMax: 3, yMin: -3, yMax: 3, left: 0, top: 0, width: 300, height: 300 };
    const { points } = traceParametric(
      (t) => 0.2 * Math.exp(2 * t),
      (t) => 2 * Math.exp(-2 * t),
      square,
      0,
      0.75,
      12,
    );
    for (const [px, py] of points) {
      const x = -3 + (px / 300) * 6;
      const y = 3 - (py / 300) * 6;
      expect(x * y).toBeCloseTo(0.4, 1);
    }
  });
});
