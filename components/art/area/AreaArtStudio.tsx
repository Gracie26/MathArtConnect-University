import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  Maximize2,
  Redo2,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react-native';
import { type ReactNode, useMemo, useReducer, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ChipButton, ChipRow } from '@/components/explore/ExploreScaffold';
import { Readout } from '@/components/explore/area/AreaParts';
import { AuthTextField } from '@/components/forms/AuthTextField';
import { FormError } from '@/components/forms/FormError';
import { CURVE_COLOR_NAMES, curvePalette } from '@/components/graph/plot';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Slider } from '@/components/ui/Slider';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  ACCUMULATION_FUNCTIONS,
  AREA_FUNCTIONS,
  AREA_TEMPLATES,
  type AreaArtProject,
  type AreaLayer,
  type AreaLayerKind,
  type AreaStudioConfig,
  type AreaTemplate,
  type ColourMode,
  type CreativeSettings,
  duplicateLayer,
  hasCreativeLayout,
  layerMath,
  type Mirror,
  MOSAIC_FUNCTIONS,
  type MosaicRule,
  moveLayer,
  newLayer,
  normaliseLayer,
  projectFromTemplate,
  TRAIL_FUNCTIONS,
} from '@/lib/art/areaArt';

import type { SaveStatus } from '../EquationArtStudio';
import { AreaArtCanvas } from './AreaArtCanvas';

/** Minimum length of the learner's explanation for the project to count as complete. */
export const EXPLANATION_MIN = 20;
const MAX_LAYERS = 8;

export type History = { past: AreaArtProject[]; present: AreaArtProject; future: AreaArtProject[] };
type Action =
  | { type: 'set'; project: AreaArtProject }
  /** Pinch and drag: changes the view live without filling the undo history. */
  | { type: 'gesture'; zoomFactor: number; panX: number; panY: number }
  | { type: 'undo' }
  | { type: 'redo' };

export function historyReducer(state: History, action: Action): History {
  switch (action.type) {
    case 'set':
      return { past: [...state.past, state.present].slice(-40), present: action.project, future: [] };
    case 'gesture': {
      const view = state.present.view;
      const zoom = Math.max(0.25, Math.min(8, view.zoom * action.zoomFactor));
      return {
        ...state,
        present: {
          ...state.present,
          view: { zoom, panX: view.panX + action.panX / view.zoom, panY: view.panY + action.panY / view.zoom },
        },
      };
    }
    case 'undo': {
      const previous = state.past.at(-1);
      return previous
        ? { past: state.past.slice(0, -1), present: previous, future: [state.present, ...state.future] }
        : state;
    }
    case 'redo': {
      const [next, ...rest] = state.future;
      return next ? { past: [...state.past, state.present], present: next, future: rest } : state;
    }
  }
}

/** A number as plain text, with multiples of π/4 written with π. */
function plainNumber(v: number): string {
  const quarters = (v / Math.PI) * 4;
  if (Math.abs(v) > 1e-9 && Math.abs(quarters - Math.round(quarters)) < 1e-9) {
    const q = Math.round(quarters);
    const table: Record<number, string> = {
      1: 'π/4',
      2: 'π/2',
      3: '3π/4',
      4: 'π',
      5: '5π/4',
      6: '3π/2',
      7: '7π/4',
      8: '2π',
    };
    return table[q] ?? `${q}π/4`;
  }
  return String(Number(v.toFixed(3)));
}

const RULES: { id: MosaicRule; label: string }[] = [
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
  { id: 'midpoint', label: 'Midpoint' },
  { id: 'mean', label: 'Mean value' },
];
const MIRRORS: { id: Mirror; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'sideways', label: 'Sideways' },
  { id: 'below', label: 'Below' },
  { id: 'both', label: 'Both' },
  { id: 'water', label: 'Water' },
];
const COLOUR_MODES: { id: ColourMode; label: string }[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'fade', label: 'Fade' },
  { id: 'alternate', label: 'Alternate' },
];
const KIND_LABELS: Record<AreaLayerKind, string> = {
  mosaic: 'Riemann mosaic',
  accumulation: 'Accumulation',
  trail: 'Convergence trail',
};

