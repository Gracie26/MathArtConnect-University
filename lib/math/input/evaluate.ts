/**
 * Evaluates learner expressions together with their exact derivative with
 * respect to the main variable (forward-mode differentiation with dual
 * numbers). Nothing is executed: the tree is walked with a fixed set of
 * operations.
 *
 * - An integral the learner writes, ∫ h dv, counts as a function whose
 *   derivative is h (times dv/dx when v is a substituted variable). Its
 *   value is found with Simpson's rule from a base point, so steps such as
 *   "x eˣ − ∫ eˣ dx" can be checked.
 * - A substituted variable (u = 3x + 5) is evaluated through its definition.
 */
import type { ExprNode, FunctionName } from './parse';

export interface Dual {
  v: number;
  d: number;
}

export class UnknownSymbolError extends Error {
  constructor(readonly symbol: string) {
    super(`Unknown symbol ${symbol}`);
    this.name = 'UnknownSymbolError';
  }
}

export interface EvalContext {
  /** Main variable of the problem, usually "x". */
  variable: string;
  /** Values for named constants in the problem (a, b, μ …). */
  constants: Record<string, number>;
  /** Substitutions defined in earlier steps, in terms of the main variable. */
  definitions: Record<string, ExprNode>;
  /** Lower limit used when an integral's value is needed. */
  base: number;
}

const constant = (v: number): Dual => ({ v, d: 0 });

/** Real power, allowing odd roots of negative numbers (e.g. (−8)^(1/3) = −2). */
export function realPow(base: number, exponent: number): number {
  if (base >= 0 || Number.isInteger(exponent)) return Math.pow(base, exponent);
  for (const q of [3, 5, 7, 9]) {
    const n = exponent * q;
    if (Math.abs(n - Math.round(n)) < 1e-9) {
      const magnitude = Math.pow(-base, exponent);
      return Math.round(n) % 2 === 0 ? magnitude : -magnitude;
    }
  }
  return Number.NaN;
}

function pow(a: Dual, b: Dual): Dual {
  if (b.d === 0) {
    const p = b.v;
    const v = realPow(a.v, p);
    const d = a.d === 0 ? 0 : p * realPow(a.v, p - 1) * a.d;
    return { v, d };
  }
  const v = Math.pow(a.v, b.v);
  return { v, d: v * (b.d * Math.log(a.v) + (a.d === 0 ? 0 : (b.v * a.d) / a.v)) };
}

const FUNCTIONS: Record<FunctionName, (a: Dual) => Dual> = {
  sin: (a) => ({ v: Math.sin(a.v), d: Math.cos(a.v) * a.d }),
  cos: (a) => ({ v: Math.cos(a.v), d: -Math.sin(a.v) * a.d }),
  tan: (a) => ({ v: Math.tan(a.v), d: a.d / Math.cos(a.v) ** 2 }),
  sec: (a) => ({ v: 1 / Math.cos(a.v), d: (Math.tan(a.v) / Math.cos(a.v)) * a.d }),
  csc: (a) => ({ v: 1 / Math.sin(a.v), d: (-1 / (Math.sin(a.v) * Math.tan(a.v))) * a.d }),
  cot: (a) => ({ v: 1 / Math.tan(a.v), d: -a.d / Math.sin(a.v) ** 2 }),
  arcsin: (a) => ({ v: Math.asin(a.v), d: a.d / Math.sqrt(1 - a.v * a.v) }),
  arccos: (a) => ({ v: Math.acos(a.v), d: -a.d / Math.sqrt(1 - a.v * a.v) }),
  arctan: (a) => ({ v: Math.atan(a.v), d: a.d / (1 + a.v * a.v) }),
  sinh: (a) => ({ v: Math.sinh(a.v), d: Math.cosh(a.v) * a.d }),
  cosh: (a) => ({ v: Math.cosh(a.v), d: Math.sinh(a.v) * a.d }),
  tanh: (a) => ({ v: Math.tanh(a.v), d: (1 - Math.tanh(a.v) ** 2) * a.d }),
  ln: (a) => ({ v: a.v > 0 ? Math.log(a.v) : Number.NaN, d: a.d / a.v }),
  exp: (a) => ({ v: Math.exp(a.v), d: Math.exp(a.v) * a.d }),
};

