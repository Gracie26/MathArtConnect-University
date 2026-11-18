/**
 * The Topic 4 Create studios: Gradient Field Art, Faceted Surface and
 * Landscape Designer (lib/art/paArt.ts).
 *
 * The artwork comes first. Below it: the COURSE-ALIGNED settings (which decide
 * the mathematics), the collapsible CREATIVE EXTENSION settings (which only
 * colour and arrange it), and "Math behind my art", where the learner explains
 * the mathematics to complete the project. Everything is an app-created
 * visualisation; Chapter 4 has no figures. Controls are buttons and sliders
 * (no pinch gestures), so the page scrolls normally on a phone.
 *
 * Math view shows the coordinate structure (axes with numbers, a light grid,
 * or 3D axes with their scale) and lets the learner tap an arrow, facet or
 * point to read its mathematics; the step buttons do the same without a tap.
 * Art view is the clean artwork. Both views are the same project.
 */
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Readout } from '@/components/explore/area/AreaParts';
import { ChipButton, ChipRow } from '@/components/explore/ExploreScaffold';
import { TapScene } from '@/components/explore/TapScene';
import { AuthTextField } from '@/components/forms/AuthTextField';
import { FormError } from '@/components/forms/FormError';
import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Slider } from '@/components/ui/Slider';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  defaultSelection,
  DENSITY_RANGE,
  FIELD_SOURCES,
  MAX_FEATURES,
  newPaProject,
  PA_EXPLANATION_MIN,
  type PaArtProject,
  paArtMath,
  paArtScene,
  type PaCourse,
  type PaCreative,
  type PaFeature,
  paInspect,
  pickAt,
  type PaScheme,
  type PaSelection,
  type PaStudioConfig,
  stepSelection,
  SURFACE_SOURCES,
} from '@/lib/art/paArt';
import { fmt } from '@/lib/explore/rn';

import { Band, BandTitle } from '../area/AreaArtStudio';
import type { SaveStatus } from '../EquationArtStudio';

const STUDIO_NAMES: Record<PaArtProject['studio'], string> = {
  gradientField: 'Gradient Field Art',
  facetedSurface: 'Faceted Surface',
  landscape: 'Landscape Designer',
};

const FEATURE_NAMES: Record<PaFeature['kind'], string> = { peak: 'Peak', pit: 'Pit', saddle: 'Saddle' };

const TAP_LABEL: Record<PaArtProject['studio'], string> = {
  gradientField: 'Select the nearest arrow',
  facetedSurface: 'Select a facet',
  landscape: 'Select a critical point or a point',
};

const SCHEMES: { id: PaScheme; label: string }[] = [
  { id: 'primary', label: 'Teal' },
  { id: 'warm', label: 'Coral' },
  { id: 'secondary', label: 'Blue' },
];

