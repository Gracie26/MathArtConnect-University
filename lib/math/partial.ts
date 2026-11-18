/**
 * Checking for Topic 3 (Differential Calculus in ℝⁿ): partial derivatives,
 * higher and mixed partials, values at points, total-differential
 * coefficients, chain rules through intermediate variables, derivatives of
 * integrals with variable limits, and partial derivatives of an inverse
 * change of variables.
 *
 * Learner input goes through the same safe parser as the rest of the app
 * (lib/math/input/parse.ts): an expression tree, an allow-list of functions
 * and only the variables of the question; nothing is ever executed as code.
 *
 * References are computed from the question itself, never from a typed
 * answer key:
 *   - first partial derivatives exactly, with dual numbers, including through
 *     intermediate variables (the chain rule is exact);
 *   - second (mixed) partials by a central difference of the exact first
 *     partial (error ≈ 1e-8 at the sample points, compared with a tolerance
 *     of 1e-5 relative), at several fixed generic points inside the domain.
 * An answer is accepted only if it agrees at every sample point. Lines of
 * working are checked for equality of their sides (a sound check); a line
 * that matches nothing is reported as information, never as wrong.
 *
 * Mixed-partial order: `wrt: ['x', 'y']` means differentiate with respect to
 * x first and then y, which the course notes write fxy = ∂²f/∂y∂x
 * (Chapter 3, §3.2.3; internal review flag MR3-03).
 */
import { type EvalContext, evaluate, UnknownSymbolError } from './input/evaluate';
import { type ExprNode, parseStatement, symbolsOf } from './input/parse';

export type Point = Record<string, number>;

/** One quantity the learner must give. Functions are written in learner syntax, e.g. "x^3 - 2xy + 3y^2". */
export type PartialTarget =
  /** A partial derivative of f, as a function: differentiate in the order of `wrt` (`[]` is f itself). */
  | { kind: 'derivative'; label: string; f: string; wrt: string[] }
  /** A partial derivative of f (or f itself) evaluated at a point. */
  | { kind: 'value'; label: string; f: string; wrt: string[]; at: Point }
  /** A number fixed by the question, verified independently in the tests (e.g. a constant c). */
  | { kind: 'number'; label: string; value: number }
  /** ∂/∂wrt of ∫ from lower to upper of integrand(t) dt (Fundamental Theorem with the chain rule). */
  | {
      kind: 'integralDerivative';
      label: string;
      integrand: string;
      t: string;
      lower: string;
      upper: string;
      wrt: string;
    }
  /**
   * Partial derivative of an input variable with respect to an output variable, when the outputs are
   * given as functions of the inputs (e.g. x = e^(2r) cos θ, y = e^(3r) sin θ; want ∂r/∂x).
   */
  | {
      kind: 'inverse';
      label: string;
      outputs: [string, string];
      inputs: [string, string];
      forward: Record<string, string>;
      want: string;
      wrt: string;
    };

export interface PartialSpec {
  /** Independent variables of the question, e.g. ['x', 'y'], ['s', 't'] or ['r', 'θ']. */
  variables: string[];
  /** Intermediate variables in terms of other variables (chain rule), in learner syntax. */
  definitions?: Record<string, string>;
  /** Points inside the domain (values of the independent variables) where answers are compared. */
  samples: Point[];
  /** What the final answer must contain, in order (comma-separated when there are several). */
  targets: PartialTarget[];
}

export type PartialStatus = 'correct' | 'incorrect' | 'info' | 'cannotCheck';

export interface PartialFeedback {
  status: PartialStatus;
  message: string;
}

// -----------------------------------------------------------------------------
// Parsing and evaluation
// -----------------------------------------------------------------------------

function parseExpr(text: string): ExprNode {
  const statement = parseStatement(text);
  if (statement.k !== 'expr') throw new Error(`Not a single expression: ${text}`);
  return statement.node;
}

export interface CompiledPartial {
  spec: PartialSpec;
  definitions: Record<string, ExprNode>;
  /** Symbols a learner may use: independent and intermediate variables, e and π. */
  allowed: Set<string>;
}

