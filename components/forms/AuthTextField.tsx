import { type ReactNode, type Ref, useState } from 'react';
import { Platform, StyleSheet, TextInput, type TextInputInstance, type TextInputProps, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface AuthTextFieldProps extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  label: string;
  /** Validation message; shown under the field and announced. */
  error?: string | null;
  /** Guidance shown when there is no error, e.g. password rules. */
  helper?: string;
  /** Trailing control inside the field (e.g. password visibility toggle). */
  trailing?: ReactNode;
  ref?: Ref<TextInputInstance>;
}

/** Labelled text input with focus, error and helper states (44+ dp, AA contrast). */
export function AuthTextField({ label, error, helper, trailing, ref, onFocus, onBlur, ...input }: AuthTextFieldProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.error : focused ? colors.primary : colors.borderStrong;

  return (
    <View style={styles.wrap}>
      <AppText variant="caption" style={{ color: colors.textPrimary, fontFamily: theme.fontFamilies.semibold }}>
        {label}
      </AppText>
      <View
        style={[
          styles.field,
          {
            borderColor,
            borderWidth: focused || error ? 2 : 1,
            backgroundColor: colors.surface,
            borderRadius: theme.radius.md - 2,
            minHeight: theme.touchTarget.comfortable + 4,
          },
        ]}
      >
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={error ?? helper}
          aria-invalid={Boolean(error)}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            styles.input,
            theme.typography.body,
            { color: colors.textPrimary, paddingHorizontal: focused || error ? 13 : 14 },
            Platform.OS === 'web' ? styles.webNoOutline : null,
          ]}
          {...input}
        />
        {trailing}
      </View>
      {error ? (
        <AppText variant="small" color="error" accessibilityLiveRegion="polite" style={styles.message}>
          {error}
        </AppText>
      ) : helper ? (
        <AppText variant="small" color="textSecondary" style={styles.message}>
          {helper}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  field: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, alignSelf: 'stretch', paddingVertical: 12 },
  // The field border already shows focus clearly; avoid the doubled browser ring.
  webNoOutline: { outlineWidth: 0 } as object,
  message: { marginTop: 2 },
});
