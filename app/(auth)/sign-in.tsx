import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, type TextInputInstance, View } from 'react-native';

import { AuthCard } from '@/components/auth/AuthCard';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { BackendSetupNotice } from '@/components/auth/BackendSetupNotice';
import { DevBackendNotice } from '@/components/auth/DevBackendNotice';
import { ProviderSignInButtons } from '@/components/auth/ProviderSignInButtons';
import { AuthTextField } from '@/components/forms/AuthTextField';
import { FormError } from '@/components/forms/FormError';
import { PasswordField } from '@/components/forms/PasswordField';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryTextButton } from '@/components/ui/SecondaryTextButton';
import { useAuth } from '@/features/auth/AuthProvider';
import { consumeAuthEntryIntent } from '@/features/onboarding/entryIntent';
import { normaliseEmail, validateEmail } from '@/lib/validation/auth';
import { AUTH_MESSAGES } from '@/services/auth';

export default function SignInScreen() {
  const auth = useAuth();
  const passwordRef = useRef<TextInputInstance>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  // "Get Started" in onboarding means: go to Create Account (Back returns here).
  useEffect(() => {
    if (consumeAuthEntryIntent() === 'sign-up') router.push('/sign-up');
  }, []);

  const submit = async () => {
    const emailError = validateEmail(email);
    const passwordError = password ? null : 'Enter your password.';
    setErrors({ email: emailError, password: passwordError });
    setFormError(null);
    setNeedsVerification(false);
    if (emailError || passwordError) return;

    const result = await auth.signIn(normaliseEmail(email), password);
    if (!result.ok) {
      setFormError(result.error.message);
      setNeedsVerification(result.error.message === AUTH_MESSAGES.emailNotVerified);
    }
    // Success: the route guard moves to profile setup or Home.
  };

  return (
    <AuthScreenLayout
      title="Welcome back"
      subtitle="Continue your learning journey."
      onBack={null}
      footer={
        <View style={styles.footer}>
          <AppText variant="caption" color="textSecondary">
            New to MathArt Connect?
          </AppText>
          <SecondaryTextButton label="Create account" onPress={() => router.push('/sign-up')} />
        </View>
      }
    >
      <AuthCard>
        <BackendSetupNotice />
        <AuthTextField
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors((e) => ({ ...e, email: null }));
          }}
          error={errors.email}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          inputMode="email"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          submitBehavior="submit"
        />
        <View>
          <PasswordField
            ref={passwordRef}
            purpose="current"
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors((e) => ({ ...e, password: null }));
            }}
            error={errors.password}
            returnKeyType="go"
            onSubmitEditing={() => void submit()}
          />
          <SecondaryTextButton
            label="Forgot password?"
            onPress={() => router.push({ pathname: '/forgot-password', params: email ? { email } : {} })}
            style={styles.forgot}
          />
        </View>
        <FormError message={formError} />
        {needsVerification ? (
          <SecondaryTextButton
            label="Resend verification email"
            onPress={() => router.push({ pathname: '/verify-email', params: { email: normaliseEmail(email) } })}
          />
        ) : null}
        <PrimaryButton
          label="Sign In"
          loadingLabel="Signing in"
          loading={auth.signingIn}
          // Always pressable (strongest action); empty fields get clear validation messages.
          disabled={!auth.accountsAvailable}
          onPress={() => void submit()}
        />
        <ProviderSignInButtons placement="bottom" disabled={auth.signingIn} />
      </AuthCard>
      <DevBackendNotice />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  forgot: { alignSelf: 'flex-end' },
});
