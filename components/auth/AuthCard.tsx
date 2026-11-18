import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cardStyle } from '@/components/ui/cardStyle';
import { useAppTheme } from '@/hooks/useAppTheme';

/** White (light) / slate (dark) surface holding an auth form. */
export function AuthCard({ children }: { children: ReactNode }) {
  const theme = useAppTheme();
  return (
    <View
      style={[cardStyle(theme), { padding: theme.spacing.xl, gap: theme.spacing.lg, borderRadius: theme.radius.lg }]}
    >
      {children}
    </View>
  );
}
