import AsyncStorage from '@react-native-async-storage/async-storage';

/** Intro onboarding is a per-device experience, so completion is stored locally. */
const KEY = 'mathart.onboarding.completed.v1';

export async function readOnboardingComplete(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function writeOnboardingComplete(complete: boolean): Promise<void> {
  try {
    if (complete) await AsyncStorage.setItem(KEY, 'true');
    else await AsyncStorage.removeItem(KEY);
  } catch {
    // Non-critical: worst case onboarding shows again next launch.
  }
}
