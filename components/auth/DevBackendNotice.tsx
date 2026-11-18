import { FlaskConical } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { isDevAuthBackend } from '@/services/auth';

/**
 * Shown only with the development device backend (a __DEV__ build without
 * Supabase), so test accounts are never mistaken for real ones.
 */
export function DevBackendNotice({ message }: { message?: string }) {
  const theme = useAppTheme();
  if (!isDevAuthBackend) return null;

  return (
    <View
      accessible
      accessibilityRole="summary"
      style={[styles.row, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.sm }]}
    >
      <FlaskConical size={14} color={theme.colors.textSecondary} />
      <AppText variant="small" color="textSecondary" style={styles.text}>
        {message ?? 'Development mode: test accounts are stored on this device only and are not real accounts.'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 8 },
  text: { flex: 1 },
});
