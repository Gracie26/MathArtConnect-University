import { ChartSpline, Gamepad2, type LucideIcon, Palette } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ActivityList } from '@/components/activities/ActivityList';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { IconTile } from '@/components/ui/IconTile';
import type { ActivityKind, TopicActivity } from '@/content/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AccentTone } from '@/types/dashboard';

import { StatusLabel } from './StatusLabel';

const GROUPS: { kind: ActivityKind; title: string; summary: string; icon: LucideIcon; tone: AccentTone }[] = [
  { kind: 'lab', title: 'Explore', summary: 'Interactive visual labs', icon: ChartSpline, tone: 'blue' },
  { kind: 'game', title: 'Play', summary: 'Games that practise each technique', icon: Gamepad2, tone: 'coral' },
  { kind: 'studio', title: 'Create', summary: 'Mathematical art activities', icon: Palette, tone: 'teal' },
];

/**
 * Progressive disclosure: one compact card per activity type with its count.
 * Tapping a card lists its activities below the cards.
 */
export function ActivityGroups({ activities }: { activities: readonly TopicActivity[] }) {
  const theme = useAppTheme();
  const [open, setOpen] = useState<ActivityKind | null>(null);
  const openItems = activities.filter((a) => a.kind === open && a.availability.status === 'available');

  return (
    <View style={{ gap: theme.spacing.md }}>
      <View style={[styles.grid, { gap: theme.spacing.md }]}>
        {GROUPS.map((group) => {
          const items = activities.filter((a) => a.kind === group.kind);
          const available = items.filter((a) => a.availability.status === 'available').length;
          const selected = open === group.kind;
          return (
            <Pressable
              key={group.kind}
              disabled={available === 0}
              onPress={() => setOpen(selected ? null : group.kind)}
              accessibilityRole="button"
              accessibilityState={{ expanded: selected, disabled: available === 0 }}
              accessibilityLabel={`${group.title}: ${items.length} activities. ${available === 0 ? 'Coming soon.' : selected ? 'Hide the list.' : 'Show the list.'}`}
              style={({ pressed }) => [
                cardStyle(theme),
                styles.card,
                {
                  padding: theme.spacing.lg,
                  gap: theme.spacing.sm,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  borderWidth: selected ? 2 : StyleSheet.hairlineWidth,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <IconTile icon={group.icon} tone={group.tone} size={36} />
              <AppText variant="title">{group.title}</AppText>
              <AppText variant="small" color="textSecondary">
                {`${group.summary} · ${items.length}`}
              </AppText>
              {available === 0 ? <StatusLabel status="comingSoon" /> : null}
            </Pressable>
          );
        })}
      </View>
      {open && openItems.length > 0 ? <ActivityList activities={openItems} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { flexBasis: '30%', flexGrow: 1, minWidth: 150 },
});
