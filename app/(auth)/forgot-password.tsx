import { router, useLocalSearchParams } from 'expo-router';
import { KeyRound, MailCheck } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { AuthCard } from '@/components/auth/AuthCard';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { BackendSetupNotice } from '@/components/auth/BackendSetupNotice';
import { DevBackendNotice } from '@/components/auth/DevBackendNotice';
import { AuthTextField } from '@/components/forms/AuthTextField';
import { FormError } from '@/components/forms/FormError';
import { AppText } from '@/components/ui/AppText';
import { IconTile } from '@/components/ui/IconTile';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/features/auth/AuthProvider';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useCooldown } from '@/hooks/useCooldown';
import { normaliseEmail, validateEmail } from '@/lib/validation/auth';
import { isDevAuthBackend } from '@/services/auth';
import { devAuthTools } from '@/services/auth/devAuthService';

export default function ForgotPasswordScreen() {
  const theme = useAppTheme();
  const auth = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const cooldown = useCooldown(30);
  const [email, setEmail] = useState(params.email ?? '');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; tone: 'success' | 'error' } | null>(null);

  const send = async (target: string) => {
    setSending(true);
    setMessage(null);
    const result = await auth.requestPasswordReset(target);
    setSending(false);
    if (!result.ok) {
      setMessage({ tone: 'error', text: result.error.message });
      return false;
    }
    cooldown.start();
    return true;
  };

  const submit = async () => {
    const error = validateEmail(email);
    setEmailError(error);
    if (error) return;
    const target = normaliseEmail(email);
    if (await send(target)) setSentTo(target);
  };

  const backToSignIn = () => (router.canGoBack() ? router.back() : router.replace('/sign-in'));

  if (sentTo) {
    return (
      <AuthScreenLayout
        title="Check your email"
        onBack={backToSignIn}
        hero={<IconTile icon={MailCheck} tone="teal" size={56} />}
      >
        <AuthCard>
          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="body" color="textSecondary">
              If an account exists for this address, we sent a link to reset your password:
            </AppText>
            <AppText variant="title" selectable>
              {sentTo}
            </AppText>
          </View>
          <FormError message={message?.text} tone={message?.tone} />
          <PrimaryButton label="Back to Sign In" onPress={backToSignIn} />
          <LoadingButton
            variant="secondary"
            label={cooldown.active ? `Resend (${cooldown.remaining}s)` : 'Resend'}
            loading={sending}
            disabled={cooldown.active}
            onPress={() =>
              void send(sentTo).then((sent) => {
                if (sent) setMessage({ tone: 'success', text: 'We sent the link again.' });
              })
            }
          />
          {isDevAuthBackend ? (
            <LoadingButton
              variant="secondary"
              label="Simulate reset link (development)"
              onPress={() =>
                void devAuthTools.simulatePasswordResetLink(sentTo).then((result) => {
                  if (!result.ok) setMessage({ tone: 'error', text: result.error.message });
                })
              }
            />
          ) : null}
        </AuthCard>
        <DevBackendNotice message="Development mode: no email is sent. Use “Simulate reset link” to continue." />
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout
      title="Forgot password"
      subtitle="Enter your account email and we will send you a link to reset your password."
      onBack={backToSignIn}
      hero={<IconTile icon={KeyRound} tone="teal" size={56} />}
    >
      <AuthCard>
        <BackendSetupNotice />
        <AuthTextField
          label="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (emailError) setEmailError(null);
          }}
          error={emailError}
          placeholder="you@example.com"
          keyboardType="email-address"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="send"
          onSubmitEditing={() => void submit()}
        />
        <FormError message={message?.text} tone={message?.tone} />
        <PrimaryButton
          label="Send Reset Link"
          loadingLabel="Sending reset link"
          loading={sending}
          disabled={!email || !auth.accountsAvailable}
          onPress={() => void submit()}
        />
      </AuthCard>
      <DevBackendNotice />
    </AuthScreenLayout>
  );
}