function IconAction({
  label,
  icon,
  onPress,
  disabled = false,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={4}
      style={({ pressed }) => [
        styles.icon,
        {
          borderRadius: theme.radius.sm,
          backgroundColor: pressed ? theme.colors.surfacePressed : 'transparent',
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      {icon}
    </Pressable>
  );
}

/** A labelled band: course-aligned (teal) or creative extension (coral), never colour alone. */
export function Band({ kind, children }: { kind: 'course' | 'creative'; children: ReactNode }) {
  const theme = useAppTheme();
  const course = kind === 'course';
  return (
    <View
      style={[
        cardStyle(theme),
        {
          padding: theme.spacing.md,
          gap: theme.spacing.md,
          borderLeftWidth: 4,
          borderLeftColor: course ? theme.colors.primary : theme.colors.accent,
        },
      ]}
    >
      {children}
    </View>
  );
}

export function BandTitle({ kind, title, text }: { kind: 'course' | 'creative'; title: string; text: string }) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: 2 }}>
      <AppText
        variant="caption"
        style={{
          fontFamily: theme.fontFamilies.semibold,
          color: kind === 'course' ? theme.colors.primary : theme.colors.accentStrong,
        }}
      >
        {kind === 'course' ? `■ ${title}` : `✦ ${title}`}
      </AppText>
      <AppText variant="small" color="textSecondary">
        {text}
      </AppText>
    </View>
  );
}

/**
 * The Riemann Mosaic Studio and the Accumulation Art Studio. The canvas comes
 * first; below it are the layers, the course-aligned controls for the
 * selected layer, the collapsible creative-extension controls, the starter
 * templates and "Math behind my art".
 */
