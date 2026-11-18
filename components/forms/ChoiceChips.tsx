import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

interface ChoiceChipsProps<T extends string | number> {
  label: string;
  options: { value: T; label: string; accessibilityLabel?: string }[];
  value: T | null;
  /** Called with null when the selected chip is tapped again (optional field). */
  onChange: (value: T | null) => void;
  helper?: string;
}

/** Single-choice chip row (radio group semantics), e.g. year of study. */
export function ChoiceChips<T extends string | number>({
  label,
  options,
  value,
  onChange,
  helper,
}: ChoiceChipsProps<T>) {
  const theme = useAppTheme();
  const { colors } = theme;

  return (
    <View style={{ gap: 8 }}>
      <AppText variant="caption" style={{ fontFamily: theme.fontFamilies.semibold }}>
        {label}
      </AppText>
      <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.row}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={String(option.value)}
              onPress={() => onChange(selected ? null : option.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={option.accessibilityLabel ?? option.label}
              style={({ pressed }) => [
                styles.chip,
                {
                  minHeight: theme.touchTarget.min,
                  minWidth: theme.touchTarget.min + 8,
                  borderRadius: theme.radius.sm,
                  borderColor: selected ? colors.primary : colors.borderStrong,
                  borderWidth: selected ? 2 : 1,
                  backgroundColor: selected ? colors.primarySoft : pressed ? colors.surfacePressed : colors.surface,
                },
              ]}
            >
              <AppText
                variant="caption"
                style={{
                  color: selected ? colors.primary : colors.textPrimary,
                  fontFamily: theme.fontFamilies.semibold,
                }}
              >
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      {helper ? (
        <AppText variant="small" color="textSecondary">
          {helper}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
});
