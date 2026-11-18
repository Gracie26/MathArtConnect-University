import { ChevronRight, Compass, type LucideIcon, PenLine, Trophy } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { IconTile } from '@/components/ui/IconTile';
import type { PracticeMode, PracticeModeId } from '@/content/types';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AccentTone } from '@/types/dashboard';

import { StatusLabel } from './StatusLabel';

const LOOK: Record<PracticeModeId, { icon: LucideIcon; tone: AccentTone }> = {
  guided: { icon: Compass, tone: 'teal' },
  independent: { icon: PenLine, tone: 'blue' },
  challenge: { icon: Trophy, tone: 'amber' },
};

/** Practice mode entry: opens the practice list when available, otherwise shows "Coming soon". */
export function PracticeModeCard({ mode, onPress }: { mode: PracticeMode; onPress?: () => void }) {
  const theme = useAppTheme();
  const { icon, tone } = LOOK[mode.id];
  const available = mode.availability.status === 'available' && onPress !== undefined;

  const content = (
    <>
      <IconTile icon={icon} tone={tone} size={40} />
      <View style={styles.text}>
        <AppText variant="title">{mode.title}</AppText>
        <AppText variant="small" color="textSecondary">
          {mode.summary}
        </AppText>
        {available ? null : (
          <View style={{ marginTop: theme.spacing.xs }}>
            <StatusLabel status="comingSoon" />
          </View>
        )}
      </View>
      {available ? <ChevronRight size={20} color={theme.colors.textSecondary} /> : null}
    </>
  );

  if (!available) {
    return (
      <View
        accessible
        accessibilityLabel={`${mode.title}. ${mode.summary} Coming soon.`}
        style={[cardStyle(theme), styles.card, { padding: theme.spacing.lg, gap: theme.spacing.md }]}
      >
        {content}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${mode.title}. ${mode.summary}`}
      style={({ pressed }) => [
        cardStyle(theme),
        styles.card,
        { padding: theme.spacing.lg, gap: theme.spacing.md, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center' },
  text: { flex: 1, gap: 2 },
});
