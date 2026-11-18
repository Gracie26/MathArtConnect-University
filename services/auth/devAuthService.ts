/**
 * ⚠ DEVELOPMENT-ONLY AUTH BACKEND ⚠
 *
 * Used only when the app runs as a development build (__DEV__) and Supabase
 * is not configured (see services/auth/index.ts). It lets the whole account
 * flow be exercised on one device: accounts live in this device's local
 * storage, are labelled as development accounts in the UI, never leave the
 * device and are not real MathArt Connect accounts.
 *
 * Email links cannot be sent without a backend, so the verification and
 * password-reset screens offer "simulate link" actions in this mode only.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { fail, ok } from '../types';

import { AUTH_MESSAGES } from './errors';
import type { AuthEvent, AuthService, AuthStateListener, AuthUser, OAuthProvider } from './types';

const KEYS = {
  accounts: 'mathart.dev-auth.accounts.v1',
  session: 'mathart.dev-auth.session.v1',
} as const;

interface DevAccount {
  id: string;
  email: string;
  fullName: string | null;
  /** Not a secure hash: obfuscation so plain passwords never sit in storage. Dev only. */
  passwordHash: string;
  verified: boolean;
}

type Accounts = Record<string, DevAccount>;

const listeners = new Set<AuthStateListener>();

function hash(email: string, password: string): string {
  // FNV-1a (32-bit) over "email:password". Development use only.
  let h = 0x811c9dc5;
  for (const char of `${email}:${password}`) {
    h ^= char.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16);
}

function newId(): string {
  const hex = () =>
    Math.floor(Math.random() * 0x10000)
      .toString(16)
      .padStart(4, '0');
  return `dev-${hex()}${hex()}-${hex()}-${hex()}-${hex()}${hex()}${hex()}`;
}

async function readAccounts(): Promise<Accounts> {
  const raw = await AsyncStorage.getItem(KEYS.accounts);
  return raw ? (JSON.parse(raw) as Accounts) : {};
}

async function writeAccounts(accounts: Accounts): Promise<void> {
  await AsyncStorage.setItem(KEYS.accounts, JSON.stringify(accounts));
}

async function readSessionAccount(): Promise<DevAccount | null> {
  const email = await AsyncStorage.getItem(KEYS.session);
  if (!email) return null;
  return (await readAccounts())[email] ?? null;
}

function toAuthUser(account: DevAccount): AuthUser {
  return {
    id: account.id,
    email: account.email,
    emailVerified: account.verified,
    providers: ['email'],
    fullName: account.fullName,
  };
}

function emit(user: AuthUser | null, event: AuthEvent) {
  for (const listener of listeners) listener(user, event);
}

async function startSession(account: DevAccount, event: AuthEvent): Promise<AuthUser> {
  await AsyncStorage.setItem(KEYS.session, account.email);
  const user = toAuthUser(account);
  emit(user, event);
  return user;
}

export const devAuthService: AuthService = {
  kind: 'device-dev',

  isAvailable: () => true,

  async getCurrentUser() {
    const account = await readSessionAccount();
    return ok(account ? toAuthUser(account) : null);
  },

  onAuthStateChange(listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  async signUpWithEmail({ fullName, email, password }) {
    const accounts = await readAccounts();
    if (accounts[email]) return fail('validation', AUTH_MESSAGES.accountExists);
    accounts[email] = {
      id: newId(),
      email,
      fullName: fullName.trim() || null,
      passwordHash: hash(email, password),
      verified: false,
    };
    await writeAccounts(accounts);
    return ok({ status: 'verification_required' as const, email });
  },

  async signInWithEmail({ email, password }) {
    const account = (await readAccounts())[email];
    if (!account || account.passwordHash !== hash(email, password)) {
      return fail('unauthenticated', AUTH_MESSAGES.invalidCredentials);
    }
    if (!account.verified) return fail('unauthenticated', AUTH_MESSAGES.emailNotVerified);
    return ok(await startSession(account, 'signed_in'));
  },

  async resendVerificationEmail() {
    return ok(undefined);
  },

  async requestPasswordReset() {
    // Same response whether or not the account exists, like the real backend.
    return ok(undefined);
  },

  async updatePassword(newPassword) {
    const account = await readSessionAccount();
    if (!account) return fail('unauthenticated', AUTH_MESSAGES.reauthenticate);
    if (account.passwordHash === hash(account.email, newPassword)) {
      return fail('validation', AUTH_MESSAGES.samePassword);
    }
    const accounts = await readAccounts();
    accounts[account.email] = { ...account, passwordHash: hash(account.email, newPassword) };
    await writeAccounts(accounts);
    emit(toAuthUser(account), 'user_updated');
    return ok(undefined);
  },

  async signInWithProvider(provider: OAuthProvider) {
    const name = provider === 'google' ? 'Google' : 'Apple';
    return fail(
      'not_configured',
      `${name} sign-in is not set up yet. Development note: connect Supabase and enable the provider (docs/EXTERNAL_SETUP.md).`,
    );
  },

  async completeAuthRedirect() {
    const account = await readSessionAccount();
    return ok(account ? toAuthUser(account) : null);
  },

  async signOut() {
    await AsyncStorage.removeItem(KEYS.session);
    emit(null, 'signed_out');
    return ok(undefined);
  },
};

/**
 * Development helpers standing in for the links a real backend would email.
 * Only reachable from UI rendered when the device-dev backend is active.
 */
export const devAuthTools = {
  /** Equivalent of tapping the verification link: verifies and signs in. */
  async simulateEmailVerification(email: string) {
    const accounts = await readAccounts();
    const account = accounts[email];
    if (!account) return fail('not_found', 'No development account uses this email.');
    accounts[email] = { ...account, verified: true };
    await writeAccounts(accounts);
    return ok(await startSession(accounts[email], 'signed_in'));
  },

  /** Equivalent of tapping the password-reset link: opens recovery mode. */
  async simulatePasswordResetLink(email: string) {
    const account = (await readAccounts())[email];
    if (!account) return fail('not_found', 'No development account uses this email.');
    return ok(await startSession({ ...account, verified: true }, 'password_recovery'));
  },

  /** Test/dev seeding: create an account, optionally signed in. */
  async seedAccount(input: { email: string; password: string; fullName?: string; signedIn?: boolean }) {
    const accounts = await readAccounts();
    const account: DevAccount = {
      id: accounts[input.email]?.id ?? newId(),
      email: input.email,
      fullName: input.fullName ?? null,
      passwordHash: hash(input.email, input.password),
      verified: true,
    };
    accounts[input.email] = account;
    await writeAccounts(accounts);
    if (input.signedIn) await AsyncStorage.setItem(KEYS.session, input.email);
    return toAuthUser(account);
  },
};
