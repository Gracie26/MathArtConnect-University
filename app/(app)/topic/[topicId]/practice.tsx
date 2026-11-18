import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { PracticeItemCard } from '@/components/learning/PracticeItems';
import type { HelpPolicy } from '@/components/practice/MyWorking';
import { AppText } from '@/components/ui/AppText';
import { matchesPracticeSource, practiceSourceOptions } from '@/content/practiceSources';
import { getTopic } from '@/content/registry';
import type { PracticeItem, PracticeModeId, PracticeSourceOption, TopicDefinition } from '@/content/types';
import { isPracticeItemVisible } from '@/content/visibility';
import { practiceHref } from '@/features/learning/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';

const HELP: Record<PracticeModeId, HelpPolicy> = { guided: 'full', independent: 'full', challenge: 'afterFirstCheck' };

const isMode = (value: string | undefined): value is PracticeModeId =>
  value === 'guided' || value === 'independent' || value === 'challenge';

/** Practice: every question from the course material, ordered by mode and filterable by subtopic. */
export default function PracticeScreen() {
  const { topicId, mode, unit, source, method } = useLocalSearchParams<{
    topicId: string;
    mode?: string;
    unit?: string;
    source?: string;
    method?: string;
  }>();
  const topic = topicId ? getTopic(topicId) : undefined;
  if (!topic || topic.isDemo || !(topic.practiceItems?.length ?? 0)) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Practice' }} />
        <AppText variant="h2">Practice is not available for this topic yet.</AppText>
      </Screen>
    );
  }
  return (
    <Practice
      topic={topic}
      mode={isMode(mode) ? mode : 'independent'}
      unitSlug={unit}
      source={practiceSourceOptions(topic).find((option) => option.id === source)}
      method={method || undefined}
    />
  );
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Show ${label}`}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.colors.primarySoft : theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.radius.pill,
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

function Practice({
  topic,
  mode,
  unitSlug,
  source,
  method,
}: {
  topic: TopicDefinition;
  mode: PracticeModeId;
  unitSlug?: string;
  source?: PracticeSourceOption;
  method?: string;
}) {
  const theme = useAppTheme();
  const modeInfo = topic.practiceModes.find((m) => m.id === mode);
  const selectedUnit = topic.units.find((u) => u.slug === unitSlug);

  const items = useMemo(() => {
    const sections = topic.sections ?? [];
    const sectionIndex = new Map(sections.map((s, i) => [s.id, i]));
    const unitIndex = new Map(topic.units.map((u, i) => [u.id, i]));
    const courseOrder = (item: PracticeItem) =>
      (unitIndex.get(item.unitId) ?? 0) * 10_000 +
      (sectionIndex.get(item.sourceSection) ?? 0) * 100 +
      (item.sourceType === 'tutorial-question' ? 50 : 0);
    const list = (topic.practiceItems ?? [])
      .map((item, order) => ({ item, order }))
      .filter(
        ({ item }) =>
          isPracticeItemVisible(item) &&
          (!selectedUnit || item.unitId === selectedUnit.id) &&
          matchesPracticeSource(item, source) &&
          (!method || item.technique === method),
      );
    list.sort((a, b) => {
      const difficulty =
        mode === 'guided'
          ? a.item.difficulty - b.item.difficulty
          : mode === 'challenge'
            ? b.item.difficulty - a.item.difficulty
            : 0;
      return difficulty || courseOrder(a.item) - courseOrder(b.item) || a.order - b.order;
    });
    return list.map(({ item }) => item);
  }, [topic, mode, selectedUnit, source, method]);

  const sourceOptions = practiceSourceOptions(topic);
  // Methods in the questions for the chosen subtopic and source (whatever the method filter).
  const methods = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of topic.practiceItems ?? []) {
      if (
        !isPracticeItemVisible(item) ||
        (selectedUnit && item.unitId !== selectedUnit.id) ||
        !matchesPracticeSource(item, source)
      )
        continue;
      if (!seen.has(item.technique)) seen.set(item.technique, item.techniqueLabel);
    }
    return [...seen.entries()];
  }, [topic, selectedUnit, source]);

  const sectionLabel = (item: PracticeItem) => {
    const section = topic.sections?.find((s) => s.id === item.sourceSection);
    const unitTitle = topic.units.find((u) => u.id === item.unitId)?.title ?? '';
    return section ? `${unitTitle} · ${section.label} ${section.heading}` : unitTitle;
  };

  const header = (
    <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="eyebrow" color="textSecondary">
          {`${topic.title.toUpperCase()} · PRACTICE`}
        </AppText>
        <AppText variant="h1">{modeInfo?.title ?? 'Practice'}</AppText>
        {modeInfo ? (
          <AppText variant="body" color="textSecondary">
            {modeInfo.summary}
          </AppText>
        ) : null}
        <AppText variant="small" color="textSecondary">
          Hints and walkthroughs are app guidance, not official UNAM or lecturer solutions.
        </AppText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.rowNoWrap, { gap: theme.spacing.sm }]}>
          <FilterChip
            label="All subtopics"
            selected={!selectedUnit}
            onPress={() => router.setParams({ unit: '', method: '' })}
          />
          {topic.units.map((u, index) => (
            <FilterChip
              key={u.id}
              label={`${index + 1}. ${u.title}`}
              selected={selectedUnit?.id === u.id}
              onPress={() => router.setParams({ unit: u.slug, method: '' })}
            />
          ))}
        </View>
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.rowNoWrap, { gap: theme.spacing.sm }]}>
          <FilterChip
            label="All questions"
            selected={!source}
            onPress={() => router.setParams({ source: '', method: '' })}
          />
          {sourceOptions.map((option) => (
            <FilterChip
              key={option.id}
              label={option.label}
              selected={source?.id === option.id}
              onPress={() => router.setParams({ source: option.id, method: '' })}
            />
          ))}
        </View>
      </ScrollView>
      {methods.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.rowNoWrap, { gap: theme.spacing.sm }]}>
            <FilterChip label="All methods" selected={!method} onPress={() => router.setParams({ method: '' })} />
            {methods.map(([id, label]) => (
              <FilterChip
                key={id}
                label={label}
                selected={method === id}
                onPress={() => router.setParams({ method: id })}
              />
            ))}
          </View>
        </ScrollView>
      ) : null}
      <View style={[styles.row, { gap: theme.spacing.sm }]}>
        {topic.practiceModes
          .filter((m) => m.id !== mode)
          .map((m) => (
            <FilterChip
              key={m.id}
              label={m.title}
              selected={false}
              onPress={() => router.replace(practiceHref(topic.id, m.id, selectedUnit?.slug, source?.id))}
            />
          ))}
      </View>
      <AppText variant="small" color="textSecondary">
        {items.length === 1 ? '1 question' : `${items.length} questions`}
      </AppText>
    </View>
  );

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: modeInfo?.title ?? 'Practice' }} />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        contentContainerStyle={[
          styles.column,
          {
            padding: theme.layout.screenGutter,
            paddingBottom: theme.spacing.huge,
            maxWidth: theme.layout.maxContentWidth,
          },
        ]}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.lg }} />}
        renderItem={({ item, index }) => (
          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="small" color="textSecondary">
              {sectionLabel(item)}
            </AppText>
            <PracticeItemCard item={item} index={index} helpPolicy={HELP[mode]} />
          </View>
        )}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  column: { width: '100%', alignSelf: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  rowNoWrap: { flexDirection: 'row', alignItems: 'center' },
  chip: { paddingHorizontal: 14, justifyContent: 'center', borderWidth: 1 },
});
