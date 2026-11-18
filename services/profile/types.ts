import type { ServiceResult } from '../types';

/**
 * Learner profile as the UI sees it. Deliberately minimal: no student
 * number, ID number, date of birth, phone number or address is collected.
 * Email is not stored here; it comes from the auth account.
 */
export interface LearnerProfile {
  id: string;
  displayName: string | null;
  /**
   * As stored (kept for existing profiles). The app shows APP_INSTITUTION instead:
   * MathArt Connect is for University of Namibia students only.
   */
  institution: string | null;
  programme: string | null;
  yearOfStudy: number | null;
  /** Displayable image URL (short-lived signed URL for the private bucket). */
  avatarUrl: string | null;
  /** True once "Tell us about you" has been completed. */
  profileComplete: boolean;
}

/** What the learner edits. The institution is not asked for: it is fixed (APP_INSTITUTION). */
export interface ProfileInput {
  displayName: string;
  programme: string | null;
  yearOfStudy: number | null;
}

export interface AvatarFile {
  /** Local URI from the image picker (used directly by the dev backend). */
  uri: string;
  base64: string | null;
  mimeType: string | null;
}

export interface ProfileService {
  getProfile(userId: string): Promise<ServiceResult<LearnerProfile | null>>;
  /** Saves editable fields; `markComplete` also records profile setup completion. */
  saveProfile(
    userId: string,
    input: ProfileInput,
    options?: { markComplete?: boolean },
  ): Promise<ServiceResult<LearnerProfile>>;
  setAvatar(userId: string, file: AvatarFile): Promise<ServiceResult<LearnerProfile>>;
  removeAvatar(userId: string): Promise<ServiceResult<LearnerProfile>>;
}
