/**
 * Practice builder for Topic 5: Tutorial 6 (66 items) and the App practice
 * retrieval questions in Review.
 *
 * Tutorial 6 has no answer key (MR5-23), so every walkthrough is written for
 * the app and labelled: hints as APP GUIDANCE, the full walkthrough and
 * answer as APP-GENERATED SOLUTION, status pendingLecturerReview. Learners'
 * answers are checked from the question itself (lib/math/multiple), never
 * from a typed key. Every authored line of working that carries a `check`
 * and every suggested final answer is recorded in SUGGESTED and must be
 * accepted by that checker in the tests, and every exact value must agree
 * with the numerical value of every form of the integral, so a wrong
 * suggestion fails the build.
 */
import type { PracticeItem, PracticeModeId, WorkedStep } from '../../types';
import { exprTex, limitsTex, type MultipleSpec } from '@/lib/math/multiple';

import { MI_TOPIC_ID, type MiUnitId } from './ids';
import { MI_MANUAL_REVIEW } from './manualReview';

export const MI_TECHNIQUES = {
  'mi-partial-integration': 'Integrating with respect to one variable',
  'mi-iterated': 'Evaluating iterated integrals',
  'mi-rectangle-order': 'Reversing the order over a rectangle',
  'mi-sketch-switch': 'Sketching the region and switching the order',
  'mi-switch-evaluate': 'Switching the order to evaluate',
  'mi-double-region': 'Double integrals over a region',
  'mi-triple': 'Triple integrals',
  'mi-jacobian': 'Finding Jacobians',
  'mi-polar': 'Polar coordinates',
  'mi-change-variables': 'Change of variables (Theorem 5.4.1)',
} as const;

export type MiTechnique = keyof typeof MI_TECHNIQUES;

const CONCEPTUAL_HINTS: Record<MiTechnique, string> = {
  'mi-partial-integration':
    'As in §5.1, integrate with respect to the variable in the differential and hold the other variable constant. The limits may contain the other variable; the answer is a function of it.',
  'mi-iterated':
    'An iterated integral is evaluated from the inside out (§5.1): the inner integral first, holding the outer variable constant, then the outer integral, which gives a number.',
  'mi-rectangle-order':
    'Over a rectangle every limit is a constant, so the order can be reversed without changing the limits. By §5.1, the order affects the ease of integration, but not the value.',
  'mi-sketch-switch':
    'Read the region from the limits: the outer limits are constants and the inner limits are curves (§5.1.1). Then place a strip in the other direction and read the new limits from it.',
  'mi-switch-evaluate':
    'When the inner integral has no elementary anti-derivative, sketch the region and reverse the order, as in Examples 5.1.4 and 5.1.5.',
  'mi-double-region':
    'Sketch the region and find where the boundaries meet. Choose the order that describes the region with one pair of inner limits, then integrate from the inside out (§5.2.1).',
  'mi-triple':
    'Evaluation by Iterated Integrals (§5.3): integrate the innermost variable first, holding the other two constant, then the next, as in Example 5.3.1.',
  'mi-jacobian':
    'By the Definition of the Jacobian (§5.4.1), ∂(x, y)/∂(u, v) is the determinant of the partial derivatives: (∂x/∂u)(∂y/∂v) − (∂y/∂u)(∂x/∂v).',
  'mi-polar':
    'With x = r cos θ and y = r sin θ the Jacobian is r (Example 5.4.1), so dA becomes r dr dθ. Describe the region by limits for r and θ (APP GUIDANCE: the notes have no example of this).',
  'mi-change-variables':
    'Theorem 5.4.1: choose u and v so that the boundaries become u = constant and v = constant. Then the integral becomes ∬_S f(x(u, v), y(u, v)) |∂(x, y)/∂(u, v)| du dv.',
};

const NEXT_ACTIONS: Record<MiTechnique, string> = {
  'mi-partial-integration':
    'Find an anti-derivative with respect to the variable of integration, then substitute the limits.',
  'mi-iterated': 'Evaluate the inner integral and write the function of the outer variable that it gives.',
  'mi-rectangle-order': 'Swap the order of integration and integrate with respect to the other variable first.',
  'mi-sketch-switch': 'Write the region as inequalities, then the limits in the new order.',
  'mi-switch-evaluate': 'Write the limits in the reversed order, then evaluate the new inner integral.',
  'mi-double-region': 'Find the points where the boundaries meet, then write the limits.',
  'mi-triple': 'Integrate with respect to the innermost variable first.',
  'mi-jacobian': 'Find ∂x/∂u, ∂x/∂v, ∂y/∂u and ∂y/∂v.',
  'mi-polar': 'Write the region as limits for r and θ, then replace dA by r dr dθ.',
  'mi-change-variables': 'Write u and v from the boundary equations, then find the Jacobian.',
};

