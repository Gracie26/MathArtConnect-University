import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { FadeIn } from '@/components/ui/FadeIn';
import { useAppTheme } from '@/hooks/useAppTheme';

/**
 * A section whose content is hidden until asked for: a title, one line saying
 * what is inside, and a chevron. Keeps secondary material (practice modes,
 * extra resources) one tap away without competing with the main path.
 */
export function CollapsibleSection({
  title,
  summary,
  children,
  initiallyOpen = false,
}: {
  title: string;
  summary: string;
  children: ReactNode;
  initiallyOpen?: boolean;
}) {
  const theme = useAppTheme();
  const [open, setOpen] = useState(initiallyOpen);
  const Icon = open ? ChevronUp : ChevronDown;
  return (
    <View style={{ gap: theme.spacing.md }}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${title}. ${summary}. ${open ? 'Hide' : 'Show'}.`}
        style={({ pressed }) => [
          styles.header,
          {
            minHeight: theme.touchTarget.comfortable,
            gap: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderBottomColor: theme.colors.border,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View style={styles.text}>
          <AppText variant="h3">{title}</AppText>
          <AppText variant="small" color="textSecondary">
            {summary}
          </AppText>
        </View>
        <Icon size={20} color={theme.colors.primary} strokeWidth={2.4} />
      </Pressable>
      {open ? <FadeIn>{children}</FadeIn> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  text: { flex: 1, gap: 2 },
});
