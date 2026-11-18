import { Stack } from 'expo-router';

import { useAppTheme } from '@/hooks/useAppTheme';

/**
 * Signed-in area. Access is guarded in app/_layout.tsx (signed in + profile
 * setup complete); nothing here repeats session logic.
 */
export default function AppLayout() {
  const theme = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.primary,
        headerTitleStyle: { fontFamily: theme.fontFamilies.semibold, color: theme.colors.textPrimary },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: theme.colors.background },
        // iOS otherwise labels the back button with the previous route's name, which for the tab
        // group is the internal "(tabs)". Learners always see a plain "Back".
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
      <Stack.Screen name="topic/[topicId]" options={{ title: '' }} />
      <Stack.Screen name="topic/[topicId]/[subtopicId]" options={{ title: 'Lesson' }} />
      <Stack.Screen name="topic/[topicId]/section/[sectionId]" options={{ title: 'Course notes' }} />
      <Stack.Screen name="topic/[topicId]/practice" options={{ title: 'Practice' }} />
      <Stack.Screen name="topic/[topicId]/activity/[activityId]" options={{ title: 'Activity' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="settings" options={{ title: 'Appearance & Motion' }} />
      <Stack.Screen name="about" options={{ title: 'About' }} />
      <Stack.Screen name="help" options={{ title: 'Help' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="account" options={{ title: 'Account & Security' }} />
      <Stack.Screen name="change-password" options={{ title: 'Change password' }} />
      <Stack.Screen name="my-work" options={{ title: 'Review My Work' }} />
      <Stack.Screen name="mistakes" options={{ title: 'Review Mistakes' }} />
      <Stack.Screen name="games" options={{ title: 'Games' }} />
      <Stack.Screen name="practice" options={{ title: 'Practice' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="progress/[topicId]" options={{ title: 'Progress' }} />
      <Stack.Screen name="rewards" options={{ title: 'Rewards' }} />
    </Stack>
  );
}
