/**
 * Practice builder for Topic 3: Tutorial 3, Tutorial 4 and §3.3 App practice.
 *
 * Every item is checked from the question itself (lib/math/partial.ts): the
 * targets are the source function and the derivative asked for, never a
 * typed answer key. Each item also stores an app-authored suggested answer in
 * learner syntax; the tests check every suggested answer with the same
 * checker, so a wrong suggestion fails the build. Walkthroughs are generated
 * from those answers (or written out for written questions) and are always
 * app guidance, stored as pendingLecturerReview (MR3-T8).
 */
import type { PracticeItem, PracticeModeId, WorkedStep } from '../../types';
import type { PartialSpec, PartialTarget, Point } from '@/lib/math/partial';
import { toTex } from '@/lib/math/input/toTex';
import { parseStatement } from '@/lib/math/input/parse';

import { RN_TOPIC_ID, type RnUnitId } from './ids';
import { RN_MANUAL_REVIEW } from './manualReview';

export const RN_TECHNIQUES = {
  'rn-evaluate': 'Evaluating functions of two variables',
  'rn-domain': 'Domains of functions of several variables',
  'rn-limit-definition': 'Partial derivatives from the definition',
  'rn-partial': 'Partial derivatives',
  'rn-higher-order': 'Higher-order and mixed partial derivatives',
  'rn-total-differential': 'The total differential',
  'rn-chain-one': 'Chain rule: one independent variable',
  'rn-chain-two': 'Chain rule: two or more independent variables',
  'rn-chain-general': 'Chain-rule formulas and identities',
  'rn-change-variables': 'Changing variables with differentials',
  'rn-second-order': 'Second-order chain rule',
} as const;

export type RnTechnique = keyof typeof RN_TECHNIQUES;

const CONCEPTUAL_HINTS: Record<RnTechnique, string> = {
  'rn-evaluate': 'Replace each variable in the formula by the value (or expression) given, and simplify.',
  'rn-domain':
    'The domain is the set of all points for which the formula is defined and real (§3.1): no division by zero, logarithms of positive numbers only, square roots of non-negative numbers only.',
  'rn-limit-definition':
    'By the definition (§3.2.1), $f_{x}(x, y) = \\lim_{\\Delta x \\to 0} \\frac{f(x + \\Delta x, y) - f(x, y)}{\\Delta x}$, and similarly for $f_{y}$ with $\\Delta y$.',
  'rn-partial':
    'To find $f_{x}$, consider every other variable constant and differentiate with respect to $x$ (§3.2.1, §3.2.2).',
  'rn-higher-order':
    'Differentiate in the order the notation states. In the notes, $f_{xy} = \\frac{\\partial}{\\partial y}\\left(\\frac{\\partial f}{\\partial x}\\right)$: first with respect to $x$, then $y$ (§3.2.3).',
  'rn-total-differential':
    'The total differential is $dz = \\frac{\\partial z}{\\partial x}dx + \\frac{\\partial z}{\\partial y}dy$, with one term for every variable (§3.3).',
  'rn-chain-one':
    'Theorem 3.4.1: $\\frac{dw}{dt} = \\frac{\\partial w}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial w}{\\partial y}\\frac{dy}{dt}$, one term for each path from $w$ to $t$ in the tree diagram (Figure 3.1).',
  'rn-chain-two':
    'Theorem 3.4.2: $\\frac{\\partial w}{\\partial s} = \\frac{\\partial w}{\\partial x}\\frac{\\partial x}{\\partial s} + \\frac{\\partial w}{\\partial y}\\frac{\\partial y}{\\partial s}$; follow every path from $w$ down to $s$ (Figure 3.2).',
  'rn-chain-general':
    'Draw the tree of dependencies (as in Figures 3.1 and 3.2). Each path from $w$ to the variable gives one product of derivatives; add the products.',
  'rn-change-variables':
    'Write the differentials of both equations, then solve them for the differentials you need, as in Examples 3.4.5 and 3.4.6.',
  'rn-second-order':
    'Find the first derivatives with the Chain Rule, then differentiate them again, applying the Chain Rule to $w_{x}$ and $w_{y}$ themselves (Example 3.4.7).',
};