export function compilePartial(spec: PartialSpec): CompiledPartial {
  const definitions = Object.fromEntries(
    Object.entries(spec.definitions ?? {}).map(([name, text]) => [name, parseExpr(text)]),
  );
  return {
    spec,
    definitions,
    allowed: new Set([...spec.variables, ...Object.keys(definitions), 'e', 'π']),
  };
}

/** Value and exact derivative of `node` with respect to `variable` at point p. */
function dual(node: ExprNode, p: Point, variable: string, compiled: CompiledPartial): { v: number; d: number } {
  const constants = { ...p };
  delete constants[variable];
  const ctx: EvalContext = { variable, constants, definitions: compiled.definitions, base: 0 };
  return evaluate(node, p[variable] ?? 0, ctx);
}

/** The value of `node` at p (through the intermediate-variable definitions). */
function valueAt(node: ExprNode, p: Point, compiled: CompiledPartial): number {
  const variable = compiled.spec.variables[0] ?? 'x';
  return dual(node, p, variable, compiled).v;
}

/** ∂ⁿ node / ∂wrt[n-1] … ∂wrt[0] at p: exact first derivative, central differences for later ones. */
function derivativeAt(node: ExprNode, wrt: readonly string[], p: Point, compiled: CompiledPartial): number {
  if (wrt.length === 0) return valueAt(node, p, compiled);
  if (wrt.length === 1) return dual(node, p, wrt[0]!, compiled).d;
  const last = wrt[wrt.length - 1]!;
  const inner = wrt.slice(0, -1);
  const h = 1e-4 * Math.max(1, Math.abs(p[last] ?? 0));
  const plus = derivativeAt(node, inner, { ...p, [last]: (p[last] ?? 0) + h }, compiled);
  const minus = derivativeAt(node, inner, { ...p, [last]: (p[last] ?? 0) - h }, compiled);
  return (plus - minus) / (2 * h);
}

/** Tolerance for comparing with a reference that used `differences` central differences. */
const tolerance = (reference: number, differences: number) =>
  (differences === 0 ? 1e-7 : 1e-5) * Math.max(1, Math.abs(reference));

/**
 * A rounded decimal typed for a numeric answer (a value at a point, or a fixed number): accepted to four
 * decimal places, or four significant figures for large values, as in Topic 2 (lib/math/definite.ts).
 */
const roughlyClose = (a: number, b: number) => Math.abs(a - b) <= 5.1e-4 * Math.max(1, Math.abs(b));
const typedDecimal = (part: string) => /\d\.\d/.test(part);

interface Reference {
  label: string;
  /** Value of the target at a sample point (NaN if undefined there). */
  at: (p: Point) => number;
  /** A constant (value targets) rather than a function of the variables. */
  constant: boolean;
  differences: number;
}

function referenceOf(target: PartialTarget, compiled: CompiledPartial): Reference {
  switch (target.kind) {
    case 'derivative': {
      const f = parseExpr(target.f);
      return {
        label: target.label,
        at: (p) => derivativeAt(f, target.wrt, p, compiled),
        constant: false,
        differences: Math.max(0, target.wrt.length - 1),
      };
    }
    case 'value': {
      const f = parseExpr(target.f);
      const value = derivativeAt(f, target.wrt, target.at, compiled);
      return { label: target.label, at: () => value, constant: true, differences: Math.max(0, target.wrt.length - 1) };
    }
    case 'number':
      return { label: target.label, at: () => target.value, constant: true, differences: 0 };
    case 'integralDerivative': {
      const integrand = parseExpr(target.integrand);
      const lower = parseExpr(target.lower);
      const upper = parseExpr(target.upper);
      const g = (s: number) =>
        evaluate(integrand, s, { variable: target.t, constants: {}, definitions: {}, base: 0 }).v;
      return {
        label: target.label,
        at: (p) => {
          const u = dual(upper, p, target.wrt, compiled);
          const l = dual(lower, p, target.wrt, compiled);
          return g(u.v) * u.d - g(l.v) * l.d;
        },
        constant: false,
        differences: 0,
      };
    }
    case 'inverse': {
      const [o1, o2] = target.outputs;
      const [i1, i2] = target.inputs;
      const X = parseExpr(target.forward[o1]!);
      const Y = parseExpr(target.forward[o2]!);
      return {
        label: target.label,
        at: (p) => {
          const [xa, xb, ya, yb] = [
            dual(X, p, i1, compiled).d,
            dual(X, p, i2, compiled).d,
            dual(Y, p, i1, compiled).d,
            dual(Y, p, i2, compiled).d,
          ];
          const det = xa * yb - xb * ya;
          // Inverse of [[∂o1/∂i1, ∂o1/∂i2], [∂o2/∂i1, ∂o2/∂i2]].
          const table: Record<string, number> = {
            [`${i1}|${o1}`]: yb / det,
            [`${i1}|${o2}`]: -xb / det,
            [`${i2}|${o1}`]: -ya / det,
            [`${i2}|${o2}`]: xa / det,
          };
          return table[`${target.want}|${target.wrt}`] ?? Number.NaN;
        },
        constant: false,
        differences: 0,
      };
    }
  }
}

