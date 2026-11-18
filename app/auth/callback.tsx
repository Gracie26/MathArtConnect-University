import { router, useLocalSearchParams } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';
import { useEffect, useState } from 'react';

import { AuthCard } from '@/components/auth/AuthCard';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { StartupScreen } from '@/components/layout/StartupScreen';
import { AppText } from '@/components/ui/AppText';
import { IconTile } from '@/components/ui/IconTile';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/features/auth/AuthProvider';

/** A PKCE code can be exchanged once; guards against double effects and re-renders. */
const handledCodes = new Set<string>();

/**
 * Landing route for every auth deep link: email verification, password
 * reset (flow=recovery) and Google / Apple OAuth redirects
 * (mathartconnect://auth/callback, or /auth/callback on web).
 */
export default function AuthCallbackScreen() {
  const auth = useAuth();
  const params = useLocalSearchParams<{
    code?: string;
    flow?: string;
    error?: string;
    error_code?: string;
    error_description?: string;
  }>();
  const [problem, setProblem] = useState<string | null>(null);
  const recovery = params.flow === 'recovery';

  useEffect(() => {
    const key = params.code ?? params.error_code ?? params.error ?? 'none';
    if (handledCodes.has(key)) return;
    handledCodes.add(key);

    void (async () => {
      const result = await auth.completeAuthRedirect(
        {
          code: params.code,
          error: params.error,
          errorCode: params.error_code,
          errorDescription: params.error_description,
        },
        recovery ? 'recovery' : undefined,
      );
      if (result.ok && result.data) {
        router.replace(recovery ? '/reset-password' : '/');
        return;
      }
      setProblem(
        result.ok
          ? 'We could not finish signing you in from this link. If you have just verified your email, you can now sign in.'
          : result.error.message,
      );
    })();
    // Runs once per link; auth actions are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.code, params.error, params.error_code]);

  if (!problem) return <StartupScreen />;

  return (
    <AuthScreenLayout
      title="Link not completed"
      onBack={null}
      hero={<IconTile icon={CircleAlert} tone="coral" size={56} />}
    >
      <AuthCard>
        <AppText variant="body" color="textSecondary">
          {problem}
        </AppText>
        <PrimaryButton
          label={auth.status === 'signedIn' ? 'Continue' : 'Go to Sign In'}
          onPress={() => router.replace(auth.status === 'signedIn' ? '/' : '/sign-in')}
        />
      </AuthCard>
    </AuthScreenLayout>
  );
}
