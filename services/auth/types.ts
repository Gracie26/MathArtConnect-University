import type { ServiceResult } from '../types';

export type AuthProvider = 'email' | 'google' | 'apple';
export type OAuthProvider = Exclude<AuthProvider, 'email'>;

export interface AuthUser {
  id: string;
  email: string | null;
  emailVerified: boolean;
  /** Sign-in methods linked to this account. */
  providers: AuthProvider[];
  /** Name supplied at sign-up or by the provider; used to prefill profile setup. */
  fullName: string | null;
}

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export type SignUpOutcome = { status: 'signed_in' } | { status: 'verification_required'; email: string };

/** Web OAuth leaves the page and returns via /auth/callback; native completes in place. */
export type OAuthOutcome = { status: 'signed_in' } | { status: 'redirecting' };

export type AuthEvent = 'initial' | 'signed_in' | 'signed_out' | 'password_recovery' | 'user_updated';
export type AuthStateListener = (user: AuthUser | null, event: AuthEvent) => void;

/** Query parameters an auth deep link (email link or OAuth redirect) returns with. */
export interface AuthRedirectParams {
  code?: string;
  error?: string;
  errorCode?: string;
  errorDescription?: string;
}

/**
 * 'supabase'      real accounts (production and connected development).
 * 'device-dev'    development-only local backend, used when Supabase is not
 *                 configured in a __DEV__ build. Never shipped as real auth.
 */
export type AuthBackendKind = 'supabase' | 'device-dev';

/**
 * Authentication contract used by the UI (through AuthProvider). Screens
 * never call an implementation directly.
 */
export interface AuthService {
  readonly kind: AuthBackendKind;
  /** False when no backend can create real accounts (release build without Supabase). */
  isAvailable(): boolean;
  getCurrentUser(): Promise<ServiceResult<AuthUser | null>>;
  onAuthStateChange(listener: AuthStateListener): () => void;

  signUpWithEmail(input: SignUpInput): Promise<ServiceResult<SignUpOutcome>>;
  signInWithEmail(input: SignInInput): Promise<ServiceResult<AuthUser>>;
  resendVerificationEmail(email: string): Promise<ServiceResult<void>>;
  requestPasswordReset(email: string): Promise<ServiceResult<void>>;
  updatePassword(newPassword: string): Promise<ServiceResult<void>>;

  signInWithProvider(provider: OAuthProvider): Promise<ServiceResult<OAuthOutcome>>;
  /** Finishes an email-verification, password-reset or OAuth deep link. */
  completeAuthRedirect(params: AuthRedirectParams): Promise<ServiceResult<AuthUser | null>>;

  signOut(): Promise<ServiceResult<void>>;
}
