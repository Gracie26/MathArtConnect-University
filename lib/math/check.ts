/**
 * Checks learner working for an indefinite integral.
 *
 * Everything is checked numerically at sample points inside the question's
 * domain:
 *   - a step written as an integral, or containing one, is correct when its
 *     derivative equals the integrand (it is the same family of functions);
 *   - a step without an integral is either a rewrite of the integrand (same
 *     values) or an anti-derivative (same derivative);
 *   - "u = 3x + 5" defines a substitution used to check later steps;
 *   - "du = 3 dx" is checked against the definition of u;
 *   - any other equation is checked side by side.
 * When something cannot be checked reliably the result says so; nothing is
 * marked wrong just because the checker cannot read it.
 */
import { evaluate, type EvalContext, UnknownSymbolError } from './input/evaluate';
import { containsIntegral, type ExprNode, ParseError, parseStatement, type Statement, symbolsOf } from './input/parse';

export interface CheckProblem {
  /** The integrand as a function of the main variable (constants already applied). */
  integrand: (x: number) => number;
  variable: string;
  points: number[];
  constants: Record<string, number>;
}

export type FeedbackStatus = 'correct' | 'incorrect' | 'info' | 'cannotCheck';

export interface Feedback {
  status: FeedbackStatus;
  message: string;
}

/** What earlier steps established: substitutions in terms of the main variable. */
export interface WorkingState {
  definitions: Record<string, ExprNode>;
  /** Variables introduced in a form the checker cannot invert (e.g. x = 2 sin θ). */
  opaque: string[];
}

export const emptyWorkingState = (): WorkingState => ({ definitions: {}, opaque: [] });

const RESERVED = new Set(['e', 'π', 'C', 'K']);

/** Lower-case letters learners often use for the constant of integration ("+ c", "+ k"). */
const LOWER_CONSTANTS: Record<string, string> = { c: 'C', k: 'K' };

/**
 * Reads a free "c" or "k" as the constant of integration C or K when it is a term on its own
 * ("… + c", "… − k"), unless that letter already means something in the question (its variable or a
 * constant) or in the working (a substitution). A letter used as a factor ("k x³") is left alone, so
 * it is still reported as unknown rather than guessed.
 */
function withIntegrationConstants(node: ExprNode, problem: CheckProblem, state: WorkingState): ExprNode {
  const term = (n: ExprNode): ExprNode => {
    switch (n.k) {
      case 'add':
      case 'sub':
        return { ...n, a: term(n.a), b: term(n.b) };
      case 'neg':
        return { ...n, a: term(n.a) };
      case 'sym': {
        const upper = LOWER_CONSTANTS[n.name];
        const taken = n.name === problem.variable || n.name in problem.constants || n.name in state.definitions;
        return upper && !taken ? { k: 'sym', name: upper } : n;
      }
      default:
        return n;
    }
  };
  // A lone "c" is not a sum, so it is not read as a constant of integration.
  return node.k === 'add' || node.k === 'sub' ? term(node) : node;
}

function statementWithIntegrationConstants(
  statement: Statement,
  problem: CheckProblem,
  state: WorkingState,
): Statement {
  if (statement.k === 'expr') return { k: 'expr', node: withIntegrationConstants(statement.node, problem, state) };
  // "c = …" defines a letter; it is not a constant of integration.
  const first = statement.sides[0];
  if (first?.k === 'sym' && first.name in LOWER_CONSTANTS) return statement;
  return { k: 'eq', sides: statement.sides.map((side) => withIntegrationConstants(side, problem, state)) };
}
const MIN_POINTS = 3;
const close = (a: number, b: number) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));

interface Sample {
  value: number;
  derivative: number;
  integrand: number;
}

function sample(node: ExprNode, problem: CheckProblem, state: WorkingState): Sample[] {
  const ctx: EvalContext = {
    variable: problem.variable,
    constants: problem.constants,
    definitions: state.definitions,
    base: problem.points[0] ?? 0,
  };
  const samples: Sample[] = [];
  for (const x of problem.points) {
    const result = evaluate(node, x, ctx);
    const integrand = problem.integrand(x);
    if ([result.v, result.d, integrand].every(Number.isFinite)) {
      samples.push({ value: result.v, derivative: result.d, integrand });
    }
  }
  return samples;
}

class NotEnoughPoints extends Error {}

/** True when `test` holds at every sample (needs enough points inside the domain). */
function holds(samples: Sample[], test: (s: Sample) => boolean): boolean {
  if (samples.length < MIN_POINTS) throw new NotEnoughPoints();
  return samples.every(test);
}

