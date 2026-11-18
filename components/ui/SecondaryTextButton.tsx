import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

import { AppText, type TextColorRole } from './AppText';

interface SecondaryTextButtonProps {
  label: string;
  onPress: () => void;
  color?: TextColorRole;
  accessibilityLabel?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Low-emphasis text action ("Forgot password?") with a 44 dp touch target. */
export function SecondaryTextButton({
  label,
  onPress,
  color = 'primary',
  accessibilityLabel,
  disabled = false,
  style,
}: SecondaryTextButtonProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      hitSlop={8}
      style={({ pressed }) => [
        { minHeight: theme.touchTarget.min, justifyContent: 'center', opacity: disabled ? 0.5 : pressed ? 0.6 : 1 },
        style,
      ]}
    >
      <AppText variant="caption" color={color} style={{ fontFamily: theme.fontFamilies.semibold }}>
        {label}
      </AppText>
    </Pressable>
  );
}
