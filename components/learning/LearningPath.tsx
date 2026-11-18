import { router } from 'expo-router';
import { ArrowRight, Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { estimateSubtopicMinutes, formatStudyTime, spokenStudyTime } from '@/content/estimate';
import type { LearningUnitDefinition, LessonStepKind, TopicDefinition } from '@/content/types';
import { subtopicHref } from '@/features/learning/navigation';
import type { SubtopicProgress, TopicProgress } from '@/features/learning/progress';
import { useAppTheme } from '@/hooks/useAppTheme';
import { toPercent } from '@/lib/utils/format';

/** The lesson's ten steps, gathered into the five parts learners choose between. */
const STEP_GROUPS: { title: string; kinds: LessonStepKind[] }[] = [
  { title: 'Learn', kinds: ['concept', 'see-it'] },
  { title: 'Worked examples', kinds: ['worked-example'] },
  { title: 'Try it and practise', kinds: ['try-it', 'practise'] },
  { title: 'Explore and create', kinds: ['explore', 'play', 'create'] },
  { title: 'Review', kinds: ['reflect', 'review'] },
];

type NodeState = 'completed' | 'current' | 'started' | 'upcoming';

function nodeState(unit: LearningUnitDefinition, progress: TopicProgress | null): NodeState {
  const p = progress?.subtopics[unit.id];
  if (p?.status === 'completed') return 'completed';
  if (progress?.currentUnitId === unit.id) return 'current';
  return p?.status === 'inProgress' ? 'started' : 'upcoming';
}

/**
 * Topic page: the subtopics as one guided path. Completed subtopics are a
 * single compact row, the current one is open (what it covers, time left and
 * where to jump in), and later ones stay folded until tapped. Only one is
 * open at a time, so the page never becomes a wall of cards; every step
 * stays one tap away.
 */
export function LearningPath({ topic, progress }: { topic: TopicDefinition; progress: TopicProgress | null }) {
  const theme = useAppTheme();
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);
  // Until the learner chooses, the current subtopic is the open one.
  const expanded = openId === undefined ? (progress?.currentUnitId ?? null) : openId;

  return (
    <View accessibilityRole="list">
      {topic.units.map((unit, index) => (
        <PathNode
          key={unit.id}
          topic={topic}
          unit={unit}
          index={index + 1}
          last={index === topic.units.length - 1}
          state={nodeState(unit, progress)}
          subtopic={progress?.subtopics[unit.id]}
          open={expanded === unit.id}
          onToggle={() => setOpenId(expanded === unit.id ? null : unit.id)}
          gap={theme.spacing.md}
        />
      ))}
    </View>
  );
}