const NEXT_ACTIONS: Record<RnTechnique, string> = {
  'rn-evaluate': 'Substitute the values into $f(x, y)$.',
  'rn-domain': 'Write the condition that makes each part of the formula defined.',
  'rn-limit-definition': 'Write $f(x + \\Delta x, y) - f(x, y)$ and simplify before dividing by $\\Delta x$.',
  'rn-partial': 'Differentiate with respect to the first variable asked for, treating the others as constants.',
  'rn-higher-order': 'Find the first partial derivatives first.',
  'rn-total-differential': 'Find each first partial derivative.',
  'rn-chain-one':
    'Find $\\frac{\\partial w}{\\partial x}$, $\\frac{\\partial w}{\\partial y}$, $\\frac{dx}{dt}$ and $\\frac{dy}{dt}$.',
  'rn-chain-two': 'Find the partial derivatives of $w$ with respect to the intermediate variables.',
  'rn-chain-general': 'List which variables each intermediate variable depends on.',
  'rn-change-variables': 'Differentiate both given equations to get equations in the differentials.',
  'rn-second-order': 'Start with the first partial derivatives, using the Chain Rule.',
};

const MODE_FOR_DIFFICULTY: Record<1 | 2 | 3, PracticeModeId> = { 1: 'guided', 2: 'independent', 3: 'challenge' };

/** Generic sample points (inside most domains); questions with a restricted domain give their own. */
export const SAMPLES_XY: Point[] = [
  { x: 0.7, y: 1.3 },
  { x: 1.6, y: 0.45 },
  { x: 0.35, y: 2.2 },
  { x: 2.1, y: 1.7 },
  { x: 1.15, y: 0.8 },
];
export const SAMPLES_XYZ: Point[] = [
  { x: 0.7, y: 1.3, z: 0.4 },
  { x: 1.6, y: 0.45, z: 1.1 },
  { x: 0.35, y: 2.2, z: 0.75 },
  { x: 1.2, y: 0.9, z: 1.6 },
  { x: 0.55, y: 1.45, z: 0.2 },
];

export interface RnPracticeSpec {
  instruction: string;
  /** The question's formula, as printed (TeX). */
  problem: string;
  condition?: string;
  technique: RnTechnique;
  difficulty: 1 | 2 | 3;
  method: string;
  /** Variables, sample points and targets. Written questions give targets: [] (lines are still checked). */
  partial: PartialSpec;
  grading?: PracticeItem['grading'];
  /** App-authored suggested answers, one per target, in learner syntax (verified by the tests). */
  answers?: string[];
  /** Labels of the targets in TeX for the walkthrough, e.g. "f_{x}". */
  labelsTex?: string[];
  /** Steps shown before the generated walkthrough (e.g. the definition being used). */
  before?: [string, string?][];
  /** Written walkthrough steps (written questions, or to replace the generated ones). */
  steps?: [string, string?][];
  /** Final display of the suggested answer (TeX); generated from `answers` when absent. */
  answerTex?: string;
  /**
   * Written questions only: the derivatives the suggested working claims, checked against the
   * suggested answers in the tests (never used to grade learners).
   */
  verify?: { targets: PartialTarget[]; answers: string[] };
  advanced?: boolean;
  prerequisite?: PracticeItem['prerequisite'];
  reviewIds?: string[];
}

/** TeX of a suggested answer written in learner syntax. */
export const texOf = (answer: string): string => {
  const statement = parseStatement(answer);
  return statement.k === 'expr' ? toTex(statement.node) : answer;
};

function generatedStep(target: PartialTarget, labelTex: string, answer: string, chain: boolean): WorkedStep {
  const tex = `${labelTex} = ${texOf(answer)}`;
  switch (target.kind) {
    case 'derivative':
      if (target.wrt.length === 0) return { explanation: 'Substitute and simplify:', tex };
      if (target.wrt.length === 1)
        return {
          explanation: chain
            ? `By the Chain Rule, following every path to $${target.wrt[0]}$:`
            : `Hold the other variables constant and differentiate with respect to $${target.wrt[0]}$:`,
          tex,
        };
      return {
        explanation: `Differentiate with respect to $${target.wrt[0]}$, then differentiate the result with respect to $${target.wrt[1]}$:`,
        tex,
      };
    case 'value':
      return { explanation: 'Find the derivative, then substitute the point:', tex };
    case 'number':
      return { explanation: 'So', tex };
    case 'integralDerivative':
      return {
        explanation: `By the Fundamental Theorem of Calculus with the chain rule, differentiating the limits with respect to $${target.wrt}$:`,
        tex,
      };
    case 'inverse':
      return { explanation: 'Solving the equations in the differentials:', tex };
  }
}

