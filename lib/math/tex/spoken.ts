import type { MathNode } from './parse';
import { parseTex } from './parse';

/**
 * Screen-reader text for a formula, e.g.
 *   \int x^{6}\,dx = \frac{x^{7}}{7} + C
 *   → "integral of x to the power 6, d x, equals x to the power 7 over 7, plus C"
 */

const FUNCTION_NAMES: Record<string, string> = {
  sin: 'sine',
  cos: 'cosine',
  tan: 'tangent',
  sec: 'secant',
  csc: 'cosecant',
  cot: 'cotangent',
  sinh: 'hyperbolic sine',
  cosh: 'hyperbolic cosine',
  tanh: 'hyperbolic tangent',
  arcsin: 'arc sine',
  arccos: 'arc cosine',
  arctan: 'arc tangent',
  ln: 'natural log',
  log: 'log',
  exp: 'exponential',
  lim: 'limit',
};

const OPERATOR_WORDS: Record<string, string> = {
  '+': 'plus',
  '−': 'minus',
  '=': 'equals',
  '±': 'plus or minus',
  '∓': 'minus or plus',
  '·': 'times',
  '×': 'times',
  '÷': 'divided by',
  '/': 'over',
  '≠': 'is not equal to',
  '≤': 'is less than or equal to',
  '≥': 'is greater than or equal to',
  '<': 'is less than',
  '>': 'is greater than',
  '≈': 'is approximately',
  '→': 'tends to',
  '⇒': 'implies',
  '⇔': 'if and only if',
  '(': 'open bracket',
  ')': 'close bracket',
  '[': 'open bracket',
  ']': 'close bracket',
  '|': 'absolute value bar',
  ',': 'comma',
  '′': 'prime',
  '∞': 'infinity',
  '…': 'and so on',
  '⋯': 'and so on',
  '!': 'factorial',
  '∗': 'star',
  '∈': 'in',
  '∇': 'del',
  '{': '',
  '}': '',
  '': '',
};

const GREEK_WORDS: Record<string, string> = {
  α: 'alpha',
  β: 'beta',
  γ: 'gamma',
  δ: 'delta',
  ε: 'epsilon',
  θ: 'theta',
  λ: 'lambda',
  μ: 'mu',
  π: 'pi',
  σ: 'sigma',
  φ: 'phi',
  ω: 'omega',
  Δ: 'Delta',
};

function isSimple(node: MathNode): boolean {
  if (node.kind === 'row') return node.children.length === 1 && isSimple(node.children[0] as MathNode);
  return node.kind === 'ident' || node.kind === 'number';
}

function textOf(node: MathNode): string {
  if (node.kind === 'row') return node.children.map(textOf).join('');
  if (node.kind === 'number' || node.kind === 'ident' || node.kind === 'op') return node.text;
  return '';
}

function power(base: string, sup: MathNode): string {
  const exponent = textOf(sup);
  if (exponent === '2') return `${base} squared`;
  if (exponent === '3') return `${base} cubed`;
  return isSimple(sup) ? `${base} to the power ${speak(sup)}` : `${base} to the power ${speak(sup)}, end power`;
}

/** The spoken name of a large operator: ∑ is a sum, ∬ and ∭ are double and triple integrals. */
const opWord = (node: MathNode): string =>
  node.kind === 'largeop' && node.text === '∬'
    ? 'double integral'
    : node.kind === 'largeop' && node.text === '∭'
      ? 'triple integral'
      : 'sum';

export function speak(node: MathNode): string {
  switch (node.kind) {
    case 'row':
      return node.children
        .map(speak)
        .filter((part) => part.length > 0)
        .join(' ')
        .replace(/\s+,/g, ',');
    case 'ident':
      return GREEK_WORDS[node.text] ?? node.text;
    case 'number':
      return node.text;
    case 'op':
      return OPERATOR_WORDS[node.text] ?? node.text;
    case 'fn':
      return FUNCTION_NAMES[node.name] ?? node.name;
    case 'text':
      return node.text;
    case 'space':
      return '';
    case 'integral':
      return 'integral of';
    case 'largeop':
      return `${opWord(node)} of`;
    case 'bar':
      return `${speak(node.body)} bar`;
    case 'under':
      return `${speak(node.body)}, labelled ${speak(node.label)},`;
    case 'bold':
      return speak(node.body);
    case 'matrix': {
      const rows = node.rows.map((row) => row.map(speak).join(', ')).join('; next row, ');
      return `${node.delimiter === 'bars' ? 'determinant' : 'matrix'} with rows ${rows}, end ${node.delimiter === 'bars' ? 'determinant' : 'matrix'}`;
    }
    case 'sup': {
      if (node.base.kind === 'fn' && textOf(node.sup) === '−1') return `inverse ${speak(node.base)}`;
      if (node.base.kind === 'integral') return `integral up to ${speak(node.sup)} of`;
      if (node.base.kind === 'largeop') return `${opWord(node.base)} up to ${speak(node.sup)} of`;
      if (node.sup.kind === 'op' && node.sup.text === '∗') return `${speak(node.base)} star`;
      return power(speak(node.base), node.sup);
    }
    case 'sub':
      if (node.base.kind === 'integral') return `integral from ${speak(node.sub)} of`;
      if (node.base.kind === 'largeop') return `${opWord(node.base)} over ${speak(node.sub)} of`;
      if (node.base.kind === 'fn' && node.base.name === 'lim') return `limit as ${speak(node.sub)} of`;
      return `${speak(node.base)} sub ${speak(node.sub)}`;
    case 'subsup':
      if (node.base.kind === 'integral') return `integral from ${speak(node.sub)} to ${speak(node.sup)} of`;
      if (node.base.kind === 'largeop') return `${opWord(node.base)} from ${speak(node.sub)} to ${speak(node.sup)} of`;
      if (node.sup.kind === 'op' && node.sup.text === '∗') return `${speak(node.base)} sub ${speak(node.sub)} star`;
      return power(`${speak(node.base)} sub ${speak(node.sub)}`, node.sup);
    case 'frac':
      return isSimple(node.num) && isSimple(node.den)
        ? `${speak(node.num)} over ${speak(node.den)}`
        : `fraction, ${speak(node.num)}, over ${speak(node.den)}, end fraction`;
    case 'sqrt': {
      const index = node.index ? textOf(node.index) : '';
      const root = index === '3' ? 'cube root' : index ? `root ${index}` : 'square root';
      return isSimple(node.body) ? `${root} of ${speak(node.body)}` : `${root} of ${speak(node.body)}, end root`;
    }
  }
}

/** Spoken form of a TeX string; falls back to the raw text if it cannot be parsed. */
export function speakTex(tex: string): string {
  try {
    return speak(parseTex(tex)).replace(/\s+/g, ' ').trim();
  } catch {
    return tex;
  }
}
