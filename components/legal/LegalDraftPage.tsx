import { FileClock } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { useAppTheme } from '@/hooks/useAppTheme';

interface LegalDraftPageProps {
  title: string;
  /** What the final document will cover; no legal claims are made here. */
  willCover: string[];
}

/**
 * Placeholder for legal documents that are still being prepared. States
 * clearly that the text is a draft pending research and legal review.
 */
export function LegalDraftPage({ title, willCover }: LegalDraftPageProps) {
  const theme = useAppTheme();

  return (
    <Screen>
      <View
        accessible
        accessibilityRole="summary"
        style={[styles.badge, { backgroundColor: theme.colors.achievementSoft, borderRadius: theme.radius.sm }]}
      >
        <FileClock size={18} color={theme.colors.achievementStrong} />
        <AppText variant="caption" style={styles.badgeText}>
          Draft / pending final research and legal review
        </AppText>
      </View>
      <View style={[cardStyle(theme), { padding: theme.spacing.xl, gap: theme.spacing.md }]}>
        <AppText variant="h2">{title}</AppText>
        <AppText variant="body" color="textSecondary">
          {`The final ${title} for MathArt Connect is being prepared. This page will be updated with the approved text before the app is made publicly available.`}
        </AppText>
        <AppText variant="title">This document will cover</AppText>
        <View style={{ gap: theme.spacing.sm }}>
          {willCover.map((item) => (
            <AppText key={item} variant="body" color="textSecondary">
              {`•  ${item}`}
            </AppText>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10 },
  badgeText: { flex: 1 },
});
