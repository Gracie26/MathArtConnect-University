/**
 * Answer-validation contract, kept separate from UI.
 *
 * `numericValidator` implements it with the engine in lib/math/input
 * (sandboxed parsing, exact derivatives by dual numbers, checks at sample
 * points). The practice screens use the richer step checks in
 * lib/math/check.ts, built on the same engine.
 *
 * Rules for any engine implementing this interface:
 *   - never evaluate learner input as JavaScript (no eval, no new Function)
 *   - parse only a whitelisted set of symbols and functions
 *   - accept equivalent forms; indefinite integrals may differ by a constant
 *   - when equivalence cannot be decided, return 'cannotVerify' (never 'incorrect')
 */

import { evaluate } from './input/evaluate';
import { type ExprNode, parseStatement } from './input/parse';

export type AnswerCheckStatus = 'correct' | 'incorrect' | 'cannotVerify';

export interface AnswerCheckResult {
  status: AnswerCheckStatus;
  /** Teaching feedback; never just "Wrong". */
  feedback?: string;
}

export interface AntiderivativeCheck {
  /** The integrand f(x) in the engine's input syntax. */
  integrand: string;
  /** The learner's proposed F(x). */
  proposed: string;
  variable?: string;
}

export interface EquivalenceCheck {
  expected: string;
  proposed: string;
  variable?: string;
}

export interface AnswerValidator {
  /** Correct when d/dx of `proposed` equals `integrand` (constants allowed). */
  checkAntiderivative(check: AntiderivativeCheck): Promise<AnswerCheckResult>;
  /** Correct when both expressions agree for all admissible values. */
  checkEquivalent(check: EquivalenceCheck): Promise<AnswerCheckResult>;
}

const NOT_YET: AnswerCheckResult = {
  status: 'cannotVerify',
  feedback: 'Automatic checking for this question is not available yet. Compare with the worked solution.',
};

/** A validator that never decides; used where no domain information is available. */
export const deferredValidator: AnswerValidator = {
  checkAntiderivative: async () => NOT_YET,
  checkEquivalent: async () => NOT_YET,
};

const DEFAULT_POINTS = [0.35, 0.8, 1.4, 2.2];

function expressionOf(input: string): ExprNode | null {
  try {
    const statement = parseStatement(input);
    return statement.k === 'expr' ? statement.node : null;
  } catch {
    return null;
  }
}

/** Compares f and g (value or derivative) at sample points; null when it cannot decide. */
function agreeAt(
  f: ExprNode,
  g: ExprNode,
  variable: string,
  compare: (a: { v: number; d: number }, b: { v: number; d: number }) => boolean,
): boolean | null {
  const ctx = { variable, constants: {}, definitions: {}, base: DEFAULT_POINTS[0] ?? 0 };
  let valid = 0;
  for (const x of DEFAULT_POINTS) {
    try {
      const a = evaluate(f, x, ctx);
      const b = evaluate(g, x, ctx);
      if (![a.v, a.d, b.v, b.d].every(Number.isFinite)) continue;
      valid++;
      if (!compare(a, b)) return false;
    } catch {
      return null;
    }
  }
  return valid >= 3 ? true : null;
}

const near = (a: number, b: number) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));

/** Numeric validator: never marks wrong when it cannot read or evaluate the input. */
export const numericValidator: AnswerValidator = {
  checkAntiderivative: async ({ integrand, proposed, variable = 'x' }) => {
    const f = expressionOf(integrand);
    const F = expressionOf(proposed);
    if (!f || !F) return NOT_YET;
    const result = agreeAt(F, f, variable, (a, b) => near(a.d, b.v));
    if (result === null) return NOT_YET;
    return result
      ? { status: 'correct', feedback: 'Differentiating the answer gives the integrand.' }
      : { status: 'incorrect', feedback: 'Differentiating the answer does not give the integrand.' };
  },
  checkEquivalent: async ({ expected, proposed, variable = 'x' }) => {
    const a = expressionOf(expected);
    const b = expressionOf(proposed);
    if (!a || !b) return NOT_YET;
    const result = agreeAt(a, b, variable, (p, q) => near(p.v, q.v));
    if (result === null) return NOT_YET;
    return result ? { status: 'correct' } : { status: 'incorrect', feedback: 'These expressions are not equal.' };
  },
};
