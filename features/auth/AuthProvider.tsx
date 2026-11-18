import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { readOnboardingComplete, writeOnboardingComplete } from '@/features/onboarding/onboardingStorage';
import {
  type AuthBackendKind,
  type AuthRedirectParams,
  authService,
  type AuthUser,
  type OAuthOutcome,
  type OAuthProvider,
  type SignUpOutcome,
} from '@/services/auth';
import { type AvatarFile, type LearnerProfile, type ProfileInput, profileService } from '@/services/profile';
import { fail, type ServiceResult } from '@/services/types';

import { clearCachedProfile, readCachedProfile, writeCachedProfile } from './profileCache';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';
export type ProfileStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface AuthState {
  /** 'loading' until the stored session (and its profile) has been restored. */
  status: AuthStatus;
  user: AuthUser | null;
  profile: LearnerProfile | null;
  profileStatus: ProfileStatus;
  profileComplete: boolean;
  /** Signed in through a password-reset link: only the reset screen is reachable. */
  recoveryMode: boolean;
  onboardingComplete: boolean;
  signingIn: boolean;
  signingOut: boolean;
  /** Last action error (friendly text), for screens that show a global message. */
  error: string | null;
  backend: AuthBackendKind;
  /** False in a release build without a backend: account actions are unavailable. */
  accountsAvailable: boolean;
}

export interface AuthActions {
  signIn(email: string, password: string): Promise<ServiceResult<AuthUser>>;
  signUp(fullName: string, email: string, password: string): Promise<ServiceResult<SignUpOutcome>>;
  signInWithProvider(provider: OAuthProvider): Promise<ServiceResult<OAuthOutcome>>;
  resendVerification(email: string): Promise<ServiceResult<void>>;
  requestPasswordReset(email: string): Promise<ServiceResult<void>>;
  updatePassword(newPassword: string): Promise<ServiceResult<void>>;
  completeAuthRedirect(params: AuthRedirectParams, flow?: 'recovery'): Promise<ServiceResult<AuthUser | null>>;
  /** Ends password recovery: signs out so the learner signs in with the new password. */
  finishPasswordRecovery(): Promise<void>;
  signOut(): Promise<ServiceResult<void>>;
  saveProfile(input: ProfileInput, options?: { markComplete?: boolean }): Promise<ServiceResult<LearnerProfile>>;
  setAvatar(file: AvatarFile): Promise<ServiceResult<LearnerProfile>>;
  removeAvatar(): Promise<ServiceResult<LearnerProfile>>;
  retryProfile(): Promise<void>;
  completeOnboarding(): Promise<void>;
  clearError(): void;
}

type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

const INITIAL: AuthState = {
  status: 'loading',
  user: null,
  profile: null,
  profileStatus: 'idle',
  profileComplete: false,
  recoveryMode: false,
  onboardingComplete: false,
  signingIn: false,
  signingOut: false,
  error: null,
  backend: authService.kind,
  accountsAvailable: authService.isAvailable(),
};

const NOT_SIGNED_IN = 'Please sign in to continue.';

