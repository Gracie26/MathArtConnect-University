import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { FadeIn } from '@/components/ui/FadeIn';
import { useAppTheme } from '@/hooks/useAppTheme';

/**
 * A "Show …" / "Hide …" toggle that reveals extra content (a proof, a
 * derivation, a "Why this step?" note). Collapsed by default so a lesson
 * never becomes one long page; screen readers hear the expanded state.
 */
export function Disclosure({
  showLabel,
  hideLabel,
  children,
  initiallyOpen = false,
}: {
  showLabel: string;
  hideLabel: string;
  children: ReactNode;
  initiallyOpen?: boolean;
}) {
  const theme = useAppTheme();
  const [open, setOpen] = useState(initiallyOpen);
  const Icon = open ? ChevronUp : ChevronDown;
  return (
    <View style={{ gap: theme.spacing.sm }}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={open ? hideLabel : showLabel}
        accessibilityState={{ expanded: open }}
        hitSlop={8}
        style={({ pressed }) => [
          styles.toggle,
          { minHeight: theme.touchTarget.min, gap: theme.spacing.xs, opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
          {open ? hideLabel : showLabel}
        </AppText>
        <Icon size={16} color={theme.colors.primary} strokeWidth={2.4} />
      </Pressable>
      {open ? <FadeIn>{children}</FadeIn> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
});
