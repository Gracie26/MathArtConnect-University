/**
 * Sign-up and sign-in hierarchy: the email form and its primary button come
 * first, then an "or" divider, then Continue with Google / Apple. (In
 * development and tests both provider buttons are always shown.)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { screen } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { seedSignedOutLearner } from '@/test-utils/auth';

jest.setTimeout(90_000);

beforeEach(async () => {
  await AsyncStorage.clear();
  await seedSignedOutLearner();
});

interface HostNode {
  props: { accessibilityLabel?: unknown };
  children: (HostNode | string)[];
}

/** Accessible names of the labelled elements (fields and buttons), in screen order. */
const order = () => {
  const names: string[] = [];
  const walk = (node: HostNode) => {
    if (typeof node.props.accessibilityLabel === 'string') names.push(node.props.accessibilityLabel);
    for (const child of node.children) if (typeof child !== 'string') walk(child);
  };
  walk(screen.root as unknown as HostNode);
  return names;
};

// The last match belongs to the focused screen (screens below it in the stack stay mounted).
const before = (names: string[], first: string, second: string) => {
  const a = names.findLastIndex((n) => n.startsWith(first));
  const b = names.findLastIndex((n) => n.startsWith(second));
  expect(a).toBeGreaterThanOrEqual(0);
  expect(b).toBeGreaterThanOrEqual(0);
  expect(a).toBeLessThan(b);
};

describe('sign-up and sign-in put the email form first', () => {
  test('Create your account: fields, Create account, "or", then Google and Apple', async () => {
    await renderRouter('./app', { initialUrl: '/sign-up' });
    expect(await screen.findByText('Create your account', {}, { timeout: 20_000 })).toBeOnTheScreen();
    const names = order();
    before(names, 'Full name', 'Email');
    before(names, 'Email', 'Password');
    before(names, 'Password', 'Confirm password');
    before(names, 'Confirm password', 'Create account');
    before(names, 'Create account', 'Continue with Google');
    before(names, 'Continue with Google', 'Continue with Apple');
    before(names, 'Continue with Apple', 'Sign in');
    // The divider is decorative, so it is hidden from screen readers.
    expect(screen.getAllByText('or', { includeHiddenElements: true }).length).toBeGreaterThan(0);
    expect(screen.queryByText('or continue with', { includeHiddenElements: true })).toBeNull();
  });

  test('Sign in: email and password, Sign In, "or", then Google and Apple', async () => {
    await renderRouter('./app', { initialUrl: '/sign-in' });
    expect(await screen.findByText('Welcome back', {}, { timeout: 20_000 })).toBeOnTheScreen();
    const names = order();
    before(names, 'Email', 'Password');
    before(names, 'Password', 'Sign In');
    before(names, 'Sign In', 'Continue with Google');
    before(names, 'Continue with Google', 'Continue with Apple');
    // The divider is decorative, so it is hidden from screen readers.
    expect(screen.getAllByText('or', { includeHiddenElements: true }).length).toBeGreaterThan(0);
  });
});
