import { useState } from 'react';

import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

import { useAuth } from './AuthProvider';

/**
 * "Are you sure you want to sign out?" confirmation. After sign-out the route
 * guards return the learner to the sign-in screen.
 */
export function useSignOutDialog() {
  const auth = useAuth();
  const [visible, setVisible] = useState(false);

  const dialog = (
    <ConfirmDialog
      visible={visible}
      title="Sign out?"
      message="Are you sure you want to sign out?"
      confirmLabel="Sign Out"
      cancelLabel="Cancel"
      destructive
      loading={auth.signingOut}
      onCancel={() => setVisible(false)}
      onConfirm={() => {
        void auth.signOut().finally(() => setVisible(false));
      }}
    />
  );

  return { open: () => setVisible(true), dialog };
}