function PathNode({
  topic,
  unit,
  index,
  last,
  state,
  subtopic,
  open,
  onToggle,
  gap,
}: {
  topic: TopicDefinition;
  unit: LearningUnitDefinition;
  index: number;
  last: boolean;
  state: NodeState;
  subtopic: SubtopicProgress | undefined;
  open: boolean;
  onToggle: () => void;
  gap: number;
}) {
  const theme = useAppTheme();
  const { colors } = theme;
  const total = estimateSubtopicMinutes(unit);
  const left = subtopic?.minutesRemaining ?? total;
  const percent = toPercent(subtopic?.fraction ?? 0);
  const done = state === 'completed';
  const active = state === 'current';
  const Chevron = open ? ChevronUp : ChevronDown;

  const statusWords =
    state === 'completed' ? 'completed' : state === 'upcoming' ? 'not started' : `in progress, ${percent} percent`;
  const timeText = done
    ? 'Completed'
    : state === 'upcoming'
      ? `About ${formatStudyTime(total)}`
      : subtopic?.completedStepKeys.size
        ? `${percent}% · about ${formatStudyTime(left)} left`
        : `Up next · about ${formatStudyTime(left)}`;
  const spokenTime = done ? '' : ` ${state === 'upcoming' ? spokenStudyTime(total) : `${spokenStudyTime(left)} left`}.`;

  const marker = done ? colors.success : active ? colors.primary : colors.surface;
  const markerBorder = done ? colors.success : active ? colors.primary : colors.borderStrong;

  return (
    <View style={styles.node} accessibilityRole="none">
      {/* The path: a marker per subtopic joined by a line (state also given in words). */}
      <View style={styles.rail} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <View style={[styles.marker, { backgroundColor: marker, borderColor: markerBorder }]}>
          {done ? (
            <Check size={16} color={colors.onSuccess} strokeWidth={3} />
          ) : (
            <AppText
              variant="caption"
              style={{ color: active ? colors.onPrimary : colors.textSecondary, fontFamily: theme.fontFamilies.bold }}
            >
              {String(index)}
            </AppText>
          )}
        </View>
        {!last ? <View style={[styles.line, { backgroundColor: done ? colors.success : colors.border }]} /> : null}
      </View>

      <View style={[styles.body, { paddingBottom: last ? 0 : gap }]}>
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={`Subtopic ${index}: ${unit.title}. ${statusWords}.${spokenTime} ${open ? 'Hide details.' : 'Show details.'}`}
          style={({ pressed }) => [
            styles.header,
            {
              minHeight: theme.touchTarget.min,
              gap: theme.spacing.sm,
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.spacing.md,
              paddingVertical: theme.spacing.sm,
              backgroundColor: open ? colors.surface : pressed ? colors.surfacePressed : 'transparent',
              borderColor: open ? (active ? colors.primary : colors.border) : 'transparent',
              borderWidth: open ? (active ? 1.5 : StyleSheet.hairlineWidth) : 0,
              borderBottomLeftRadius: open ? 0 : theme.radius.md,
              borderBottomRightRadius: open ? 0 : theme.radius.md,
            },
          ]}
        >
          <View style={styles.headerText}>
            <AppText variant="title" color={state === 'upcoming' && !open ? 'textSecondary' : 'textPrimary'}>
              {unit.title}
            </AppText>
            <AppText variant="small" color={active ? 'primary' : 'textSecondary'}>
              {timeText}
            </AppText>
          </View>
          <Chevron size={18} color={colors.textSecondary} />
        </Pressable>

        {open ? (
          <View
            style={[
              styles.panel,
              {
                gap: theme.spacing.md,
                padding: theme.spacing.md,
                paddingTop: theme.spacing.xs,
                backgroundColor: colors.surface,
                borderColor: active ? colors.primary : colors.border,
                borderWidth: active ? 1.5 : StyleSheet.hairlineWidth,
                borderBottomLeftRadius: theme.radius.md,
                borderBottomRightRadius: theme.radius.md,
              },
            ]}
          >
            <AppText variant="small" color="textSecondary">
              {unit.summary}
            </AppText>
            {state !== 'upcoming' && !done ? <ProgressBar value={subtopic?.fraction ?? 0} height={5} /> : null}
            <StepGroups topic={topic} unit={unit} subtopic={subtopic} />
            <Pressable
              onPress={() => router.push(subtopicHref(topic.id, unit.slug, subtopic?.nextStepKey ?? undefined))}
              accessibilityRole="button"
              accessibilityLabel={`${done ? 'Review' : subtopic?.completedStepKeys.size ? 'Continue' : 'Start'} ${unit.title}`}
              style={({ pressed }) => [
                styles.open,
                {
                  minHeight: theme.touchTarget.min,
                  gap: theme.spacing.xs,
                  borderRadius: theme.radius.pill,
                  paddingHorizontal: theme.spacing.lg,
                  borderColor: colors.primary,
                  backgroundColor: pressed ? colors.primarySoft : 'transparent',
                },
              ]}
            >
              <AppText variant="button" color="primary">
                {done ? 'Review subtopic' : subtopic?.completedStepKeys.size ? 'Continue subtopic' : 'Start subtopic'}
              </AppText>
              <ArrowRight size={16} color={colors.primary} strokeWidth={2.4} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/** Where to jump in: the lesson's parts, each opening its first step; a tick when every step in it is done. */
function StepGroups({
  topic,
  unit,
  subtopic,
}: {
  topic: TopicDefinition;
  unit: LearningUnitDefinition;
  subtopic: SubtopicProgress | undefined;
}) {
  const theme = useAppTheme();
  const { colors } = theme;
  const groups = STEP_GROUPS.map((group) => ({
    ...group,
    steps: unit.steps.filter((s) => group.kinds.includes(s.kind) && s.availability.status === 'available'),
  })).filter((group) => group.steps.length > 0);

  return (
    <View style={[styles.groups, { gap: theme.spacing.sm }]}>
      {groups.map((group) => {
        const complete = group.steps.every((s) => subtopic?.completedStepKeys.has(s.key));
        return (
          <Pressable
            key={group.title}
            onPress={() => router.push(subtopicHref(topic.id, unit.slug, group.steps[0]!.key))}
            accessibilityRole="button"
            accessibilityLabel={`${group.title}${complete ? ', done' : ''}. Open in ${unit.title}.`}
            style={({ pressed }) => [
              styles.group,
              {
                minHeight: theme.touchTarget.min - 4,
                gap: 6,
                borderRadius: theme.radius.pill,
                paddingHorizontal: theme.spacing.md,
                backgroundColor: pressed ? colors.surfacePressed : colors.surfaceMuted,
              },
            ]}
          >
            {complete ? <Check size={13} color={colors.success} strokeWidth={3} /> : null}
            <AppText variant="caption">{group.title}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const MARKER = 30;

const styles = StyleSheet.create({
  node: { flexDirection: 'row' },
  rail: { width: MARKER + 10, alignItems: 'center' },
  marker: {
    width: MARKER,
    height: MARKER,
    borderRadius: MARKER / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
  },
  line: { width: 2, flex: 1, marginTop: 4, borderRadius: 1 },
  body: { flex: 1, minWidth: 0 },
  header: { flexDirection: 'row', alignItems: 'center' },
  headerText: { flex: 1, gap: 2 },
  panel: { borderTopWidth: 0 },
  groups: { flexDirection: 'row', flexWrap: 'wrap' },
  group: { flexDirection: 'row', alignItems: 'center' },
  open: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1.5 },
});
