import { useRef, useState } from 'react';
import { type TextInputInstance, View } from 'react-native';

import { FormError } from '@/components/forms/FormError';
import { PasswordField } from '@/components/forms/PasswordField';
import { KeyboardSafeScreen } from '@/components/layout/KeyboardSafeScreen';
import { cardStyle } from '@/components/ui/cardStyle';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/features/auth/AuthProvider';
import { useAppTheme } from '@/hooks/useAppTheme';
import { PASSWORD_MIN_LENGTH, validatePassword, validatePasswordConfirmation } from '@/lib/validation/auth';

export default function ChangePasswordScreen() {
  const theme = useAppTheme();
  const auth = useAuth();
  const confirmRef = useRef<TextInputInstance>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string | null; confirm?: string | null }>({});
  const [message, setMessage] = useState<{ text: string; tone: 'error' | 'success' } | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const next = { password: validatePassword(password), confirm: validatePasswordConfirmation(password, confirm) };
    setErrors(next);
    setMessage(null);
    if (next.password || next.confirm) return;
    setSaving(true);
    const result = await auth.updatePassword(password);
    setSaving(false);
    if (result.ok) {
      setPassword('');
      setConfirm('');
      setMessage({ tone: 'success', text: 'Your password has been updated.' });
    } else {
      setMessage({ tone: 'error', text: result.error.message });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardSafeScreen contentContainerStyle={{ padding: theme.layout.screenGutter }}>
        <View
          style={[
            cardStyle(theme),
            {
              padding: theme.spacing.xl,
              gap: theme.spacing.lg,
              width: '100%',
              maxWidth: 480,
              alignSelf: 'center',
            },
          ]}
        >
          <PasswordField
            purpose="new"
            label="New password"
            value={password}
            onChangeText={setPassword}
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
            onChangeText={setConfirm}
            error={errors.confirm}
            returnKeyType="done"
            onSubmitEditing={() => void submit()}
          />
          <FormError message={message?.text} tone={message?.tone} />
          <PrimaryButton
            label="Update Password"
            loadingLabel="Updating password"
            loading={saving}
            onPress={() => void submit()}
          />
        </View>
      </KeyboardSafeScreen>
    </View>
  );
}
