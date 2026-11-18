import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AreaArtCanvas } from '@/components/art/area/AreaArtCanvas';
import { ArtPreview } from '@/components/art/ArtPreview';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { listLearnerTopics } from '@/content/registry';
import type { CreateType, TopicActivity, TopicDefinition } from '@/content/types';
import { activityHref } from '@/features/learning/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';
import { projectFromTemplate, templateById } from '@/lib/art/areaArt';

import { ActivityList } from './ActivityList';

const unitTitle = (topic: TopicDefinition) => (a: TopicActivity) =>
  topic.units.find((u) => u.id === a.unitId)?.title ?? '';

/**
 * Explore (Visual Calculus Lab): one topic at a time, chosen with the topic
 * switcher, its tools as compact rows grouped by subtopic in lesson order.
 * Every tool of every topic stays one or two taps away.
 */
export function ExploreCatalog() {
  const theme = useAppTheme();
  const topics = listLearnerTopics().filter((t) => t.activities.some((a) => a.kind === 'lab'));
  const [topicId, setTopicId] = useState(topics[0]?.id);
  const topic = topics.find((t) => t.id === topicId) ?? topics[0];
  if (!topic) return null;
  const labs = topic.activities.filter((a) => a.kind === 'lab');
  return (
    <View style={{ gap: theme.spacing.lg }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: theme.spacing.sm, paddingVertical: 2 }}
        accessibilityRole="tablist"
      >
        {topics.map((t) => {
          const selected = t.id === topic.id;
          const number = listLearnerTopics().indexOf(t) + 1;
          return (
            <Pressable
              key={t.id}
              onPress={() => setTopicId(t.id)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={`Topic ${number}: ${t.title}`}
              style={({ pressed }) => [
                styles.topicChip,
                {
                  minHeight: theme.touchTarget.min,
                  borderRadius: theme.radius.pill,
                  paddingHorizontal: theme.spacing.lg,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
                  backgroundColor: selected
                    ? theme.colors.primarySoft
                    : pressed
                      ? theme.colors.surfacePressed
                      : theme.colors.surface,
                },
              ]}
            >
              <AppText
                variant="caption"
                numberOfLines={1}
                style={{ color: selected ? theme.colors.primary : theme.colors.textPrimary, maxWidth: 220 }}
              >
                {`${number} · ${t.title}`}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={{ gap: theme.spacing.xs }}>
        <AppText variant="h2">{topic.title}</AppText>
        <AppText variant="small" color="textSecondary">
          {`${labs.length} interactive tools, by subtopic`}
        </AppText>
      </View>
      {topic.units.map((unit) => {
        const tools = labs.filter((a) => a.unitId === unit.id);
        if (tools.length === 0) return null;
        return (
          <View key={unit.id} style={{ gap: theme.spacing.sm }}>
            <AppText variant="h3">{unit.title}</AppText>
            <ActivityList activities={tools} compact />
          </View>
        );
      })}
    </View>
  );
}

/** Every learner topic's games, grouped by subtopic in lesson order. */
export function GamesCatalog() {
  return <KindCatalog kind="game" />;
}

function KindCatalog({ kind }: { kind: 'lab' | 'game' }) {
  const theme = useAppTheme();
  return (
    <>
      {listLearnerTopics().map((topic) => {
        const labs = topic.activities.filter((a) => a.kind === kind);
        if (labs.length === 0) return null;
        return (
          <View key={topic.id} style={{ gap: theme.spacing.lg }}>
            <AppText variant="h2">{topic.title}</AppText>
            {topic.units.map((unit) => {
              const tools = labs.filter((a) => a.unitId === unit.id);
              if (tools.length === 0) return null;
              return (
                <View key={unit.id} style={{ gap: theme.spacing.sm }}>
                  <AppText variant="h3">{unit.title}</AppText>
                  <ActivityList activities={tools} />
                </View>
              );
            })}
          </View>
        );
      })}
    </>
  );
}

const CREATE_GROUPS: { type: CreateType; title: string; description: string }[] = [
  {
    type: 'graphArt',
    title: 'Graph art',
    description: 'Build pictures from equations, restrictions and parameter sliders.',
  },
  {
    type: 'areaArt',
    title: 'Area art',
    description: 'Build mosaics, accumulation curves and trails from Riemann sums and integrals.',
  },
  {
    type: 'rnArt',
    title: 'Multivariable art',
    description: 'Draw domains, surface slices, chain-rule networks and coordinate grids from the mathematics.',
  },
  {
    type: 'paArt',
    title: 'Gradient and surface art',
    description: 'Draw gradient fields, tangent-plane sculptures and landscapes of peaks, pits and saddles.',
  },
  {
    type: 'structure',
    title: 'Mathematical structure maps',
    description: 'Arrange the structure of a method as cards and nodes. No graph needed.',
  },
  {
    type: 'flow',
    title: 'Solution flows',
    description: 'Build a solution as a flow of stages, then style and explain it.',
  },
];

/** A graph-art activity card that shows its starter artwork, rendered live from its equations. */
function ArtActivityCard({ activity, topic }: { activity: TopicActivity; topic: TopicDefinition }) {
  const theme = useAppTheme();
  const studio = topic.studios?.[activity.id];
  const starter = useMemo(() => studio?.starter(), [studio]);
  return (
    <Pressable
      onPress={() => router.push(activityHref(activity.topicId, activity.id))}
      accessibilityRole="button"
      accessibilityLabel={`Open ${activity.title}. Graph art. ${activity.summary}`}
      style={({ pressed }) => [
        cardStyle(theme),
        styles.artCard,
        { padding: theme.spacing.md, gap: theme.spacing.sm, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {starter && studio ? (
        <ArtPreview
          project={starter}
          functions={studio.functions}
          height={150}
          summary={`Starter artwork: ${starter.title}`}
        />
      ) : null}
      <AppText variant="small" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
        {`Graph art · ${unitTitle(topic)(activity)}`}
      </AppText>
      <AppText variant="title">{activity.title}</AppText>
      <AppText variant="small" color="textSecondary">
        {activity.summary}
      </AppText>
    </Pressable>
  );
}

/** An area-art activity card showing its starter template. */
function AreaArtActivityCard({ activity, topic }: { activity: TopicActivity; topic: TopicDefinition }) {
  const theme = useAppTheme();
  const config = topic.areaStudios?.[activity.id];
  const starter = useMemo(() => {
    const template = config ? templateById(config.starter) : undefined;
    return template ? projectFromTemplate(template, template.title) : null;
  }, [config]);
  return (
    <Pressable
      onPress={() => router.push(activityHref(activity.topicId, activity.id))}
      accessibilityRole="button"
      accessibilityLabel={`Open ${activity.title}. Area art. ${activity.summary}`}
      style={({ pressed }) => [
        cardStyle(theme),
        styles.artCard,
        { padding: theme.spacing.md, gap: theme.spacing.sm, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {starter ? (
        <AreaArtCanvas project={starter} height={150} thumbnail description={`Starter artwork: ${starter.title}`} />
      ) : null}
      <AppText variant="small" color="textSecondary" style={{ fontFamily: theme.fontFamilies.semibold }}>
        {`Area art · ${unitTitle(topic)(activity)}`}
      </AppText>
      <AppText variant="title">{activity.title}</AppText>
      <AppText variant="small" color="textSecondary">
        {activity.summary}
      </AppText>
    </Pressable>
  );
}

/** Every learner topic's Create activities, grouped by graph art, area art, structure maps and solution flows. */
export function CreateCatalog() {
  const theme = useAppTheme();
  return (
    <>
      {listLearnerTopics().map((topic) => {
        const studios = topic.activities.filter((a) => a.kind === 'studio');
        if (studios.length === 0) return null;
        return (
          <View key={topic.id} style={{ gap: theme.spacing.lg }}>
            <AppText variant="h2">{topic.title}</AppText>
            {CREATE_GROUPS.map((group) => {
              const items = studios.filter((a) => (a.createType ?? 'graphArt') === group.type);
              if (items.length === 0) return null;
              return (
                <View key={group.type} style={{ gap: theme.spacing.sm }}>
                  <AppText variant="h3">{group.title}</AppText>
                  <AppText variant="small" color="textSecondary">
                    {group.description}
                  </AppText>
                  {group.type === 'areaArt' ? (
                    <View style={[styles.grid, { gap: theme.spacing.md }]}>
                      {items.map((a) => (
                        <AreaArtActivityCard key={a.id} activity={a} topic={topic} />
                      ))}
                    </View>
                  ) : group.type === 'graphArt' ? (
                    <View style={[styles.grid, { gap: theme.spacing.md }]}>
                      {items.map((a) => (
                        <ArtActivityCard key={a.id} activity={a} topic={topic} />
                      ))}
                    </View>
                  ) : (
                    <ActivityList activities={items} context={unitTitle(topic)} />
                  )}
                </View>
              );
            })}
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  topicChip: { justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  artCard: { flexGrow: 1, flexBasis: 280, minWidth: 0 },
});