export function buildRnItem(
  base: Pick<
    PracticeItem,
    'id' | 'sourceType' | 'source' | 'sourceQuestion' | 'sourceSubquestion' | 'sourceSection'
  > & {
    unitId: RnUnitId;
  },
  spec: RnPracticeSpec,
): PracticeItem {
  const reviewIds = [...new Set(spec.reviewIds ?? [])];
  const known = new Set(RN_MANUAL_REVIEW.map((m) => m.id));
  for (const id of reviewIds) if (!known.has(id)) throw new Error(`Unknown review item ${id}`);
  const targets = spec.partial.targets;
  if (spec.answers && spec.answers.length !== targets.length) {
    throw new Error(`${base.id}: ${spec.answers.length} answers for ${targets.length} targets`);
  }
  const labelsTex = spec.labelsTex ?? targets.map((t) => t.label);
  const chain = Object.keys(spec.partial.definitions ?? {}).length > 0;
  const generated =
    spec.answers?.map((answer, i) => generatedStep(targets[i]!, labelsTex[i] ?? '', answer, chain)) ?? [];
  const asSteps = (lines: [string, string?][]): WorkedStep[] =>
    lines.map(([explanation, tex]) => (tex ? { explanation, tex } : { explanation }));
  const steps: WorkedStep[] = [...asSteps(spec.before ?? []), ...(spec.steps ? asSteps(spec.steps) : generated)];
  const answerTex =
    spec.answerTex ??
    (spec.answers
      ? spec.answers.map((a, i) => `${labelsTex[i]} = ${texOf(a)}`).join(', \\quad ')
      : ([...steps].reverse().find((s) => s.tex)?.tex ?? ''));
  const first = steps[0]?.explanation ?? '';
  return {
    ...base,
    topicId: RN_TOPIC_ID,
    instruction: spec.instruction,
    problemTex: spec.problem,
    ...(spec.condition ? { condition: spec.condition } : {}),
    technique: spec.technique,
    techniqueLabel: RN_TECHNIQUES[spec.technique],
    difficulty: spec.difficulty,
    recommendedPracticeMode: MODE_FOR_DIFFICULTY[spec.difficulty],
    supportsHints: true,
    supportsStepValidation: true,
    needsManualReview: reviewIds.length > 0,
    reviewIds,
    // No Topic 3 question is withheld: questions whose intent is under review are written work instead.
    withheldFromLearners: false,
    isExtension: false,
    check: { variable: spec.partial.variables[0] ?? 'x', points: [], constants: {} },
    partial: spec.partial,
    grading: spec.grading ?? 'auto',
    ...(spec.advanced ? { advanced: true } : {}),
    ...(spec.prerequisite ? { prerequisite: spec.prerequisite } : {}),
    hints: [
      CONCEPTUAL_HINTS[spec.technique],
      spec.method,
      first.length >= 25 && !first.startsWith('Hold') ? first : NEXT_ACTIONS[spec.technique],
    ],
    solution: {
      status: 'pendingLecturerReview',
      method: spec.method,
      steps,
      answerTex,
      verification: spec.answers ? 'numericDerivative' : 'notVerified',
    },
  };
}

/** The app-authored suggested answers and verification data of every item (for the tests). */
export const SUGGESTED: Map<string, RnPracticeSpec> = new Map();

/** Builds an item and records its spec for the tests. */
export function rnItem(base: Parameters<typeof buildRnItem>[0], spec: RnPracticeSpec): PracticeItem {
  SUGGESTED.set(base.id, spec);
  return buildRnItem(base, spec);
}

/** Shorthand targets. */
export const d = (label: string, f: string, ...wrt: string[]): PartialTarget => ({ kind: 'derivative', label, f, wrt });
export const at = (label: string, f: string, wrt: string[], point: Point): PartialTarget => ({
  kind: 'value',
  label,
  f,
  wrt,
  at: point,
});
export const num = (label: string, value: number): PartialTarget => ({ kind: 'number', label, value });
