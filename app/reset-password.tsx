import { CircleCheck, LockKeyhole } from 'lucide-react-native';
import { useRef, useState } from 'react';
import type { TextInputInstance } from 'react-native';

import { AuthCard } from '@/components/auth/AuthCard';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { FormError } from '@/components/forms/FormError';
import { PasswordField } from '@/components/forms/PasswordField';
import { IconTile } from '@/components/ui/IconTile';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryTextButton } from '@/components/ui/SecondaryTextButton';
import { useAuth } from '@/features/auth/AuthProvider';
import { PASSWORD_MIN_LENGTH, validatePassword, validatePasswordConfirmation } from '@/lib/validation/auth';

/**
 * Reached only through a password-reset link (recovery mode, see
 * app/_layout.tsx). The learner is signed in with a recovery session until
 * they finish, then signed out to sign in with the new password.
 */
export default function ResetPasswordScreen() {
  const auth = useAuth();
  const confirmRef = useRef<TextInputInstance>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string | null; confirm?: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const leave = async () => {
    setLeaving(true);
    await auth.finishPasswordRecovery();
  };

  const submit = async () => {
    const next = { password: validatePassword(password), confirm: validatePasswordConfirmation(password, confirm) };
    setErrors(next);
    setFormError(null);
    if (next.password || next.confirm) return;
    setSaving(true);
    const result = await auth.updatePassword(password);
    setSaving(false);
    if (result.ok) setDone(true);
    else setFormError(result.error.message);
  };

  if (done) {
    return (
      <AuthScreenLayout
        title="Password updated"
        onBack={null}
        hero={<IconTile icon={CircleCheck} tone="teal" size={56} />}
      >
        <AuthCard>
          <FormError tone="success" message="Password updated successfully." />
          <PrimaryButton label="Return to Sign In" loading={leaving} onPress={() => void leave()} />
        </AuthCard>
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout
      title="Set a new password"
      subtitle="Choose a password you have not used for this account before."
      onBack={null}
      hero={<IconTile icon={LockKeyhole} tone="teal" size={56} />}
    >
      <AuthCard>
        <PasswordField
          purpose="new"
          label="New password"
          value={password}
          onChangeText={(t) => {
            setPassword(t);
            if (errors.password) setErrors((e) => ({ ...e, password: null }));
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
          label="Confirm new password"
          value={confirm}
          onChangeText={(t) => {
            setConfirm(t);
            if (errors.confirm) setErrors((e) => ({ ...e, confirm: null }));
          }}
          error={errors.confirm}
          returnKeyType="done"
          onSubmitEditing={() => void submit()}
        />
        <FormError message={formError} />
        <PrimaryButton
          label="Update Password"
          loadingLabel="Updating password"
          loading={saving}
          onPress={() => void submit()}
        />
        <SecondaryTextButton
          label="Cancel"
          color="textSecondary"
          onPress={() => void leave()}
          disabled={leaving}
          style={{ alignSelf: 'center' }}
        />
      </AuthCard>
    </AuthScreenLayout>
  );
}
