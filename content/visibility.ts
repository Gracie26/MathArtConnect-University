import { env } from '@/config/env';

import type { SolutionStatus } from './types';

/**
 * Whether learners may see a solution or hint ladder.
 *
 * Only solutions printed in the UNAM material or approved by the lecturer are
 * shown. App-authored solutions stay hidden while pending review, even when
 * verified automatically. A development build can opt into reviewer mode
 * (EXPO_PUBLIC_REVIEWER_MODE=true) to check them; release builds never can.
 */
export function isSolutionVisibleToLearners(status: SolutionStatus, options: { reviewerMode?: boolean } = {}): boolean {
  if (status === 'unamSource' || status === 'lecturerApproved') return true;
  return options.reviewerMode ?? isReviewerMode();
}

/** Reviewer mode: development builds only, opted into with EXPO_PUBLIC_REVIEWER_MODE=true. */
export function isReviewerMode(): boolean {
  return __DEV__ && env.reviewerModeRequested;
}

/**
 * Whether a practice item may be listed. Items withheld by an open
 * manual-review item appear only in reviewer mode.
 */
export function isPracticeItemVisible(
  item: { withheldFromLearners: boolean },
  options: { reviewerMode?: boolean } = {},
): boolean {
  return !item.withheldFromLearners || (options.reviewerMode ?? isReviewerMode());
}
