import { type LucideIcon, Moon, Sun, SunMoon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { useAppTheme } from '@/hooks/useAppTheme';
import { type ThemePreference, useThemeContext } from '@/theme';

const OPTIONS: { value: ThemePreference; label: string; icon: LucideIcon }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: SunMoon },
];

/** Light / Dark / System segmented control. Saved on this device and in the signed-in learner's account. */
export function AppearanceSelector() {
  const theme = useAppTheme();
  const { preference, setPreference } = useThemeContext();

  return (
    <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
      <AppText variant="title">Appearance</AppText>
      <View
        accessibilityRole="radiogroup"
        style={[styles.track, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.md }]}
      >
        {OPTIONS.map(({ value, label, icon: Icon }) => {
          const selected = preference === value;
          const color = selected ? theme.colors.primary : theme.colors.textSecondary;
          return (
            <Pressable
              key={value}
              onPress={() => setPreference(value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${label} appearance`}
              style={[
                styles.option,
                {
                  minHeight: theme.touchTarget.min,
                  borderRadius: theme.radius.sm,
                  backgroundColor: selected ? theme.colors.surface : 'transparent',
                },
                selected ? theme.shadows.subtle : null,
              ]}
            >
              <Icon size={16} color={color} />
              <AppText variant="caption" style={{ color }}>
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', padding: 4, gap: 4 },
  option: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
