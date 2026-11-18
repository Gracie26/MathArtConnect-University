import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Transformation } from '@/lib/graph/expression';
import type { GraphLayer } from '@/lib/graph/sample';
import type { StudioPreset } from '@/lib/graph/studio';
import type { FunctionName } from '@/lib/math/input/parse';

import { ArtPreview } from './ArtPreview';

export const EXTENSION_LABEL = 'Creative extension';
export const EXTENSION_TEXT =
  'Explore how mathematical equations can form visual patterns. This uses mathematics beyond Chapter 1 and is not course content.';

/** A labelled band saying the current artwork is a creative extension, not course content. */
export function ExtensionBadge() {
  const theme = useAppTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${EXTENSION_LABEL}. ${EXTENSION_TEXT}`}
      style={[
        styles.badge,
        { backgroundColor: theme.colors.accentSoft, borderRadius: theme.radius.sm, gap: 2, padding: theme.spacing.sm },
      ]}
    >
      <AppText variant="caption" style={{ fontFamily: theme.fontFamilies.semibold }}>
        {`✦ ${EXTENSION_LABEL}`}
      </AppText>
      <AppText variant="small" color="textSecondary">
        {EXTENSION_TEXT}
      </AppText>
    </View>
  );
}

/**
 * Starter artworks as live thumbnails, in two groups: course-aligned starters
 * (mathematics from the notes) first, then creative extensions. Tapping one
 * loads it onto the canvas.
 */
export function TemplateGallery({
  presets,
  functions,
  activeId,
  onUse,
}: {
  presets: readonly StudioPreset[];
  functions: readonly FunctionName[];
  activeId: string | null;
  onUse: (preset: StudioPreset) => void;
}) {
  const theme = useAppTheme();
  if (presets.length === 0) return null;
  const groups = [
    {
      id: 'course',
      title: 'Course-aligned',
      text: 'Built only from the mathematics of this subtopic in the notes.',
      items: presets.filter((p) => p.category === 'course'),
    },
    {
      id: 'extension',
      title: 'Creative extensions',
      text: EXTENSION_TEXT,
      items: presets.filter((p) => p.category === 'extension'),
    },
  ].filter((g) => g.items.length > 0);
  return (
    <View style={{ gap: theme.spacing.md }}>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="h3">Starter artworks</AppText>
        <AppText variant="small" color="textSecondary">
          Tap a starter to load it. It replaces the layers on the canvas; save first to keep your own.
        </AppText>
      </View>
      {groups.map((group) => (
        <View key={group.id} style={{ gap: theme.spacing.xs }}>
          <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            {group.title.toUpperCase()}
          </AppText>
          <AppText variant="small" color="textSecondary">
            {group.text}
          </AppText>
          <StarterRow items={group.items} functions={functions} activeId={activeId} onUse={onUse} />
        </View>
      ))}
    </View>
  );
}

function StarterRow({
  items,
  functions,
  activeId,
  onUse,
}: {
  items: readonly StudioPreset[];
  functions: readonly FunctionName[];
  activeId: string | null;
  onUse: (preset: StudioPreset) => void;
}) {
  const theme = useAppTheme();
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: theme.spacing.sm }}>
        {items.map((preset) => {
          const selected = preset.id === activeId;
          return (
            <Pressable
              key={preset.id}
              onPress={() => onUse(preset)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Use starter: ${preset.title}${preset.category === 'extension' ? ` (${EXTENSION_LABEL.toLowerCase()})` : ''}`}
              style={[
                cardStyle(theme),
                styles.tile,
                {
                  padding: theme.spacing.sm,
                  gap: theme.spacing.xs,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
                },
              ]}
            >
              <ArtPreview
                project={preset.project}
                functions={functions}
                height={110}
                summary={`Preview of ${preset.title}`}
              />
              <AppText variant="caption" numberOfLines={1} style={{ fontFamily: theme.fontFamilies.semibold }}>
                {selected ? `✓ ${preset.title}` : preset.title}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/**
 * Apply a substitution u = g(x), or an outer change, to a chosen layer. The
 * original becomes the dashed "before" curve and the result is a new layer
 * with its own sliders, so before and after are compared on one plane.
 */
