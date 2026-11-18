import { router, useLocalSearchParams } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Platform, View } from 'react-native';

import { AuthCard } from '@/components/auth/AuthCard';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { DevBackendNotice } from '@/components/auth/DevBackendNotice';
import { FormError } from '@/components/forms/FormError';
import { AppText } from '@/components/ui/AppText';
import { IconTile } from '@/components/ui/IconTile';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryTextButton } from '@/components/ui/SecondaryTextButton';
import { useAuth } from '@/features/auth/AuthProvider';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCooldown } from '@/hooks/useCooldown';
import { isDevAuthBackend } from '@/services/auth';
import { devAuthTools } from '@/services/auth/devAuthService';

/** Opens the mail app's inbox where the platform allows it. */
async function openMailApp(): Promise<boolean> {
  const url = Platform.OS === 'ios' ? 'message://' : 'mailto:';
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}

export default function VerifyEmailScreen() {
  const theme = useAppTheme();
  const auth = useAuth();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const cooldown = useCooldown(30);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ text: string; tone: 'success' | 'error' | 'info' } | null>(null);

  const resend = async () => {
    setSending(true);
    const result = await auth.resendVerification(email);
    setSending(false);
    if (result.ok) {
      cooldown.start();
      setMessage({ tone: 'success', text: 'We sent the email again. It can take a minute to arrive.' });
    } else {
      setMessage({ tone: 'error', text: result.error.message });
    }
  };

  return (
    <AuthScreenLayout
      title="Check your email"
      onBack={() => router.replace('/sign-in')}
      hero={<IconTile icon={MailCheck} tone="teal" size={56} />}
    >
      <AuthCard>
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="body" color="textSecondary">
            We sent a verification link to:
          </AppText>
          <AppText variant="title" selectable>
            {email}
          </AppText>
        </View>
        <AppText variant="small" color="textSecondary">
          Open the link on this device to verify your account and continue. Check your spam folder if you cannot find
          it.
        </AppText>
        <FormError message={message?.text} tone={message?.tone} />
        {Platform.OS !== 'web' ? (
          <PrimaryButton
            label="Open email app"
            onPress={() =>
              void openMailApp().then((opened) => {
                if (!opened) setMessage({ tone: 'info', text: 'Open your email app to find the link.' });
              })
            }
          />
        ) : null}
        <LoadingButton
          variant="secondary"
          label={cooldown.active ? `Resend email (${cooldown.remaining}s)` : 'Resend email'}
          loading={sending}
          disabled={cooldown.active || !email}
          onPress={() => void resend()}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.xl, flexWrap: 'wrap' }}>
          <SecondaryTextButton
            label="Change email"
            onPress={() => router.replace({ pathname: '/sign-up', params: { email } })}
          />
          {/* Verified on another device or browser: that link cannot sign in here. */}
          <SecondaryTextButton label="Already verified? Sign in" onPress={() => router.replace('/sign-in')} />
        </View>
        {isDevAuthBackend ? (
          <LoadingButton
            variant="secondary"
            label="Simulate verification link (development)"
            onPress={() => void devAuthTools.simulateEmailVerification(email)}
          />
        ) : null}
      </AuthCard>
      <DevBackendNotice message="Development mode: no email is sent. Use “Simulate verification link” to continue." />
    </AuthScreenLayout>
  );
}
