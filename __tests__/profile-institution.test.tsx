import AsyncStorage from '@react-native-async-storage/async-storage';
import { screen, userEvent } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';

import { APP_INSTITUTION } from '@/config/app';
import { devProfileService } from '@/services/profile/devProfileService';
import { seedSignedInLearner } from '@/test-utils/auth';

// Full-router renders compile the whole app on a cold cache.
jest.setTimeout(240_000);

const profileKey = (id: string) => `mathart.dev-profile.v1.${id}`;

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('the institution is a fixed value, never asked for', () => {
  test('a new profile gets University of Namibia automatically', async () => {
    const result = await devProfileService.saveProfile(
      'new-learner',
      { displayName: 'Tumi', programme: null, yearOfStudy: 1 },
      { markComplete: true },
    );
    expect(result.ok && result.data.institution).toBe(APP_INSTITUTION);
  });

  test('an institution already stored for an existing learner is kept, not overwritten', async () => {
    await AsyncStorage.setItem(
      profileKey('existing'),
      JSON.stringify({
        id: 'existing',
        displayName: 'Ada',
        institution: 'UNAM Main Campus',
        programme: 'BSc',
        yearOfStudy: 2,
        avatarUrl: null,
        profileComplete: true,
      }),
    );
    const result = await devProfileService.saveProfile('existing', {
      displayName: 'Ada L.',
      programme: 'BSc',
      yearOfStudy: 3,
    });
    expect(result.ok && result.data).toMatchObject({ institution: 'UNAM Main Campus', yearOfStudy: 3 });
  });

  test('Edit Profile has no institution input, shows the fixed value and still saves', async () => {
    const user = userEvent.setup();
    await seedSignedInLearner();
    await renderRouter('./app', { initialUrl: '/edit-profile' });

    expect(await screen.findByLabelText('Full name')).toBeOnTheScreen();
    expect(screen.queryByLabelText('Institution')).toBeNull();
    expect(screen.getByLabelText(`Institution, ${APP_INSTITUTION}`)).toBeOnTheScreen();

    await user.press(screen.getByRole('radio', { name: '3rd' }));
    await user.press(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByLabelText('Year of study, 3rd year')).toBeOnTheScreen();
  });

  test('Profile shows University of Namibia even for an older profile that stored something else', async () => {
    const learner = await seedSignedInLearner();
    const stored = JSON.parse((await AsyncStorage.getItem(profileKey(learner.id))) ?? '{}');
    await AsyncStorage.setItem(profileKey(learner.id), JSON.stringify({ ...stored, institution: 'Somewhere Else' }));

    await renderRouter('./app', { initialUrl: '/profile' });
    expect(await screen.findByLabelText(`Institution, ${APP_INSTITUTION}`)).toBeOnTheScreen();
    expect(screen.queryByText('Somewhere Else')).toBeNull();
    // The stored value itself is untouched.
    expect(JSON.parse((await AsyncStorage.getItem(profileKey(learner.id))) ?? '{}').institution).toBe('Somewhere Else');
  });
});
