/**
 * Practice items for Topic 1: shared builder, techniques and filters.
 *
 * Chapter "You Try It" items and exercises (chapterPractice.ts) and all
 * Tutorial 1 parts (tutorial1.ts) are stored as PracticeItems. Their
 * solutions are app-authored, so every one is `pendingLecturerReview` and
 * hidden from learners until approved (MR-14). Each solution is checked by
 * differentiation in __tests__/integration-solutions.test.ts; that check
 * never changes the review status.
 */
import type { PracticeItem, PracticeModeId, SourceRef, WorkedStep } from '../../types';

import { INTEGRATION_TOPIC_ID, type IntegrationUnitId } from './ids';
import { blocksLearnerUse, MANUAL_REVIEW_REGISTER } from './manualReview';

export const TECHNIQUES = {
  'reverse-differentiation': 'Reversing differentiation',
  'standard-forms': 'Standard forms and the power rule',
  'u-substitution': 'Substitution',
  'partial-fractions-linear': 'Partial fractions: distinct linear factors',
  'partial-fractions-repeated': 'Partial fractions: repeated linear factors',
  'partial-fractions-quadratic': 'Partial fractions: quadratic factors',
  'improper-rational': 'Improper rational functions',
  'completing-square': 'Completing the square',
  'algebraic-substitution': 'Removing a root by substitution',
  'fractional-powers': 'Fractional powers',
  'trig-substitution': 'Trigonometric and hyperbolic substitution',
  'secant-integral': 'Integrating sec x',
  'tan-half-angle': 'Rational functions of sine and cosine',
  'integration-by-parts': 'Integration by parts',
  'repeated-parts': 'Integration by parts, more than once',
  'odd-trig-powers': 'Odd powers of sine or cosine',
  'even-trig-powers': 'Even powers of sine and cosine',
  'product-to-sum': 'Products of sines and cosines',
  'tan-sec-powers': 'Powers of tangent and secant',
  'trig-quotient': 'Quotients of sine and cosine expressions',
  'reduction-formula': 'Reduction formulas',
} as const;

export type Technique = keyof typeof TECHNIQUES;

const MODE_FOR_DIFFICULTY: Record<1 | 2 | 3, PracticeModeId> = { 1: 'guided', 2: 'independent', 3: 'challenge' };

export interface PracticeSpec {
  instruction?: string;
  problem: string;
  condition?: string;
  technique: Technique;
  difficulty: 1 | 2 | 3;
  method: string;
  /** Solution steps as [explanation, tex?]. */
  steps: [string, string?][];
  answer: string;
  /** Some items (proofs, general constants) cannot be checked step by step. */
  stepValidation?: boolean;
  /** Review items that apply in addition to those found in the register. */
  reviewIds?: string[];
}

/** Review items in the register whose location names this source item. */
export function reviewIdsFor(document: SourceRef['document'], item: string): string[] {
  return MANUAL_REVIEW_REGISTER.filter((entry) => {
    const locations = Array.isArray(entry.location) ? entry.location : [entry.location];
    return locations.some((loc) => loc.document === document && loc.item === item);
  }).map((entry) => entry.id);
}

const toSteps = (steps: [string, string?][]): WorkedStep[] =>
  steps.map(([explanation, tex]) => (tex ? { explanation, tex } : { explanation }));