/** Compares a learner expression with a reference at every sample point. */
function agrees(node: ExprNode, reference: Reference, compiled: CompiledPartial): boolean {
  let compared = 0;
  for (const p of compiled.spec.samples) {
    const want = reference.at(p);
    if (!Number.isFinite(want)) continue;
    const got = valueAt(node, p, compiled);
    if (!Number.isFinite(got)) return false;
    if (Math.abs(got - want) > tolerance(want, reference.differences)) return false;
    compared++;
  }
  return compared >= Math.min(3, compiled.spec.samples.length);
}

/** Symbols in the learner's expression that the question does not allow (null if all are allowed). */
function unknownSymbols(node: ExprNode, compiled: CompiledPartial): string[] | null {
  const unknown = [...symbolsOf(node)].filter((s) => !compiled.allowed.has(s));
  return unknown.length > 0 ? unknown : null;
}

const variableList = (compiled: CompiledPartial) =>
  [...compiled.spec.variables, ...Object.keys(compiled.definitions)].join(', ');

// -----------------------------------------------------------------------------
// Final answers
// -----------------------------------------------------------------------------

/** Splits a final answer at top-level commas (commas inside brackets stay). */
export function splitAnswer(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of input) {
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    if (ch === ')' || ch === ']' || ch === '}') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(current);
      current = '';
    } else current += ch;
  }
  parts.push(current);
  return parts.map((p) => p.trim()).filter((p) => p.length > 0);
}

/** The expression of one answer part: the right-hand side if it is written "label = expression". */
function answerExpression(part: string): ExprNode {
  const sides = part.split('=');
  return parseExpr(sides[sides.length - 1]!.trim());
}

export function answerLabel(spec: PartialSpec): string {
  const labels = spec.targets.map((t) => t.label);
  return labels.length === 1
    ? `Final answer: ${labels[0]}`
    : `Final answer: ${labels.join(', ')} (separated by commas)`;
}

export function checkPartialAnswer(
  input: string,
  compiled: CompiledPartial,
): { status: 'correct' | 'incorrect' | 'cannotCheck'; message: string } {
  const parts = splitAnswer(input);
  const targets = compiled.spec.targets;
  if (parts.length !== targets.length) {
    return {
      status: 'cannotCheck',
      message:
        targets.length === 1
          ? 'Give one answer.'
          : `Give ${targets.length} answers, separated by commas, in this order: ${targets.map((t) => t.label).join(', ')}.`,
    };
  }
  const wrong: string[] = [];
  let rounded = false;
  let functionWrong = false;
  for (const [index, target] of targets.entries()) {
    let node: ExprNode;
    try {
      node = answerExpression(parts[index]!);
    } catch (error) {
      return { status: 'cannotCheck', message: `${target.label}: ${(error as Error).message}` };
    }
    const unknown = unknownSymbols(node, compiled);
    if (unknown) {
      return {
        status: 'cannotCheck',
        message: `${target.label}: "${unknown.join('", "')}" is not a variable of this question. Use ${variableList(compiled)}.`,
      };
    }
    try {
      const reference = referenceOf(target, compiled);
      if (!agrees(node, reference, compiled)) {
        // A numeric answer given as a rounded decimal (e.g. 22.1672 for 3e²) is accepted, with a note.
        const sample = compiled.spec.samples[0];
        const numeric = [...symbolsOf(node)].every((s) => s === 'e' || s === 'π');
        const got = sample && numeric ? valueAt(node, sample, compiled) : Number.NaN;
        const want = sample ? reference.at(sample) : Number.NaN;
        if (reference.constant && typedDecimal(parts[index]!) && roughlyClose(got, want)) rounded = true;
        else {
          wrong.push(target.label);
          if (!reference.constant) functionWrong = true;
        }
      }
    } catch (error) {
      if (error instanceof UnknownSymbolError) {
        return { status: 'cannotCheck', message: `${target.label}: "${error.symbol}" cannot be evaluated here.` };
      }
      throw error;
    }
  }
  if (wrong.length === 0) {
    const note = rounded ? ' (as a decimal; an exact form is better where you can give one)' : '';
    return {
      status: 'correct',
      message: targets.length === 1 ? `Correct${note}.` : `Correct: all ${targets.length} answers are right${note}.`,
    };
  }
  return {
    status: 'incorrect',
    message:
      `Not yet: ${wrong.join(', ')} ${wrong.length === 1 ? 'is' : 'are'} not right${functionWrong ? ' (checked at several points)' : ''}. ${
        wrong.length < targets.length ? 'The others are correct.' : ''
      }`.trim(),
  };
}