const usesVariable = (node: ExprNode, name: string) => symbolsOf(node).has(name);

function unknownSymbols(node: ExprNode, problem: CheckProblem, state: WorkingState): string[] {
  return [...symbolsOf(node)].filter(
    (s) => s !== problem.variable && !(s in problem.constants) && !(s in state.definitions) && !RESERVED.has(s),
  );
}

function cannotCheck(error: unknown, problem: CheckProblem, state: WorkingState): Feedback {
  if (error instanceof ParseError) return { status: 'cannotCheck', message: error.message };
  if (error instanceof NotEnoughPoints) {
    return { status: 'cannotCheck', message: 'This step could not be evaluated for enough values to check it.' };
  }
  if (error instanceof UnknownSymbolError) {
    const symbol = error.symbol;
    if (state.opaque.includes(symbol)) {
      return {
        status: 'cannotCheck',
        message: `Steps in ${symbol} can't be checked automatically yet. Compare them with the hints or the walkthrough.`,
      };
    }
    if (symbol.startsWith('d'))
      return {
        status: 'cannotCheck',
        message: 'A differential such as dx belongs inside an integral or in an equation like du = 3 dx.',
      };
    return {
      status: 'cannotCheck',
      message: `I don't know what ${symbol} stands for. If it is a substitution, define it first, for example ${symbol} = 3${problem.variable} + 5.`,
    };
  }
  return { status: 'cannotCheck', message: 'This step could not be checked.' };
}

// -----------------------------------------------------------------------------
// Differentials: du = 3 dx, dx = ½ t dt, 2t dt = 4 dx
// -----------------------------------------------------------------------------

function containsDifferential(node: ExprNode): boolean {
  switch (node.k) {
    case 'diff':
      return true;
    case 'num':
    case 'sym':
    case 'int':
      return false;
    case 'neg':
    case 'abs':
    case 'sqrt':
      return containsDifferential(node.a);
    case 'fn':
      return containsDifferential(node.arg);
    default:
      return containsDifferential(node.a) || containsDifferential(node.b);
  }
}

/** Splits "k · dv" into k and v; null when the side is not a multiple of one differential. */
function splitDifferential(node: ExprNode): { coefficient: ExprNode; v: string } | null {
  switch (node.k) {
    case 'diff':
      return { coefficient: { k: 'num', v: 1 }, v: node.v };
    case 'neg': {
      const inner = splitDifferential(node.a);
      return inner ? { coefficient: { k: 'neg', a: inner.coefficient }, v: inner.v } : null;
    }
    case 'mul': {
      const left = containsDifferential(node.a);
      const right = containsDifferential(node.b);
      if (left === right) return null;
      const inner = splitDifferential(left ? node.a : node.b);
      if (!inner) return null;
      const other = left ? node.b : node.a;
      return { coefficient: { k: 'mul', a: other, b: inner.coefficient }, v: inner.v };
    }
    case 'div': {
      if (containsDifferential(node.b)) return null;
      const inner = splitDifferential(node.a);
      return inner ? { coefficient: { k: 'div', a: inner.coefficient, b: node.b }, v: inner.v } : null;
    }
    default:
      return null;
  }
}

function checkDifferential(sides: ExprNode[], problem: CheckProblem, state: WorkingState): Feedback {
  const parts = sides.map(splitDifferential);
  if (parts.some((p) => p === null) || sides.length !== 2) {
    return { status: 'cannotCheck', message: 'Write a differential step as, for example, du = 3 dx.' };
  }
  // k₁ dv₁ = k₂ dv₂ means k₁ · dv₁/dx = k₂ · dv₂/dx.
  const rate = (part: { coefficient: ExprNode; v: string }): ExprNode =>
    part.v === problem.variable
      ? part.coefficient
      : { k: 'mul', a: part.coefficient, b: { k: 'sym', name: `__rate_${part.v}` } };
  const [left, right] = parts as [{ coefficient: ExprNode; v: string }, { coefficient: ExprNode; v: string }];
  for (const part of [left, right]) {
    if (part.v !== problem.variable && !state.definitions[part.v]) {
      return {
        status: 'cannotCheck',
        message: `Define ${part.v} first (for example ${part.v} = …), then write d${part.v} in terms of d${problem.variable}.`,
      };
    }
  }
  // dv/dx is the derivative of v's definition.
  const ctx: EvalContext = {
    variable: problem.variable,
    constants: problem.constants,
    definitions: state.definitions,
    base: 0,
  };
  let valid = 0;
  for (const x of problem.points) {
    const rates: Record<string, { v: number; d: number }> = {};
    for (const part of [left, right]) {
      if (part.v !== problem.variable)
        rates[`__rate_${part.v}`] = { v: evaluate(state.definitions[part.v] as ExprNode, x, ctx).d, d: 0 };
    }
    const a = evaluate(rate(left), x, ctx, rates).v;
    const b = evaluate(rate(right), x, ctx, rates).v;
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    valid++;
    if (!close(a, b)) {
      return {
        status: 'incorrect',
        message: 'This differential does not match the substitution. Differentiate it again.',
      };
    }
  }
  if (valid < MIN_POINTS) throw new NotEnoughPoints();
  return { status: 'correct', message: 'Correct: the differentials match.' };
}

