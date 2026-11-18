/**
 * The Topic 3 Create studios: Domain Region, Surface Slice, Chain Network and
 * Coordinate Grid.
 *
 * The artwork comes first, with its view (zoom, move, fit) and the studio's
 * animation. Below it: the layers (select, show or hide, reorder, duplicate,
 * delete, rename, add), the COURSE-ALIGNED settings of the selected layer
 * (which decide the mathematics), its collapsible CREATIVE EXTENSION settings
 * (which only arrange and colour it), and "Math behind my art", where the
 * learner explains the mathematics to complete the project.
 *
 * Zoom and move are sliders and buttons rather than pinch gestures, so the
 * page always scrolls normally on a phone.
 */
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { LiveScene, Readout } from '@/components/explore/area/AreaParts';
import { ChipButton, ChipRow } from '@/components/explore/ExploreScaffold';
import { AuthTextField } from '@/components/forms/AuthTextField';
import { FormError } from '@/components/forms/FormError';
import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Slider } from '@/components/ui/Slider';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  ANIMATION_TEXT,
  CHAIN_SOURCES,
  COUNT_RANGE,
  FIT_VIEW,
  MAX_RN_LAYERS,
  newLayerId,
  newRnProject,
  RN_EXPLANATION_MIN,
  type RnArtProject,
  rnSceneOf,
  type RnCourse,
  type RnCreative,
  type RnLayer,
  rnLayerMath,
  type RnStudioConfig,
  type RnView,
  selectedLayer,
  sourcesFor,
  SURFACE_SOURCES,
} from '@/lib/art/rnArt';
import { fmt } from '@/lib/explore/rn';

import { Band, BandTitle } from '../area/AreaArtStudio';
import type { SaveStatus } from '../EquationArtStudio';

const STUDIO_NAMES: Record<RnArtProject['studio'], string> = {
  domainRegion: 'Domain Region Studio',
  surfaceSlice: 'Surface Slice Studio',
  chainNetwork: 'Chain Network Studio',
  coordinateGrid: 'Coordinate Grid Studio',
};

const COURSE_TEXT: Record<RnArtProject['studio'], string> = {
  domainRegion: 'The domain of f and its level bands (§3.1).',
  surfaceSlice: 'Slices of a surface with one variable held constant (§3.2).',
  chainNetwork: 'The tree diagram of the Chain Rule (§3.4, Figures 3.1 and 3.2).',
  coordinateGrid: 'The grid of a change of variables (§3.4, Examples 3.4.5 to 3.4.7).',
};

const COUNT_LABEL: Record<RnArtProject['studio'], string> = {
  domainRegion: 'Band width (level spacing)',
  surfaceSlice: 'Number of slices',
  chainNetwork: '',
  coordinateGrid: 'Curves in each family',
};

/**
 * Animation: the next frame is scheduled only after the previous one has been drawn, so a slow
 * phone gets fewer frames instead of a backlog that blocks taps. One cycle in about five seconds.
 */
const FRAME_MS = 100;
const PHASE_STEP = 0.02;

