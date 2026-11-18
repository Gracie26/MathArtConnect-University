import AsyncStorage from '@react-native-async-storage/async-storage';
import { screen, userEvent } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { seedSignedInLearner, seedSignedOutLearner, TEST_LEARNER } from '@/test-utils/auth';

jest.setTimeout(90_000);

beforeEach(async () => {
  await AsyncStorage.clear();
});

const button = (name: string | RegExp) => screen.getByRole('button', { name });

describe('first launch and onboarding', () => {
  test('shows onboarding, persists completion, then opens Create Account', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/' });

    expect(await screen.findByText('See Mathematics Differently')).toBeOnTheScreen();
    expect(screen.getByLabelText('Page 1 of 4')).toBeOnTheScreen();
    await user.press(button('Next'));
    expect(screen.getByLabelText('Page 2 of 4')).toBeOnTheScreen();
    await user.press(button('Back'));
    expect(screen.getByLabelText('Page 1 of 4')).toBeOnTheScreen();
    await user.press(button('Next'));
    await user.press(button('Next'));
    await user.press(button('Next'));
    expect(screen.getByLabelText('Page 4 of 4')).toBeOnTheScreen();
    await user.press(button('Get Started'));

    expect(await screen.findByText('Create your account')).toBeOnTheScreen();
    // Stored on the device, so the next launch skips onboarding (see the tests below,
    // which all start from this stored state and open on Sign In / Home).
    expect(await AsyncStorage.getItem('mathart.onboarding.completed.v1')).toBe('true');
  });

  test('a later launch skips onboarding and opens Sign In', async () => {
    await seedSignedOutLearner();
    await renderRouter('./app', { initialUrl: '/' });
    expect(await screen.findByText('Welcome back')).toBeOnTheScreen();
    expect(screen.queryByText('See Mathematics Differently')).toBeNull();
  });

  test('Skip goes straight to Sign In', async () => {
    const user = userEvent.setup();
    await renderRouter('./app', { initialUrl: '/' });
    await user.press(await screen.findByLabelText('Skip introduction'));
    expect(await screen.findByText('Welcome back')).toBeOnTheScreen();
  });
});

describe('sign-in', () => {
  test('validates, maps wrong credentials to a friendly message and toggles password visibility', async () => {
    const user = userEvent.setup();
    await seedSignedOutLearner();
    await renderRouter('./app', { initialUrl: '/' });

    await user.type(await screen.findByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'whatever1');
    await user.press(button('Sign In'));
    expect(await screen.findByText('Please enter a valid email address.')).toBeOnTheScreen();

    await user.clear(screen.getByLabelText('Email'));
    await user.type(screen.getByLabelText('Email'), TEST_LEARNER.email);
    await user.press(button('Sign In'));
    expect(await screen.findByText('Incorrect email or password.')).toBeOnTheScreen();

    await user.press(button('Show password'));
    expect(button('Hide password')).toBeOnTheScreen();
    expect(screen.getByLabelText('Password').props.secureTextEntry).toBe(false);
  });

  test('a returning learner signs in and lands on Home', async () => {
    const user = userEvent.setup();
    await seedSignedOutLearner();
    // Profile already completed on an earlier sign-in.
    await seedSignedInLearner();
    await AsyncStorage.removeItem('mathart.dev-auth.session.v1');
    await renderRouter('./app', { initialUrl: '/' });

    await user.type(await screen.findByLabelText('Email'), TEST_LEARNER.email);
    await user.type(screen.getByLabelText('Password'), TEST_LEARNER.password);
    await user.press(button('Sign In'));
    expect(await screen.findByText(/^Good (morning|afternoon|evening), Ada$/)).toBeOnTheScreen();
  });

  test('restores a saved session straight into Home (no sign-in flash)', async () => {
    await seedSignedInLearner();
    await renderRouter('./app', { initialUrl: '/' });
    expect(await screen.findByText(/^Good (morning|afternoon|evening), Ada$/)).toBeOnTheScreen();
    expect(screen.queryByText('Welcome back')).toBeNull();
  });
});

