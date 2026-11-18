import { router } from 'expo-router';
import {
  Award,
  BellRing,
  CheckCheck,
  CircleAlert,
  Clock,
  FolderOpen,
  type LucideIcon,
  Sparkles,
  Target,
  X,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { FormError } from '@/components/forms/FormError';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { IconTile } from '@/components/ui/IconTile';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyNote, formatWhen, Section } from '@/features/insights/components';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { AccentTone } from '@/types/dashboard';

import {
  GROUP_TITLE,
  groupNotificationsByDay,
  KIND_LABEL,
  type LearnerNotification,
  type NotificationKind,
  type NotificationSettings,
} from './notifications';
import { useNotifications } from './useNotifications';

const LOOK: Record<NotificationKind, { icon: LucideIcon; tone: AccentTone }> = {
  reminder: { icon: BellRing, tone: 'teal' },
  inactivity: { icon: Clock, tone: 'blue' },
  review: { icon: CircleAlert, tone: 'amber' },
  weakArea: { icon: Target, tone: 'coral' },
  achievement: { icon: Award, tone: 'amber' },
  savedWork: { icon: FolderOpen, tone: 'blue' },
  newActivity: { icon: Sparkles, tone: 'teal' },
};

const SETTINGS: { key: keyof NotificationSettings; title: string; text: string }[] = [
  {
    key: 'learning',
    title: 'Learning reminders',
    text: 'Unfinished lessons, saved work to finish, new activities, and a nudge after a few days away.',
  },
  {
    key: 'review',
    title: 'Review reminders',
    text: 'Questions to review, and tools to try where you used many hints.',
  },
  { key: 'achievement', title: 'Achievement notifications', text: 'Subtopics, games and creations you complete.' },
];

/**
 * The in-app notification centre: real, rule-based notifications with read
 * and unread state, mark all as read, dismiss, and a tap that opens the
 * relevant screen, grouped into Today, Yesterday and Earlier. No phone push
 * notifications are sent.
 */
export function NotificationCentre() {
  const theme = useAppTheme();
  const n = useNotifications();

  const open = (item: LearnerNotification) => {
    n.markRead(item.id);
    router.push(item.href);
  };

  return (
    <View style={{ gap: theme.spacing.xl }}>
      <FormError message={n.error} />
      {n.status === 'loading' ? (
        <Skeleton height={160} radius={theme.radius.card} />
      ) : n.status === 'error' ? (
        <LoadingButton label="Try again" onPress={() => void n.reload()} />
      ) : (
        <View style={{ gap: theme.spacing.md }}>
          <View style={[styles.header, { gap: theme.spacing.md }]}>
            <View style={styles.text}>
              <AppText variant="h3" accessibilityRole="header">
                {n.unread > 0 ? `${n.unread} unread` : 'Inbox'}
              </AppText>
              <AppText variant="small" color="textSecondary">
                In-app reminders, from your own learning record.
              </AppText>
            </View>
            {n.unread > 0 ? (
              <Pressable
                onPress={n.markAllRead}
                accessibilityRole="button"
                accessibilityLabel={`Mark all ${n.unread} notifications as read`}
                style={({ pressed }) => [
                  styles.link,
                  styles.inline,
                  {
                    minHeight: theme.touchTarget.min,
                    gap: 4,
                    borderRadius: theme.radius.pill,
                    backgroundColor: pressed ? theme.colors.surfacePressed : 'transparent',
                  },
                ]}
              >
                <CheckCheck size={16} color={theme.colors.primary} strokeWidth={2.4} />
                <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
                  Mark all read
                </AppText>
              </Pressable>
            ) : null}
          </View>

          {n.items.length === 0 ? (
            <EmptyNote
              art="field"
              title="You’re all caught up"
              text="New reminders, review suggestions and achievements appear here as you learn."
            />
          ) : (
            groupNotificationsByDay(n.items).map((group) => (
              <View key={group.id} style={{ gap: theme.spacing.sm }}>
                <AppText variant="eyebrow" color="textSecondary" accessibilityRole="header">
                  {GROUP_TITLE[group.id].toUpperCase()}
                </AppText>
                {group.items.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    unread={!n.read.has(item.id)}
                    when={group.id === 'earlier' ? formatWhen(item.at, true) : timeOf(item.at)}
                    onOpen={() => open(item)}
                    onMarkRead={() => n.markRead(item.id)}
                    onDismiss={() => n.dismiss(item.id)}
                  />
                ))}
              </View>
            ))
          )}
        </View>
      )}

      <Section
        title="Notification settings"
        subtitle="In-app reminders only: they appear here and as a dot on the bell. The app does not send phone push notifications yet."
      >
        <View style={[cardStyle(theme), { padding: theme.spacing.lg, gap: theme.spacing.md }]}>
          {SETTINGS.map((s) => (
            <View key={s.key} style={[styles.setting, { gap: theme.spacing.md }]}>
              <View style={styles.text}>
                <AppText variant="title">{s.title}</AppText>
                <AppText variant="small" color="textSecondary">
                  {s.text}
                </AppText>
              </View>
              <Switch
                value={n.settings[s.key]}
                onValueChange={(v) => n.setSetting(s.key, v)}
                accessibilityLabel={`${s.title} (in-app)`}
                trackColor={{ true: theme.colors.primary, false: theme.colors.borderStrong }}
                thumbColor={theme.colors.surface}
              />
            </View>
          ))}
          <AppText variant="small" color="textSecondary">
            Read, dismissed and these settings are kept on this device.
          </AppText>
        </View>
      </Section>
    </View>
  );
}

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

