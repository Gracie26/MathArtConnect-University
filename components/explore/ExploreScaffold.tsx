import { router } from 'expo-router';
import { CircleCheck, Compass } from 'lucide-react-native';
import { type ReactNode, useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { FormError } from '@/components/forms/FormError';
import { ScrollLockContext } from '@/components/graph/ScrollLock';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { labGuideFor } from '@/content/labGuides';
import { getTopic } from '@/content/registry';
import type { TopicActivity } from '@/content/types';
import { sectionHref } from '@/features/learning/navigation';
import { useActivityRecorder } from '@/features/learning/useLearningHistory';
import { useAppTheme } from '@/hooks/useAppTheme';

/**
 * Records that the learner used an Explore tool, once per visit, when the
 * tool decides they have genuinely explored it (e.g. compared three curves).
 */
export function useExploreCompletion(activity: TopicActivity) {
  const record = useActivityRecorder();
  const done = useRef(false);
  const [status, setStatus] = useState<{ explored: boolean; error: string | null }>({ explored: false, error: null });
  const complete = useCallback(
    async (detail: Record<string, string | number | boolean>) => {
      if (done.current) return;
      done.current = true;
      // Once per tool per study day: reopening the same tool the same day earns no extra XP.
      const result = await record(
        {
          type: 'explore',
          refId: activity.id,
          topicId: activity.topicId,
          summary: `Explored ${activity.title}`,
          xp: 5,
          metadata: detail,
        },
        { oncePerDay: activity.id },
      );
      setStatus(result.ok ? { explored: true, error: null } : { explored: false, error: result.error.message });
      if (!result.ok) done.current = false;
    },
    [activity, record],
  );
  return { ...status, complete };
}

/** Layout shared by every Explore tool: header, the source sections it teaches, and progress. */
export function ExploreScaffold({
  activity,
  intro,
  explored,
  error,
  children,
}: {
  activity: TopicActivity;
  intro: string;
  explored: boolean;
  error: string | null;
  children: ReactNode;
}) {
  const theme = useAppTheme();
  const topic = getTopic(activity.topicId);
  const unit = topic?.units.find((u) => u.id === activity.unitId);
  const sections = (topic?.sections ?? []).filter((s) => activity.sections.includes(s.id));
  const guide = labGuideFor(activity.id);
  // While a finger is on a slider or canvas the page does not scroll, so the drag is not taken
  // over by the scroll view (iOS and Android); releasing restores normal scrolling.
  const [scrollLocked, setScrollLocked] = useState(false);
  return (
    <ScrollLockContext.Provider value={setScrollLocked}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ padding: theme.layout.screenGutter, paddingBottom: theme.spacing.huge }}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!scrollLocked}
      >
        <View style={[styles.column, { maxWidth: theme.layout.maxContentWidth, gap: theme.spacing.lg }]}>
          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="eyebrow" color="textSecondary">
              {`EXPLORE · ${(unit?.title ?? '').toUpperCase()}`}
            </AppText>
            <AppText variant="h1">{activity.title}</AppText>
            <MathText text={intro} variant="bodyLarge" color="textSecondary" />
          </View>
          {guide ? <LabGuideCard {...guide} /> : null}
          {sections.length > 0 ? (
            <View style={[styles.row, { gap: theme.spacing.sm }]}>
              <AppText variant="small" color="textSecondary">
                From the notes:
              </AppText>
              {sections.map((s) => (
                <Pressable
                  key={s.id}
                  onPress={() => router.push(sectionHref(activity.topicId, s.id))}
                  accessibilityRole="link"
                  accessibilityLabel={`Open section ${s.label} ${s.heading}`}
                  hitSlop={6}
                  style={{ minHeight: theme.touchTarget.min, justifyContent: 'center' }}
                >
                  <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
                    {s.label}
                  </AppText>
                </Pressable>
              ))}
            </View>
          ) : null}
          {children}
          {explored ? (
            <View style={[styles.row, { gap: theme.spacing.sm }]} accessibilityLiveRegion="polite">
              <CircleCheck size={16} color={theme.colors.success} strokeWidth={2.4} />
              <AppText variant="small" color="textSecondary">
                Explored · saved to your learning history
              </AppText>
            </View>
          ) : null}
          <FormError message={error} />
        </View>
      </ScrollView>
    </ScrollLockContext.Provider>
  );
}

/** "How to use this lab": the goal, what to do and what to look for, in three short lines. */
function LabGuideCard({ goal, steps, look }: { goal: string; steps: string; look: string }) {
  const theme = useAppTheme();
  const rows: [string, string][] = [
    ['Goal', goal],
    ['What to do', steps],
    ['What to look for', look],
  ];
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        gap: theme.spacing.sm,
      }}
    >
      <View style={[styles.row, { gap: theme.spacing.xs }]}>
        <Compass size={15} color={theme.colors.primary} strokeWidth={2.4} />
        <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
          How to use this lab
        </AppText>
      </View>
      {rows.map(([label, text]) => (
        <View key={label} style={{ gap: 2 }}>
          <AppText variant="caption" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
            {label}
          </AppText>
          <MathText text={text} variant="small" />
        </View>
      ))}
    </View>
  );
}

/** A small rounded chip button used across Explore tools. */
export function ChipButton({
  label,
  selected = false,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.chip,
        {
          borderRadius: theme.radius.pill,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderWidth: selected ? 2 : 1,
          backgroundColor: selected
            ? theme.colors.primarySoft
            : pressed
              ? theme.colors.surfacePressed
              : theme.colors.surface,
          minHeight: theme.touchTarget.min,
        },
      ]}
    >
      <AppText
        variant="caption"
        color={selected ? 'primary' : 'textPrimary'}
        style={{ fontFamily: theme.fontFamilies.semibold }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  const theme = useAppTheme();
  return <View style={[styles.wrap, { gap: theme.spacing.sm }]}>{children}</View>;
}

const styles = StyleSheet.create({
  column: { width: '100%', alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, justifyContent: 'center' },
});
