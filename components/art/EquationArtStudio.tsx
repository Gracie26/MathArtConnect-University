import {
  ArrowDown,
  ArrowUp,
  Copy,
  Crosshair,
  Eye,
  EyeOff,
  Grid3x3,
  Move,
  Pencil,
  Plus,
  Redo2,
  RotateCcw,
  Stamp,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react-native';
import { type ReactNode, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthTextField } from '@/components/forms/AuthTextField';
import { FormError } from '@/components/forms/FormError';
import { GraphCanvas } from '@/components/graph/GraphCanvas';
import { CURVE_COLOR_NAMES, curvePalette } from '@/components/graph/plot';
import { Disclosure } from '@/components/learning/Disclosure';
import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Slider } from '@/components/ui/Slider';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { diagnose, MAX_LAYERS } from '@/lib/graph/diagnose';
import { layerFeatures } from '@/lib/graph/features';
import { freezeParameters, type Transformation, transformExpression, usesSymbols } from '@/lib/graph/expression';
import { type ArtProject, historyReducer, newLayer, startHistory } from '@/lib/graph/project';
import {
  compileLayer,
  describeRestriction,
  fmt,
  type GraphLayer,
  type GraphView,
  isPlaced,
  PARAMETER_NAMES,
  type Parameter,
  parameterValues,
  type Placement,
  valueAt,
} from '@/lib/graph/sample';
import { parseNumber, type StudioConfig } from '@/lib/graph/studio';
import { parseStatement } from '@/lib/math/input/parse';
import { toTex } from '@/lib/math/input/toTex';

import { projectCurves } from './artCurves';
import { LayerEditor } from './LayerEditor';
import {
  ALL_PARAMETERS,
  AnimationControls,
  type AnimationDirection,
  type AnimationSpeed,
  ExtensionBadge,
  type GraphAction,
  type GraphNotice,
  GraphStatus,
  SPEED_SECONDS,
  TemplateGallery,
  TransformPanel,
} from './StudioPanels';

export type SaveStatus = { status: 'idle' | 'saving' | 'saved' } | { status: 'error'; message: string };

/**
 * One animation step: each animated parameter moves `fraction` of the way
 * across its range (at least one slider step), going up, down, or back and
 * forth. `phases` remembers where each one is and which way it is moving.
 */
export function advanceParameters(
  parameters: readonly Parameter[],
  target: string,
  direction: AnimationDirection,
  fraction: number,
  phases: Map<string, { phase: number; sign: 1 | -1 }>,
): { name: string; value: number }[] {
  const names = target === ALL_PARAMETERS ? parameters.map((p) => p.name) : [target];
  const updates: { name: string; value: number }[] = [];
  for (const name of names) {
    const p = parameters.find((x) => x.name === name);
    if (!p || !(p.max > p.min)) continue;
    const range = p.max - p.min;
    const state = phases.get(name) ?? { phase: (p.value - p.min) / range, sign: 1 as const };
    const delta = Math.max(fraction, p.step / range);
    let next: number;
    let sign = state.sign;
    if (direction === 'up') next = state.phase + delta > 1 + 1e-9 ? 0 : state.phase + delta;
    else if (direction === 'down') next = state.phase - delta < -1e-9 ? 1 : state.phase - delta;
    else {
      next = state.phase + sign * delta;
      if (next > 1 + 1e-9 || next < -1e-9) {
        sign = sign === 1 ? -1 : 1;
        next = state.phase + sign * delta;
      }
    }
    next = Math.min(1, Math.max(0, next));
    phases.set(name, { phase: next, sign });
    updates.push({ name, value: p.min + next * range });
  }
  return updates;
}

/** The drawing rule for a moved, scaled or turned polar layer, in words learners can check. */
function placementText({ h, k, scale, rotation }: Placement): string {
  const s = scale === 1 ? '' : `${fmt(scale)}·`;
  const angle = rotation === 0 ? 'θ' : `θ + ${fmt(rotation)}°`;
  return `Drawn at x = ${fmt(h)} + ${s}r(θ)cos(${angle}), y = ${fmt(k)} + ${s}r(θ)sin(${angle}).`;
}

/** TeX for a layer's equation, or the raw text if it cannot be read. */
function equationTex(layer: GraphLayer): string {
  try {
    const statement = parseStatement(layer.expression);
    const node = statement.k === 'eq' ? statement.sides[1] : statement.node;
    return `${layer.kind === 'polar' ? 'r' : 'y'} = ${node ? toTex(node) : ''}`;
  } catch {
    return `\\text{${layer.expression.replace(/[{}\\]/g, '')}}`;
  }
}