/** Hint 1 for each technique: a conceptual clue that does not give the method away. */
const CONCEPTUAL_HINTS: Record<Technique, string> = {
  'reverse-differentiation':
    'Ask which function, when differentiated, gives the integrand. Then remember that adding any constant does not change the derivative.',
  'standard-forms': 'Write every term as a power of $x$ or as one of the standard forms, then integrate term by term.',
  'u-substitution':
    'Look for a function inside another function, where the derivative of the inside also appears (perhaps up to a constant).',
  'partial-fractions-linear':
    'The denominator factorises into different linear factors, so the fraction splits into simpler fractions.',
  'partial-fractions-repeated': 'A linear factor is repeated, so the decomposition needs a term for every power of it.',
  'partial-fractions-quadratic':
    'One factor of the denominator is a quadratic with no real factors; it needs a linear numerator $Ax + B$.',
  'improper-rational':
    'Compare the degrees: when the numerator’s degree is not lower than the denominator’s, divide first.',
  'completing-square':
    'A quadratic with no real factors can be written as a square plus a constant, which leads to an inverse tangent.',
  'algebraic-substitution': 'A root makes this hard. A substitution can remove the root and leave a rational function.',
  'fractional-powers':
    'Several fractional powers of $x$ appear. One substitution $x = u^{n}$ can make them all whole powers.',
  'trig-substitution':
    'The root has the form of one row of the table of substitutions; a trigonometric substitution removes it.',
  'secant-integral':
    'There is a standard trick: multiply by $\\frac{\\sec\\theta + \\tan\\theta}{\\sec\\theta + \\tan\\theta}$ so the numerator becomes the derivative of the denominator.',
  'tan-half-angle':
    'This is a rational function of sine and cosine, so $t = \\tan\\frac{x}{2}$ turns it into a rational function of $t$.',
  'integration-by-parts': 'The integrand is a product. Choose one part to differentiate and one part to integrate.',
  'repeated-parts':
    'One application of integration by parts will not finish it; expect to apply it again (or to see the integral reappear).',
  'odd-trig-powers':
    'One of the powers of sine or cosine is odd: keep one factor aside and use $\\sin^{2}x + \\cos^{2}x = 1$ on the rest.',
  'even-trig-powers': 'All the powers are even, so use the double-angle identities to lower them.',
  'product-to-sum': 'A product of sines or cosines of different multiples of $x$ can be written as a sum.',
  'tan-sec-powers':
    'Use $\\sec^{2}x = 1 + \\tan^{2}x$, keeping aside $\\sec^{2}x$ (for $u = \\tan x$) or $\\sec x\\tan x$ (for $u = \\sec x$).',
  'trig-quotient':
    'Write the numerator as a multiple of the denominator, plus a multiple of the denominator’s derivative, plus a constant.',
  'reduction-formula':
    'Integrate by parts once so that a lower power of the same kind of integral appears, then rearrange (§1.12).',
};

/** A concrete next action used for Hint 3 when the first walkthrough line is too brief to act on. */
const NEXT_ACTIONS: Record<Technique, string> = {
  'reverse-differentiation':
    'Write down a function whose derivative is the integrand, check it by differentiating, then add $C$.',
  'standard-forms': 'Rewrite each term as a power of $x$, then add 1 to each exponent and divide by the new exponent.',
  'u-substitution': 'Write down $u$ and $du$, then rewrite the whole integral in terms of $u$.',
  'partial-fractions-linear':
    'Factorise the denominator and write one fraction with an unknown constant over each factor.',
  'partial-fractions-repeated':
    'Write the decomposition with a fraction for each power of the repeated factor, then find the constants.',
  'partial-fractions-quadratic':
    'Write the decomposition with $\\frac{Ax+B}{\\text{quadratic}}$ for each quadratic factor, then find the constants.',
  'improper-rational': 'Do the long division, so you have a polynomial plus a proper fraction.',
  'completing-square': 'Complete the square in the denominator.',
  'algebraic-substitution':
    'Let the new variable equal the root (or the expression under it), and express $x$ and $dx$ in terms of it.',
  'fractional-powers':
    'Let $x = u^{n}$ where $n$ is the LCM of the denominators of the indices, and rewrite the integral.',
  'trig-substitution': 'Choose the substitution from the table that matches the root, and find $dx$.',
  'secant-integral': 'Multiply the numerator and denominator by $\\sec\\theta + \\tan\\theta$.',
  'tan-half-angle': 'Replace $\\sin$, $\\cos$ and $dx$ using $t = \\tan\\frac{x}{2}$, and simplify.',
  'integration-by-parts': 'Choose $u$ and $dv$, then find $du$ and $v$.',
  'repeated-parts': 'Apply integration by parts once and look at the new integral.',
  'odd-trig-powers': 'Split off one factor of the odd power and rewrite the rest with $\\sin^{2}x + \\cos^{2}x = 1$.',
  'even-trig-powers': 'Replace each $\\sin^{2}$ or $\\cos^{2}$ with its double-angle form.',
  'product-to-sum': 'Use the product formula to write the product as a sum or difference.',
  'tan-sec-powers': 'Keep aside the factor that will become $du$ and rewrite the rest.',
  'trig-quotient': 'Compare the coefficients of $\\cos x$, $\\sin x$ and the constant to find $p$, $q$ and $r$.',
  'reduction-formula': 'Choose $u$ as the factor whose power you want to lower, and $dv$ as what remains.',
};

