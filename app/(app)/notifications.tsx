import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { NotificationCentre } from '@/features/notifications/NotificationCentre';

/** The in-app inbox. The navigation header carries the "Notifications" title. */
export default function NotificationsScreen() {
  return (
    <Screen>
      <AppText variant="bodyLarge" color="textSecondary">
        Reminders and updates about your learning.
      </AppText>
      <NotificationCentre />
    </Screen>
  );
}