function IconAction({
  label,
  icon,
  onPress,
  disabled = false,
  selected,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={selected === undefined ? { disabled } : { disabled, selected }}
      hitSlop={4}
      style={({ pressed }) => [
        styles.iconAction,
        {
          borderRadius: theme.radius.sm,
          backgroundColor: selected ? theme.colors.primarySoft : pressed ? theme.colors.surfacePressed : 'transparent',
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      {icon}
    </Pressable>
  );
}

/** Function Curve Composer: integrate a·xⁿ correctly to add its anti-derivative curve. */
function ComposerPanel({
  exponents,
  onAdd,
}: {
  exponents: number[];
  onAdd: (expression: string, name: string) => void;
}) {
  const theme = useAppTheme();
  const [a, setA] = useState(3);
  const [n, setN] = useState(exponents[0] ?? 2);
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const m = n + 1;
  const coefficient = Number((a / m).toFixed(4));
  const options = [
    {
      id: 'right',
      tex: `\\frac{${a}}{${m}}x^{${m}} + C`,
      correct: true,
      why: `Increase the exponent to ${m} and divide by ${m}.`,
    },
    {
      id: 'derivative',
      tex: `${a * n}x^{${n - 1}} + C`,
      correct: false,
      why: 'That differentiates $ax^{n}$ instead of integrating it.',
    },
    {
      id: 'nodivide',
      tex: `${a}x^{${m}} + C`,
      correct: false,
      why: `The exponent is right, but you must also divide by the new exponent ${m}.`,
    },
  ];
  const order = n % 2 === 0 ? [options[1], options[0], options[2]] : [options[2], options[1], options[0]];
  return (
    <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
      <AppText variant="h3">Integrate to add a curve</AppText>
      <AppText variant="small" color="textSecondary">
        Choose a coefficient and a power, then pick the correct anti-derivative. Correct answers join your composition.
      </AppText>
      <Slider
        label="Coefficient a"
        value={a}
        min={-4}
        max={4}
        step={1}
        onChange={(v) => setA(v === 0 ? 1 : v)}
        valueText={`a = ${a}`}
      />
      <View style={[styles.wrap, { gap: theme.spacing.xs }]}>
        {exponents.map((value) => (
          <Pressable
            key={value}
            onPress={() => {
              setN(value);
              setFeedback(null);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: value === n }}
            accessibilityLabel={`Power n = ${value}`}
            style={[
              styles.pill,
              {
                borderRadius: theme.radius.pill,
                borderColor: value === n ? theme.colors.primary : theme.colors.border,
                backgroundColor: value === n ? theme.colors.primarySoft : theme.colors.surface,
                minHeight: theme.touchTarget.min,
              },
            ]}
          >
            <AppText variant="caption">{`n = ${value}`}</AppText>
          </Pressable>
        ))}
      </View>
      <MathExpression tex={`\\int ${a}x^{${n}}\\,dx`} display />
      {order.map((option) =>
        option ? (
          <Pressable
            key={option.id}
            onPress={() => {
              setFeedback({ correct: option.correct, text: option.why });
              if (option.correct) onAdd(`${coefficient} x^${m} + C`, `∫ ${a}x^${n} dx`);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Choose ${option.tex.replace(/\\frac\{(\-?\d+)\}\{(\d+)\}/, '$1 over $2')}`}
            style={[
              styles.option,
              {
                borderRadius: theme.radius.md,
                borderColor: theme.colors.border,
                minHeight: theme.touchTarget.comfortable,
              },
            ]}
          >
            <MathExpression tex={option.tex} display size={17} />
          </Pressable>
        ) : null,
      )}
      {feedback ? (
        <MathText
          text={`${feedback.correct ? '✓ Correct. The curve was added with its own +C.' : '✗ Not yet.'} ${feedback.text}`}
          variant="small"
        />
      ) : null}
    </View>
  );
}

/**
 * Reusable Equation Art Studio: art made from many equation layers with
 * restrictions and live parameter sliders, zoom/pan, axes and grid, trace,
 * undo/redo, presets, and "Math behind my art". Saving is supplied by the
 * caller, so the studio works for any topic.
 */
/** Compiled layers, recompiled only when equations or parameter names change, not on every slider move. */
function useCompiledLayers(project: ArtProject, functions: StudioConfig['functions']) {
  const parameterKey = project.parameters.map((p) => p.name).join(',');
  const layers = project.layers;
  return useMemo(() => {
    const names = parameterKey === '' ? [] : parameterKey.split(',');
    return new Map(layers.map((layer) => [layer.id, compileLayer(layer, names, functions)]));
  }, [layers, parameterKey, functions]);
}

export function EquationArtStudio({
  config,
  initial,
  onSave,
  saveStatus,
  title,
  presetId,
}: {
  config: StudioConfig;
  initial: ArtProject;
  /** The starter this project came from, highlighted in the gallery. */
  presetId?: string;
  onSave: (project: ArtProject, completed: boolean) => void;
  saveStatus: SaveStatus;
  title: string;
}) {
  const theme = useAppTheme();
  const colors = useMemo(() => curvePalette(theme), [theme]);
  const [history, dispatch] = useReducer(historyReducer, initial, startHistory);
  const project = history.present;
  const [editing, setEditing] = useState<GraphLayer | null>(null);
  const [tracing, setTracing] = useState(false);
  const [trace, setTrace] = useState<{ layerId: string; x: number; y: number } | null>(null);
  const [layersOpen, setLayersOpen] = useState(true);
  const [newParameter, setNewParameter] = useState<{ min: string; max: string; step: string } | null>(null);
  const [paramError, setParamError] = useState<string | null>(null);

  const values = useMemo(() => parameterValues(project.parameters), [project.parameters]);
  const compiled = useCompiledLayers(project, config.functions);
  const parameterNames = project.parameters.map((p) => p.name);

  // The project the reset actions return to: the one opened, or the last starter loaded.
  const [baseline, setBaseline] = useState(initial);
  const [activePreset, setActivePreset] = useState<string | null>(presetId ?? null);
  const activeCategory = config.presets.find((p) => p.id === activePreset)?.category;

  // Animation: the learner chooses the parameter (or all), speed and direction.
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(false);
  const [animTarget, setAnimTarget] = useState<string>(project.parameters[0]?.name ?? '');
  const [speed, setSpeed] = useState<AnimationSpeed>('normal');
  const [animDirection, setAnimDirection] = useState<AnimationDirection>('bounce');
  const target =
    parameterNames.includes(animTarget) || (animTarget === ALL_PARAMETERS && parameterNames.length > 1)
      ? animTarget
      : (parameterNames[0] ?? '');
  const parametersRef = useRef(project.parameters);
  const phases = useRef(new Map<string, { phase: number; sign: 1 | -1 }>());
  useEffect(() => {
    parametersRef.current = project.parameters;
  }, [project.parameters]);

  /** Moves the animated parameters on by `fraction` of a full sweep. */
  const advance = (fraction: number) => {
    for (const u of advanceParameters(parametersRef.current, target, animDirection, fraction, phases.current)) {
      dispatch({ type: 'setParameterValue', name: u.name, value: u.value });
    }
  };

  useEffect(() => {
    if (!playing || reducedMotion || !target) return;
    const tickMs = 80;
    const fraction = tickMs / (SPEED_SECONDS[speed] * 1000);
    const timer = setInterval(() => {
      for (const u of advanceParameters(parametersRef.current, target, animDirection, fraction, phases.current)) {
        dispatch({ type: 'setParameterValue', name: u.name, value: u.value });
      }
    }, tickMs);
    return () => clearInterval(timer);
  }, [playing, reducedMotion, target, speed, animDirection]);

  const resetParameters = (names: readonly string[]) => {
    for (const name of names) {
      const start = baseline.parameters.find((p) => p.name === name)?.value;
      const p = project.parameters.find((x) => x.name === name);
      if (p) dispatch({ type: 'setParameterValue', name, value: start ?? (p.min + p.max) / 2 });
      phases.current.delete(name);
    }
  };

  // Fewer points while animating keeps phones responsive; full detail when still.
  const density = playing ? 0.5 : 1;
  // Sampled for the view actually drawn (with equal scaling it can be wider than the project's).
  const curves = useCallback(
    (drawn: GraphView) => projectCurves(project, compiled, drawn, colors, values, density),
    [project, compiled, colors, values, density],
  );

  // Checked only when the art is still, so animation does no extra sampling.
  const issues = useMemo(
    () => (playing ? [] : diagnose(project, compiled, values, project.view)),
    [playing, project, compiled, values],
  );
  const atLayerLimit = project.layers.length >= MAX_LAYERS;
  const notices: GraphNotice[] = issues.flatMap((issue): GraphNotice[] => {
    switch (issue.kind) {
      case 'noLayers':
        return [
          { id: 'none', text: 'There are no equations yet. Add one, or pick a starter artwork below.', actions: [] },
        ];
      case 'allHidden':
        return [
          {
            id: 'hidden',
            text: 'Every layer is hidden, so the canvas is empty.',
            actions: [{ label: 'Show all layers', action: { kind: 'showAll' } }],
          },
        ];
      case 'invalidDomain':
        return [
          {
            id: `domain-${issue.layerId}`,
            text: `${issue.name}: the end of its interval is not after the start, so nothing is drawn.`,
            actions: [{ label: 'Remove restriction', action: { kind: 'removeRestriction', layerId: issue.layerId } }],
          },
        ];
      case 'restrictionHidesAll':
        return [
          {
            id: `restriction-${issue.layerId}`,
            text: `${issue.name}: its restriction leaves no visible part of the curve.`,
            actions: [
              { label: 'Remove restriction', action: { kind: 'removeRestriction', layerId: issue.layerId } },
              { label: 'Edit layer', action: { kind: 'editLayer', layerId: issue.layerId } },
            ],
          },
        ];
      case 'offView':
        return [
          {
            id: 'offview',
            text: 'Your art is outside the visible part of the plane.',
            actions: [{ label: 'Reset view', action: { kind: 'resetView' } }],
          },
        ];
      case 'parameterAtLimit':
        return [
          {
            id: `param-${issue.name}`,
            text: `${issue.name} is at the end of its range, which may be why little is drawn.`,
            actions: [{ label: `Reset ${issue.name}`, action: { kind: 'resetParameter', name: issue.name } }],
          },
        ];
      case 'heavy':
        return [
          {
            id: 'heavy',
            text: 'This composition has many points to draw and may redraw slowly on a phone. Hide or remove a few layers (rotated copies count several times).',
            actions: [],
          },
        ];
      case 'tooManyLayers':
        return [
          {
            id: 'limit',
            text: `You have reached ${MAX_LAYERS} layers, the most a composition can hold on a phone. Remove a layer to add another.`,
            actions: [],
          },
        ];
    }
  });
  const onGraphAction = (action: GraphAction) => {
    switch (action.kind) {
      case 'showAll':
        for (const l of project.layers) if (!l.visible) dispatch({ type: 'toggleLayer', id: l.id });
        return;
      case 'resetView':
        dispatch({ type: 'resetView', view: baseline.view });
        return;
      case 'resetParameter':
        resetParameters([action.name]);
        return;
      case 'removeRestriction':
        dispatch({
          type: 'updateLayer',
          id: action.layerId,
          change: { domain: { start: null, end: null }, range: { min: null, max: null } },
        });
        return;
      case 'editLayer': {
        const layer = project.layers.find((l) => l.id === action.layerId);
        if (layer) setEditing(layer);
      }
    }
  };

  /** Adds a copy of the layer with its parameters frozen at their current values. */
  const stampLayer = (layer: GraphLayer) => {
    const used = project.parameters.filter((p) => usesSymbols(layer.expression, [p.name]));
    if (used.length === 0 || atLayerLimit) return;
    const at = used.map((p) => `${p.name} = ${fmt(p.value)}`).join(', ');
    dispatch({
      type: 'addLayer',
      layer: {
        ...newLayer(
          layer.kind,
          freezeParameters(layer.expression, values),
          `${layer.name.replace(/ \(.*\)$/, '')} (${at})`,
          (project.layers.length + 1) % colors.length,
        ),
        domain: layer.domain,
        range: layer.range,
        repeat: layer.repeat,
        mirror: layer.mirror,
        ...(layer.placement ? { placement: layer.placement } : {}),
        width: Math.max(1.5, layer.width - 1),
      },
    });
  };
  const stampTarget = [...project.layers].reverse().find((l) => usesSymbols(l.expression, parameterNames));
  const stampValues = stampTarget
    ? project.parameters
        .filter((p) => usesSymbols(stampTarget.expression, [p.name]))
        .map((p) => `${p.name} = ${fmt(p.value)}`)
        .join(', ')
    : '';

  /** Substitutes into a layer: the original becomes the dashed "before", the result a new layer. */
  const applyTransformation = (source: GraphLayer, operation: Transformation) => {
    if (atLayerLimit) return;
    for (const p of operation.parameters) {
      if (!parameterNames.includes(p.name)) dispatch({ type: 'addParameter', parameter: p });
    }
    if (!source.dashed) dispatch({ type: 'updateLayer', id: source.id, change: { dashed: true } });
    dispatch({
      type: 'addLayer',
      layer: {
        ...newLayer(
          source.kind,
          transformExpression(source.expression, source.kind, operation),
          `${source.name} · ${operation.label}`,
          (project.layers.length + 1) % colors.length,
        ),
        domain: source.domain,
        ...(source.placement ? { placement: source.placement } : {}),
        width: 3,
      },
    });
  };

  const visibleLayers = project.layers.filter((l) => l.visible);
  const summary = `${project.title}: ${visibleLayers.length} visible ${visibleLayers.length === 1 ? 'layer' : 'layers'}. ${visibleLayers
    .map(
      (l) =>
        `${l.name}, ${l.kind === 'polar' ? 'r' : 'y'} = ${l.expression}${describeRestriction(l) ? ` for ${describeRestriction(l)}` : ''}`,
    )
    .join('; ')}`;

  const traceLayer = project.layers.find((l) => l.visible && l.kind === 'cartesian' && compiled.get(l.id)?.ok);
  const onTap = (x: number) => {
    if (!tracing || !traceLayer) return;
    const c = compiled.get(traceLayer.id);
    if (!c?.ok) return;
    const y = valueAt(c, x, values);
    setTrace(Number.isFinite(y) ? { layerId: traceLayer.id, x, y } : null);
  };

  const unusedNames = PARAMETER_NAMES.filter((n) => !parameterNames.includes(n));
  const addParameter = () => {
    if (!newParameter) return;
    const min = parseNumber(newParameter.min);
    const max = parseNumber(newParameter.max);
    const step = parseNumber(newParameter.step);
    const name = unusedNames[0];
    if (!name) return setParamError('All parameter names are in use.');
    if (min === null || max === null || step === null || !(max > min) || !(step > 0)) {
      return setParamError('Enter a minimum, a larger maximum and a positive step.');
    }
    dispatch({ type: 'addParameter', parameter: { name, min, max, step, value: Math.min(max, Math.max(min, 1)) } });
    setNewParameter(null);
    setParamError(null);
  };

  const answered = config.questions.some((q) => (project.math.answers[q.id] ?? '').trim().length > 0);

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <View style={{ gap: theme.spacing.sm }}>
        <AuthTextField
          label="Project title"
          value={project.title}
          onChangeText={(t) => dispatch({ type: 'setTitle', title: t })}
        />
        <View style={[styles.toolbar, { gap: 2 }]}>
          <IconAction
            label="Undo"
            icon={<Undo2 size={20} color={theme.colors.primary} />}
            onPress={() => dispatch({ type: 'undo' })}
            disabled={history.past.length === 0}
          />
          <IconAction
            label="Redo"
            icon={<Redo2 size={20} color={theme.colors.primary} />}
            onPress={() => dispatch({ type: 'redo' })}
            disabled={history.future.length === 0}
          />
          <IconAction
            label="Zoom in"
            icon={<ZoomIn size={20} color={theme.colors.primary} />}
            onPress={() => dispatch({ type: 'zoom', factor: 0.8 })}
          />
          <IconAction
            label="Zoom out"
            icon={<ZoomOut size={20} color={theme.colors.primary} />}
            onPress={() => dispatch({ type: 'zoom', factor: 1.25 })}
          />
          <IconAction
            label="Reset view"
            icon={<RotateCcw size={20} color={theme.colors.primary} />}
            onPress={() => dispatch({ type: 'resetView', view: baseline.view })}
          />
          <IconAction
            label={project.view.axes ? 'Hide axes' : 'Show axes'}
            icon={<Move size={20} color={theme.colors.primary} />}
            onPress={() => dispatch({ type: 'setView', view: { axes: !project.view.axes } })}
            selected={project.view.axes}
          />
          <IconAction
            label={project.view.grid ? 'Hide grid' : 'Show grid'}
            icon={<Grid3x3 size={20} color={theme.colors.primary} />}
            onPress={() => dispatch({ type: 'setView', view: { grid: !project.view.grid } })}
            selected={project.view.grid}
          />
          <IconAction
            label={tracing ? 'Stop tracing' : 'Trace values'}
            icon={<Crosshair size={20} color={theme.colors.primary} />}
            onPress={() => {
              setTracing((t) => !t);
              setTrace(null);
            }}
            selected={tracing}
          />
        </View>
      </View>

      <View style={{ gap: theme.spacing.xs }}>
        {activeCategory === 'extension' ? <ExtensionBadge /> : null}
        <GraphCanvas
          view={project.view}
          curves={curves}
          equalScale={config.equalScale === true}
          summary={summary}
          onPan={(dx, dy) => dispatch({ type: 'pan', dx, dy })}
          onZoom={(factor) => dispatch({ type: 'zoom', factor })}
          onTap={onTap}
          marker={trace ? { x: trace.x, y: trace.y } : null}
        />
        <AppText variant="small" color="textSecondary">
          {tracing
            ? traceLayer
              ? trace
                ? `${traceLayer.name}: at x = ${fmt(trace.x)}, y = ${fmt(trace.y)}`
                : `Tap the graph to read ${traceLayer.name} at that x.`
              : 'Add a visible y = f(x) layer to trace values.'
            : 'Drag with one finger to pan, pinch with two to zoom, or use the buttons above.'}
        </AppText>
        <GraphStatus notices={notices} onAction={onGraphAction} />
      </View>

      <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
        <View style={styles.headerRow}>
          <AppText variant="h3">Parameters</AppText>
          {unusedNames.length > 0 && !newParameter ? (
            <Pressable
              onPress={() => setNewParameter({ min: '-5', max: '5', step: '0.5' })}
              accessibilityRole="button"
              accessibilityLabel="Add a parameter"
              style={{ minHeight: theme.touchTarget.min, justifyContent: 'center' }}
            >
              <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
                + Add parameter
              </AppText>
            </Pressable>
          ) : null}
        </View>
        {project.parameters.length === 0 && !newParameter ? (
          <AppText variant="small" color="textSecondary">
            Parameters such as a, b or c become sliders. Use them in your equations and watch the art change live.
          </AppText>
        ) : null}
        {project.parameters.map((p) => (
          <View key={p.name} style={{ gap: theme.spacing.xs }}>
            <Slider
              label={`Parameter ${p.name}`}
              value={p.value}
              min={p.min}
              max={p.max}
              step={p.step}
              onChange={(v) => dispatch({ type: 'setParameterValue', name: p.name, value: v })}
              valueText={`${p.name} = ${fmt(p.value)}`}
            />
            <Disclosure showLabel={`Range for ${p.name}`} hideLabel={`Hide range for ${p.name}`}>
              <View style={[styles.wrap, { gap: theme.spacing.sm }]}>
                {(['min', 'max', 'step'] as const).map((field) => (
                  <View key={field} style={styles.third}>
                    <AuthTextField
                      label={`${field === 'min' ? 'Minimum' : field === 'max' ? 'Maximum' : 'Step'} of ${p.name}`}
                      defaultValue={String(p[field])}
                      onEndEditing={(e) => {
                        const value = parseNumber(e.nativeEvent.text);
                        if (value !== null)
                          dispatch({ type: 'updateParameter', name: p.name, change: { [field]: value } });
                      }}
                      autoCapitalize="none"
                    />
                  </View>
                ))}
              </View>
              <Pressable
                onPress={() => dispatch({ type: 'deleteParameter', name: p.name })}
                accessibilityRole="button"
                accessibilityLabel={`Delete parameter ${p.name}`}
                style={{ minHeight: theme.touchTarget.min, justifyContent: 'center' }}
              >
                <AppText variant="caption" color="error">
                  {`Delete parameter ${p.name}`}
                </AppText>
              </Pressable>
            </Disclosure>
          </View>
        ))}
        {newParameter ? (
          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="caption">{`New parameter: ${unusedNames[0]}`}</AppText>
            <View style={[styles.wrap, { gap: theme.spacing.sm }]}>
              {(['min', 'max', 'step'] as const).map((field) => (
                <View key={field} style={styles.third}>
                  <AuthTextField
                    label={field === 'min' ? 'Minimum' : field === 'max' ? 'Maximum' : 'Step'}
                    value={newParameter[field]}
                    onChangeText={(text) => setNewParameter({ ...newParameter, [field]: text })}
                    autoCapitalize="none"
                  />
                </View>
              ))}
            </View>
            <FormError message={paramError} />
            <View style={[styles.wrap, { gap: theme.spacing.sm }]}>
              <LoadingButton
                variant="secondary"
                label="Cancel"
                onPress={() => setNewParameter(null)}
                style={styles.grow}
              />
              <LoadingButton label={`Add ${unusedNames[0]}`} onPress={addParameter} style={styles.grow} />
            </View>
          </View>
        ) : null}
      </View>

      <AnimationControls
        parameterNames={parameterNames}
        target={target}
        speed={speed}
        direction={animDirection}
        playing={playing}
        reducedMotion={reducedMotion}
        onTarget={(name) => {
          setAnimTarget(name);
          phases.current.clear();
        }}
        onSpeed={setSpeed}
        onDirection={(d) => {
          setAnimDirection(d);
          phases.current.clear();
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onStep={() => advance(0.05)}
        onReset={() => {
          setPlaying(false);
          resetParameters(target === ALL_PARAMETERS ? parameterNames : [target]);
        }}
      />

      {config.stamp && stampTarget ? (
        <View style={[cardStyle(theme), { padding: theme.spacing.md, gap: theme.spacing.sm }]}>
          <MathText text={config.stamp.hint} variant="small" color="textSecondary" />
          <LoadingButton
            variant="secondary"
            icon={Stamp}
            label={`${config.stamp.label} (${stampValues})`}
            onPress={() => stampLayer(stampTarget)}
          />
        </View>
      ) : null}

      <TemplateGallery
        presets={config.presets}
        functions={config.functions}
        activeId={activePreset}
        onUse={(preset) => {
          setPlaying(false);
          phases.current.clear();
          setActivePreset(preset.id);
          setBaseline(preset.project);
          setAnimTarget(preset.project.parameters[0]?.name ?? '');
          dispatch({ type: 'load', project: { ...preset.project, title: project.title, math: project.math } });
        }}
      />

      {config.transform ? (
        <TransformPanel
          intro={config.transform.intro}
          operations={config.transform.operations}
          layers={project.layers}
          onApply={applyTransformation}
        />
      ) : null}

      {config.composer ? (
        <ComposerPanel
          exponents={config.composer.exponents}
          onAdd={(expression, name) => {
            if (atLayerLimit) return;
            if (!parameterNames.includes('C')) {
              dispatch({ type: 'addParameter', parameter: { name: 'C', value: 0, min: -5, max: 5, step: 0.5 } });
            }
            dispatch({ type: 'addLayer', layer: newLayer('cartesian', expression, name, project.layers.length % 6) });
          }}
        />
      ) : null}

      <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
        <Pressable
          onPress={() => setLayersOpen((o) => !o)}
          accessibilityRole="button"
          accessibilityState={{ expanded: layersOpen }}
          accessibilityLabel={`Equation layers, ${project.layers.length}`}
          style={[styles.headerRow, { minHeight: theme.touchTarget.min }]}
        >
          <AppText variant="h3">{`Equation layers (${project.layers.length})`}</AppText>
          <AppText variant="caption" color="primary">
            {layersOpen ? 'Hide' : 'Show'}
          </AppText>
        </Pressable>
        {layersOpen
          ? project.layers.map((layer, index) => {
              const c = compiled.get(layer.id);
              const restriction = describeRestriction(layer);
              return (
                <View
                  key={layer.id}
                  style={[
                    styles.layer,
                    { borderColor: theme.colors.border, borderRadius: theme.radius.md, gap: theme.spacing.xs },
                  ]}
                >
                  <View style={[styles.headerRow, { gap: theme.spacing.sm }]}>
                    <View style={[styles.swatch, { backgroundColor: colors[layer.color % colors.length] }]} />
                    <AppText variant="title" style={styles.grow} numberOfLines={1}>
                      {`${index + 1}. ${layer.name}`}
                    </AppText>
                    <AppText variant="small" color="textSecondary">
                      {`${CURVE_COLOR_NAMES[layer.color % CURVE_COLOR_NAMES.length]}${layer.visible ? '' : ' · hidden'}`}
                    </AppText>
                  </View>
                  {c?.ok ? <MathExpression tex={equationTex(layer)} display size={16} /> : null}
                  {c && !c.ok ? (
                    <AppText variant="small" color="error">
                      {c.error}
                    </AppText>
                  ) : null}
                  {restriction ? (
                    <AppText variant="small" color="textSecondary">
                      {restriction}
                    </AppText>
                  ) : null}
                  <View style={[styles.toolbar, { gap: 2 }]}>
                    <IconAction
                      label={layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}
                      icon={
                        layer.visible ? (
                          <Eye size={18} color={theme.colors.primary} />
                        ) : (
                          <EyeOff size={18} color={theme.colors.textSecondary} />
                        )
                      }
                      onPress={() => dispatch({ type: 'toggleLayer', id: layer.id })}
                    />
                    <IconAction
                      label={`Edit ${layer.name}`}
                      icon={<Pencil size={18} color={theme.colors.primary} />}
                      onPress={() => setEditing(layer)}
                    />
                    {usesSymbols(layer.expression, parameterNames) ? (
                      <IconAction
                        label={`Keep a copy of ${layer.name} at the current values`}
                        icon={<Stamp size={18} color={theme.colors.primary} />}
                        onPress={() => stampLayer(layer)}
                      />
                    ) : null}
                    <IconAction
                      label={`Duplicate ${layer.name}`}
                      icon={<Copy size={18} color={theme.colors.primary} />}
                      onPress={() => dispatch({ type: 'duplicateLayer', id: layer.id })}
                      disabled={atLayerLimit}
                    />
                    <IconAction
                      label={`Move ${layer.name} up`}
                      icon={<ArrowUp size={18} color={theme.colors.primary} />}
                      onPress={() => dispatch({ type: 'moveLayer', id: layer.id, direction: -1 })}
                      disabled={index === 0}
                    />
                    <IconAction
                      label={`Move ${layer.name} down`}
                      icon={<ArrowDown size={18} color={theme.colors.primary} />}
                      onPress={() => dispatch({ type: 'moveLayer', id: layer.id, direction: 1 })}
                      disabled={index === project.layers.length - 1}
                    />
                    <IconAction
                      label={`Delete ${layer.name}`}
                      icon={<Trash2 size={18} color={theme.colors.error} />}
                      onPress={() => dispatch({ type: 'deleteLayer', id: layer.id })}
                    />
                  </View>
                </View>
              );
            })
          : null}
        <LoadingButton
          label="Add equation"
          onPress={() =>
            setEditing(
              newLayer(
                config.layerKinds[0] ?? 'cartesian',
                config.layerKinds[0] === 'polar' ? 'cos(θ)' : 'x',
                `Layer ${project.layers.length + 1}`,
                project.layers.length % colors.length,
              ),
            )
          }
          icon={Plus}
          disabled={atLayerLimit}
        />
      </View>

      <MathBehindMyArt
        project={project}
        config={config}
        extension={activeCategory === 'extension'}
        onChange={(change) => dispatch({ type: 'setMath', change })}
      />

      <View style={{ gap: theme.spacing.sm }}>
        {saveStatus.status === 'error' ? <FormError message={saveStatus.message} /> : null}
        {saveStatus.status === 'saved' ? (
          <AppText variant="small" color="success" accessibilityLiveRegion="polite">
            {`Saved "${title}".`}
          </AppText>
        ) : null}
        <LoadingButton
          label={answered ? 'Save and mark complete' : 'Save project'}
          loading={saveStatus.status === 'saving'}
          loadingLabel="Saving"
          onPress={() => onSave(project, answered)}
        />
        {!answered ? (
          <AppText variant="small" color="textSecondary">
            Answer a question in “Math behind my art” to complete this activity.
          </AppText>
        ) : null}
      </View>

      {editing ? (
        <LayerEditor
          layer={editing}
          parameterNames={parameterNames}
          config={config}
          onCancel={() => setEditing(null)}
          onSave={(layer) => {
            if (project.layers.some((l) => l.id === layer.id)) {
              const { id, ...change } = layer;
              dispatch({ type: 'updateLayer', id, change });
            } else {
              dispatch({ type: 'addLayer', layer });
            }
            setEditing(null);
          }}
        />
      ) : null}
    </View>
  );
}

/** One line of features for a layer, computed from its equation (lib/graph/features). */
function featureLines(layer: GraphLayer, project: ArtProject): string[] {
  const features = layerFeatures(layer, project.parameters, project.view);
  if (!features) return [];
  if (features.kind === 'polar') {
    return [
      ...(features.maxDistance !== null
        ? [
            `The largest |r(θ)| is ${fmt(features.maxDistance)}: how far the curve reaches from its centre${
              layer.placement && layer.placement.scale !== 1 ? ', before scaling' : ''
            }.`,
          ]
        : []),
      ...(features.symmetricAboutXAxis ? ['r(−θ) = r(θ), so this curve is symmetric about the x-axis.'] : []),
    ];
  }
  const lines: string[] = [];
  if (features.yIntercept === 'undefined') lines.push('No y-intercept: the equation is undefined at x = 0.');
  else if (features.yIntercept !== null) lines.push(`y-intercept: (0, ${fmt(features.yIntercept)}).`);
  if (features.xIntercepts.length === 0) lines.push('Does not meet the x-axis in this view.');
  else
    lines.push(
      `Meets the x-axis at x ≈ ${features.xIntercepts.map(fmt).join(', ')}${features.moreXIntercepts ? ' and more' : ''}.`,
    );
  if (features.symmetry === 'even') lines.push('Symmetric about the y-axis: f(−x) = f(x).');
  if (features.symmetry === 'odd') lines.push('Symmetric about the origin: f(−x) = −f(x).');
  if (features.range) lines.push(`In this view, y runs from ${fmt(features.range.min)} to ${fmt(features.range.max)}.`);
  return lines;
}

/**
 * "How to read this graph": what the axes mean, and the key features of up to three visible layers,
 * computed from their equations. Features are shown only where they exist.
 */
function GraphReading({ project }: { project: ArtProject }) {
  const theme = useAppTheme();
  const visible = project.layers.filter((l) => l.visible);
  const shown = visible.slice(0, 3);
  const hasPolar = visible.some((l) => l.kind === 'polar');
  const hasCartesian = visible.some((l) => l.kind === 'cartesian');
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
        How to read this graph
      </AppText>
      {hasCartesian ? (
        <AppText variant="small" color="textSecondary">
          {
            'Horizontal axis: x, the input. Vertical axis: y, the value of the equation at that x. Each curve is every point (x, y) that makes its equation true.'
          }
        </AppText>
      ) : null}
      {hasPolar ? (
        <AppText variant="small" color="textSecondary">
          {
            'Polar curves: for each angle θ, a point is drawn at distance r(θ) from the centre in the direction θ. Petals and loops come from r growing and shrinking as θ turns.'
          }
        </AppText>
      ) : null}
      {project.parameters.length > 0 ? (
        <AppText variant="small" color="textSecondary">
          {
            'Move one slider at a time and watch which feature changes: height, width, position, or the number of waves or petals.'
          }
        </AppText>
      ) : null}
      {shown.map((layer) => {
        const lines = featureLines(layer, project);
        return lines.length > 0 ? (
          <View key={layer.id} style={{ gap: 2 }}>
            <AppText variant="small" style={{ fontFamily: theme.fontFamilies.semibold }}>
              {layer.name}
            </AppText>
            {lines.map((line) => (
              <AppText key={line} variant="small" color="textSecondary">
                {line}
              </AppText>
            ))}
          </View>
        ) : null;
      })}
      {visible.length > shown.length ? (
        <AppText variant="small" color="textSecondary">
          {`Features are listed for the first ${shown.length} visible layers.`}
        </AppText>
      ) : null}
    </View>
  );
}

/** Equations, parameters, restrictions, the concept, and the learner's own explanation. */
export function MathBehindMyArt({
  project,
  config,
  onChange,
  extension = false,
}: {
  project: ArtProject;
  config: StudioConfig;
  onChange: (change: Partial<ArtProject['math']>) => void;
  /** The artwork started from a creative-extension starter. */
  extension?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
      <AppText variant="h3">Math behind my art</AppText>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
          Concept
        </AppText>
        <MathText text={config.concept} />
        {config.note ? <MathText text={config.note} variant="small" color="textSecondary" /> : null}
        {extension ? <ExtensionBadge /> : null}
      </View>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
          {`Equations used (${project.layers.length})`}
        </AppText>
        {project.layers.length === 0 ? (
          <AppText variant="small" color="textSecondary">
            No equations yet.
          </AppText>
        ) : (
          project.layers.map((layer) => (
            <View key={layer.id} style={{ gap: 2 }}>
              <MathExpression tex={equationTex(layer)} size={15} display />
              {describeRestriction(layer) ? (
                <AppText variant="small" color="textSecondary">
                  {`Restrictions and position: ${describeRestriction(layer)}`}
                </AppText>
              ) : null}
              {layer.kind === 'polar' && isPlaced(layer.placement) ? (
                <AppText variant="small" color="textSecondary">
                  {placementText(layer.placement)}
                </AppText>
              ) : null}
            </View>
          ))
        )}
        {project.parameters.length > 0 ? (
          <AppText variant="small" color="textSecondary">
            {`Parameters: ${project.parameters.map((p) => `${p.name} = ${fmt(p.value)} (from ${fmt(p.min)} to ${fmt(p.max)})`).join(', ')}`}
          </AppText>
        ) : null}
      </View>
      <GraphReading project={project} />
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
          Transformations and identities I used
        </AppText>
        <View style={[styles.wrap, { gap: theme.spacing.xs }]}>
          {config.transformations.map((t) => {
            const on = project.math.transformations.includes(t);
            return (
              <Pressable
                key={t}
                onPress={() =>
                  onChange({
                    transformations: on
                      ? project.math.transformations.filter((x) => x !== t)
                      : [...project.math.transformations, t],
                  })
                }
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={t}
                style={[
                  styles.pill,
                  {
                    borderRadius: theme.radius.pill,
                    borderColor: on ? theme.colors.primary : theme.colors.border,
                    backgroundColor: on ? theme.colors.primarySoft : theme.colors.surface,
                    minHeight: theme.touchTarget.min,
                  },
                ]}
              >
                <AppText variant="caption">{on ? `✓ ${t}` : t}</AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
      {config.questions.map((q) => (
        <View key={q.id} style={{ gap: theme.spacing.xs }}>
          <MathText text={q.prompt} />
          <AuthTextField
            label="Your answer"
            value={project.math.answers[q.id] ?? ''}
            onChangeText={(text) => onChange({ answers: { ...project.math.answers, [q.id]: text } })}
            multiline
          />
        </View>
      ))}
      <AuthTextField
        label="Explain your art (optional)"
        value={project.math.explanation}
        onChangeText={(explanation) => onChange({ explanation })}
        multiline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  iconAction: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  grow: { flexGrow: 1, flexShrink: 1 },
  third: { flex: 1, minWidth: 90 },
  layer: { borderWidth: 1, padding: 10 },
  swatch: { width: 16, height: 16, borderRadius: 8 },
  pill: { paddingHorizontal: 12, justifyContent: 'center', borderWidth: 1 },
  option: { borderWidth: 1, paddingHorizontal: 8, justifyContent: 'center' },
});
