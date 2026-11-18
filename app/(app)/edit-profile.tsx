import { router } from 'expo-router';
import { View } from 'react-native';

import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { cardStyle } from '@/components/ui/cardStyle';
import { useAuth } from '@/features/auth/AuthProvider';
import { ProfileForm } from '@/features/profile/ProfileForm';
import { useAppTheme } from '@/hooks/useAppTheme';

/**
 * Edits descriptive profile fields only. Account identity (email, password,
 * linked sign-in methods) is managed under Settings › Account & security.
 */
export default function EditProfileScreen() {
  const theme = useAppTheme();
  const { profile, user } = useAuth();

  return (
    <Screen>
      <View style={[cardStyle(theme), { padding: theme.spacing.xl, gap: theme.spacing.lg }]}>
        <ProfileForm
          submitLabel="Save changes"
          initial={{
            displayName: profile?.displayName ?? user?.fullName ?? '',
            programme: profile?.programme ?? null,
            yearOfStudy: profile?.yearOfStudy ?? null,
          }}
          onSaved={() => (router.canGoBack() ? router.back() : router.replace('/profile'))}
        />
      </View>
      {user?.email ? (
        <AppText variant="small" color="textSecondary">
          {`Signed in as ${user.email}. Email and password are managed in Settings › Account & security.`}
        </AppText>
      ) : null}
    </Screen>
  );
}
