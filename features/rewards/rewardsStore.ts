/**
 * The learner's reward choices kept on this device (AsyncStorage), per
 * learner: which badges have already been celebrated, whether weekly goals are
 * shown, and the chosen Home backdrop. Badges and goals themselves are rebuilt
 * from the synced record, so only these small choices are local (as for
 * notification read state).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AmbientVariant } from '@/components/art/AmbientMathArt';

export interface RewardsState {
  /** Badge ids already celebrated (or present when rewards were first opened), so none is celebrated twice. */
  celebrated: string[];
  /** False until the first load, when every badge already earned is marked celebrated without a moment. */
  initialised: boolean;
  weeklyGoals: boolean;
  backdrop: AmbientVariant;
}

export const EMPTY_REWARDS: RewardsState = {
  celebrated: [],
  initialised: false,
  weeklyGoals: true,
  backdrop: 'curves',
};

const key = (userId: string) => `mathart.rewards.v1.${userId}`;
const VARIANTS: AmbientVariant[] = ['curves', 'lissajous', 'contours', 'field'];

export async function loadRewardsState(userId: string): Promise<RewardsState> {
  try {
    const raw = await AsyncStorage.getItem(key(userId));
    if (!raw) return EMPTY_REWARDS;
    const parsed = JSON.parse(raw) as Partial<RewardsState>;
    return {
      celebrated: Array.isArray(parsed.celebrated)
        ? parsed.celebrated.filter((x): x is string => typeof x === 'string')
        : [],
      initialised: parsed.initialised === true,
      weeklyGoals: parsed.weeklyGoals !== false,
      backdrop: VARIANTS.includes(parsed.backdrop as AmbientVariant) ? (parsed.backdrop as AmbientVariant) : 'curves',
    };
  } catch {
    return EMPTY_REWARDS;
  }
}

export async function saveRewardsState(userId: string, state: RewardsState): Promise<void> {
  await AsyncStorage.setItem(key(userId), JSON.stringify(state));
}

/** Cosmetic Home backdrops. Unlocks are optional decoration; no learning content is ever locked. */
export const BACKDROPS: { id: AmbientVariant; title: string; description: string; badgesNeeded: number }[] = [
  {
    id: 'curves',
    title: 'Drifting curves',
    description: 'Two function graphs that slowly change shape.',
    badgesNeeded: 0,
  },
  {
    id: 'lissajous',
    title: 'Lissajous figure',
    description: 'The parametric curve x = sin 3t, y = sin 2t, turning slowly.',
    badgesNeeded: 3,
  },
  {
    id: 'contours',
    title: 'Contour lines',
    description: 'Level curves of a surface with two peaks, gently breathing.',
    badgesNeeded: 6,
  },
  {
    id: 'field',
    title: 'Vector field',
    description: 'Arrows of the gradient field of x² − y², slowly turning.',
    badgesNeeded: 10,
  },
];

export const backdropUnlocked = (id: AmbientVariant, earnedBadges: number): boolean =>
  earnedBadges >= (BACKDROPS.find((b) => b.id === id)?.badgesNeeded ?? Infinity);
