import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, type TextInputInstance, View } from 'react-native';

import { AuthCard } from '@/components/auth/AuthCard';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { BackendSetupNotice } from '@/components/auth/BackendSetupNotice';
import { DevBackendNotice } from '@/components/auth/DevBackendNotice';
import { ProviderSignInButtons } from '@/components/auth/ProviderSignInButtons';
import { AuthTextField } from '@/components/forms/AuthTextField';
import { Checkbox } from '@/components/forms/Checkbox';
import { FormError } from '@/components/forms/FormError';
import { PasswordField } from '@/components/forms/PasswordField';
import { AppText } from '@/components/ui/AppText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryTextButton } from '@/components/ui/SecondaryTextButton';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  normaliseEmail,
  PASSWORD_MIN_LENGTH,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from '@/lib/validation/auth';

type Field = 'fullName' | 'email' | 'password' | 'confirm' | 'terms';

export default function SignUpScreen() {
  const auth = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(params.email ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string | null>>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const clear = (field: Field) => errors[field] && setErrors((e) => ({ ...e, [field]: null }));

  const submit = async () => {
    const next = {
      fullName: validateDisplayName(fullName),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: validatePasswordConfirmation(password, confirm),
      terms: agreed ? null : 'Please agree to the Terms of Use and Privacy Policy to continue.',
    };
    setErrors(next);
    setFormError(null);
    if (Object.values(next).some(Boolean)) return;

    const result = await auth.signUp(fullName.trim(), normaliseEmail(email), password);
    if (!result.ok) {
      setFormError(result.error.message);
      return;
    }
    if (result.data.status === 'verification_required') {
      router.replace({ pathname: '/verify-email', params: { email: result.data.email } });
    }
    // 'signed_in' (email confirmation disabled): the route guard opens profile setup.
  };

  return (
    <AuthScreenLayout
      title="Create your account"
      subtitle="Save your progress, creations and practice across sessions."
      footer={
        <View style={styles.footer}>
          <AppText variant="caption" color="textSecondary">
            Already have an account?
          </AppText>
          <SecondaryTextButton
            label="Sign in"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/sign-in'))}
          />
        </View>
      }
    >
      <AuthCard>
        <BackendSetupNotice />
        <AuthTextField
          label="Full name"
          value={fullName}
          onChangeText={(t) => {
            setFullName(t);
            clear('fullName');
          }}
          error={errors.fullName}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          submitBehavior="submit"
        />
        <AuthTextField
          ref={emailRef}
          label="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            clear('email');
          }}
          error={errors.email}
          placeholder="you@example.com"
          keyboardType="email-address"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          submitBehavior="submit"
        />
        <PasswordField
          ref={passwordRef}
          purpose="new"
          label="Password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            clear('password');
          }}
          error={errors.password}
          helper={`At least ${PASSWORD_MIN_LENGTH} characters.`}
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
          submitBehavior="submit"
        />
        <PasswordField
          ref={confirmRef}
          purpose="new"
          label="Confirm password"
          value={confirm}
          onChangeText={(t) => {
            setConfirm(t);
            clear('confirm');
          }}
          error={errors.confirm}
          returnKeyType="done"
          onSubmitEditing={() => void submit()}
        />
        <Checkbox
          checked={agreed}
          onChange={(value) => {
            setAgreed(value);
            clear('terms');
          }}
          accessibilityLabel="I agree to the Terms of Use and Privacy Policy"
          error={errors.terms}
        >
          <AppText variant="caption">I agree to the </AppText>
          <SecondaryTextButton
            label="Terms"
            accessibilityLabel="Read the Terms of Use"
            onPress={() => router.push('/terms')}
          />
          <AppText variant="caption"> and </AppText>
          <SecondaryTextButton
            label="Privacy Policy"
            accessibilityLabel="Read the Privacy Policy"
            onPress={() => router.push('/privacy')}
          />
        </Checkbox>
        {/* Account consent and research participation are deliberately separate. */}
        <AppText variant="small" color="textSecondary">
          Creating an account does not enrol you in any research study.
        </AppText>
        <FormError message={formError} />
        <PrimaryButton
          label="Create account"
          loadingLabel="Creating your account"
          loading={auth.signingIn}
          disabled={!auth.accountsAvailable}
          onPress={() => void submit()}
        />
        {/* The email form is the main path; Google and Apple follow as secondary options. */}
        <ProviderSignInButtons placement="bottom" disabled={auth.signingIn} />
      </AuthCard>
      <DevBackendNotice />
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  footer: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
});