// -----------------------------------------------------------------------------
// Steps
// -----------------------------------------------------------------------------

function substitutedVariables(node: ExprNode, state: WorkingState): string[] {
  return [...symbolsOf(node)].filter((s) => s in state.definitions);
}

function checkExpression(node: ExprNode, problem: CheckProblem, state: WorkingState): Feedback {
  const samples = sample(node, problem, state);
  const derivativeMatches = holds(samples, (s) => close(s.derivative, s.integrand));
  if (containsIntegral(node)) {
    return derivativeMatches
      ? { status: 'correct', message: 'Correct: this is equal to the integral.' }
      : { status: 'incorrect', message: "This doesn't match the integral. Check this step, or ask for a hint." };
  }
  if (derivativeMatches) {
    return substitutedVariables(node, state).length > 0
      ? { status: 'correct', message: `Correct. Now write it in terms of ${problem.variable}.` }
      : { status: 'correct', message: 'Correct: this is an anti-derivative. You can give it as your final answer.' };
  }
  if (holds(samples, (s) => close(s.value, s.integrand))) {
    return { status: 'correct', message: 'Correct: this rewrites the integrand. Now integrate it.' };
  }
  return { status: 'incorrect', message: "This doesn't match the integral. Check this step, or ask for a hint." };
}

function checkEquation(sides: ExprNode[], problem: CheckProblem, state: WorkingState): Feedback {
  let aboutTheIntegral = false;
  for (let i = 0; i + 1 < sides.length; i++) {
    const a = sides[i] as ExprNode;
    const b = sides[i + 1] as ExprNode;
    const sa = sample(a, problem, state);
    const sb = sample(b, problem, state);
    const n = Math.min(sa.length, sb.length);
    if (n < MIN_POINTS) throw new NotEnoughPoints();
    // With an integral on either side, equal means equal up to a constant: compare derivatives.
    const compareDerivatives = containsIntegral(a) || containsIntegral(b);
    for (let j = 0; j < n; j++) {
      const left = sa[j] as Sample;
      const right = sb[j] as Sample;
      const equal = compareDerivatives ? close(left.derivative, right.derivative) : close(left.value, right.value);
      if (!equal) {
        return {
          status: 'incorrect',
          message:
            sides.length > 2
              ? `Parts ${i + 1} and ${i + 2} of this line are not equal.`
              : 'The two sides are not equal.',
        };
      }
    }
    if (compareDerivatives && sa.every((s) => close(s.derivative, s.integrand))) aboutTheIntegral = true;
  }
  return aboutTheIntegral
    ? { status: 'correct', message: 'Correct: each side is equal to the integral.' }
    : { status: 'correct', message: 'This equation is correct.' };
}

/** Is this line "u = …" introducing a new substitution? */
function definitionOf(
  statement: Statement,
  problem: CheckProblem,
  state: WorkingState,
): { name: string; expr: ExprNode } | null {
  if (statement.k !== 'eq' || statement.sides.length !== 2) return null;
  const [left, right] = statement.sides as [ExprNode, ExprNode];
  if (left.k !== 'sym') return null;
  const name = left.name;
  if (name === problem.variable || name in problem.constants || name in state.definitions || RESERVED.has(name))
    return null;
  if (containsDifferential(right) || usesVariable(right, name)) return null;
  return { name, expr: right };
}

/** "x = 2 sin θ": a substitution written the other way round. */
function inverseSubstitution(statement: Statement, problem: CheckProblem, state: WorkingState): string | null {
  if (statement.k !== 'eq' || statement.sides.length !== 2) return null;
  const [left, right] = statement.sides as [ExprNode, ExprNode];
  if (left.k !== 'sym' || left.name !== problem.variable) return null;
  const fresh = unknownSymbols(right, problem, state);
  return fresh.length === 1 ? (fresh[0] as string) : null;
}