export function TransformPanel({
  intro,
  operations,
  layers,
  onApply,
}: {
  intro: string;
  operations: readonly Transformation[];
  layers: readonly GraphLayer[];
  onApply: (source: GraphLayer, operation: Transformation) => void;
}) {
  const theme = useAppTheme();
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [opId, setOpId] = useState(operations[0]?.id ?? '');
  const source = layers.find((l) => l.id === sourceId) ?? layers[0];
  const operation = operations.find((o) => o.id === opId) ?? operations[0];
  const chip = (label: string, selected: boolean, onPress: () => void, a11y?: string) => (
    <Pressable
      key={a11y ?? label}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={a11y ?? label}
      style={[
        styles.chip,
        {
          borderRadius: theme.radius.pill,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderWidth: selected ? 2 : 1,
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
          minHeight: theme.touchTarget.min,
        },
      ]}
    >
      <AppText variant="caption" color={selected ? 'primary' : 'textPrimary'}>
        {label}
      </AppText>
    </Pressable>
  );
  return (
    <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
      <AppText variant="h3">Transform a curve</AppText>
      <MathText text={intro} variant="small" color="textSecondary" />
      {layers.length === 0 ? (
        <AppText variant="small" color="textSecondary">
          Add an equation first.
        </AppText>
      ) : (
        <>
          <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            1. Curve to transform
          </AppText>
          <View style={[styles.wrap, { gap: theme.spacing.xs }]}>
            {layers.map((l) => chip(l.name, l.id === source?.id, () => setSourceId(l.id), `Transform ${l.name}`))}
          </View>
          <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            2. Transformation
          </AppText>
          <View style={[styles.wrap, { gap: theme.spacing.xs }]}>
            {operations.map((o) =>
              chip(o.label, o.id === operation?.id, () => setOpId(o.id), `Transformation ${o.label}`),
            )}
          </View>
          {operation ? <MathText text={operation.effect} variant="small" /> : null}
          {source && operation ? (
            <LoadingButton label={`Apply to ${source.name}`} onPress={() => onApply(source, operation)} />
          ) : null}
        </>
      )}
    </View>
  );
}

export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type AnimationDirection = 'up' | 'down' | 'bounce';
/** Seconds for one sweep from minimum to maximum. */
export const SPEED_SECONDS: Record<AnimationSpeed, number> = { slow: 8, normal: 4, fast: 2 };
export const ALL_PARAMETERS = '__all__';

