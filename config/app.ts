import * as Application from 'expo-application';
import Constants from 'expo-constants';

/**
 * Runtime app metadata. Store identifiers are defined in app.config.ts;
 * this reads them back so the UI (About, Settings › Version) never
 * duplicates them.
 */
export const appInfo = {
  name: Constants.expoConfig?.name ?? 'MathArt Connect',
  tagline: 'See mathematics differently.',
  version: Constants.expoConfig?.version ?? '0.0.0',
  nativeBuild: Application.nativeBuildVersion,
  scheme: (Constants.expoConfig?.scheme as string | undefined) ?? 'mathartconnect',
} as const;

/**
 * MathArt Connect is built for University of Namibia students, so the
 * institution is a fixed application value: shown on the profile, filled in
 * automatically for new profiles, and never asked of the learner.
 */
export const APP_INSTITUTION = 'University of Namibia';

/**
 * Approved wording for describing the app's purpose. The research has not
 * evaluated learning outcomes, so the app must not claim it improves
 * performance.
 */
export const researchCopy = {
  purposeStatement: 'Designed to support Calculus learning.',
} as const;
