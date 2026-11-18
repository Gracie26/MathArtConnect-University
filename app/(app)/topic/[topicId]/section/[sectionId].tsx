import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { Block } from '@/components/learning/LessonSection';
import { PracticeGroup } from '@/components/learning/PracticeItems';
import { sectionTitle } from '@/components/learning/SectionChips';
import { MathExpression } from '@/components/math/MathExpression';
import { MathText } from '@/components/math/MathText';
import { AppText } from '@/components/ui/AppText';
import { getTopic } from '@/content/registry';
import type { SourceSection, TopicDefinition } from '@/content/types';
import { isPracticeItemVisible } from '@/content/visibility';
import { sectionHref, subtopicHref } from '@/features/learning/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** One section of the course notes (e.g. 1.6.1), with everything printed in it and its practice. */
export default function SectionScreen() {
  const { topicId, sectionId } = useLocalSearchParams<{ topicId: string; sectionId: string }>();
  const topic = topicId ? getTopic(topicId) : undefined;
  const section = topic?.sections?.find((s) => s.id === sectionId);

  if (!topic || topic.isDemo || !section) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Course notes' }} />
        <AppText variant="h2">This section is not available.</AppText>
      </Screen>
    );
  }
  return <Section topic={topic} section={section} />;
}

function NeighbourLink({
  topicId,
  section,
  direction,
}: {
  topicId: string;
  section: SourceSection;
  direction: 'previous' | 'next';
}) {
  const theme = useAppTheme();
  const Icon = direction === 'previous' ? ChevronLeft : ChevronRight;
  return (
    <Pressable
      onPress={() => router.replace(sectionHref(topicId, section.id))}
      accessibilityRole="link"
      accessibilityLabel={`${direction === 'previous' ? 'Previous' : 'Next'} section: ${sectionTitle(section)}`}
      style={({ pressed }) => [
        styles.neighbour,
        { minHeight: theme.touchTarget.min, gap: theme.spacing.xs, opacity: pressed ? 0.6 : 1 },
        direction === 'next' ? styles.alignEnd : null,
      ]}
    >
      {direction === 'previous' ? <Icon size={16} color={theme.colors.primary} /> : null}
      <AppText variant="caption" color="primary" numberOfLines={1} style={styles.flexText}>
        {`${section.label} ${section.heading}`}
      </AppText>
      {direction === 'next' ? <Icon size={16} color={theme.colors.primary} /> : null}
    </Pressable>
  );
}

function Section({ topic, section }: { topic: TopicDefinition; section: SourceSection }) {
  const theme = useAppTheme();
  const unit = topic.units.find((u) => u.id === section.unitId);
  const siblings = (topic.sections ?? []).filter((s) => s.unitId === section.unitId);
  const position = siblings.findIndex((s) => s.id === section.id);
  const previous = siblings[position - 1];
  const next = siblings[position + 1];
  const examples = section.blocks.filter((b) => b.type === 'workedExample').length;
  const tryIt = section.tryIt.filter((i) => isPracticeItemVisible(i)).length;
  const tutorial = section.tutorial.filter((i) => isPracticeItemVisible(i)).length;

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: `Section ${section.label}` }} />
      <ScrollView
        style={styles.fill}
        contentContainerStyle={{ padding: theme.layout.screenGutter, paddingBottom: theme.spacing.huge }}
      >
        <View style={[styles.column, { maxWidth: theme.layout.maxContentWidth, gap: theme.spacing.xl }]}>
          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="eyebrow" color="textSecondary">
              {`${(unit?.title ?? topic.title).toUpperCase()} · COURSE NOTES`}
            </AppText>
            <AppText variant="h3" color="primary">
              {section.label}
            </AppText>
            <AppText variant="h1" accessibilityRole="header">
              {section.heading}
            </AppText>
            {section.headingTex ? <MathExpression tex={section.headingTex} display /> : null}
            {section.headingCondition ? <MathText text={section.headingCondition} variant="bodyLarge" /> : null}
            <AppText variant="small" color="textSecondary">
              {[
                plural(examples, 'worked example', 'worked examples'),
                plural(tryIt, 'Try it question', 'Try it questions'),
                plural(tutorial, 'practice question', 'practice questions'),
              ].join(' · ')}
            </AppText>
          </View>

          {section.blocks.map((block, index) => (
            <Block key={`${section.id}-${index}`} block={block} />
          ))}

          {section.tryIt.length > 0 ? (
            <PracticeGroup
              title="Try it"
              text="From the course notes. Write your working, check each step, and ask for hints when you need them."
              items={section.tryIt}
            />
          ) : null}
          {section.tutorial.length > 0 ? (
            <PracticeGroup
              title="Practice questions"
              text="Tutorial questions that use the method of this section."
              items={section.tutorial}
            />
          ) : null}

          <View style={{ gap: theme.spacing.sm }}>
            {unit ? (
              <Pressable
                onPress={() => router.push(subtopicHref(topic.id, unit.slug))}
                accessibilityRole="link"
                accessibilityLabel={`Back to the lesson: ${unit.title}`}
                style={({ pressed }) => [
                  styles.neighbour,
                  { minHeight: theme.touchTarget.min, opacity: pressed ? 0.6 : 1 },
                ]}
              >
                <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
                  {`Back to the lesson: ${unit.title}`}
                </AppText>
              </Pressable>
            ) : null}
            <View style={[styles.neighbours, { gap: theme.spacing.md }]}>
              {previous ? (
                <NeighbourLink topicId={topic.id} section={previous} direction="previous" />
              ) : (
                <View style={styles.flexText} />
              )}
              {next ? <NeighbourLink topicId={topic.id} section={next} direction="next" /> : null}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  column: { width: '100%', alignSelf: 'center' },
  neighbours: { flexDirection: 'row', justifyContent: 'space-between' },
  neighbour: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  alignEnd: { justifyContent: 'flex-end' },
  flexText: { flexShrink: 1 },
});
