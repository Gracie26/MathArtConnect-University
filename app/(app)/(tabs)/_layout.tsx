import { Tabs } from 'expo-router/js-tabs';
import { BookOpen, ChartSpline, House, PenTool, TrendingUp } from 'lucide-react-native';
import { View } from 'react-native';

import { AvatarButton } from '@/components/navigation/AvatarButton';
import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function TabsLayout() {
  const theme = useAppTheme();

  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTitleStyle: { fontFamily: theme.fontFamilies.semibold, color: theme.colors.textPrimary },
        headerShadowVisible: false,
        headerRight: () => (
          <View style={{ marginRight: theme.spacing.sm }}>
            <AvatarButton />
          </View>
        ),
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        // Home draws its own app toolbar (wordmark, notifications, avatar).
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{ title: 'Learn', tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Explore', tabBarIcon: ({ color, size }) => <ChartSpline color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="create"
        options={{ title: 'Create', tabBarIcon: ({ color, size }) => <PenTool color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Progress', tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} /> }}
      />
    </Tabs>
  );
}
