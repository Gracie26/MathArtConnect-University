import { Stack } from 'expo-router';

import { useAppTheme } from '@/hooks/useAppTheme';

/** Signed-out screens. Each draws its own header via AuthScreenLayout. */
export const unstable_settings = {
  initialRouteName: 'sign-in',
};

export default function AuthLayout() {
  const theme = useAppTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }} />;
}
