/**
 * Equation art project: layers, parameters, view, and the learner's "Math
 * behind my art". All edits go through `projectReducer`, wrapped in an
 * undo/redo history. Slider moves update live without filling the history;
 * structural edits (layers, parameters, title) can be undone.
 */
import type { GraphLayer, GraphView, LayerKind, Parameter } from './sample';

export interface MathBehindMyArt {
  /** Transformations or identities the learner says the art uses. */
  transformations: string[];
  /** Answers to the activity's short questions, by question id. */
  answers: Record<string, string>;
  /** Optional free explanation. */
  explanation: string;
}

export interface ArtProject {
  title: string;
  layers: GraphLayer[];
  parameters: Parameter[];
  view: GraphView;
  math: MathBehindMyArt;
}

export const DEFAULT_VIEW: GraphView = { xMin: -6, xMax: 6, yMin: -4.5, yMax: 4.5, axes: true, grid: true };

let layerCounter = 0;
export const layerId = (): string => `layer-${Date.now().toString(36)}-${(layerCounter++).toString(36)}`;

export function newLayer(kind: LayerKind, expression: string, name: string, color = 0): GraphLayer {
  return {
    id: layerId(),
    name,
    kind,
    expression,
    visible: true,
    color,
    width: 2.5,
    domain: { start: null, end: null },
    range: { min: null, max: null },
    repeat: 1,
    mirror: false,
  };
}

export const emptyProject = (title = 'Untitled composition', view: GraphView = DEFAULT_VIEW): ArtProject => ({
  title,
  layers: [],
  parameters: [],
  view,
  math: { transformations: [], answers: {}, explanation: '' },
});

export type ProjectAction =
  | { type: 'load'; project: ArtProject }
  | { type: 'setTitle'; title: string }
  | { type: 'addLayer'; layer: GraphLayer }
  | { type: 'updateLayer'; id: string; change: Partial<Omit<GraphLayer, 'id'>> }
  | { type: 'deleteLayer'; id: string }
  | { type: 'duplicateLayer'; id: string }
  | { type: 'moveLayer'; id: string; direction: -1 | 1 }
  | { type: 'toggleLayer'; id: string }
  | { type: 'addParameter'; parameter: Parameter }
  | { type: 'updateParameter'; name: string; change: Partial<Omit<Parameter, 'name'>> }
  | { type: 'deleteParameter'; name: string }
  /** Live slider value: applied immediately, not recorded in undo history. */
  | { type: 'setParameterValue'; name: string; value: number }
  | { type: 'setView'; view: Partial<GraphView> }
  | { type: 'zoom'; factor: number }
  | { type: 'pan'; dx: number; dy: number }
  | { type: 'resetView'; view?: GraphView }
  | { type: 'setMath'; change: Partial<MathBehindMyArt> };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Rounds to the slider step, avoiding floating-point noise. */
export function snap(value: number, parameter: Pick<Parameter, 'min' | 'max' | 'step'>): number {
  const steps = Math.round((clamp(value, parameter.min, parameter.max) - parameter.min) / parameter.step);
  return Number((parameter.min + steps * parameter.step).toFixed(6));
}

