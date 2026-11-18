import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

/** "—— or ——" separator between provider buttons and the email form. */
export function AuthDivider({ label = 'or' }: { label?: string }) {
  const theme = useAppTheme();
  const line = [styles.line, { backgroundColor: theme.colors.border }];
  return (
    <View style={styles.row} aria-hidden>
      <View style={line} />
      <AppText variant="small" color="textSecondary">
        {label}
      </AppText>
      <View style={line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
});
