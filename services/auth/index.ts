import { env } from '@/config/env';

import { devAuthService } from './devAuthService';
import { supabaseAuthService } from './supabaseAuthService';
import type { AuthService } from './types';

/**
 * The single auth backend for this build. Real Supabase Auth by default.
 *
 * The device-only test backend is used ONLY when a development build
 * explicitly opts in with EXPO_PUBLIC_AUTH_BACKEND=device-dev (and in the
 * automated tests). Without Supabase values the app shows a setup notice
 * instead of silently faking accounts.
 */
export const authService: AuthService = __DEV__ && env.devAuthBackendRequested ? devAuthService : supabaseAuthService;

export const isDevAuthBackend = authService.kind === 'device-dev';

export { AUTH_MESSAGES, describeAuthError } from './errors';
export type * from './types';