/** One notification: unread shown by a dot and the word "New" (not colour alone). */
function NotificationRow({
  item,
  unread,
  when,
  onOpen,
  onMarkRead,
  onDismiss,
}: {
  item: LearnerNotification;
  unread: boolean;
  when: string;
  onOpen: () => void;
  onMarkRead: () => void;
  onDismiss: () => void;
}) {
  const theme = useAppTheme();
  const { icon, tone } = LOOK[item.kind];
  return (
    <View
      style={[
        cardStyle(theme),
        {
          padding: theme.spacing.md,
          gap: theme.spacing.xs,
          backgroundColor: unread ? theme.colors.primarySoft : theme.colors.surface,
        },
      ]}
    >
      <Pressable
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`${unread ? 'Unread. ' : ''}${KIND_LABEL[item.kind]}. ${item.title}. ${item.body} ${when}. Open.`}
        style={({ pressed }) => [styles.main, { gap: theme.spacing.md, opacity: pressed ? 0.8 : 1 }]}
      >
        <IconTile icon={icon} tone={tone} size={40} />
        <View style={styles.text}>
          <View style={[styles.inline, { gap: theme.spacing.xs }]}>
            {unread ? (
              <>
                <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
                <AppText variant="small" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
                  New ·
                </AppText>
              </>
            ) : null}
            <AppText variant="small" color="textSecondary" numberOfLines={1} style={styles.shrink}>
              {`${KIND_LABEL[item.kind]} · ${when}`}
            </AppText>
          </View>
          <AppText variant="title">{item.title}</AppText>
          <AppText variant="small" color="textSecondary">
            {item.body}
          </AppText>
        </View>
      </Pressable>
      <View style={[styles.actions, { gap: theme.spacing.xs }]}>
        {unread ? (
          <Pressable
            onPress={onMarkRead}
            accessibilityRole="button"
            accessibilityLabel={`Mark as read: ${item.title}`}
            style={[styles.link, { minHeight: theme.touchTarget.min }]}
          >
            <AppText variant="caption" color="primary" style={{ fontFamily: theme.fontFamilies.semibold }}>
              Mark as read
            </AppText>
          </Pressable>
        ) : null}
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={`Dismiss: ${item.title}`}
          style={[styles.link, styles.inline, { minHeight: theme.touchTarget.min, gap: 4 }]}
        >
          <X size={16} color={theme.colors.textSecondary} />
          <AppText variant="caption" color="textSecondary">
            Dismiss
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center' },
  main: { flexDirection: 'row', alignItems: 'flex-start' },
  text: { flex: 1, minWidth: 0, gap: 2 },
  inline: { flexDirection: 'row', alignItems: 'center' },
  shrink: { flexShrink: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap' },
  link: { justifyContent: 'center', paddingHorizontal: 10 },
  setting: { flexDirection: 'row', alignItems: 'center' },
});
