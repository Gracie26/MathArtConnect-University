import { Camera, UserRound } from 'lucide-react-native';
import { Image, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { initialsOf } from '@/lib/utils/format';

import { AppText } from './AppText';

interface ProfileAvatarProps {
  name?: string | null;
  imageUrl?: string | null;
  size?: number;
  /** Shows a small camera badge (for avatar pickers). */
  editable?: boolean;
}

/** Profile picture, else initials, else a person icon. Decorative: wrap with a labelled control. */
export function ProfileAvatar({ name, imageUrl, size = 40, editable = false }: ProfileAvatarProps) {
  const theme = useAppTheme();
  const initials = name ? initialsOf(name) : null;
  const badge = Math.max(22, Math.round(size * 0.32));

  return (
    <View aria-hidden style={{ width: size, height: size }}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: initials || imageUrl ? theme.colors.primary : theme.colors.primarySoft,
          },
        ]}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: size, height: size }} resizeMode="cover" />
        ) : initials ? (
          <AppText
            color="onPrimary"
            style={{ fontFamily: theme.fontFamilies.bold, fontSize: Math.round(size * 0.38), lineHeight: size }}
          >
            {initials}
          </AppText>
        ) : (
          <UserRound size={Math.round(size * 0.5)} color={theme.colors.primary} />
        )}
      </View>
      {editable ? (
        <View
          style={[
            styles.badge,
            {
              width: badge,
              height: badge,
              borderRadius: badge / 2,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Camera size={Math.round(badge * 0.55)} color={theme.colors.textPrimary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