/**
 * Checks one line of working. Returns feedback and the working state after
 * the line (a new substitution is remembered for later lines).
 */
export function checkStep(
  input: string,
  problem: CheckProblem,
  state: WorkingState,
): { feedback: Feedback; state: WorkingState } {
  let statement: Statement;
  try {
    statement = statementWithIntegrationConstants(parseStatement(input), problem, state);
  } catch (error) {
    return { feedback: cannotCheck(error, problem, state), state };
  }

  const definition = definitionOf(statement, problem, state);
  if (definition) {
    const unknown = unknownSymbols(definition.expr, problem, state);
    if (unknown.length > 0) {
      return { feedback: cannotCheck(new UnknownSymbolError(unknown[0] as string), problem, state), state };
    }
    return {
      feedback: {
        status: 'info',
        message: `Noted: ${definition.name} = ${input.split('=').slice(1).join('=').trim()}. Steps that use ${definition.name} are checked with this.`,
      },
      state: { ...state, definitions: { ...state.definitions, [definition.name]: definition.expr } },
    };
  }

  const inverse = inverseSubstitution(statement, problem, state);
  if (inverse) {
    return {
      feedback: {
        status: 'info',
        message: `Noted: a substitution for ${problem.variable} in terms of ${inverse}. Steps in ${inverse} can't be checked automatically yet; compare them with the hints or the walkthrough.`,
      },
      state: { ...state, opaque: [...state.opaque, inverse] },
    };
  }

  try {
    if (statement.k === 'eq') {
      if (statement.sides.some(containsDifferential))
        return { feedback: checkDifferential(statement.sides, problem, state), state };
      return { feedback: checkEquation(statement.sides, problem, state), state };
    }
    return { feedback: checkExpression(statement.node, problem, state), state };
  } catch (error) {
    return { feedback: cannotCheck(error, problem, state), state };
  }
}

/** Runs every line in order, so each line is checked with the substitutions defined above it. */
export function checkWorking(lines: string[], problem: CheckProblem): Feedback[] {
  let state = emptyWorkingState();
  return lines.map((line) => {
    const result = checkStep(line, problem, state);
    state = result.state;
    return result.feedback;
  });
}

export type AnswerStatus = 'correct' | 'missingConstant' | 'incorrect' | 'cannotCheck';

/**
 * Checks a final answer: an anti-derivative in the main variable, ideally with
 * + C. For a "show that" reduction formula (`allowIntegral`), the answer may
 * keep an integral, as the formula does.
 */
export function checkFinalAnswer(
  input: string,
  problem: CheckProblem,
  options: { allowIntegral?: boolean } = {},
): { status: AnswerStatus; message: string } {
  let statement: Statement;
  try {
    statement = statementWithIntegrationConstants(parseStatement(input), problem, emptyWorkingState());
  } catch (error) {
    return {
      status: 'cannotCheck',
      message: error instanceof Error ? error.message : 'This answer could not be read.',
    };
  }
  const node = statement.k === 'expr' ? statement.node : (statement.sides[statement.sides.length - 1] as ExprNode);
  const keepsIntegral = containsIntegral(node);
  if (keepsIntegral && !options.allowIntegral) {
    return { status: 'incorrect', message: 'Your answer still contains an integral. Integrate it first.' };
  }
  const state = emptyWorkingState();
  const unknown = unknownSymbols(node, problem, state);
  if (unknown.length > 0) {
    return {
      status: 'incorrect',
      message: `Write your final answer in terms of ${problem.variable}; it still contains ${unknown.join(', ')}.`,
    };
  }
  try {
    const samples = sample(node, problem, state);
    if (!holds(samples, (s) => close(s.derivative, s.integrand))) {
      return {
        status: 'incorrect',
        message:
          'Not quite: differentiating this answer does not give the integrand. Check your working or ask for a hint.',
      };
    }
  } catch (error) {
    return { status: 'cannotCheck', message: cannotCheck(error, problem, state).message };
  }
  if (keepsIntegral) {
    return {
      status: 'correct',
      message: 'Correct! Differentiating both sides gives the same function, so the formula holds.',
    };
  }
  const symbols = symbolsOf(node);
  return symbols.has('C') || symbols.has('K')
    ? { status: 'correct', message: 'Correct! Differentiating your answer gives the integrand.' }
    : {
        status: 'missingConstant',
        message: 'Correct anti-derivative. Remember to add the constant of integration, + C.',
      };
}
