import { CircleAlert, CircleCheck, Info, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useAppTheme } from '@/hooks/useAppTheme';

type Tone = 'error' | 'success' | 'info';

interface FormErrorProps {
  message: string | null | undefined;
  tone?: Tone;
}

/**
 * Inline form message with icon + text (never colour alone). Errors are
 * announced immediately to screen readers.
 */
export function FormError({ message, tone = 'error' }: FormErrorProps) {
  const theme = useAppTheme();
  const { colors } = theme;
  if (!message) return null;

  const config: Record<Tone, { icon: LucideIcon; bg: string; fg: string }> = {
    error: { icon: CircleAlert, bg: colors.errorSoft, fg: colors.error },
    success: { icon: CircleCheck, bg: colors.successSoft, fg: colors.textPrimary },
    info: { icon: Info, bg: colors.secondarySoft, fg: colors.textPrimary },
  };
  const { icon: Icon, bg, fg } = config[tone];

  return (
    <View
      accessibilityRole={tone === 'error' ? 'alert' : 'summary'}
      accessibilityLiveRegion={tone === 'error' ? 'assertive' : 'polite'}
      style={[styles.box, { backgroundColor: bg, borderRadius: theme.radius.sm }]}
    >
      <Icon
        size={18}
        color={tone === 'error' ? colors.error : tone === 'success' ? colors.success : colors.secondary}
      />
      <AppText variant="caption" style={[styles.text, { color: tone === 'error' ? colors.textPrimary : fg }]}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  text: { flex: 1 },
});
