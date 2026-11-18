import { Check, Clock3 } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, type ScrollViewInstance, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { LESSON_STEP_LABELS, type LessonStepDefinition } from '@/content/types';
import { useAppTheme } from '@/hooks/useAppTheme';

interface LessonStepNavProps {
  steps: readonly LessonStepDefinition[];
  currentIndex: number;
  completedKeys: ReadonlySet<string>;
  onSelect: (index: number) => void;
}

/**
 * Horizontal step chips: the learner's position in Concept → … → Review.
 * Completed steps show a tick, unavailable steps a clock (not colour alone).
 */
export function LessonStepNav({ steps, currentIndex, completedKeys, onSelect }: LessonStepNavProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const scrollRef = useRef<ScrollViewInstance>(null);
  const offsets = useRef<number[]>([]);

  useEffect(() => {
    const x = offsets.current[currentIndex];
    if (x !== undefined) scrollRef.current?.scrollTo({ x: Math.max(0, x - 24), animated: true });
  }, [currentIndex]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: theme.spacing.sm, paddingVertical: 2 }}
      accessibilityRole="tablist"
    >
      {steps.map((step, index) => {
        const current = index === currentIndex;
        const done = completedKeys.has(step.key);
        const planned = step.availability.status === 'planned';
        const state = done ? 'completed' : planned ? 'coming soon' : 'not completed';
        return (
          <Pressable
            key={step.key}
            onLayout={(event) => {
              offsets.current[index] = event.nativeEvent.layout.x;
            }}
            onPress={() => onSelect(index)}
            accessibilityRole="tab"
            accessibilityState={{ selected: current }}
            accessibilityLabel={`Step ${index + 1} of ${steps.length}: ${LESSON_STEP_LABELS[step.kind]}, ${state}`}
            style={({ pressed }) => [
              styles.chip,
              {
                minHeight: theme.touchTarget.min - 6,
                borderRadius: theme.radius.pill,
                borderColor: current ? colors.primary : colors.border,
                borderWidth: current ? 2 : 1,
                backgroundColor: current ? colors.primarySoft : pressed ? colors.surfacePressed : colors.surface,
              },
            ]}
          >
            {done ? <Check size={13} color={colors.success} strokeWidth={3} /> : null}
            {!done && planned ? <Clock3 size={13} color={colors.textSecondary} /> : null}
            <AppText
              variant="small"
              style={{
                color: current ? colors.primary : planned && !done ? colors.textSecondary : colors.textPrimary,
                fontFamily: current ? theme.fontFamilies.semibold : theme.fontFamilies.medium,
              }}
            >
              {LESSON_STEP_LABELS[step.kind]}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12 },
});