const SIMPSON_INTERVALS = 200;

function simpson(f: (s: number) => number, from: number, to: number): number {
  if (from === to) return 0;
  const h = (to - from) / SIMPSON_INTERVALS;
  let sum = f(from) + f(to);
  for (let i = 1; i < SIMPSON_INTERVALS; i++) sum += (i % 2 === 1 ? 4 : 2) * f(from + i * h);
  return (sum * h) / 3;
}

/** Evaluates `node` at main-variable value `x`, returning the value and its derivative with respect to x. */
export function evaluate(node: ExprNode, x: number, ctx: EvalContext, overrides: Record<string, Dual> = {}): Dual {
  const ev = (n: ExprNode) => evaluate(n, x, ctx, overrides);
  switch (node.k) {
    case 'num':
      return constant(node.v);
    case 'sym': {
      if (node.name in overrides) return overrides[node.name] as Dual;
      if (node.name === ctx.variable) return { v: x, d: 1 };
      if (node.name in ctx.constants) return constant(ctx.constants[node.name] as number);
      const definition = ctx.definitions[node.name];
      if (definition) return evaluate(definition, x, ctx);
      if (node.name === 'e') return constant(Math.E);
      if (node.name === 'π') return constant(Math.PI);
      if (node.name === 'C' || node.name === 'K') return constant(0);
      throw new UnknownSymbolError(node.name);
    }
    case 'add': {
      const a = ev(node.a);
      const b = ev(node.b);
      return { v: a.v + b.v, d: a.d + b.d };
    }
    case 'sub': {
      const a = ev(node.a);
      const b = ev(node.b);
      return { v: a.v - b.v, d: a.d - b.d };
    }
    case 'mul': {
      const a = ev(node.a);
      const b = ev(node.b);
      return { v: a.v * b.v, d: a.d * b.v + a.v * b.d };
    }
    case 'div': {
      const a = ev(node.a);
      const b = ev(node.b);
      return { v: a.v / b.v, d: (a.d * b.v - a.v * b.d) / (b.v * b.v) };
    }
    case 'pow':
      return pow(ev(node.a), ev(node.b));
    case 'neg': {
      const a = ev(node.a);
      return { v: -a.v, d: -a.d };
    }
    case 'fn': {
      const value = FUNCTIONS[node.name](ev(node.arg));
      return node.power ? pow(value, ev(node.power)) : value;
    }
    case 'abs': {
      const a = ev(node.a);
      return { v: Math.abs(a.v), d: Math.sign(a.v) * a.d };
    }
    case 'sqrt': {
      const a = ev(node.a);
      const v = a.v >= 0 ? Math.sqrt(a.v) : Number.NaN;
      return { v, d: a.d / (2 * v) };
    }
    case 'int':
      return integral(node.body, node.v, x, ctx);
    case 'diff':
      throw new UnknownSymbolError(`d${node.v}`);
  }
}

/** ∫ body d(v) as a function of the main variable: derivative exact, value by Simpson's rule. */
function integral(body: ExprNode, v: string, x: number, ctx: EvalContext): Dual {
  // The integrand written in terms of the main variable, at s.
  const integrandAt = (s: number): number => {
    if (v === ctx.variable) return evaluate(body, s, ctx).v;
    const definition = ctx.definitions[v];
    if (!definition) throw new UnknownSymbolError(v);
    const inner = evaluate(definition, s, ctx);
    return evaluate(body, s, ctx, { [v]: constant(inner.v) }).v * inner.d;
  };
  return { v: simpson(integrandAt, ctx.base, x), d: integrandAt(x) };
}
