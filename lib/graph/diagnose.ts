/**
 * Why a studio canvas looks empty or wrong, with the action that fixes it.
 * Pure: the studio shows these as a short list of buttons under the canvas.
 */
import type { ArtProject } from './project';
import { type CompiledLayer, type GraphLayer, type GraphView, sampleLayer } from './sample';

/** Above this many layers, adding more is refused (phones redraw every layer on every change). */
export const MAX_LAYERS = 30;
/** Roughly how many points a composition may draw before it is flagged as heavy. */
export const HEAVY_POINTS = 16000;

export type GraphIssue =
  | { kind: 'noLayers' }
  | { kind: 'allHidden' }
  | { kind: 'invalidDomain'; layerId: string; name: string }
  | { kind: 'restrictionHidesAll'; layerId: string; name: string }
  | { kind: 'offView' }
  | { kind: 'parameterAtLimit'; name: string }
  | { kind: 'heavy'; points: number }
  | { kind: 'tooManyLayers' };

const hasRestriction = (l: GraphLayer) =>
  l.domain.start !== null || l.domain.end !== null || l.range.min !== null || l.range.max !== null;

/** Points a layer draws, or none if it cannot be evaluated (never throws). */
function safePoints(
  layer: GraphLayer,
  c: Extract<CompiledLayer, { ok: true }>,
  values: Record<string, number>,
  view: GraphView,
) {
  try {
    return sampleLayer(layer, c, values, view, 0.25).flat();
  } catch {
    return [];
  }
}

const inView = (view: GraphView) => (p: { x: number; y: number }) =>
  p.x >= view.xMin && p.x <= view.xMax && p.y >= view.yMin && p.y <= view.yMax;

/** Approximate number of points a layer draws (for the performance warning). */
export const layerCost = (l: GraphLayer) =>
  l.kind === 'polar' ? 720 * Math.max(1, Math.min(24, Math.round(l.repeat))) : l.mirror ? 800 : 400;

export function diagnose(
  project: ArtProject,
  compiled: ReadonlyMap<string, CompiledLayer>,
  values: Record<string, number>,
  view: GraphView,
): GraphIssue[] {
  const issues: GraphIssue[] = [];
  const layers = project.layers;
  if (layers.length === 0) return [{ kind: 'noLayers' }];
  if (layers.length >= MAX_LAYERS) issues.push({ kind: 'tooManyLayers' });
  const visible = layers.filter((l) => l.visible);
  if (visible.length === 0) return [...issues, { kind: 'allHidden' }];

  let anyInView = false;
  let anyDrawn = false;
  for (const layer of visible) {
    const c = compiled.get(layer.id);
    if (!c?.ok) continue;
    const { start, end } = layer.domain;
    if (start !== null && end !== null && !(end > start)) {
      issues.push({ kind: 'invalidDomain', layerId: layer.id, name: layer.name });
      continue;
    }
    const points = safePoints(layer, c, values, view);
    if (points.length > 0) anyDrawn = true;
    if (points.some(inView(view))) {
      anyInView = true;
      continue;
    }
    if (hasRestriction(layer)) {
      const unrestricted: GraphLayer = {
        ...layer,
        domain: { start: null, end: null },
        range: { min: null, max: null },
      };
      if (safePoints(unrestricted, c, values, view).some(inView(view))) {
        issues.push({ kind: 'restrictionHidesAll', layerId: layer.id, name: layer.name });
      }
    }
  }
  if (!anyInView && anyDrawn) issues.push({ kind: 'offView' });
  if (!anyInView) {
    for (const p of project.parameters) {
      if (p.value <= p.min || p.value >= p.max) issues.push({ kind: 'parameterAtLimit', name: p.name });
    }
  }
  const points = visible.reduce((n, l) => n + layerCost(l), 0);
  if (points > HEAVY_POINTS) issues.push({ kind: 'heavy', points });
  return issues;
}
