/**
 * SVG path builders for the app's mathematical line art. Every decorative
 * curve in the UI is generated from a real function, so the artwork is
 * genuine mathematics rather than stock illustration.
 */

export interface PlotFrame {
  /** Mathematical domain and range shown. */
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  /** Target rectangle in SVG user units. */
  left: number;
  top: number;
  width: number;
  height: number;
}

const round = (value: number) => Math.round(value * 10) / 10;

export function toCanvas(frame: PlotFrame, x: number, y: number): [number, number] {
  const px = frame.left + ((x - frame.xMin) / (frame.xMax - frame.xMin)) * frame.width;
  const py = frame.top + (1 - (y - frame.yMin) / (frame.yMax - frame.yMin)) * frame.height;
  return [round(px), round(py)];
}

/** Path for y = f(x) sampled across the frame's domain. */
export function plotFunction(f: (x: number) => number, frame: PlotFrame, steps = 48): string {
  const parts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = frame.xMin + ((frame.xMax - frame.xMin) * i) / steps;
    const [px, py] = toCanvas(frame, x, f(x));
    parts.push(`${i === 0 ? 'M' : 'L'}${px} ${py}`);
  }
  return parts.join(' ');
}

/** Path for a parametric curve (x(t), y(t)), t in [t0, t1]. */
export function plotParametric(
  fx: (t: number) => number,
  fy: (t: number) => number,
  frame: PlotFrame,
  t0 = 0,
  t1 = Math.PI * 2,
  steps = 96,
): string {
  const parts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = t0 + ((t1 - t0) * i) / steps;
    const [px, py] = toCanvas(frame, fx(t), fy(t));
    parts.push(`${i === 0 ? 'M' : 'L'}${px} ${py}`);
  }
  return parts.join(' ');
}

/** Points along a curve in canvas units, and the tangent direction at each one (degrees, canvas orientation). */
export interface Trace {
  points: [number, number][];
  angles: number[];
}

/** Samples y = f(x) for a moving tracer: positions and the angle of the true tangent (slope f′(x)) at each. */
export function traceFunction(f: (x: number) => number, frame: PlotFrame, x0: number, x1: number, samples = 48): Trace {
  const h = 1e-4;
  // One unit of x and of y in canvas units (y grows downwards on the canvas).
  const sx = frame.width / (frame.xMax - frame.xMin);
  const sy = frame.height / (frame.yMax - frame.yMin);
  const points: [number, number][] = [];
  const angles: number[] = [];
  for (let i = 0; i < samples; i++) {
    const x = x0 + ((x1 - x0) * i) / (samples - 1);
    points.push(toCanvas(frame, x, f(x)));
    const slope = (f(x + h) - f(x - h)) / (2 * h);
    angles.push(Math.round(((Math.atan2(-slope * sy, sx) * 180) / Math.PI) * 10) / 10);
  }
  return { points, angles };
}

/** Samples a parametric curve (x(t), y(t)) for a moving tracer, with the tangent direction at each point. */
export function traceParametric(
  fx: (t: number) => number,
  fy: (t: number) => number,
  frame: PlotFrame,
  t0: number,
  t1: number,
  samples = 64,
): Trace {
  const points: [number, number][] = [];
  for (let i = 0; i < samples; i++) {
    const t = t0 + ((t1 - t0) * i) / (samples - 1);
    points.push(toCanvas(frame, fx(t), fy(t)));
  }
  const angles = points.map((p, i) => {
    const a = points[Math.max(0, i - 1)]!;
    const b = points[Math.min(points.length - 1, i + 1)]!;
    return Math.round(((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI) * 10) / 10;
  });
  return { points, angles };
}

/** Tangent segment to f at x0, spanning ±halfWidth in x. Uses a central difference. */
export function tangentSegment(
  f: (x: number) => number,
  x0: number,
  halfWidth: number,
  frame: PlotFrame,
): { path: string; point: [number, number] } {
  const h = 1e-4;
  const slope = (f(x0 + h) - f(x0 - h)) / (2 * h);
  const y0 = f(x0);
  const [ax, ay] = toCanvas(frame, x0 - halfWidth, y0 - slope * halfWidth);
  const [bx, by] = toCanvas(frame, x0 + halfWidth, y0 + slope * halfWidth);
  return { path: `M${ax} ${ay} L${bx} ${by}`, point: toCanvas(frame, x0, y0) };
}
