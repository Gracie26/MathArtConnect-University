import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { LogoMark } from '@/components/art/LogoMark';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAppTheme } from '@/hooks/useAppTheme';

interface StartupScreenProps {
  /** When set, shows a message and retry instead of the spinner. */
  error?: string | null;
  onRetry?: () => void;
}

/**
 * Calm launch state while the saved session and profile are restored, so the
 * sign-in screen never flashes for a learner who is already signed in.
 */
export function StartupScreen({ error, onRetry }: StartupScreenProps) {
  const theme = useAppTheme();

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background, gap: theme.spacing.xxl }]}>
      <LogoMark size={64} />
      {error ? (
        <View style={[styles.error, { gap: theme.spacing.lg }]}>
          <AppText variant="body" color="textSecondary" style={styles.center}>
            {error}
          </AppText>
          {onRetry ? <PrimaryButton label="Try again" onPress={onRetry} /> : null}
        </View>
      ) : (
        <ActivityIndicator color={theme.colors.primary} accessibilityLabel="Loading MathArt Connect" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  error: { width: '100%', maxWidth: 360 },
  center: { textAlign: 'center' },
});