export function RnArtStudio({
  config,
  initial,
  saveStatus,
  onSave,
}: {
  config: RnStudioConfig;
  initial: RnArtProject;
  saveStatus: SaveStatus;
  onSave: (project: RnArtProject, completed: boolean) => void;
}) {
  const theme = useAppTheme();
  const reducedMotion = useReducedMotion();
  const [project, setProject] = useState<RnArtProject>(initial);
  const [creativeOpen, setCreativeOpen] = useState(false);
  const [phase, setPhase] = useState(0);
  const playing = project.animate && !reducedMotion;

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setPhase((p) => (p + PHASE_STEP) % 1), FRAME_MS);
    return () => clearTimeout(timer);
  }, [playing, phase]);

  const layer = selectedLayer(project);
  const updateLayer = (id: string, change: (l: RnLayer) => RnLayer) =>
    setProject((p) => ({ ...p, layers: p.layers.map((l) => (l.id === id ? change(l) : l)) }));
  const setCourse = (change: Partial<RnCourse>) =>
    updateLayer(layer.id, (l) => ({ ...l, course: { ...l.course, ...change } }));
  const setCreative = (change: Partial<RnCreative>) =>
    updateLayer(layer.id, (l) => ({ ...l, creative: { ...l.creative, ...change } }));
  const setView = (change: Partial<RnView>) => setProject((p) => ({ ...p, view: { ...p.view, ...change } }));

  const move = (id: string, by: -1 | 1) =>
    setProject((p) => {
      const i = p.layers.findIndex((l) => l.id === id);
      const j = i + by;
      if (i < 0 || j < 0 || j >= p.layers.length) return p;
      const layers = [...p.layers];
      [layers[i], layers[j]] = [layers[j]!, layers[i]!];
      return { ...p, layers };
    });
  const duplicate = (source: RnLayer) =>
    setProject((p) => {
      if (p.layers.length >= MAX_RN_LAYERS) return p;
      const copy: RnLayer = { ...source, id: newLayerId(), name: `${source.name} (copy)` };
      const at = p.layers.findIndex((l) => l.id === source.id) + 1;
      return { ...p, layers: [...p.layers.slice(0, at), copy, ...p.layers.slice(at)], selectedId: copy.id };
    });
  const remove = (id: string) =>
    setProject((p) => {
      if (p.layers.length <= 1) return p;
      const layers = p.layers.filter((l) => l.id !== id);
      return { ...p, layers, selectedId: p.selectedId === id ? layers[layers.length - 1]!.id : p.selectedId };
    });

  // Recomputed only when the artwork itself changes (not when the title or explanation is typed,
  // or when the page re-renders as a slider drag starts and ends), so the canvas is not redrawn.
  const { studio, layers, view, display } = project;
  const scenePhase = playing ? phase : null;
  const scene = useMemo(
    () => rnSceneOf(studio, layers, view, scenePhase, display),
    [studio, layers, view, scenePhase, display],
  );
  // The chain tree is a diagram, not a graph: it has no coordinates to show.
  const hasCoordinates = studio !== 'chainNetwork';
  const visible = project.layers.filter((l) => l.visible);
  const completed = project.explanation.trim().length >= RN_EXPLANATION_MIN;
  const [lo, hi, step] = COUNT_RANGE[project.studio];
  const surface = project.studio === 'surfaceSlice' ? SURFACE_SOURCES[layer.course.source] : undefined;
  const chain = project.studio === 'chainNetwork' ? CHAIN_SOURCES[layer.course.source] : undefined;
  const description = `${project.title}: ${visible.length} visible layer${visible.length === 1 ? '' : 's'}. ${visible
    .map((l) => `${l.name}: ${rnLayerMath(project.studio, l).explanation}`)
    .join(' ')}`;

  return (
    <View style={{ gap: theme.spacing.lg }}>
      {/* The artwork, its view and its animation */}
      <View style={[cardStyle(theme), { padding: theme.spacing.md, gap: theme.spacing.sm }]}>
        <AppText variant="caption" color="textSecondary">
          {STUDIO_NAMES[project.studio]}
        </AppText>
        <LiveScene scene={scene} description={description} />
        {visible.length === 0 ? (
          <AppText variant="small" color="textSecondary">
            Every layer is hidden. Show a layer to see the artwork.
          </AppText>
        ) : null}
        {hasCoordinates ? (
          <ChipRow>
            <ChipButton
              label="Math view"
              accessibilityLabel="Math view: numbered axes"
              selected={display === 'math'}
              onPress={() => setProject((p) => ({ ...p, display: 'math' }))}
            />
            <ChipButton
              label="Art view"
              accessibilityLabel="Art view: the artwork without axes"
              selected={display === 'art'}
              onPress={() => setProject((p) => ({ ...p, display: 'art' }))}
            />
          </ChipRow>
        ) : null}
        <ChipRow>
          <ChipButton
            label={playing ? 'Pause' : 'Animate'}
            accessibilityLabel={playing ? 'Pause the animation' : 'Animate the artwork'}
            selected={playing}
            onPress={() => setProject((p) => ({ ...p, animate: !p.animate }))}
          />
          <ChipButton label="Zoom in" onPress={() => setView({ zoom: Math.min(8, project.view.zoom * 1.25) })} />
          <ChipButton label="Zoom out" onPress={() => setView({ zoom: Math.max(0.5, project.view.zoom / 1.25) })} />
          <ChipButton
            label="Fit"
            accessibilityLabel="Fit the whole artwork in view"
            onPress={() => setView({ ...FIT_VIEW })}
          />
        </ChipRow>
        {project.animate && reducedMotion ? (
          <AppText variant="small" color="textSecondary">
            Animation is paused because Reduce Motion is on (in your device settings or in Appearance & Motion).
          </AppText>
        ) : null}
        {playing ? (
          <AppText variant="small" color="textSecondary">
            {ANIMATION_TEXT[project.studio]}
          </AppText>
        ) : null}
        <Slider
          label="Zoom"
          value={project.view.zoom}
          min={0.5}
          max={8}
          step={0.25}
          onChange={(zoom) => setView({ zoom })}
          valueText={`Zoom ${fmt(project.view.zoom)}×`}
        />
        <Slider
          label="Move across"
          value={project.view.panX}
          min={-1}
          max={1}
          step={0.05}
          onChange={(panX) => setView({ panX })}
          valueText={`Across ${fmt(project.view.panX)}`}
        />
        <Slider
          label="Move up or down"
          value={project.view.panY}
          min={-1}
          max={1}
          step={0.05}
          onChange={(panY) => setView({ panY })}
          valueText={`Up or down ${fmt(project.view.panY)}`}
        />
      </View>

      <AuthTextField
        label="Project title"
        value={project.title}
        onChangeText={(title) => setProject((p) => ({ ...p, title }))}
      />

      {/* Layers */}
      <View style={[cardStyle(theme), { padding: theme.spacing.md, gap: theme.spacing.sm }]}>
        <AppText variant="h3">{`Layers (${project.layers.length})`}</AppText>
        <AppText variant="small" color="textSecondary">
          The bottom layer is drawn first. Select a layer to change its mathematics and style.
        </AppText>
        {[...project.layers].reverse().map((l) => {
          const index = project.layers.findIndex((x) => x.id === l.id);
          const selected = l.id === layer.id;
          return (
            <View
              key={l.id}
              style={[
                styles.layer,
                {
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
                  borderRadius: theme.radius.md,
                  gap: theme.spacing.xs,
                },
              ]}
            >
              <Pressable
                onPress={() => setProject((p) => ({ ...p, selectedId: l.id }))}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`Select layer ${l.name}${l.visible ? '' : ', hidden'}`}
                style={{ minHeight: theme.touchTarget.min, justifyContent: 'center' }}
              >
                <AppText variant="title" color={l.visible ? 'textPrimary' : 'textSecondary'}>
                  {`${selected ? '● ' : ''}${l.name}${l.visible ? '' : ' (hidden)'}`}
                </AppText>
              </Pressable>
              <ChipRow>
                <ChipButton
                  label={l.visible ? 'Hide' : 'Show'}
                  accessibilityLabel={`${l.visible ? 'Hide' : 'Show'} layer ${l.name}`}
                  onPress={() => updateLayer(l.id, (x) => ({ ...x, visible: !x.visible }))}
                />
                <ChipButton
                  label="Up"
                  accessibilityLabel={`Move layer ${l.name} up`}
                  onPress={() => index < project.layers.length - 1 && move(l.id, 1)}
                />
                <ChipButton
                  label="Down"
                  accessibilityLabel={`Move layer ${l.name} down`}
                  onPress={() => index > 0 && move(l.id, -1)}
                />
                <ChipButton
                  label="Duplicate"
                  accessibilityLabel={`Duplicate layer ${l.name}`}
                  onPress={() => duplicate(l)}
                />
                {project.layers.length > 1 ? (
                  <ChipButton
                    label="Delete"
                    accessibilityLabel={`Delete layer ${l.name}`}
                    onPress={() => remove(l.id)}
                  />
                ) : null}
              </ChipRow>
            </View>
          );
        })}
        {project.layers.length < MAX_RN_LAYERS ? (
          <LoadingButton
            variant="secondary"
            label="Add a layer"
            onPress={() =>
              setProject((p) => {
                const fresh = newRnProject(config, p.title).layers[0]!;
                const added: RnLayer = { ...fresh, name: `Layer ${p.layers.length + 1}` };
                return { ...p, layers: [...p.layers, added], selectedId: added.id };
              })
            }
          />
        ) : (
          <AppText variant="small" color="textSecondary">
            {`An artwork can have up to ${MAX_RN_LAYERS} layers.`}
          </AppText>
        )}
        <AuthTextField
          label="Selected layer name"
          value={layer.name}
          onChangeText={(name) => updateLayer(layer.id, (l) => ({ ...l, name }))}
        />
      </View>

      <Band kind="course">
        <BandTitle kind="course" title="COURSE-ALIGNED" text={`${layer.name}: ${COURSE_TEXT[project.studio]}`} />
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="caption" color="textSecondary">
            {project.studio === 'chainNetwork'
              ? 'Example'
              : project.studio === 'coordinateGrid'
                ? 'Coordinates'
                : 'Function'}
          </AppText>
          <ChipRow>
            {sourcesFor(project.studio).map((s) => (
              <ChipButton
                key={s.id}
                label={s.label}
                selected={layer.course.source === s.id}
                onPress={() => {
                  const third = project.studio === 'surfaceSlice' ? SURFACE_SOURCES[s.id]?.third : undefined;
                  setCourse({ source: s.id, ...(third ? { value: (third.range[0] + third.range[1]) / 2 } : {}) });
                }}
              />
            ))}
          </ChipRow>
        </View>
        {COUNT_LABEL[project.studio] ? (
          <Slider
            label={COUNT_LABEL[project.studio]}
            value={layer.course.count}
            min={lo}
            max={hi}
            step={step}
            onChange={(count) => setCourse({ count })}
            valueText={`${COUNT_LABEL[project.studio]}: ${fmt(layer.course.count)}`}
          />
        ) : null}
        {project.studio === 'surfaceSlice' ? (
          <ChipRow>
            {(
              [
                ['x', 'Hold y: slices in x'],
                ['y', 'Hold x: slices in y'],
                ['both', 'Both directions'],
              ] as const
            ).map(([id, label]) => (
              <ChipButton
                key={id}
                label={label}
                selected={layer.course.direction === id}
                onPress={() => setCourse({ direction: id })}
              />
            ))}
          </ChipRow>
        ) : null}
        {surface?.third ? (
          <Slider
            label={`Held value of ${surface.third.name}`}
            value={layer.course.value}
            min={surface.third.range[0]}
            max={surface.third.range[1]}
            step={0.05}
            onChange={(value) => setCourse({ value })}
            valueText={`${surface.third.name} = ${fmt(layer.course.value)}`}
          />
        ) : null}
        {chain && chain.independents.length > 1 ? (
          <ChipRow>
            {chain.independents.map((v) => (
              <ChipButton
                key={v}
                label={`Paths to ${v}`}
                selected={(layer.course.direction === 'y' ? 't' : 's') === v}
                onPress={() => setCourse({ direction: v === 't' ? 'y' : 'x' })}
              />
            ))}
          </ChipRow>
        ) : null}
      </Band>

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
            text={`${layer.name}: arrange and colour copies. The mathematics stays the same.`}
          />
          {creativeOpen ? (
            <ChevronUp size={20} color={theme.colors.accentStrong} />
          ) : (
            <ChevronDown size={20} color={theme.colors.accentStrong} />
          )}
        </Pressable>
        {creativeOpen ? (
          <View style={{ gap: theme.spacing.md }}>
            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="caption" color="textSecondary">
                Rotated copies
              </AppText>
              <ChipRow>
                {([1, 2, 3, 4, 6] as const).map((n) => (
                  <ChipButton
                    key={n}
                    label={n === 1 ? 'None' : `${n}-fold`}
                    accessibilityLabel={n === 1 ? 'No rotated copies' : `${n} rotated copies`}
                    selected={layer.creative.copies === n}
                    onPress={() => setCreative({ copies: n })}
                  />
                ))}
              </ChipRow>
            </View>
            <View style={{ gap: theme.spacing.xs }}>
              <AppText variant="caption" color="textSecondary">
                Colours
              </AppText>
              <ChipRow>
                {(
                  [
                    ['primary', 'Calm'],
                    ['secondary', 'Bright'],
                    ['warm', 'Warm'],
                  ] as const
                ).map(([id, label]) => (
                  <ChipButton
                    key={id}
                    label={label}
                    accessibilityLabel={`${label} colours`}
                    selected={layer.creative.scheme === id}
                    onPress={() => setCreative({ scheme: id })}
                  />
                ))}
              </ChipRow>
            </View>
            {project.studio === 'surfaceSlice' ? (
              <ChipButton
                label={layer.creative.surface === false ? 'Show the surface' : 'Slices only'}
                accessibilityLabel={
                  layer.creative.surface === false
                    ? 'Show the surface under the slices'
                    : 'Hide the surface under the slices'
                }
                onPress={() => setCreative({ surface: layer.creative.surface === false })}
              />
            ) : null}
            <Slider
              label="Line weight"
              value={layer.creative.weight}
              min={0.5}
              max={2.5}
              step={0.25}
              onChange={(weight) => setCreative({ weight })}
              valueText={`Line weight ${fmt(layer.creative.weight)}`}
            />
            <Slider
              label="Opacity"
              value={layer.opacity}
              min={0.15}
              max={1}
              step={0.05}
              onChange={(opacity) => updateLayer(layer.id, (l) => ({ ...l, opacity }))}
              valueText={`Opacity ${Math.round(layer.opacity * 100)}%`}
            />
          </View>
        ) : null}
      </Band>

      <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
        <AppText variant="h3">Math behind my art</AppText>
        {visible.length === 0 ? (
          <AppText variant="small" color="textSecondary">
            Show a layer to see its mathematics.
          </AppText>
        ) : null}
        {visible.map((l) => {
          const math = rnLayerMath(project.studio, l);
          return (
            <View key={l.id} style={{ gap: theme.spacing.xs }}>
              <AppText variant="title">{l.name}</AppText>
              <MathExpression tex={math.tex} display />
              <Readout rows={math.rows.map((r) => [r.label, r.tex])} />
              <AppText variant="small">{math.explanation}</AppText>
              <AppText variant="small" color="textSecondary">
                {`From: ${math.origin}.`}
                {l.creative.copies > 1 || l.opacity < 1
                  ? ' Creative extension: rotated copies and opacity change only the look; the mathematics above is for one copy.'
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
            onChangeText={(explanation) => setProject((p) => ({ ...p, explanation }))}
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
        <LoadingButton
          variant="secondary"
          label="Reset to the starter"
          onPress={() => setProject({ ...newRnProject(config, project.title), explanation: project.explanation })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  layer: { padding: 10 },
});
