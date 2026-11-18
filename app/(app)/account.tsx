import { router } from 'expo-router';
import { KeyRound, LogOut, Mail } from 'lucide-react-native';

import { DevBackendNotice } from '@/components/auth/DevBackendNotice';
import { Screen } from '@/components/layout/Screen';
import { AppText } from '@/components/ui/AppText';
import { ListRow, ListSection } from '@/components/ui/ListRow';
import { useAuth } from '@/features/auth/AuthProvider';
import { useSignOutDialog } from '@/features/auth/useSignOutDialog';
import type { AuthProvider } from '@/services/auth';

const METHODS: { provider: AuthProvider; label: string }[] = [
  { provider: 'email', label: 'Email and password' },
  { provider: 'google', label: 'Google' },
  { provider: 'apple', label: 'Apple' },
];

/** Settings › Account & security. */
export default function AccountScreen() {
  const { user } = useAuth();
  const signOut = useSignOutDialog();
  const providers = user?.providers ?? [];

  return (
    <Screen>
      <ListSection title="Account">
        <ListRow
          first
          icon={Mail}
          label="Email"
          description={user?.email ?? 'No email on this account'}
          value={user?.emailVerified ? 'Verified' : 'Not verified'}
          accessibilityLabel={`Email ${user?.email ?? ''}, ${user?.emailVerified ? 'verified' : 'not verified'}`}
        />
        {providers.includes('email') ? (
          <ListRow icon={KeyRound} label="Change password" onPress={() => router.push('/change-password')} />
        ) : null}
      </ListSection>

      <ListSection title="Sign-in methods">
        {METHODS.map((method, index) => (
          <ListRow
            key={method.provider}
            first={index === 0}
            label={method.label}
            value={providers.includes(method.provider) ? 'Linked' : 'Not linked'}
          />
        ))}
      </ListSection>
      <AppText variant="small" color="textSecondary">
        Linking additional sign-in methods and changing your email address will be available in a later update.
      </AppText>

      <ListSection>
        <ListRow first icon={LogOut} label="Sign Out" destructive onPress={signOut.open} />
      </ListSection>
      <DevBackendNotice />
      {signOut.dialog}
    </Screen>
  );
}
