import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { useAuth } from '@/features/auth/AuthProvider';
import { useAppTheme } from '@/hooks/useAppTheme';

interface AvatarButtonProps {
  size?: number;
}

/** Profile entry point in the toolbar: the learner's photo or initials. Opens Profile. */
export function AvatarButton({ size = 34 }: AvatarButtonProps) {
  const theme = useAppTheme();
  const { profile } = useAuth();

  return (
    <Pressable
      onPress={() => router.push('/profile')}
      accessibilityRole="button"
      accessibilityLabel="Open profile and settings"
      hitSlop={6}
      style={({ pressed }) => [
        styles.touch,
        { width: theme.touchTarget.min, height: theme.touchTarget.min, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <ProfileAvatar name={profile?.displayName} imageUrl={profile?.avatarUrl} size={size} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touch: { alignItems: 'center', justifyContent: 'center' },
});
