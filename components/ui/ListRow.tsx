import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

import { AppText } from './AppText';
import { cardStyle } from './cardStyle';

interface ListRowProps {
  label: string;
  icon?: LucideIcon;
  /** Secondary text under the label. */
  description?: string;
  /** Right-aligned value (e.g. "Linked"), or any element. */
  value?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  accessibilityLabel?: string;
  first?: boolean;
}

/** Settings-style row. With onPress it is a button with a chevron; otherwise a plain info row. */
export function ListRow({
  label,
  icon: Icon,
  description,
  value,
  onPress,
  destructive,
  accessibilityLabel,
  first,
}: ListRowProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const color = destructive ? colors.error : colors.textPrimary;

  const content = (pressed: boolean) => (
    <View
      style={[
        styles.row,
        {
          minHeight: theme.touchTarget.comfortable + 8,
          paddingHorizontal: theme.spacing.lg,
          gap: theme.spacing.md,
          borderTopWidth: first ? 0 : StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          backgroundColor: pressed ? colors.surfacePressed : 'transparent',
        },
      ]}
    >
      {Icon ? <Icon size={20} color={destructive ? colors.error : colors.textSecondary} /> : null}
      <View style={styles.text}>
        <AppText variant="body" style={{ color, fontFamily: theme.fontFamilies.medium }}>
          {label}
        </AppText>
        {description ? (
          <AppText variant="small" color="textSecondary">
            {description}
          </AppText>
        ) : null}
      </View>
      {typeof value === 'string' ? (
        <AppText variant="caption" color="textSecondary" numberOfLines={1} style={styles.value}>
          {value}
        </AppText>
      ) : (
        value
      )}
      {onPress && !destructive ? <ChevronRight size={18} color={colors.textMuted} /> : null}
    </View>
  );

  if (!onPress) {
    return (
      <View
        accessible
        accessibilityLabel={accessibilityLabel ?? (typeof value === 'string' ? `${label}, ${value}` : label)}
      >
        {content(false)}
      </View>
    );
  }
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label}>
      {({ pressed }) => content(pressed)}
    </Pressable>
  );
}

/** Titled group of rows on one card. */
export function ListSection({ title, children }: { title?: string; children: ReactNode }) {
  const theme = useAppTheme();
  return (
    <View style={{ gap: theme.spacing.sm }}>
      {title ? (
        <AppText variant="eyebrow" color="textSecondary" style={{ marginLeft: theme.spacing.xs }}>
          {title.toUpperCase()}
        </AppText>
      ) : null}
      <View style={[cardStyle(theme), styles.card]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  text: { flex: 1, gap: 2 },
  value: { maxWidth: '45%', textAlign: 'right' },
  card: { overflow: 'hidden' },
});