const MODE_FOR_DIFFICULTY: Record<1 | 2 | 3, PracticeModeId> = { 1: 'guided', 2: 'independent', 3: 'challenge' };

/** One line of an authored solution. `check` (learner syntax) must be accepted by the checker. */
export interface WorkLine {
  say: string;
  check?: string;
  /** Display TeX; when absent it is made from `check`. */
  tex?: string;
}

export interface MiPracticeSpec {
  instruction: string;
  /** The question's formula, as printed (TeX). */
  problem: string;
  /** Extra words printed with the question, with $…$ maths. */
  condition?: string;
  technique: MiTechnique;
  difficulty: 1 | 2 | 3;
  /** One sentence of method (the second hint). */
  method: string;
  multiple: MultipleSpec;
  working: WorkLine[];
  /** The suggested final answer in learner syntax (must be accepted by the checker). */
  answer: string;
  answerTex?: string;
  /** 'partial': the mathematics is graded but part of the task (a sketch, a deduction) is a self-check. */
  grading?: 'auto' | 'partial';
  reviewIds?: string[];
}

const RELATION = /<|>|≤|≥/;

/** TeX of a learner line: limits, an assignment list, or an expression (or chain of equal ones). */
export function lineTex(text: string): string {
  if (RELATION.test(text)) return limitsTex(text);
  if (/,/.test(text)) {
    return text
      .split(',')
      .map((part) => {
        const [name, value] = part.split('=');
        return value === undefined ? exprTex(part.trim()) : `${name!.trim()} = ${exprTex(value.trim())}`;
      })
      .join(', \\quad ');
  }
  return text
    .split('=')
    .map((side) => {
      const t = side.trim();
      try {
        return exprTex(t);
      } catch {
        return t;
      }
    })
    .join(' = ');
}

export function buildMiItem(
  base: Pick<
    PracticeItem,
    'id' | 'sourceType' | 'source' | 'sourceQuestion' | 'sourceSubquestion' | 'sourceSection'
  > & { unitId: MiUnitId },
  spec: MiPracticeSpec,
): PracticeItem {
  const reviewIds = [...new Set(['MR5-23', ...(spec.reviewIds ?? [])])].filter(
    (id) => base.sourceType === 'tutorial-question' || id !== 'MR5-23',
  );
  const known = new Set(MI_MANUAL_REVIEW.map((m) => m.id));
  for (const id of reviewIds) if (!known.has(id)) throw new Error(`Unknown review item ${id}`);
  const steps: WorkedStep[] = spec.working.map((w) => {
    const tex = w.tex ?? (w.check ? lineTex(w.check) : undefined);
    return tex ? { explanation: w.say, tex } : { explanation: w.say };
  });
  return {
    ...base,
    topicId: MI_TOPIC_ID,
    instruction: spec.instruction,
    problemTex: spec.problem,
    ...(spec.condition ? { condition: spec.condition } : {}),
    technique: spec.technique,
    techniqueLabel: MI_TECHNIQUES[spec.technique],
    difficulty: spec.difficulty,
    recommendedPracticeMode: MODE_FOR_DIFFICULTY[spec.difficulty],
    supportsHints: true,
    supportsStepValidation: true,
    needsManualReview: reviewIds.length > 0,
    reviewIds,
    withheldFromLearners: false,
    isExtension: false,
    check: { variable: 'x', points: [], constants: {} },
    multiple: spec.multiple,
    grading: spec.grading ?? 'auto',
    hints: [CONCEPTUAL_HINTS[spec.technique], spec.method, NEXT_ACTIONS[spec.technique]],
    solution: {
      status: 'pendingLecturerReview',
      method: spec.method,
      steps,
      answerTex: spec.answerTex ?? lineTex(spec.answer),
      verification: 'notVerified',
      appGenerated: true,
    },
  };
}

/** The authored working of every item (for the tests). */
export const SUGGESTED: Map<string, MiPracticeSpec> = new Map();

/** Builds an item and records its spec for the tests. */
export function miItem(base: Parameters<typeof buildMiItem>[0], spec: MiPracticeSpec): PracticeItem {
  SUGGESTED.set(base.id, spec);
  return buildMiItem(base, spec);
}

/** Polar coordinates (Example 5.4.1). */
export const POLAR = (f: string) => ({ vars: ['r', 'θ'] as [string, string], x: 'r cos(θ)', y: 'r sin(θ)', f });
