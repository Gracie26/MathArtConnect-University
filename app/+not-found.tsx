import { Link, Stack } from 'expo-router';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found', headerShown: true }} />
      <Screen>
        <AppText variant="h2">This page does not exist.</AppText>
        <Link href="/" accessibilityRole="link">
          <AppText color="link">Go to Home</AppText>
        </Link>
      </Screen>
    </>
  );
}
