import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Wordmark } from '@/components/brand/Wordmark';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

import { AvatarButton } from './AvatarButton';
import { IconButton } from './IconButton';

interface AppHeaderProps {
  unreadNotifications?: number;
  /** Show a hairline once content scrolls underneath. */
  elevated?: boolean;
}

/** Native-style toolbar: wordmark on the left, notifications and avatar on the right. */
export function AppHeader({ unreadNotifications = 0, elevated = false }: AppHeaderProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { gutter } = useResponsiveLayout();

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: theme.colors.background,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: elevated ? theme.colors.border : 'transparent',
      }}
    >
      <View
        style={[
          styles.bar,
          { maxWidth: theme.layout.maxDashboardWidth, paddingLeft: gutter, paddingRight: gutter - 6 },
        ]}
      >
        <Wordmark size={30} />
        <View style={styles.actions}>
          <IconButton
            icon={Bell}
            accessibilityLabel={
              unreadNotifications > 0 ? `Notifications, ${unreadNotifications} unread` : 'Notifications'
            }
            showBadge={unreadNotifications > 0}
            onPress={() => router.push('/notifications')}
          />
          <AvatarButton />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    width: '100%',
    alignSelf: 'center',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: { flexDirection: 'row', alignItems: 'center' },
});
