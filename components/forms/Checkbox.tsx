import { Check } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Spoken label (plain text). */
  accessibilityLabel: string;
  /** Visible label; may contain inline links rendered outside the toggle. */
  children: ReactNode;
  error?: string | null;
}

/** 24 dp box inside a 44 dp touch row; the label can hold separate link buttons. */
export function Checkbox({ checked, onChange, accessibilityLabel, children, error }: CheckboxProps) {
  const theme = useAppTheme();
  const { colors } = theme;

  return (
    <View style={{ gap: 4 }}>
      <View style={styles.row}>
        <Pressable
          onPress={() => onChange(!checked)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          accessibilityLabel={accessibilityLabel}
          hitSlop={10}
          style={[styles.touch, { width: theme.touchTarget.min, height: theme.touchTarget.min }]}
        >
          <View
            style={[
              styles.box,
              {
                borderColor: error ? colors.error : checked ? colors.primary : colors.borderStrong,
                backgroundColor: checked ? colors.primary : colors.surface,
              },
            ]}
          >
            {checked ? <Check size={16} color={colors.onPrimary} strokeWidth={3} /> : null}
          </View>
        </Pressable>
        <View style={styles.label}>{children}</View>
      </View>
      {error ? (
        <AppText variant="small" color="error" accessibilityLiveRegion="polite" style={{ marginLeft: 38 }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: -10 },
  touch: { alignItems: 'center', justifyContent: 'center' },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
});
