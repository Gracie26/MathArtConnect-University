import { View } from 'react-native';

import { FormError } from '@/components/forms/FormError';
import { useProviderSignIn } from '@/features/auth/useProviderSignIn';
import { useAppTheme } from '@/hooks/useAppTheme';

import { AuthDivider } from './AuthDivider';
import { ProviderButton } from './ProviderButton';

interface ProviderSignInButtonsProps {
  disabled?: boolean;
  /**
   * 'top': prominent buttons above the email form, then an "or" divider.
   * 'bottom': secondary buttons below the primary action, after an "or"
   * divider (sign-in and sign-up both use this).
   */
  placement?: 'top' | 'bottom';
}

/** "Continue with Google / Apple" block with its divider; renders nothing if no provider applies. */
export function ProviderSignInButtons({ disabled = false, placement = 'top' }: ProviderSignInButtonsProps) {
  const theme = useAppTheme();
  const { providers, busy, message, signIn } = useProviderSignIn();
  if (providers.length === 0) return null;

  const bottom = placement === 'bottom';
  const buttons = providers.map((provider) => (
    <ProviderButton
      key={provider}
      provider={provider}
      emphasis={bottom ? 'subtle' : 'brand'}
      loading={busy === provider}
      disabled={disabled || (busy !== null && busy !== provider)}
      onPress={() => void signIn(provider)}
    />
  ));

  return (
    <View style={{ gap: bottom ? theme.spacing.sm + 2 : theme.spacing.md }}>
      {bottom ? <AuthDivider /> : null}
      {buttons}
      <FormError message={message?.text} tone={message?.tone} />
      {bottom ? null : <AuthDivider />}
    </View>
  );
}
