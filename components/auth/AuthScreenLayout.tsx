import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmbientMathArt } from '@/components/art/AmbientMathArt';
import { Wordmark } from '@/components/brand/Wordmark';
import { KeyboardSafeScreen } from '@/components/layout/KeyboardSafeScreen';
import { IconButton } from '@/components/navigation/IconButton';
import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

interface AuthScreenLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Content below the card, e.g. "New to MathArt Connect? Create account". */
  footer?: ReactNode;
  /** Back arrow handler; defaults to router.back() when history exists. */
  onBack?: (() => void) | null;
  /** Optional illustration or icon above the title. */
  hero?: ReactNode;
  showWordmark?: boolean;
}

/** Max width of the auth column; forms never stretch across a desktop screen. */
export const AUTH_MAX_WIDTH = 440;

/**
 * Shared frame for every signed-out screen: calm Soft Sand background with
 * faint line art, optional back arrow, wordmark, heading, then a card. Centred
 * and capped at 440 dp so tablet and desktop stay app-like.
 */
export function AuthScreenLayout({
  title,
  subtitle,
  children,
  footer,
  onBack,
  hero,
  showWordmark = true,
}: AuthScreenLayoutProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const back = onBack === undefined ? (router.canGoBack() ? () => router.back() : null) : onBack;

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <KeyboardSafeScreen
        background={<AmbientMathArt variant="lissajous" height={460} />}
        contentContainerStyle={{
          paddingTop: insets.top + theme.spacing.sm,
          paddingBottom: insets.bottom + theme.spacing.xxxl,
          paddingHorizontal: theme.layout.screenGutter + 4,
        }}
      >
        <View style={[styles.column, { maxWidth: AUTH_MAX_WIDTH }]}>
          {back ? (
            <View style={styles.topBar}>
              <IconButton icon={ArrowLeft} accessibilityLabel="Go back" onPress={back} />
            </View>
          ) : null}

          <View style={[styles.body, { gap: theme.spacing.xxl }]}>
            <View style={{ gap: theme.spacing.lg }}>
              {showWordmark ? <Wordmark size={32} /> : null}
              {hero}
              <View style={{ gap: theme.spacing.xs }}>
                <AppText variant="h1">{title}</AppText>
                {subtitle ? (
                  <AppText variant="body" color="textSecondary">
                    {subtitle}
                  </AppText>
                ) : null}
              </View>
            </View>
            {children}
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </View>
      </KeyboardSafeScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  column: { width: '100%', alignSelf: 'center', flexGrow: 1 },
  topBar: { height: 48, flexDirection: 'row', alignItems: 'center', marginLeft: -10 },
  body: { flexGrow: 1, justifyContent: 'center', paddingVertical: 8 },
  footer: { alignItems: 'center' },
});
