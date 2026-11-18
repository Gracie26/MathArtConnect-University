import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { useFonts } from 'expo-font';
import { type Href, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StartupScreen } from '@/components/layout/StartupScreen';
import { WebScrollbarStyle } from '@/components/layout/WebScrollbarStyle';
import { AuthProvider, useAuth } from '@/features/auth/AuthProvider';
import { useDisplayPreferencesHydrated } from '@/features/preferences/displayPreferences';
import { usePreferenceSync } from '@/features/preferences/usePreferenceSync';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ThemeProvider } from '@/theme';

void SplashScreen.preventAutoHideAsync();

/**
 * Route access follows auth state (Stack.Protected). When a guard closes, every
 * Protected group redirects to the one screen the learner may use now
 * (`redirectTo`; since SDK 58 the router no longer falls through in order):
 *
 *   signed out, first launch      → onboarding
 *   signed out                    → (auth): sign-in, sign-up, verify, forgot
 *   password-reset link           → reset-password only
 *   signed in, profile incomplete → profile-setup
 *   signed in, profile complete   → (app): Home and the rest of the app
 *
 * auth/callback, terms and privacy are always reachable (deep links, legal).
 */
function RootNavigator() {
  const theme = useAppTheme();
  const auth = useAuth();
  const restoring = auth.status === 'loading';
  // Theme, high contrast and Reduce Motion follow the signed-in learner's account.
  usePreferenceSync(auth.status === 'signedIn' ? (auth.user?.id ?? null) : null);

  useEffect(() => {
    if (!restoring) void SplashScreen.hideAsync();
  }, [restoring]);

  // Never flash sign-in before the saved session has been checked.
  if (restoring) return <StartupScreen />;
  if (auth.status === 'signedIn' && auth.profileStatus === 'error' && !auth.profile) {
    return (
      <StartupScreen
        error="We could not load your profile. Check your connection and try again."
        onRetry={() => void auth.retryProfile()}
      />
    );
  }

  const signedIn = auth.status === 'signedIn';
  const recovery = auth.recoveryMode;
  const home: Href = !signedIn
    ? auth.onboardingComplete
      ? '/sign-in'
      : '/onboarding'
    : recovery
      ? '/reset-password'
      : auth.profileComplete
        ? '/'
        : '/profile-setup';
  const legalHeader = {
    headerShown: true,
    headerStyle: { backgroundColor: theme.colors.background },
    headerTintColor: theme.colors.primary,
    headerTitleStyle: { fontFamily: theme.fontFamilies.semibold, color: theme.colors.textPrimary },
    headerShadowVisible: false,
    // Never show an internal route-group name such as "(app)" as the back label.
    headerBackTitle: 'Back',
  } as const;

  return (
    <>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <WebScrollbarStyle />
      <Stack
        screenOptions={{
          headerShown: false,
          headerBackTitle: 'Back',
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Protected guard={signedIn && !recovery && auth.profileComplete} redirectTo={home}>
          <Stack.Screen name="(app)" options={{ title: 'Home' }} />
        </Stack.Protected>
        <Stack.Protected guard={signedIn && !recovery && !auth.profileComplete} redirectTo={home}>
          <Stack.Screen name="profile-setup" />
        </Stack.Protected>
        <Stack.Protected guard={signedIn && recovery} redirectTo={home}>
          <Stack.Screen name="reset-password" />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn && auth.onboardingComplete} redirectTo={home}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        {/* Signed-in learners can replay the introduction from Settings. */}
        <Stack.Protected guard={!recovery && (signedIn || !auth.onboardingComplete)} redirectTo={home}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>

        <Stack.Screen name="auth/callback" />
        <Stack.Screen name="terms" options={{ ...legalHeader, title: 'Terms of Use' }} />
        <Stack.Screen name="privacy" options={{ ...legalHeader, title: 'Privacy Policy' }} />
        <Stack.Screen name="+not-found" options={{ ...legalHeader, title: 'Not found' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  // The saved theme is read before anything is drawn (the splash stays up), so dark mode never flashes light.
  const preferencesReady = useDisplayPreferencesHydrated();

  // If fonts fail (e.g. offline web), continue with system fonts rather than block.
  if ((!fontsLoaded && !fontError) || !preferencesReady) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