export function projectReducer(project: ArtProject, action: ProjectAction): ArtProject {
  switch (action.type) {
    case 'load':
      return action.project;
    case 'setTitle':
      return { ...project, title: action.title.slice(0, 120) };
    case 'addLayer':
      return { ...project, layers: [...project.layers, action.layer] };
    case 'updateLayer':
      return {
        ...project,
        layers: project.layers.map((l) => (l.id === action.id ? { ...l, ...action.change } : l)),
      };
    case 'deleteLayer':
      return { ...project, layers: project.layers.filter((l) => l.id !== action.id) };
    case 'duplicateLayer': {
      const index = project.layers.findIndex((l) => l.id === action.id);
      const original = project.layers[index];
      if (!original) return project;
      const copy: GraphLayer = { ...original, id: layerId(), name: `${original.name} (copy)` };
      const layers = [...project.layers];
      layers.splice(index + 1, 0, copy);
      return { ...project, layers };
    }
    case 'moveLayer': {
      const index = project.layers.findIndex((l) => l.id === action.id);
      const target = index + action.direction;
      if (index < 0 || target < 0 || target >= project.layers.length) return project;
      const layers = [...project.layers];
      [layers[index], layers[target]] = [layers[target] as GraphLayer, layers[index] as GraphLayer];
      return { ...project, layers };
    }
    case 'toggleLayer':
      return {
        ...project,
        layers: project.layers.map((l) => (l.id === action.id ? { ...l, visible: !l.visible } : l)),
      };
    case 'addParameter':
      if (project.parameters.some((p) => p.name === action.parameter.name)) return project;
      return { ...project, parameters: [...project.parameters, action.parameter] };
    case 'updateParameter':
      return {
        ...project,
        parameters: project.parameters.map((p) => {
          if (p.name !== action.name) return p;
          const next = { ...p, ...action.change };
          if (!(next.max > next.min) || !(next.step > 0)) return p;
          return { ...next, value: snap(next.value, next) };
        }),
      };
    case 'deleteParameter':
      return { ...project, parameters: project.parameters.filter((p) => p.name !== action.name) };
    case 'setParameterValue':
      return {
        ...project,
        parameters: project.parameters.map((p) =>
          p.name === action.name ? { ...p, value: snap(action.value, p) } : p,
        ),
      };
    case 'setView':
      return { ...project, view: { ...project.view, ...action.view } };
    case 'zoom': {
      const { xMin, xMax, yMin, yMax } = project.view;
      const cx = (xMin + xMax) / 2;
      const cy = (yMin + yMax) / 2;
      const hw = clamp(((xMax - xMin) / 2) * action.factor, 0.05, 1000);
      const hh = clamp(((yMax - yMin) / 2) * action.factor, 0.05, 1000);
      return { ...project, view: { ...project.view, xMin: cx - hw, xMax: cx + hw, yMin: cy - hh, yMax: cy + hh } };
    }
    case 'pan':
      return {
        ...project,
        view: {
          ...project.view,
          xMin: project.view.xMin + action.dx,
          xMax: project.view.xMax + action.dx,
          yMin: project.view.yMin + action.dy,
          yMax: project.view.yMax + action.dy,
        },
      };
    case 'resetView':
      return {
        ...project,
        view: { ...(action.view ?? DEFAULT_VIEW), axes: project.view.axes, grid: project.view.grid },
      };
    case 'setMath':
      return { ...project, math: { ...project.math, ...action.change } };
  }
}

// -----------------------------------------------------------------------------
// Undo / redo
// -----------------------------------------------------------------------------

export interface History {
  past: ArtProject[];
  present: ArtProject;
  future: ArtProject[];
}

/** Live or view-only changes: applied, but not added to the undo history. */
const NOT_RECORDED = new Set<ProjectAction['type']>([
  'setParameterValue',
  'setView',
  'zoom',
  'pan',
  'resetView',
  'setMath',
  'load',
]);
const HISTORY_LIMIT = 50;

export type HistoryAction = ProjectAction | { type: 'undo' } | { type: 'redo' };

export function historyReducer(history: History, action: HistoryAction): History {
  if (action.type === 'undo') {
    const previous = history.past[history.past.length - 1];
    if (!previous) return history;
    return { past: history.past.slice(0, -1), present: previous, future: [history.present, ...history.future] };
  }
  if (action.type === 'redo') {
    const next = history.future[0];
    if (!next) return history;
    return { past: [...history.past, history.present], present: next, future: history.future.slice(1) };
  }
  const present = projectReducer(history.present, action);
  if (present === history.present) return history;
  if (action.type === 'load') return { past: [], present, future: [] };
  if (NOT_RECORDED.has(action.type)) return { ...history, present };
  return { past: [...history.past, history.present].slice(-HISTORY_LIMIT), present, future: [] };
}

export const startHistory = (project: ArtProject): History => ({ past: [], present: project, future: [] });