function Choice({
  label,
  selected,
  onPress,
  a11y,
  disabled = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  a11y: string;
  disabled?: boolean;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={a11y}
      style={[
        styles.chip,
        {
          borderRadius: theme.radius.pill,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderWidth: selected ? 2 : 1,
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
          minHeight: theme.touchTarget.min,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <AppText variant="caption" color={selected ? 'primary' : 'textPrimary'}>
        {selected ? `✓ ${label}` : label}
      </AppText>
    </Pressable>
  );
}

/**
 * Animation: choose which parameter moves (or all of them), the direction and
 * the speed, then Play, Pause, Step or Reset. With Reduce Motion on, Play is
 * replaced by Step so the learner moves the art one step at a time.
 */
export function AnimationControls({
  parameterNames,
  target,
  speed,
  direction,
  playing,
  reducedMotion,
  onTarget,
  onSpeed,
  onDirection,
  onPlay,
  onPause,
  onStep,
  onReset,
}: {
  parameterNames: readonly string[];
  target: string;
  speed: AnimationSpeed;
  direction: AnimationDirection;
  playing: boolean;
  reducedMotion: boolean;
  onTarget: (name: string) => void;
  onSpeed: (speed: AnimationSpeed) => void;
  onDirection: (direction: AnimationDirection) => void;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
}) {
  const theme = useAppTheme();
  if (parameterNames.length === 0) return null;
  const label = (t: string) => (t === ALL_PARAMETERS ? 'All' : t);
  return (
    <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.sm }]}>
      <AppText variant="h3">Animate</AppText>
      <AppText variant="small" color="textSecondary">
        Watch the art change as a parameter moves. The sliders above always work by hand too.
      </AppText>
      <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
        Parameter
      </AppText>
      <View style={[styles.wrap, { gap: theme.spacing.xs }]} accessibilityRole="radiogroup">
        {[...parameterNames, ...(parameterNames.length > 1 ? [ALL_PARAMETERS] : [])].map((t) => (
          <Choice
            key={t}
            label={label(t)}
            selected={target === t}
            onPress={() => onTarget(t)}
            a11y={t === ALL_PARAMETERS ? 'Animate all parameters' : `Animate parameter ${t}`}
          />
        ))}
      </View>
      <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
        Speed
      </AppText>
      <View style={[styles.wrap, { gap: theme.spacing.xs }]} accessibilityRole="radiogroup">
        {(['slow', 'normal', 'fast'] as const).map((s) => (
          <Choice
            key={s}
            label={s[0]!.toUpperCase() + s.slice(1)}
            selected={speed === s}
            onPress={() => onSpeed(s)}
            a11y={`Speed ${s}`}
          />
        ))}
      </View>
      <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
        Direction
      </AppText>
      <View style={[styles.wrap, { gap: theme.spacing.xs }]} accessibilityRole="radiogroup">
        {(
          [
            ['up', 'Increase'],
            ['down', 'Decrease'],
            ['bounce', 'Back and forth'],
          ] as const
        ).map(([d, text]) => (
          <Choice
            key={d}
            label={text}
            selected={direction === d}
            onPress={() => onDirection(d)}
            a11y={`Direction ${text}`}
          />
        ))}
      </View>
      {reducedMotion ? (
        <AppText variant="small" color="textSecondary" accessibilityLiveRegion="polite">
          Reduce Motion is on, so the art does not play by itself. Use Step to move one step at a time.
        </AppText>
      ) : null}
      <View style={[styles.wrap, { gap: theme.spacing.sm }]}>
        {reducedMotion ? null : playing ? (
          <LoadingButton label="Pause" onPress={onPause} style={styles.grow} />
        ) : (
          <LoadingButton label="Play" onPress={onPlay} style={styles.grow} />
        )}
        <LoadingButton variant="secondary" label="Step" onPress={onStep} style={styles.grow} />
        <LoadingButton variant="secondary" label="Reset" onPress={onReset} style={styles.grow} />
      </View>
    </View>
  );
}

export type GraphAction =
  | { kind: 'showAll' }
  | { kind: 'resetView' }
  | { kind: 'resetParameter'; name: string }
  | { kind: 'removeRestriction'; layerId: string }
  | { kind: 'editLayer'; layerId: string };

export interface GraphNotice {
  id: string;
  text: string;
  actions: { label: string; action: GraphAction }[];
}

/** Explains an empty or odd canvas, with buttons that fix it. */
export function GraphStatus({ notices, onAction }: { notices: GraphNotice[]; onAction: (a: GraphAction) => void }) {
  const theme = useAppTheme();
  if (notices.length === 0) return null;
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.badge,
        {
          backgroundColor: theme.colors.achievementSoft,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          gap: theme.spacing.sm,
        },
      ]}
    >
      {notices.map((n) => (
        <View key={n.id} style={{ gap: theme.spacing.xs }}>
          <AppText variant="small">{n.text}</AppText>
          {n.actions.length > 0 ? (
            <View style={[styles.wrap, { gap: theme.spacing.sm }]}>
              {n.actions.map((a) => (
                <LoadingButton
                  key={a.label}
                  variant="secondary"
                  label={a.label}
                  onPress={() => onAction(a.action)}
                  style={styles.grow}
                />
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {},
  grow: { flexGrow: 1 },
  tile: { width: 168 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 12, justifyContent: 'center' },
});