export function AreaArtStudio({
  config,
  initial,
  saveStatus,
  onSave,
}: {
  config: AreaStudioConfig;
  initial: AreaArtProject;
  saveStatus: SaveStatus;
  onSave: (project: AreaArtProject, completed: boolean) => void;
}) {
  const theme = useAppTheme();
  const palette = useMemo(() => curvePalette(theme), [theme]);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  // Wide enough to be the focus, but never taller than ~70% of the screen (landscape phones).
  const canvasHeight = Math.round(
    Math.min(420, screenHeight * 0.7, Math.max(200, (Math.min(screenWidth, 720) - 32) * 0.72)),
  );
  const [history, dispatch] = useReducer(historyReducer, { past: [], present: initial, future: [] });
  const project = history.present;
  const [selectedId, setSelectedId] = useState<string | null>(initial.layers.at(-1)?.id ?? null);
  const [creativeOpen, setCreativeOpen] = useState(false);
  const selected = project.layers.find((l) => l.id === selectedId) ?? null;
  const templates = AREA_TEMPLATES.filter((t) => t.studio === config.studio);

  const set = (change: Partial<AreaArtProject>) => dispatch({ type: 'set', project: { ...project, ...change } });
  const setLayers = (layers: AreaLayer[]) => set({ layers });
  const updateLayer = (id: string, change: (layer: AreaLayer) => AreaLayer) =>
    setLayers(project.layers.map((l) => (l.id === id ? normaliseLayer(change(l)) : l)));
  const updateCreative = (change: Partial<CreativeSettings>) =>
    selected && updateLayer(selected.id, (l) => ({ ...l, creative: { ...l.creative, ...change } }));
  const view = project.view;
  const setView = (change: Partial<AreaArtProject['view']>) => set({ view: { ...view, ...change } });

  const applyTemplate = (template: AreaTemplate) => {
    const next = projectFromTemplate(template, project.title);
    dispatch({ type: 'set', project: { ...next, explanation: project.explanation } });
    setSelectedId(next.layers.at(-1)?.id ?? null);
  };

  const addLayer = (kind: AreaLayerKind) => {
    const layer = newLayer(kind, undefined, project.layers.length % palette.length);
    setLayers([...project.layers, layer]);
    setSelectedId(layer.id);
  };

  const completed = project.explanation.trim().length >= EXPLANATION_MIN;
  const visibleLayers = project.layers.filter((l) => l.style.visible);

  return (
    <View style={{ gap: theme.spacing.lg }}>
      {/* Canvas first */}
      <View style={{ gap: theme.spacing.sm }}>
        <AreaArtCanvas
          project={project}
          height={canvasHeight}
          onGesture={(zoomFactor, panX, panY) => dispatch({ type: 'gesture', zoomFactor, panX, panY })}
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
            onPress={() => setView({ zoom: Math.min(8, view.zoom * 1.25) })}
          />
          <IconAction
            label="Zoom out"
            icon={<ZoomOut size={20} color={theme.colors.primary} />}
            onPress={() => setView({ zoom: Math.max(0.25, view.zoom / 1.25) })}
          />
          <IconAction
            label="Pan left"
            icon={<ArrowLeft size={20} color={theme.colors.primary} />}
            onPress={() => setView({ panX: view.panX - 0.1 / view.zoom })}
          />
          <IconAction
            label="Pan right"
            icon={<ArrowRight size={20} color={theme.colors.primary} />}
            onPress={() => setView({ panX: view.panX + 0.1 / view.zoom })}
          />
          <IconAction
            label="Pan up"
            icon={<ArrowUp size={20} color={theme.colors.primary} />}
            onPress={() => setView({ panY: view.panY + 0.1 / view.zoom })}
          />
          <IconAction
            label="Pan down"
            icon={<ArrowDown size={20} color={theme.colors.primary} />}
            onPress={() => setView({ panY: view.panY - 0.1 / view.zoom })}
          />
          <IconAction
            label="Fit artwork"
            icon={<Maximize2 size={20} color={theme.colors.primary} />}
            onPress={() => setView({ zoom: 1, panX: 0, panY: 0 })}
          />
        </View>
        <ChipRow>
          {(['none', 'grid', 'axes'] as const).map((b) => (
            <ChipButton
              key={b}
              label={b === 'none' ? 'Plain' : b === 'grid' ? 'Grid' : 'Axes'}
              selected={project.backdrop === b}
              accessibilityLabel={`Backdrop: ${b === 'none' ? 'plain' : b}`}
              onPress={() => set({ backdrop: b })}
            />
          ))}
        </ChipRow>
      </View>

      <AuthTextField label="Project title" value={project.title} onChangeText={(title) => set({ title })} />

      {/* Layers */}
      <View style={[cardStyle(theme), { padding: theme.spacing.md, gap: theme.spacing.sm }]}>
        <AppText variant="h3">{`Layers (${project.layers.length})`}</AppText>
        <AppText variant="small" color="textSecondary">
          Tap a layer to edit it. The last layer is drawn in front.
        </AppText>
        {project.layers.map((layer, index) => {
          const isSelected = layer.id === selectedId;
          const fn = AREA_FUNCTIONS[layer.fnId];
          return (
            <View
              key={layer.id}
              style={[
                styles.layerRow,
                {
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  borderWidth: isSelected ? 2 : StyleSheet.hairlineWidth,
                  borderRadius: theme.radius.md,
                  gap: theme.spacing.xs,
                },
              ]}
            >
              <Pressable
                onPress={() => setSelectedId(layer.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`Edit layer ${layer.name}, ${KIND_LABELS[layer.kind]} of ${fn.label}${layer.style.visible ? '' : ', hidden'}`}
                style={[styles.layerMain, { gap: theme.spacing.sm, minHeight: theme.touchTarget.min }]}
              >
                <View
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: palette[layer.style.colour % palette.length],
                      opacity: layer.style.visible ? 1 : 0.3,
                    },
                  ]}
                />
                <View style={styles.grow}>
                  <AppText variant="body" numberOfLines={1} style={{ fontFamily: theme.fontFamilies.semibold }}>
                    {layer.name}
                  </AppText>
                  <AppText variant="small" color="textSecondary" numberOfLines={1}>
                    {`${KIND_LABELS[layer.kind]} · ${fn.label}`}
                  </AppText>
                </View>
              </Pressable>
              <View style={[styles.toolbar, { gap: 0 }]}>
                <IconAction
                  label={layer.style.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}
                  icon={
                    layer.style.visible ? (
                      <Eye size={18} color={theme.colors.primary} />
                    ) : (
                      <EyeOff size={18} color={theme.colors.textSecondary} />
                    )
                  }
                  onPress={() =>
                    updateLayer(layer.id, (l) => ({ ...l, style: { ...l.style, visible: !l.style.visible } }))
                  }
                />
                <IconAction
                  label={`Move ${layer.name} back`}
                  icon={<ChevronDown size={18} color={theme.colors.primary} />}
                  onPress={() => setLayers(moveLayer(project.layers, layer.id, -1))}
                  disabled={index === 0}
                />
                <IconAction
                  label={`Move ${layer.name} forward`}
                  icon={<ChevronUp size={18} color={theme.colors.primary} />}
                  onPress={() => setLayers(moveLayer(project.layers, layer.id, 1))}
                  disabled={index === project.layers.length - 1}
                />
                <IconAction
                  label={`Duplicate ${layer.name}`}
                  icon={<Copy size={18} color={theme.colors.primary} />}
                  onPress={() => {
                    const copy = duplicateLayer(layer);
                    setLayers([...project.layers.slice(0, index + 1), copy, ...project.layers.slice(index + 1)]);
                    setSelectedId(copy.id);
                  }}
                  disabled={project.layers.length >= MAX_LAYERS}
                />
                <IconAction
                  label={`Delete ${layer.name}`}
                  icon={<Trash2 size={18} color={theme.colors.error} />}
                  onPress={() => {
                    setLayers(project.layers.filter((l) => l.id !== layer.id));
                    if (isSelected) setSelectedId(null);
                  }}
                />
              </View>
            </View>
          );
        })}
        <ChipRow>
          {config.layerKinds.map((kind) => (
            <ChipButton
              key={kind}
              label={`+ ${KIND_LABELS[kind]}`}
              accessibilityLabel={`Add a ${KIND_LABELS[kind]} layer`}
              onPress={() => project.layers.length < MAX_LAYERS && addLayer(kind)}
            />
          ))}
        </ChipRow>
        {project.layers.length >= MAX_LAYERS ? (
          <AppText variant="small" color="textSecondary">
            {`An artwork can have up to ${MAX_LAYERS} layers.`}
          </AppText>
        ) : null}
      </View>

      {selected ? <CourseControls layer={selected} onChange={(change) => updateLayer(selected.id, change)} /> : null}

      {selected ? (
        <Band kind="creative">
          <Pressable
            onPress={() => setCreativeOpen((o) => !o)}
            accessibilityRole="button"
            accessibilityState={{ expanded: creativeOpen }}
            accessibilityLabel="Creative extension controls"
            style={[styles.headerRow, { minHeight: theme.touchTarget.min }]}
          >
            <BandTitle
              kind="creative"
              title="CREATIVE EXTENSION"
              text="Arrange and style copies. The mathematics stays the same."
            />
            {creativeOpen ? (
              <ChevronUp size={20} color={theme.colors.accentStrong} />
            ) : (
              <ChevronDown size={20} color={theme.colors.accentStrong} />
            )}
          </Pressable>
          {creativeOpen ? (
            <CreativeControls
              layer={selected}
              palette={palette}
              onCreative={updateCreative}
              onStyle={(change) => updateLayer(selected.id, (l) => ({ ...l, style: { ...l.style, ...change } }))}
              onName={(name) => updateLayer(selected.id, (l) => ({ ...l, name }))}
            />
          ) : null}
        </Band>
      ) : null}

      {/* Templates */}
      <View style={{ gap: theme.spacing.sm }}>
        <AppText variant="h3">Templates</AppText>
        <AppText variant="small" color="textSecondary">
          Each template is built from Chapter 2 mathematics with creative-extension styling. Using one replaces the
          layers; save first to keep your own.
        </AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.sm }}>
          {templates.map((template) => {
            const preview = projectFromTemplate(template, template.title);
            const active = project.templateId === template.id;
            return (
              <Pressable
                key={template.id}
                onPress={() => applyTemplate(template)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Use template ${template.title}. ${template.description}`}
                style={[
                  cardStyle(theme),
                  styles.tile,
                  {
                    padding: theme.spacing.sm,
                    gap: theme.spacing.xs,
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                    borderWidth: active ? 2 : StyleSheet.hairlineWidth,
                  },
                ]}
              >
                <AreaArtCanvas project={preview} height={96} thumbnail description={`Preview of ${template.title}`} />
                <AppText variant="caption" numberOfLines={1} style={{ fontFamily: theme.fontFamilies.semibold }}>
                  {active ? `✓ ${template.title}` : template.title}
                </AppText>
                <AppText variant="small" color="textSecondary" numberOfLines={3}>
                  {template.description}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Math behind my art */}
      <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
        <AppText variant="h3">Math behind my art</AppText>
        {visibleLayers.length === 0 ? (
          <AppText variant="small" color="textSecondary">
            Show or add a layer to see its mathematics.
          </AppText>
        ) : null}
        {visibleLayers.map((layer) => {
          const math = layerMath(layer);
          const fn = AREA_FUNCTIONS[layer.fnId];
          return (
            <View key={layer.id} style={{ gap: theme.spacing.xs }}>
              <AppText variant="title">{layer.name}</AppText>
              <Readout rows={math.rows.map((r) => [r.label, r.tex])} />
              <AppText variant="small">{math.explanation}</AppText>
              <AppText variant="small" color="textSecondary">
                {`Function from: ${fn.source}.`}
                {hasCreativeLayout(layer)
                  ? ' Creative extension: mirroring, repeating, flipping, outlines, windows and mosaic cells change only the look; the values above are for one copy of the rectangles.'
                  : ''}
              </AppText>
            </View>
          );
        })}
        <View style={{ gap: theme.spacing.xs }}>
          <MathText text={config.question} />
          <AuthTextField
            label="Explain the mathematics in your own words"
            value={project.explanation}
            onChangeText={(explanation) => set({ explanation })}
            multiline
          />
        </View>
      </View>

      <View style={{ gap: theme.spacing.sm }}>
        {saveStatus.status === 'error' ? <FormError message={saveStatus.message} /> : null}
        {saveStatus.status === 'saved' ? (
          <AppText variant="small" color="success" accessibilityLiveRegion="polite">
            {`Saved "${project.title}".`}
          </AppText>
        ) : null}
        <LoadingButton
          label={completed ? 'Save and mark complete' : 'Save project'}
          loading={saveStatus.status === 'saving'}
          loadingLabel="Saving"
          onPress={() => onSave(project, completed)}
        />
        {!completed ? (
          <AppText variant="small" color="textSecondary">
            Explain the mathematics behind your art to complete this activity.
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

/** Function, interval, n, rule, x or t: the settings that decide the mathematics. */
function CourseControls({
  layer,
  onChange,
}: {
  layer: AreaLayer;
  onChange: (change: (l: AreaLayer) => AreaLayer) => void;
}) {
  const theme = useAppTheme();
  const fn = AREA_FUNCTIONS[layer.fnId];
  const functions =
    layer.kind === 'mosaic'
      ? MOSAIC_FUNCTIONS
      : layer.kind === 'accumulation'
        ? ACCUMULATION_FUNCTIONS
        : TRAIL_FUNCTIONS;
  const pickFunction = (id: (typeof functions)[number]) =>
    onChange((l) => {
      const next = AREA_FUNCTIONS[id];
      if (l.kind === 'trail') return { ...l, fnId: id };
      if (l.kind === 'mosaic') return { ...l, fnId: id, a: next.a, b: next.b };
      return { ...l, fnId: id, a: next.a, b: next.b, x: (next.a + next.b) / 2 };
    });

  return (
    <Band kind="course">
      <BandTitle
        kind="course"
        title="COURSE-ALIGNED"
        text={
          layer.kind === 'mosaic'
            ? 'Riemann sums and mean value bands (§2.2, §2.4).'
            : layer.kind === 'accumulation'
              ? 'A(x) = ∫ₐˣ f(t) dt and the Fundamental Theorem (§2.3).'
              : 'Improper integrals as limits of A(t) (§2.5).'
        }
      />
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="caption" color="textSecondary">
          Function
        </AppText>
        <ChipRow>
          {functions.map((id) => (
            <ChipButton
              key={id}
              label={AREA_FUNCTIONS[id].label}
              selected={layer.fnId === id}
              accessibilityLabel={`Function ${AREA_FUNCTIONS[id].label}`}
              onPress={() => pickFunction(id)}
            />
          ))}
        </ChipRow>
      </View>
      {layer.kind !== 'trail' ? (
        <>
          <Slider
            label="Lower limit a"
            value={layer.a}
            min={fn.domain[0]}
            max={fn.domain[1] - fn.step}
            step={fn.step}
            valueText={`a = ${plainNumber(layer.a)}`}
            onChange={(a) => onChange((l) => (l.kind === 'trail' ? l : { ...l, a }))}
          />
          <Slider
            label="Upper limit b"
            value={layer.b}
            min={fn.domain[0] + fn.step}
            max={fn.domain[1]}
            step={fn.step}
            valueText={`b = ${plainNumber(layer.b)}`}
            onChange={(b) => onChange((l) => (l.kind === 'trail' ? l : { ...l, b }))}
          />
        </>
      ) : null}
      {layer.kind === 'mosaic' ? (
        <>
          <Slider
            label="Number of rectangles n"
            value={layer.n}
            min={1}
            max={60}
            step={1}
            valueText={`n = ${layer.n}`}
            onChange={(n) => onChange((l) => (l.kind === 'mosaic' ? { ...l, n } : l))}
          />
          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="caption" color="textSecondary">
              Height of each rectangle
            </AppText>
            <ChipRow>
              {RULES.map((r) => (
                <ChipButton
                  key={r.id}
                  label={r.label}
                  selected={layer.rule === r.id}
                  onPress={() => onChange((l) => (l.kind === 'mosaic' ? { ...l, rule: r.id } : l))}
                />
              ))}
            </ChipRow>
          </View>
          <ChipRow>
            <ChipButton
              label={layer.showCurve ? 'Curve shown' : 'Curve hidden'}
              selected={layer.showCurve}
              onPress={() => onChange((l) => (l.kind === 'mosaic' ? { ...l, showCurve: !l.showCurve } : l))}
            />
            {layer.rule !== 'mean' ? (
              <ChipButton
                label="Show sample points"
                selected={layer.showPoints ?? false}
                onPress={() =>
                  onChange((l) => (l.kind === 'mosaic' ? { ...l, showPoints: !(l.showPoints ?? false) } : l))
                }
              />
            ) : null}
          </ChipRow>
        </>
      ) : null}
      {layer.kind === 'accumulation' ? (
        <>
          <Slider
            label="Moving x"
            value={layer.x}
            min={layer.a}
            max={layer.b}
            step={(layer.b - layer.a) / 120}
            valueText={`x = ${layer.x.toFixed(2)}`}
            onChange={(x) => onChange((l) => (l.kind === 'accumulation' ? { ...l, x } : l))}
          />
          <Slider
            label="Constant multiple k"
            value={layer.k}
            min={-2}
            max={2}
            step={0.25}
            valueText={`k = ${layer.k}`}
            onChange={(k) => onChange((l) => (l.kind === 'accumulation' ? { ...l, k: k === 0 ? 0.25 : k } : l))}
          />
          <Slider
            label="Repeated accumulation curves"
            value={layer.echoes}
            min={0}
            max={6}
            step={1}
            valueText={`${layer.echoes} extra`}
            onChange={(echoes) => onChange((l) => (l.kind === 'accumulation' ? { ...l, echoes } : l))}
          />
          <ChipRow>
            <ChipButton
              label="Show f"
              selected={layer.showF}
              onPress={() => onChange((l) => (l.kind === 'accumulation' ? { ...l, showF: !l.showF } : l))}
            />
            <ChipButton
              label="Show A(x)"
              selected={layer.showA}
              onPress={() => onChange((l) => (l.kind === 'accumulation' ? { ...l, showA: !l.showA } : l))}
            />
          </ChipRow>
        </>
      ) : null}
      {layer.kind === 'trail' ? (
        <>
          <Slider
            label="How far t has gone"
            value={layer.reach}
            min={0.05}
            max={1}
            step={0.05}
            valueText={`${Math.round(layer.reach * 100)}%`}
            onChange={(reach) => onChange((l) => (l.kind === 'trail' ? { ...l, reach } : l))}
          />
          <Slider
            label="Points in the trail"
            value={layer.dots}
            min={4}
            max={60}
            step={1}
            valueText={`${layer.dots}`}
            onChange={(dots) => onChange((l) => (l.kind === 'trail' ? { ...l, dots } : l))}
          />
          <ChipRow>
            <ChipButton
              label="Show the limit"
              selected={layer.showLimit}
              onPress={() => onChange((l) => (l.kind === 'trail' ? { ...l, showLimit: !l.showLimit } : l))}
            />
          </ChipRow>
        </>
      ) : null}
    </Band>
  );
}

function CreativeControls({
  layer,
  palette,
  onCreative,
  onStyle,
  onName,
}: {
  layer: AreaLayer;
  palette: string[];
  onCreative: (change: Partial<CreativeSettings>) => void;
  onStyle: (change: Partial<AreaLayer['style']>) => void;
  onName: (name: string) => void;
}) {
  const theme = useAppTheme();
  const c = layer.creative;
  return (
    <View style={{ gap: theme.spacing.md }}>
      <AuthTextField label="Layer name" value={layer.name} onChangeText={onName} />
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="caption" color="textSecondary">
          Mirror
        </AppText>
        <ChipRow>
          {MIRRORS.map((m) => (
            <ChipButton
              key={m.id}
              label={m.label}
              selected={c.mirror === m.id}
              accessibilityLabel={`Mirror ${m.label}`}
              onPress={() => onCreative({ mirror: m.id })}
            />
          ))}
        </ChipRow>
      </View>
      <Slider
        label="Repeat"
        value={c.repeat}
        min={1}
        max={6}
        step={1}
        valueText={`${c.repeat} ${c.repeat === 1 ? 'copy' : 'copies'}`}
        onChange={(repeat) => onCreative({ repeat })}
      />
      <Slider
        label="Spacing"
        value={c.spacing}
        min={0}
        max={1}
        step={0.05}
        valueText={c.spacing.toFixed(2)}
        onChange={(spacing) => onCreative({ spacing })}
      />
      <ChipRow>
        <ChipButton
          label="Flip every other copy"
          selected={c.flip ?? false}
          onPress={() => onCreative({ flip: !(c.flip ?? false) })}
        />
      </ChipRow>
      {layer.kind === 'mosaic' ? (
        <>
          <Slider
            label="Gap between tiles"
            value={c.gap}
            min={0}
            max={0.4}
            step={0.02}
            valueText={c.gap.toFixed(2)}
            onChange={(gap) => onCreative({ gap })}
          />
          <Slider
            label="Mosaic cells per rectangle"
            value={c.cells ?? 1}
            min={1}
            max={8}
            step={1}
            valueText={(c.cells ?? 1) === 1 ? 'Solid' : `${c.cells ?? 1} cells`}
            onChange={(cells) => onCreative({ cells })}
          />
          <ChipRow>
            <ChipButton
              label="Outlines only"
              selected={c.outline ?? false}
              onPress={() => onCreative({ outline: !(c.outline ?? false) })}
            />
            <ChipButton
              label="Windows"
              selected={c.windows ?? false}
              onPress={() => onCreative({ windows: !(c.windows ?? false) })}
            />
          </ChipRow>
        </>
      ) : (
        <Slider
          label="Line weight"
          value={c.weight}
          min={0.5}
          max={2.5}
          step={0.1}
          valueText={c.weight.toFixed(1)}
          onChange={(weight) => onCreative({ weight })}
        />
      )}
      <Slider
        label="Opacity"
        value={layer.style.opacity}
        min={0.15}
        max={1}
        step={0.05}
        valueText={`${Math.round(layer.style.opacity * 100)}%`}
        onChange={(opacity) => onStyle({ opacity })}
      />
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="caption" color="textSecondary">
          Colour
        </AppText>
        <View style={[styles.toolbar, { gap: theme.spacing.sm }]}>
          {palette.map((colour, i) => {
            const on = layer.style.colour % palette.length === i;
            return (
              <Pressable
                key={colour}
                onPress={() => onStyle({ colour: i })}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`Colour ${CURVE_COLOR_NAMES[i] ?? i + 1}`}
                style={[
                  styles.colour,
                  { backgroundColor: colour, borderColor: on ? theme.colors.textPrimary : theme.colors.surface },
                ]}
              />
            );
          })}
        </View>
        <ChipRow>
          {COLOUR_MODES.map((m) => (
            <ChipButton
              key={m.id}
              label={m.label}
              selected={c.colourMode === m.id}
              accessibilityLabel={`Colour mode ${m.label}`}
              onPress={() => onCreative({ colourMode: m.id })}
            />
          ))}
        </ChipRow>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  icon: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  layerRow: {
    padding: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  layerMain: { flexDirection: 'row', alignItems: 'center', flexGrow: 1, flexBasis: 160, minWidth: 0 },
  grow: { flex: 1, minWidth: 0 },
  swatch: { width: 18, height: 18, borderRadius: 9 },
  colour: { width: 44, height: 44, borderRadius: 22, borderWidth: 3 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  tile: { width: 168 },
});
