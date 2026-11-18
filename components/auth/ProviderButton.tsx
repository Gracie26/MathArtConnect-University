import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { OAuthProvider } from '@/services/auth';
import { providerBrandColors } from '@/theme';

function GoogleMark({ size = 18 }: { size?: number }) {
  const g = providerBrandColors.google;
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        fill={g.red}
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <Path
        fill={g.blue}
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <Path
        fill={g.yellow}
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <Path
        fill={g.green}
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </Svg>
  );
}

function AppleMark({ size = 18, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        fill={color}
        d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z"
      />
    </Svg>
  );
}

interface ProviderButtonProps {
  provider: OAuthProvider;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  /**
   * 'brand': full-strength provider styling (Apple solid black/white).
   * 'subtle': outlined, slightly shorter buttons that sit below a primary
   * action, still within Google and Apple's approved button styles.
   */
  emphasis?: 'brand' | 'subtle';
}

const LABELS: Record<OAuthProvider, string> = {
  google: 'Continue with Google',
  apple: 'Continue with Apple',
};

/**
 * Social sign-in button following provider guidelines, labelled exactly
 * "Continue with Google" / "Continue with Apple".
 *
 * brand  · Google neutral white; Apple solid black (light) / white (dark).
 * subtle · Light: both white with an outline (Apple "white outline").
 *          Dark: Google's dark-theme button and Apple's black button.
 */
export function ProviderButton({
  provider,
  onPress,
  loading = false,
  disabled = false,
  emphasis = 'brand',
}: ProviderButtonProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const apple = providerBrandColors.apple;
  const google = providerBrandColors.google;
  const dark = theme.scheme === 'dark';
  const subtle = emphasis === 'subtle';

  const look =
    provider === 'google'
      ? subtle && dark
        ? { bg: google.darkFill, fg: google.darkText, border: google.darkStroke }
        : { bg: apple.white, fg: google.text, border: colors.borderStrong }
      : subtle
        ? dark
          ? { bg: apple.black, fg: apple.white, border: google.darkStroke }
          : { bg: apple.white, fg: apple.black, border: colors.borderStrong }
        : dark
          ? { bg: apple.white, fg: apple.black, border: apple.white }
          : { bg: apple.black, fg: apple.white, border: apple.black };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={LABELS[provider]}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: look.bg,
          borderColor: look.border,
          borderRadius: theme.radius.md,
          minHeight: subtle ? theme.touchTarget.comfortable : theme.touchTarget.comfortable + 4,
          opacity: pressed ? 0.85 : disabled ? 0.5 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={look.fg} />
      ) : (
        <View style={styles.content}>
          {provider === 'google' ? <GoogleMark /> : <AppleMark color={look.fg} size={19} />}
          <AppText
            variant="button"
            style={{
              color: look.fg,
              fontFamily: subtle ? theme.fontFamilies.medium : theme.fontFamilies.semibold,
              fontSize: subtle ? 15 : 16,
            }}
          >
            {LABELS[provider]}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, paddingHorizontal: 16 },
  content: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