export function PaArtStudio({
  config,
  initial,
  saveStatus,
  onSave,
}: {
  config: PaStudioConfig;
  initial: PaArtProject;
  saveStatus: SaveStatus;
  onSave: (project: PaArtProject, completed: boolean) => void;
}) {
  const theme = useAppTheme();
  const [project, setProject] = useState<PaArtProject>(initial);
  const [creativeOpen, setCreativeOpen] = useState(false);
  const [selected, setSelected] = useState(initial.course.features[0]?.id ?? null);
  const [picked, setPicked] = useState<PaSelection>(() => defaultSelection(initial));

  const setCourse = (change: Partial<PaCourse>) => setProject((p) => ({ ...p, course: { ...p.course, ...change } }));
  const setCreative = (change: Partial<PaCreative>) =>
    setProject((p) => ({ ...p, creative: { ...p.creative, ...change } }));
  const setFeature = (id: string, change: Partial<PaFeature>) =>
    setCourse({ features: project.course.features.map((f) => (f.id === id ? { ...f, ...change } : f)) });

  // Recomputed only when the artwork changes (not while the title or explanation is typed).
  const { course, creative, studio } = project;
  const artwork = useMemo(
    (): PaArtProject => ({ version: 1, studio, title: '', course, creative, explanation: '' }),
    [studio, course, creative],
  );
  const mathView = creative.view === 'math';
  // A selection that no longer exists (e.g. after fewer arrows are chosen) falls back to the default one.
  const current = useMemo(() => (paInspect(artwork, picked) ? picked : defaultSelection(artwork)), [artwork, picked]);
  const inspection = useMemo(() => paInspect(artwork, current), [artwork, current]);
  const scene = useMemo(() => paArtScene(artwork, mathView ? current : null), [artwork, mathView, current]);
  const math = useMemo(() => paArtMath(artwork, current), [artwork, current]);
  const step = (di: number, dj: number) => setPicked(stepSelection(artwork, current, di, dj));
  const completed = project.explanation.trim().length >= PA_EXPLANATION_MIN;
  const feature = project.course.features.find((f) => f.id === selected) ?? null;
  const [lo, hi] = DENSITY_RANGE[project.studio];

  const addFeature = (kind: PaFeature['kind']) => {
    if (project.course.features.length >= MAX_FEATURES) return;
    // The next unused id f1, f2, …: stable, and unique within the project.
    const used = new Set(project.course.features.map((f) => f.id));
    let n = project.course.features.length + 1;
    while (used.has(`f${n}`)) n++;
    const id = `f${n}`;
    const next: PaFeature = { id, kind, x: 0.5, y: -0.5, height: kind === 'saddle' ? 1 : 1.5, width: 1 };
    setCourse({ features: [...project.course.features, next] });
    setSelected(id);
  };
  const removeFeature = (id: string) => {
    const features = project.course.features.filter((f) => f.id !== id);
    setCourse({ features });
    setSelected(features[features.length - 1]?.id ?? null);
  };

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <View style={[cardStyle(theme), { padding: theme.spacing.md, gap: theme.spacing.sm }]}>
        <AppText variant="caption" color="textSecondary">
          {`${STUDIO_NAMES[project.studio]} · app-created visualisation`}
        </AppText>
        <TapScene
          scene={scene}
          description={`${STUDIO_NAMES[project.studio]} artwork, ${mathView ? 'Math view' : 'Art view'}. ${math.explanation}`}
          tapLabel={TAP_LABEL[project.studio]}
          onTap={(x, y) => {
            const hit = pickAt(artwork, x, y);
            if (hit) setPicked(hit);
          }}
        />
        <ChipRow>
          <ChipButton
            label="Math view"
            accessibilityLabel="Math view: axes, numbers and inspection"
            selected={mathView}
            onPress={() => setCreative({ view: 'math' })}
          />
          <ChipButton
            label="Art view"
            accessibilityLabel="Art view: the artwork without axes"
            selected={!mathView}
            onPress={() => setCreative({ view: 'art' })}
          />
        </ChipRow>
        {mathView && project.studio !== 'facetedSurface' ? (
          <ChipButton
            label={creative.grid ? 'Hide grid' : 'Show grid'}
            selected={creative.grid}
            onPress={() => setCreative({ grid: !creative.grid })}
          />
        ) : null}
        {mathView && project.studio === 'facetedSurface' ? (
          <ChipButton
            label={creative.mesh ? 'Hide surface mesh' : 'Show surface mesh'}
            selected={creative.mesh}
            onPress={() => setCreative({ mesh: !creative.mesh })}
          />
        ) : null}
        {inspection ? (
          <View style={{ gap: theme.spacing.sm }}>
            <View accessible accessibilityLabel={inspection.spoken} accessibilityLiveRegion="polite">
              <AppText variant="title">{inspection.title}</AppText>
              <Readout rows={inspection.rows} />
            </View>
            {project.studio === 'landscape' ? (
              <ChipRow>
                <ChipButton label="Previous point" onPress={() => step(-1, 0)} />
                <ChipButton label="Next point" onPress={() => step(1, 0)} />
              </ChipRow>
            ) : (
              <ChipRow>
                <ChipButton label="←" accessibilityLabel="Select the one to the left" onPress={() => step(-1, 0)} />
                <ChipButton label="→" accessibilityLabel="Select the one to the right" onPress={() => step(1, 0)} />
                <ChipButton label="↑" accessibilityLabel="Select the one above" onPress={() => step(0, 1)} />
                <ChipButton label="↓" accessibilityLabel="Select the one below" onPress={() => step(0, -1)} />
              </ChipRow>
            )}
            {mathView ? (
              <AppText variant="small" color="textSecondary">
                {project.studio === 'facetedSurface'
                  ? 'Tap a facet: P is marked, the facet is outlined and the normal direction is drawn.'
                  : 'Tap the graph to inspect the nearest arrow or point.'}
              </AppText>
            ) : (
              <AppText variant="small" color="textSecondary">
                Switch to Math view to see axes, numbers and the selection on the artwork.
              </AppText>
            )}
          </View>
        ) : null}
      </View>

      <AuthTextField
        label="Title"
        value={project.title}
        onChangeText={(title) => setProject((p) => ({ ...p, title }))}
      />

      <Band kind="course">
        <BandTitle kind="course" title="COURSE-ALIGNED SETTINGS" text="These decide the mathematics of your artwork." />
        {project.studio === 'gradientField' ? (
          <ChipRow>
            {Object.entries(FIELD_SOURCES).map(([id, s]) => (
              <ChipButton
                key={id}
                label={s.label}
                selected={project.course.source === id}
                onPress={() => setCourse({ source: id })}
              />
            ))}
          </ChipRow>
        ) : null}
        {project.studio === 'facetedSurface' ? (
          <ChipRow>
            {Object.entries(SURFACE_SOURCES).map(([id, s]) => (
              <ChipButton
                key={id}
                label={s.label}
                selected={project.course.source === id}
                onPress={() => setCourse({ source: id })}
              />
            ))}
          </ChipRow>
        ) : null}
        {project.studio !== 'landscape' ? (
          <Slider
            label={project.studio === 'gradientField' ? 'Arrows along each side' : 'Facets along each side'}
            value={project.course.density}
            min={lo}
            max={hi}
            step={1}
            onChange={(density) => setCourse({ density })}
            valueText={`${project.course.density} × ${project.course.density}`}
          />
        ) : (
          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="small" color="textSecondary">
              {`Features (${project.course.features.length} of ${MAX_FEATURES}). Each adds one term to f(x, y).`}
            </AppText>
            <ChipRow>
              {project.course.features.map((f, i) => (
                <ChipButton
                  key={f.id}
                  label={`${FEATURE_NAMES[f.kind]} ${i + 1}`}
                  selected={f.id === selected}
                  onPress={() => setSelected(f.id)}
                />
              ))}
            </ChipRow>
            <ChipRow>
              {(['peak', 'pit', 'saddle'] as const).map((kind) => (
                <ChipButton
                  key={kind}
                  label={`Add ${FEATURE_NAMES[kind].toLowerCase()}`}
                  accessibilityLabel={`Add a ${FEATURE_NAMES[kind].toLowerCase()}`}
                  onPress={() => addFeature(kind)}
                />
              ))}
            </ChipRow>
            {feature ? (
              <View style={{ gap: theme.spacing.sm }}>
                <Slider
                  label="Centre x"
                  value={feature.x}
                  min={-2.5}
                  max={2.5}
                  step={0.1}
                  onChange={(x) => setFeature(feature.id, { x })}
                  valueText={`x = ${fmt(feature.x)}`}
                />
                <Slider
                  label="Centre y"
                  value={feature.y}
                  min={-2.5}
                  max={2.5}
                  step={0.1}
                  onChange={(y) => setFeature(feature.id, { y })}
                  valueText={`y = ${fmt(feature.y)}`}
                />
                <Slider
                  label="Height"
                  value={feature.height}
                  min={0.3}
                  max={3}
                  step={0.1}
                  onChange={(height) => setFeature(feature.id, { height })}
                  valueText={`height ${fmt(feature.height)}`}
                />
                <Slider
                  label="Width"
                  value={feature.width}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onChange={(width) => setFeature(feature.id, { width })}
                  valueText={`width ${fmt(feature.width)}`}
                />
                <LoadingButton
                  variant="secondary"
                  icon={Trash2}
                  label={`Remove ${FEATURE_NAMES[feature.kind].toLowerCase()}`}
                  onPress={() => removeFeature(feature.id)}
                />
              </View>
            ) : (
              <AppText variant="small" color="textSecondary">
                Add a peak, pit or saddle to start your landscape.
              </AppText>
            )}
          </View>
        )}
      </Band>

      <Band kind="creative">
        <Pressable
          onPress={() => setCreativeOpen((o) => !o)}
          accessibilityRole="button"
          accessibilityState={{ expanded: creativeOpen }}
          accessibilityLabel="Creative extension settings"
          style={[styles.headerRow, { minHeight: theme.touchTarget.min }]}
        >
          <BandTitle
            kind="creative"
            title="CREATIVE EXTENSION"
            text="These only colour and arrange the artwork; the mathematics stays the same."
          />
          {creativeOpen ? (
            <ChevronUp size={20} color={theme.colors.textSecondary} />
          ) : (
            <ChevronDown size={20} color={theme.colors.textSecondary} />
          )}
        </Pressable>
        {creativeOpen ? (
          <View style={{ gap: theme.spacing.sm }}>
            <ChipRow>
              {SCHEMES.map((s) => (
                <ChipButton
                  key={s.id}
                  label={s.label}
                  selected={project.creative.scheme === s.id}
                  onPress={() => setCreative({ scheme: s.id })}
                />
              ))}
            </ChipRow>
            {project.studio !== 'landscape' ? (
              <Slider
                label={project.studio === 'gradientField' ? 'Arrow size' : 'Facet size'}
                value={project.creative.size}
                min={0.4}
                max={1}
                step={0.05}
                onChange={(size) => setCreative({ size })}
                valueText={`${Math.round(project.creative.size * 100)}%`}
              />
            ) : (
              <ChipButton
                label={project.creative.bands ? 'Hide height bands' : 'Show height bands'}
                selected={project.creative.bands}
                onPress={() => setCreative({ bands: !project.creative.bands })}
              />
            )}
            {project.studio === 'facetedSurface' ? (
              <Slider
                label="Turn the view"
                value={project.creative.turn}
                min={-170}
                max={170}
                step={5}
                onChange={(turn) => setCreative({ turn })}
                valueText={`${Math.round(project.creative.turn)}°`}
              />
            ) : null}
          </View>
        ) : null}
      </Band>

      <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
        <AppText variant="h3">Math behind my art</AppText>
        <MathExpression tex={math.tex} display />
        <Readout rows={math.rows.map((r) => [r.label, r.tex])} />
        <AppText variant="small">{math.explanation}</AppText>
        <AppText variant="small" color="textSecondary">
          {`From: ${math.origin}.`}
        </AppText>
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
          icon={Plus}
          label="Reset to the starter"
          onPress={() => {
            const fresh = { ...newPaProject(config, project.title), explanation: project.explanation };
            setProject(fresh);
            setSelected(fresh.course.features[0]?.id ?? null);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