const DEFAULT_CHECK_POINTS = [0.35, 0.8, 1.4, 2.2];

/**
 * Domain information for checking answers: sample points inside each
 * integrand's domain, the variable, and values for general constants (chosen
 * to satisfy any stated assumption, e.g. a > b > 0).
 */
const CHECK_DOMAINS: Record<string, Partial<PracticeItem['check']>> = {
  'tut1-q1-iv': { constants: { a: 2, b: 3 } },
  'tut1-q1-vii': { points: [0.8, 1.4, 2.2, 3] },
  'tut1-q1-x': { variable: 'θ' },
  'tut1-q2-vi': { points: [1.4, 1.8, 2.2, 2.6] },
  'tut1-q2-viii': { points: [0.2, 0.4, 0.6, 0.8] },
  'tut1-q2-x': { points: [0.2, 0.5, 0.9, 1.2] },
  'tut1-q3-viii': { points: [0.35, 0.8, 1.4, 2.2, -0.5] },
  'tut1-q6': { constants: { μ: 1.5, α: 0.7, β: 2 } },
  'tut1-q7-iii': { points: [-0.6, 0.2, 0.5, 0.8] },
  'tut1-q7-x': { points: [0.2, 0.5, 0.8, 1.0] },
  'tut1-q7-xi': { points: [0.8, 1.4, 2.2, 3] },
  'tut1-q7-xviii': { constants: { a: 2, b: 3 } },
  'tut1-q8-xii': { points: [0.2, 0.5, 0.9, 1.2] },
  'tut1-q8-xiv': { points: [0.2, 0.5, 0.9, 1.2] },
  'tut1-q8-xv': { points: [0.2, 0.5, 0.9, 1.2] },
  'tut1-q9-i': { variable: 'θ', points: [0.2, 0.5, 0.9, 1.2] },
  'tut1-q9-ii': { variable: 'θ', points: [0.2, 0.4, 0.6, 1.2] },
  'tut1-q9-iii': { variable: 'θ' },
  'tut1-q9-iv': { variable: 'θ' },
  'tut1-q9-v': { variable: 'θ', constants: { a: 3, b: 2 } },
  'tut1-q10': { points: [0.2, 0.6, 1.1, -0.4], integrandTex: '\\int \\sec x\\,dx' },
  'tut1-q11-iii': { points: [-0.6, 0.2, 0.5, 0.8] },
  'tut1-q11-iv': { constants: { a: 2, p: 3 } },
  'tut1-q11-viii': { points: [0.2, 0.5, 0.9, 1.2] },
  'tut1-q12-iii': { points: [0.3, 0.8, 1.4, 1.9] },
  'ch1-1.5-yti-root': { points: [0.2, 0.5, 0.9, 1.3] },
  'ch1-1.5-yti-sec': { points: [0.1, 0.2, 0.3, 0.45] },
  'ch1-1.8-exercise-1': { points: [0.6, 1, 1.8, 2.6] },
  'ch1-1.14-yti': { points: [0.3, 0.8, 1.4, 1.9] },
  // Tutorial 2, Question 1 (Chapter 1 methods): general constants and the integral each formula is about.
  'tut2-q1-a': { constants: { m: 2 }, integrandTex: '\\int x^{m}\\ln x\\,dx' },
  'tut2-q1-b': { constants: { n: 4 }, integrandTex: '\\int \\sin^{n}x\\,dx', answerMayContainIntegral: true },
  'tut2-q1-c': { constants: { n: 3, a: 2 }, integrandTex: '\\int x^{n}e^{ax}\\,dx', answerMayContainIntegral: true },
  'tut2-q1-d': { integrandTex: '\\int \\sin^{6}x\\cos^{5}x\\,dx' },
  'tut2-q1-e': {
    constants: { n: 4 },
    points: [0.2, 0.5, 0.9, 1.2],
    integrandTex: '\\int \\sec^{n}x\\,dx',
    answerMayContainIntegral: true,
  },
  'tut2-q1-f': { constants: { n: 3 }, integrandTex: '\\int (\\ln x)^{n}\\,dx', answerMayContainIntegral: true },
  'tut2-q1-g': { integrandTex: '\\int x^{3}e^{x}\\,dx' },
};

