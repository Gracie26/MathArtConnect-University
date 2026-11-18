/**
 * Prints a learner expression tree as TeX for the live preview, so the
 * learner can see exactly how their input was read (e.g. "sin 2x" shows as
 * sin(2x), "e^3x" as e³x).
 */
import type { ExprNode, Statement } from './parse';

const GREEK: Record<string, string> = {
  π: '\\pi',
  θ: '\\theta',
  α: '\\alpha',
  β: '\\beta',
  μ: '\\mu',
  λ: '\\lambda',
  γ: '\\gamma',
};

const FUNCTION_TEX: Record<string, string> = {
  arcsin: '\\sin^{-1}',
  arccos: '\\cos^{-1}',
  arctan: '\\tan^{-1}',
};

/** Binding strength: higher binds tighter. */
function precedence(node: ExprNode): number {
  switch (node.k) {
    case 'add':
    case 'sub':
      return 1;
    case 'neg':
      return 2;
    case 'mul':
    case 'div':
      return 3;
    case 'pow':
      return 4;
    default:
      return 5;
  }
}

const paren = (tex: string) => `\\left(${tex}\\right)`;

function wrap(node: ExprNode, minimum: number): string {
  const tex = toTex(node);
  return precedence(node) < minimum ? paren(tex) : tex;
}

/** "x_i-1" → x_{i-1}; "Δx" → \Delta x. */
function symbolTex(name: string): string {
  if (GREEK[name]) return GREEK[name];
  const [base = '', subscript] = name.split('_');
  const head = base.startsWith('Δ') ? `\\Delta ${base.slice(1)}` : (GREEK[base] ?? base);
  return subscript === undefined ? head : `${head}_{${subscript.replace(/-/g, '−')}}`;
}

function startsWithDigit(tex: string): boolean {
  return /^[0-9.]/.test(tex);
}

export function toTex(node: ExprNode): string {
  switch (node.k) {
    case 'num':
      return String(node.v);
    case 'sym':
      return symbolTex(node.name);
    case 'add':
      return `${toTex(node.a)} + ${wrap(node.b, 2)}`;
    case 'sub':
      return `${toTex(node.a)} - ${wrap(node.b, 2)}`;
    case 'neg':
      return `-${wrap(node.a, 3)}`;
    case 'mul': {
      // −4 dx reads as "−4 dx", not "(−4) dx".
      if (node.a.k === 'neg') return `-${toTex({ ...node, a: node.a.a })}`;
      const left = wrap(node.a, 3);
      const right = wrap(node.b, 3);
      // Show a dot between two numbers, or when the reading would otherwise be unclear.
      const needsDot = !node.implicit || startsWithDigit(right);
      if (needsDot) return `${left} \\cdot ${right}`;
      // A command such as \theta or \pi must not run into the next letter (θr is "\theta r", not "\thetar").
      return /\\[A-Za-z]+$/.test(left) && /^[A-Za-z]/.test(right) ? `${left} ${right}` : `${left}${right}`;
    }
    case 'div':
      return `\\frac{${toTex(node.a)}}{${toTex(node.b)}}`;
    case 'pow': {
      const base = node.a.k === 'fn' || precedence(node.a) < 5 ? paren(toTex(node.a)) : toTex(node.a);
      return `${base}^{${toTex(node.b)}}`;
    }
    case 'fn': {
      const name = FUNCTION_TEX[node.name] ?? `\\${node.name}`;
      const head = node.power ? `${name}^{${toTex(node.power)}}` : name;
      return `${head}${paren(toTex(node.arg))}`;
    }
    case 'abs':
      return `\\left|${toTex(node.a)}\\right|`;
    case 'sqrt':
      return `\\sqrt{${toTex(node.a)}}`;
    case 'int':
      return `\\int ${wrap(node.body, 2)}\\,d${symbolTex(node.v)}`;
    case 'diff':
      return `d${symbolTex(node.v)}`;
  }
}

export function statementToTex(statement: Statement): string {
  return statement.k === 'expr' ? toTex(statement.node) : statement.sides.map(toTex).join(' = ');
}
