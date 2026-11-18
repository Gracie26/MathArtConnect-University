/**
 * Research participation is separate from having an app account.
 *
 * A normal learner account works fully without research participation.
 * Research data may only be used for learners whose consent is recorded
 * against an approved consent version. No consent wording, version or ethics
 * reference is defined yet; they are added only after confirmation.
 */
export interface ResearchParticipation {
  researchParticipant: boolean;
  researchConsentGiven: boolean;
  /** Version id of the approved consent text the learner agreed to. */
  researchConsentVersion: string | null;
  researchConsentDate: string | null;
  researchWithdrawnAt: string | null;
}

export const NOT_PARTICIPATING: ResearchParticipation = {
  researchParticipant: false,
  researchConsentGiven: false,
  researchConsentVersion: null,
  researchConsentDate: null,
  researchWithdrawnAt: null,
};

/** True only for an active participant with recorded, unwithdrawn consent. */
export function isActiveResearchParticipant(p: ResearchParticipation): boolean {
  return (
    p.researchParticipant &&
    p.researchConsentGiven &&
    p.researchConsentVersion !== null &&
    p.researchConsentDate !== null &&
    p.researchWithdrawnAt === null
  );
}