function hintsFor(spec: PracticeSpec): [string, string, string] {
  const first = spec.steps[0]?.[0] ?? '';
  const action = first.length >= 25 ? first : NEXT_ACTIONS[spec.technique];
  return [CONCEPTUAL_HINTS[spec.technique], spec.method, action];
}

export function buildPracticeItem(
  base: Pick<
    PracticeItem,
    'id' | 'sourceType' | 'source' | 'sourceQuestion' | 'sourceSubquestion' | 'sourceSection'
  > & {
    unitId: IntegrationUnitId;
  },
  spec: PracticeSpec,
): PracticeItem {
  const reviewIds = [
    ...new Set([...(spec.reviewIds ?? []), ...reviewIdsFor(base.source.document, base.source.item ?? '')]),
  ];
  const needsAssumptions = reviewIds.some(
    (id) => MANUAL_REVIEW_REGISTER.find((m) => m.id === id)?.category === 'needsAssumptions',
  );
  return {
    ...base,
    topicId: INTEGRATION_TOPIC_ID,
    instruction: spec.instruction ?? 'Evaluate',
    problemTex: spec.problem,
    ...(spec.condition ? { condition: spec.condition } : {}),
    technique: spec.technique,
    techniqueLabel: TECHNIQUES[spec.technique],
    difficulty: spec.difficulty,
    recommendedPracticeMode: MODE_FOR_DIFFICULTY[spec.difficulty],
    supportsHints: true,
    supportsStepValidation: (spec.stepValidation ?? true) && !needsAssumptions,
    needsManualReview: reviewIds.length > 0,
    reviewIds,
    withheldFromLearners: blocksLearnerUse(reviewIds),
    isExtension: reviewIds.some((id) => MANUAL_REVIEW_REGISTER.find((m) => m.id === id)?.category === 'beyondNotes'),
    check: { variable: 'x', points: DEFAULT_CHECK_POINTS, constants: {}, ...CHECK_DOMAINS[base.id] },
    hints: hintsFor(spec),
    solution: {
      status: 'pendingLecturerReview',
      method: spec.method,
      steps: toSteps(spec.steps),
      answerTex: spec.answer,
      verification: 'numericDerivative',
    },
  };
}

/** Filter practice items by subtopic, technique or source type. */
export function filterPracticeItems(
  items: readonly PracticeItem[],
  filter: { unitId?: string; technique?: string; sourceType?: PracticeItem['sourceType'] },
): PracticeItem[] {
  return items.filter(
    (item) =>
      (filter.unitId === undefined || item.unitId === filter.unitId) &&
      (filter.technique === undefined || item.technique === filter.technique) &&
      (filter.sourceType === undefined || item.sourceType === filter.sourceType),
  );
}

/** Groups items by technique, in order of first appearance. */
export function groupByTechnique(items: readonly PracticeItem[]): { label: string; items: PracticeItem[] }[] {
  const groups = new Map<string, { label: string; items: PracticeItem[] }>();
  for (const item of items) {
    const group = groups.get(item.technique) ?? { label: item.techniqueLabel, items: [] };
    group.items.push(item);
    groups.set(item.technique, group);
  }
  return [...groups.values()];
}
