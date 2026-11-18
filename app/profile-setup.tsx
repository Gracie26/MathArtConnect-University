import { useState } from 'react';

import { AuthCard } from '@/components/auth/AuthCard';
import { AuthScreenLayout } from '@/components/auth/AuthScreenLayout';
import { AppText } from '@/components/ui/AppText';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SecondaryTextButton } from '@/components/ui/SecondaryTextButton';
import { useAuth } from '@/features/auth/AuthProvider';
import { ProfileForm } from '@/features/profile/ProfileForm';

/**
 * First-run "Tell us about you". Shown once after the first sign-in (until
 * profiles.profile_completed_at is set); saving routes to Home automatically.
 */
export default function ProfileSetupScreen() {
  const auth = useAuth();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const profile = auth.profile;

  return (
    <AuthScreenLayout
      title="Tell us about you"
      subtitle="A few details to personalise MathArt Connect. You can change them any time."
      onBack={null}
      footer={
        <SecondaryTextButton
          label={auth.user?.email ? `Not you? Sign out of ${auth.user.email}` : 'Sign out'}
          color="textSecondary"
          onPress={() => setConfirmSignOut(true)}
        />
      }
    >
      <AuthCard>
        <ProfileForm
          submitLabel="Save and continue"
          markComplete
          initial={{
            displayName: profile?.displayName ?? auth.user?.fullName ?? '',
            programme: profile?.programme ?? null,
            yearOfStudy: profile?.yearOfStudy ?? null,
          }}
        />
        <AppText variant="small" color="textSecondary">
          We only ask for details that help personalise your learning. We never ask for ID or student numbers.
        </AppText>
      </AuthCard>
      <ConfirmDialog
        visible={confirmSignOut}
        title="Sign out?"
        message="Are you sure you want to sign out?"
        confirmLabel="Sign Out"
        destructive
        loading={auth.signingOut}
        onCancel={() => setConfirmSignOut(false)}
        onConfirm={() => void auth.signOut()}
      />
    </AuthScreenLayout>
  );
}
