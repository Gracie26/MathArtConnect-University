import { CloudOff, WifiOff } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useConnectivity } from '@/hooks/useConnectivity';
import { isBackendConfigured } from '@/services/supabase/client';

/**
 * Tiny status pill. Learners only ever see "Offline". The "Dev · sample data"
 * pill appears in development builds (__DEV__) when Supabase is not set up,
 * and is never shown in production.
 */
export function SyncStatusBadge() {
  const theme = useAppTheme();
  const connection = useConnectivity();

  const offline = connection === 'offline';
  const devMock = __DEV__ && !isBackendConfigured();
  if (!offline && !devMock) return null;

  const Icon = offline ? WifiOff : CloudOff;
  const label = offline ? 'Offline · changes sync later' : 'Dev · sample data';

  return (
    <View
      accessible
      accessibilityLabel={offline ? 'You are offline. Changes will sync when you reconnect.' : label}
      style={[styles.pill, { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill }]}
    >
      <Icon size={12} color={theme.colors.textSecondary} strokeWidth={2.4} />
      <AppText variant="small" color="textSecondary" style={{ fontSize: 11 }}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
