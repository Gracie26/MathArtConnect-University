import { router } from 'expo-router';
import { ArrowRight, ListChecks, RotateCcw } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { IconTile } from '@/components/ui/IconTile';
import { PressableScale } from '@/components/ui/PressableScale';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { toneColors } from '@/components/ui/tones';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { NextAction } from '@/types/dashboard';

/**
 * "Next best action": one rule-based suggestion (see dashboardRepository's
 * nextAction). Review Mistakes appears here only when there are open
 * mistakes; with nothing to suggest, Home simply leaves this card out.
 */
export function NextActionCard({ action }: { action: NextAction }) {
  const theme = useAppTheme();
  const accent = toneColors(theme, action.tone);
  const icon = action.id === 'review-mistakes' ? RotateCcw : ListChecks;

  return (
    <View>
      <SectionHeader title="Next best step" />
      <PressableScale
        onPress={() => router.push(action.href)}
        accessibilityRole="button"
        accessibilityLabel={`${action.title}. ${action.reason} ${action.actionLabel}`}
        style={[cardStyle(theme), styles.card, { padding: theme.spacing.md, borderLeftColor: accent.strong }]}
      >
        <View style={[styles.row, { gap: theme.spacing.md }]}>
          <IconTile icon={icon} tone={action.tone} size={36} />
          <View style={styles.text}>
            <AppText variant="title">{action.title}</AppText>
            <AppText variant="small" color="textSecondary">
              {action.reason}
            </AppText>
          </View>
          <View style={styles.action}>
            <AppText variant="caption" color="primary">
              {action.actionLabel}
            </AppText>
            <ArrowRight size={16} color={theme.colors.primary} strokeWidth={2.4} />
          </View>
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderLeftWidth: 3 },
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { flex: 1, gap: 2 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: 120 },
});
