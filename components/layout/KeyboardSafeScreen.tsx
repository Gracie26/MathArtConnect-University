import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, type StyleProp, StyleSheet, type ViewStyle } from 'react-native';

interface KeyboardSafeScreenProps {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Rendered behind the scrolling content (e.g. decorative backdrop). */
  background?: ReactNode;
}

/**
 * Scrollable form container that keeps the focused input above the keyboard.
 * Behaviour follows Expo's keyboard-handling guide: `padding` on iOS, none on
 * Android (the window already resizes). Taps on buttons work while the
 * keyboard is open.
 */
export function KeyboardSafeScreen({ children, contentContainerStyle, background }: KeyboardSafeScreenProps) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.grow, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
        {background}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  grow: { flexGrow: 1 },
});
