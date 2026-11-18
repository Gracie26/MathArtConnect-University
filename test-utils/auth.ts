import { writeOnboardingComplete } from '@/features/onboarding/onboardingStorage';
import { devAuthTools } from '@/services/auth/devAuthService';
import { devProfileService } from '@/services/profile/devProfileService';

export const TEST_LEARNER = {
  displayName: 'Ada',
  email: 'ada@example.com',
  password: 'correct-horse-1',
} as const;

/** Seeds the development backend with a signed-in learner (as if returning to the app). */
export async function seedSignedInLearner(options: { profileComplete?: boolean } = {}) {
  await writeOnboardingComplete(true);
  const user = await devAuthTools.seedAccount({
    email: TEST_LEARNER.email,
    password: TEST_LEARNER.password,
    fullName: TEST_LEARNER.displayName,
    signedIn: true,
  });
  if (options.profileComplete ?? true) {
    await devProfileService.saveProfile(
      user.id,
      { displayName: TEST_LEARNER.displayName, programme: 'BSc', yearOfStudy: 1 },
      { markComplete: true },
    );
  }
  return user;
}

/** A returning, signed-out learner whose account already exists. */
export async function seedSignedOutLearner() {
  await writeOnboardingComplete(true);
  await devAuthTools.seedAccount({
    email: TEST_LEARNER.email,
    password: TEST_LEARNER.password,
    fullName: TEST_LEARNER.displayName,
  });
}
