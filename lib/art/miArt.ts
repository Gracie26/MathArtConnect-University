/**
 * Topic 5 Create studios (Multiple Integration): Strip Region Studio (§5.1.1)
 * and Jacobian Grid Studio (§5.4.1).
 */

/** A Topic 5 Create activity's studio and starter. */
export interface MiStudioConfig {
  studio: 'strips' | 'jacobian';
  starter: string;
  question: string;
}
