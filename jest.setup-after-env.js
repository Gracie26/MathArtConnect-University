// Runs after the test framework is installed (RNTL needs Jest's `expect`).

// findBy* queries default to 1 s; full-router renders can exceed that on a
// busy machine, which made the suite flaky. Match the per-test budget instead.
require('@testing-library/react-native').configure({ asyncUtilTimeout: 10_000 });

// Tests run with the OS "reduce motion" setting on. Looping animations (the
// skeleton pulse) otherwise keep act() busy indefinitely under the JS driver,
// and this exercises the reduced-motion path that every animation must honour.
const { AccessibilityInfo } = require('react-native');
jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);

// Automated tests run against the device-only development auth backend (the
// app itself defaults to real Supabase; see services/auth/index.ts).
jest.mock('@/config/env', () => {
  const actual = jest.requireActual('@/config/env');
  return { ...actual, env: actual.readEnv({ EXPO_PUBLIC_AUTH_BACKEND: 'device-dev' }) };
});
