import { BookOpenText } from 'lucide-react-native';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { SourceSection } from '@/content/types';
import { sectionHref } from '@/features/learning/navigation';
import { useAppTheme } from '@/hooks/useAppTheme';

/** "1.7 Integrals of the form ∫ (Ax + B)/(ax² + bx + c) dx": a section's full name as plain text. */
export const sectionTitle = (section: SourceSection): string =>
  [section.label, section.heading, section.headingPlain].filter(Boolean).join(' ');

/**
 * The course-notes sections taught in a subtopic, each opening its own page
 * (e.g. 1.6, 1.6.1, 1.6.2, 1.6.3, 1.7 inside Partial Fractions).
 */
export function SectionChips({ topicId, sections }: { topicId: string; sections: SourceSection[] }) {
  const theme = useAppTheme();
  if (sections.length === 0) return null;
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <View style={[styles.row, { gap: theme.spacing.xs }]}>
        <BookOpenText size={14} color={theme.colors.textSecondary} strokeWidth={2.4} />
        <AppText variant="eyebrow" color="textSecondary">
          IN THE COURSE NOTES
        </AppText>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.row, { gap: theme.spacing.sm }]}>
          {sections.map((section) => (
            <Pressable
              key={section.id}
              onPress={() => router.push(sectionHref(topicId, section.id))}
              accessibilityRole="link"
              accessibilityLabel={`Open section ${sectionTitle(section)}`}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: pressed ? theme.colors.surfacePressed : theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radius.pill,
                  minHeight: theme.touchTarget.min,
                  gap: theme.spacing.xs,
                },
              ]}
            >
              <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.bold }}>
                {section.label}
              </AppText>
              <AppText variant="caption" color="textPrimary" numberOfLines={1} style={styles.heading}>
                {section.headingPlain ? `${section.heading} ${section.headingPlain}` : section.heading}
              </AppText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, borderWidth: 1 },
  heading: { maxWidth: 260 },
});