// -----------------------------------------------------------------------------
// Lines of working
// -----------------------------------------------------------------------------

export function checkPartialLine(line: string, compiled: CompiledPartial): PartialFeedback {
  const text = line.trim();
  if (!text) return { status: 'cannotCheck', message: 'Write a step first.' };
  let sides: ExprNode[];
  try {
    const statement = parseStatement(text);
    sides = statement.k === 'expr' ? [statement.node] : statement.sides;
  } catch {
    return {
      status: 'cannotCheck',
      message:
        'Written reasoning is not checked automatically. Write a calculation as an expression or as expression = expression to check it.',
    };
  }
  // Labels such as fx or ∂f/∂x on the left use letters that are not variables: check the other sides.
  const checkable = sides.filter((s) => unknownSymbols(s, compiled) === null);
  if (checkable.length === 0) {
    return {
      status: 'cannotCheck',
      message: `Only expressions in ${variableList(compiled)} can be checked. This step is kept as written reasoning.`,
    };
  }
  try {
    const references = compiled.spec.targets.map((t) => referenceOf(t, compiled)).filter((r) => !r.constant);
    // Every pair of checkable sides must be equal.
    for (let i = 1; i < checkable.length; i++) {
      const before = checkable[i - 1]!;
      const asReference: Reference = {
        label: '',
        at: (p) => valueAt(before, p, compiled),
        constant: false,
        differences: 0,
      };
      if (!agrees(checkable[i]!, asReference, compiled)) {
        return {
          status: 'incorrect',
          message: 'The two sides of this step are not equal (checked at several points).',
        };
      }
    }
    const last = checkable[checkable.length - 1]!;
    const match = references.find((r) => agrees(last, r, compiled));
    if (match) return { status: 'correct', message: `This equals ${match.label}.` };
    const values = compiled.spec.targets.filter((t) => t.kind === 'value' || t.kind === 'number');
    for (const t of values) {
      const r = referenceOf(t, compiled);
      const p = compiled.spec.samples[0] ?? {};
      if (
        Math.abs(valueAt(last, p, compiled) - r.at(p)) <= tolerance(r.at(p), r.differences) &&
        symbolsOf(last).size === 0
      ) {
        return { status: 'correct', message: `This is the value of ${t.label}.` };
      }
    }
    return checkable.length > 1
      ? { status: 'correct', message: 'Both sides are equal. Keep going.' }
      : {
          status: 'info',
          message: `Not equal to ${compiled.spec.targets.map((t) => t.label).join(' or ') || 'an answer'} yet. If this is an intermediate expression, keep going.`,
        };
  } catch (error) {
    if (error instanceof UnknownSymbolError) {
      return { status: 'cannotCheck', message: `"${error.symbol}" cannot be evaluated in this question.` };
    }
    return { status: 'cannotCheck', message: 'This step could not be checked.' };
  }
}