describe('create account → verify email → profile setup → Home', () => {
  test('full new-learner journey', async () => {
    const user = userEvent.setup();
    await seedSignedOutLearner(); // marks onboarding complete
    await renderRouter('./app', { initialUrl: '/sign-up' });

    // Validation first.
    await user.press(await screen.findByRole('button', { name: 'Create account' }));
    expect(screen.getByText('Enter the name you would like to be called.')).toBeOnTheScreen();
    expect(screen.getByText('Enter your email address.')).toBeOnTheScreen();
    expect(screen.getByText('Please agree to the Terms of Use and Privacy Policy to continue.')).toBeOnTheScreen();

    await user.type(screen.getByLabelText('Full name'), 'Tumi Example');
    await user.type(screen.getByLabelText('Email'), 'new.learner@example.com');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.type(screen.getByLabelText('Confirm password'), 'different');
    await user.press(button('Create account'));
    expect(screen.getByText('Use at least 8 characters.')).toBeOnTheScreen();
    expect(screen.getByText('Passwords do not match.')).toBeOnTheScreen();

    await user.clear(screen.getByLabelText('Password'));
    await user.type(screen.getByLabelText('Password'), 'a-good-pass');
    await user.clear(screen.getByLabelText('Confirm password'));
    await user.type(screen.getByLabelText('Confirm password'), 'a-good-pass');
    await user.press(screen.getByRole('checkbox', { name: 'I agree to the Terms of Use and Privacy Policy' }));
    await user.press(button('Create account'));

    expect(await screen.findByText('Check your email')).toBeOnTheScreen();
    expect(screen.getByText('new.learner@example.com')).toBeOnTheScreen();

    await user.press(button('Simulate verification link (development)'));
    expect(await screen.findByText('Tell us about you')).toBeOnTheScreen();
    // Prefilled from the sign-up name. The institution is fixed and shown, never asked for.
    expect(screen.getByLabelText('Full name').props.value).toBe('Tumi Example');
    expect(screen.getByLabelText('Institution, University of Namibia')).toBeOnTheScreen();
    expect(screen.queryByText('Edit if you study elsewhere.', { exact: false })).toBeNull();

    await user.clear(screen.getByLabelText('Full name'));
    await user.type(screen.getByLabelText('Full name'), 'Tumi');
    await user.press(screen.getByRole('radio', { name: '2nd' }));
    await user.press(button('Save and continue'));
    expect(await screen.findByText(/^Good (morning|afternoon|evening), Tumi$/)).toBeOnTheScreen();
  });

  test('an existing email is reported without creating a duplicate', async () => {
    const user = userEvent.setup();
    await seedSignedOutLearner();
    await renderRouter('./app', { initialUrl: '/sign-up' });

    await user.type(await screen.findByLabelText('Full name'), 'Ada');
    await user.type(screen.getByLabelText('Email'), TEST_LEARNER.email);
    await user.type(screen.getByLabelText('Password'), 'another-pass');
    await user.type(screen.getByLabelText('Confirm password'), 'another-pass');
    await user.press(screen.getByRole('checkbox', { name: 'I agree to the Terms of Use and Privacy Policy' }));
    await user.press(button('Create account'));
    expect(
      await screen.findByText('An account with this email already exists. Try signing in instead.'),
    ).toBeOnTheScreen();
  });

  test('unverified accounts are asked to verify before signing in', async () => {
    const user = userEvent.setup();
    await seedSignedOutLearner();
    await renderRouter('./app', { initialUrl: '/sign-up' });
    await user.type(await screen.findByLabelText('Full name'), 'Lee');
    await user.type(screen.getByLabelText('Email'), 'lee@example.com');
    await user.type(screen.getByLabelText('Password'), 'lee-password');
    await user.type(screen.getByLabelText('Confirm password'), 'lee-password');
    await user.press(screen.getByRole('checkbox', { name: 'I agree to the Terms of Use and Privacy Policy' }));
    await user.press(button('Create account'));
    await screen.findByText('Check your email');

    await user.press(button('Go back'));
    await user.type(await screen.findByLabelText('Email'), 'lee@example.com');
    await user.type(screen.getByLabelText('Password'), 'lee-password');
    await user.press(button('Sign In'));
    expect(await screen.findByText('Please verify your email before signing in.')).toBeOnTheScreen();
  });
});

describe('forgot and reset password', () => {
  test('reset link → new password → sign in with it', async () => {
    const user = userEvent.setup();
    await seedSignedInLearner();
    await AsyncStorage.removeItem('mathart.dev-auth.session.v1');
    await renderRouter('./app', { initialUrl: '/' });

    await user.press(await screen.findByRole('button', { name: 'Forgot password?' }));
    await user.type(await screen.findByLabelText('Email'), TEST_LEARNER.email);
    await user.press(button('Send Reset Link'));
    expect(await screen.findByText('Check your email')).toBeOnTheScreen();

    await user.press(button('Simulate reset link (development)'));
    expect(await screen.findByText('Set a new password')).toBeOnTheScreen();
    await user.type(screen.getByLabelText('New password'), 'brand-new-pass');
    await user.type(screen.getByLabelText('Confirm new password'), 'brand-new-pass');
    await user.press(button('Update Password'));
    expect(await screen.findByText('Password updated successfully.')).toBeOnTheScreen();

    await user.press(button('Return to Sign In'));
    await user.type(await screen.findByLabelText('Email'), TEST_LEARNER.email);
    await user.type(screen.getByLabelText('Password'), 'brand-new-pass');
    await user.press(button('Sign In'));
    expect(await screen.findByText(/^Good (morning|afternoon|evening), Ada$/)).toBeOnTheScreen();
  });
});

describe('profile and sign out', () => {
  test('edit profile saves and is shown on Profile', async () => {
    const user = userEvent.setup();
    await seedSignedInLearner();
    await renderRouter('./app', { initialUrl: '/profile' });

    await user.press(await screen.findByRole('button', { name: 'Edit Profile' }));
    const programme = await screen.findByLabelText('Programme / Course');
    await user.clear(programme);
    await user.type(programme, 'Bachelor of Education');
    await user.press(button('Save changes'));
    expect(await screen.findByLabelText('Programme / Course, Bachelor of Education')).toBeOnTheScreen();
  });

  test('sign out asks for confirmation, then returns to Sign In', async () => {
    const user = userEvent.setup();
    await seedSignedInLearner();
    await renderRouter('./app', { initialUrl: '/profile' });

    await user.press(await screen.findByRole('button', { name: 'Sign Out' }));
    expect(await screen.findByText('Are you sure you want to sign out?')).toBeOnTheScreen();
    await user.press(button('Cancel'));
    expect(screen.queryByText('Are you sure you want to sign out?')).toBeNull();

    await user.press(screen.getByRole('button', { name: 'Sign Out' }));
    const buttons = await screen.findAllByRole('button', { name: 'Sign Out' });
    await user.press(buttons[buttons.length - 1]!);
    expect(await screen.findByText('Welcome back')).toBeOnTheScreen();
  });

  test('an incomplete profile opens profile setup instead of Home', async () => {
    await seedSignedInLearner({ profileComplete: false });
    await renderRouter('./app', { initialUrl: '/' });
    expect(await screen.findByText('Tell us about you')).toBeOnTheScreen();
  });
});