/**
 * Central auth + profile state. Screens read state and call actions from
 * useAuth(); routing reacts to state through Stack.Protected guards in
 * app/_layout.tsx, so no screen repeats session logic.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(INITIAL);
  const userIdRef = useRef<string | null>(null);
  const patch = useCallback((next: Partial<AuthState>) => setState((s) => ({ ...s, ...next })), []);

  /** Loads (or falls back to the cached) profile for a user. */
  const loadProfile = useCallback(async (user: AuthUser) => {
    setState((s) => ({ ...s, profileStatus: 'loading' }));
    const result = await profileService.getProfile(user.id);
    if (userIdRef.current !== user.id) return; // signed out / switched meanwhile
    if (result.ok && result.data) {
      void writeCachedProfile(result.data);
      setState((s) => ({
        ...s,
        profile: result.data,
        profileStatus: 'ready',
        profileComplete: result.data?.profileComplete ?? false,
      }));
      return;
    }
    const cached = await readCachedProfile(user.id);
    setState((s) => ({
      ...s,
      profile: cached,
      profileStatus: cached ? 'ready' : 'error',
      profileComplete: cached?.profileComplete ?? false,
    }));
  }, []);

  /** Moves to the signed-in state; status flips only once the profile is known (no screen flash). */
  const adoptUser = useCallback(
    async (user: AuthUser) => {
      const isNewUser = userIdRef.current !== user.id;
      userIdRef.current = user.id;
      if (!isNewUser) {
        patch({ user });
        return;
      }
      await loadProfile(user);
      if (userIdRef.current === user.id) patch({ user, status: 'signedIn' });
    },
    [loadProfile, patch],
  );

  const resetToSignedOut = useCallback(() => {
    userIdRef.current = null;
    setState((s) => ({
      ...s,
      status: 'signedOut',
      user: null,
      profile: null,
      profileStatus: 'idle',
      profileComplete: false,
      recoveryMode: false,
      signingIn: false,
      signingOut: false,
    }));
  }, []);

  // Restore session + onboarding flag once, then follow backend auth events.
  useEffect(() => {
    let active = true;
    (async () => {
      const [onboardingComplete, current] = await Promise.all([readOnboardingComplete(), authService.getCurrentUser()]);
      if (!active) return;
      patch({ onboardingComplete });
      if (current.ok && current.data) await adoptUser(current.data);
      else resetToSignedOut();
    })();

    const unsubscribe = authService.onAuthStateChange((user, event) => {
      if (!active) return;
      if (event === 'signed_out' || !user) {
        resetToSignedOut();
        return;
      }
      if (event === 'password_recovery') patch({ recoveryMode: true });
      void adoptUser(user);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [adoptUser, patch, resetToSignedOut]);

  const actions = useMemo<AuthActions>(() => {
    const withError = <T,>(result: ServiceResult<T>): ServiceResult<T> => {
      patch({ error: result.ok ? null : result.error.message });
      return result;
    };

    return {
      async signIn(email, password) {
        patch({ signingIn: true, error: null });
        const result = await authService.signInWithEmail({ email, password });
        if (result.ok) await adoptUser(result.data);
        patch({ signingIn: false });
        return withError(result);
      },

      async signUp(fullName, email, password) {
        patch({ signingIn: true, error: null });
        const result = await authService.signUpWithEmail({ fullName, email, password });
        if (result.ok && result.data.status === 'signed_in') {
          const current = await authService.getCurrentUser();
          if (current.ok && current.data) await adoptUser(current.data);
        }
        patch({ signingIn: false });
        return withError(result);
      },

      async signInWithProvider(provider) {
        patch({ signingIn: true, error: null });
        const result = await authService.signInWithProvider(provider);
        if (result.ok && result.data.status === 'signed_in') {
          const current = await authService.getCurrentUser();
          if (current.ok && current.data) await adoptUser(current.data);
        }
        patch({ signingIn: false });
        // A cancelled provider sheet is not an error worth showing.
        return result.ok || result.error.code !== 'cancelled' ? withError(result) : result;
      },

      resendVerification: async (email) => withError(await authService.resendVerificationEmail(email)),
      requestPasswordReset: async (email) => withError(await authService.requestPasswordReset(email)),
      updatePassword: async (password) => withError(await authService.updatePassword(password)),

      async completeAuthRedirect(params, flow) {
        if (flow === 'recovery') patch({ recoveryMode: true });
        const result = await authService.completeAuthRedirect(params);
        if (result.ok && result.data) await adoptUser(result.data);
        if (!result.ok && flow === 'recovery') patch({ recoveryMode: false });
        return withError(result);
      },

      async finishPasswordRecovery() {
        await authService.signOut();
        resetToSignedOut();
      },

      async signOut() {
        patch({ signingOut: true, error: null });
        const userId = userIdRef.current;
        const result = await authService.signOut();
        if (userId) await clearCachedProfile(userId);
        resetToSignedOut();
        return withError(result);
      },

      async saveProfile(input, options) {
        const userId = userIdRef.current;
        if (!userId) return fail('unauthenticated', NOT_SIGNED_IN);
        const result = await profileService.saveProfile(userId, input, options);
        if (result.ok) {
          void writeCachedProfile(result.data);
          patch({ profile: result.data, profileStatus: 'ready', profileComplete: result.data.profileComplete });
        }
        return result;
      },

      async setAvatar(file) {
        const userId = userIdRef.current;
        if (!userId) return fail('unauthenticated', NOT_SIGNED_IN);
        const result = await profileService.setAvatar(userId, file);
        if (result.ok) patch({ profile: result.data });
        return result;
      },

      async removeAvatar() {
        const userId = userIdRef.current;
        if (!userId) return fail('unauthenticated', NOT_SIGNED_IN);
        const result = await profileService.removeAvatar(userId);
        if (result.ok) patch({ profile: result.data });
        return result;
      },

      async retryProfile() {
        const current = await authService.getCurrentUser();
        if (current.ok && current.data) await loadProfile(current.data);
      },

      async completeOnboarding() {
        await writeOnboardingComplete(true);
        patch({ onboardingComplete: true });
      },

      clearError: () => patch({ error: null }),
    };
  }, [adoptUser, loadProfile, patch, resetToSignedOut]);

  const value = useMemo<AuthContextValue>(() => ({ ...state, ...actions }), [state, actions]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

/** Display name for greetings; null when the learner has not set one. */
export function useLearnerName(): string | null {
  const { profile } = useAuth();
  return profile?.displayName?.trim() || null;
}
