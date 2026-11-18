import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

import { AppText } from './AppText';
import { LoadingButton } from './LoadingButton';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Cross-platform confirmation dialog (React Native's Alert does nothing on
 * web). Tapping the backdrop or the Android back button cancels.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={styles.center}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.overlay }]}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
        />
        <View
          accessibilityViewIsModal
          role="alertdialog"
          aria-label={title}
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.lg,
              padding: theme.spacing.xxl,
              gap: theme.spacing.lg,
            },
            theme.shadows.raised,
          ]}
        >
          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="h3">{title}</AppText>
            {message ? (
              <AppText variant="body" color="textSecondary">
                {message}
              </AppText>
            ) : null}
          </View>
          <View style={[styles.actions, { gap: theme.spacing.md }]}>
            <LoadingButton label={cancelLabel} variant="secondary" onPress={onCancel} style={styles.action} />
            <LoadingButton
              label={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
              loading={loading}
              onPress={onConfirm}
              style={styles.action}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 400 },
  actions: { flexDirection: 'row' },
  action: { flex: 1 },
});
