import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

import { AuthTextField, type AuthTextFieldProps } from './AuthTextField';

interface PasswordFieldProps extends Omit<AuthTextFieldProps, 'secureTextEntry' | 'trailing'> {
  /** 'current' for sign-in, 'new' for sign-up / reset (drives password-manager hints). */
  purpose: 'current' | 'new';
}

/** Password input with an accessible show/hide toggle and correct autofill hints. */
export function PasswordField({ purpose, ...props }: PasswordFieldProps) {
  const theme = useAppTheme();
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <AuthTextField
      {...props}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      spellCheck={false}
      textContentType={purpose === 'new' ? 'newPassword' : 'password'}
      autoComplete={purpose === 'new' ? 'new-password' : 'current-password'}
      trailing={
        <Pressable
          onPress={() => setVisible((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          accessibilityState={{ checked: visible }}
          hitSlop={4}
          style={({ pressed }) => ({
            width: theme.touchTarget.min,
            height: theme.touchTarget.min,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Icon size={20} color={theme.colors.textSecondary} />
        </Pressable>
      }
    />
  );
}
