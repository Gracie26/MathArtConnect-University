/**
 * Parser for mathematics typed by learners (plain text, not TeX).
 *
 * It builds an expression tree; nothing is executed. Only a fixed set of
 * functions and symbols is recognised, and anything else is reported as a
 * friendly ParseError. Supported, for example:
 *
 *   (3x+5)^6/18 + C      sin 2x      sin^2 x      tan^-1(x)   arctan(x)
 *   ln|x+1|              sqrt(x)     √x           e^(3x)      x^(1/3)
 *   ∫ u^5 du             int (x+1) dx               u = 3x+5    du = 3 dx
 *
 * Conventions: a function applies to a bracket, or to a number and the
 * letters that follow it ("sin 2x" is sin(2x)); single letters multiply
 * ("ax" is a·x); "d" followed by a variable is a differential (dx, du, dθ).
 */

export type ExprNode =
  /** `differential` marks the factor 1 left where "dx" stood inside an integral. */
  | { k: 'num'; v: number; differential?: boolean }
  | { k: 'sym'; name: string }
  | { k: 'add'; a: ExprNode; b: ExprNode }
  | { k: 'sub'; a: ExprNode; b: ExprNode }
  | { k: 'mul'; a: ExprNode; b: ExprNode; implicit?: boolean }
  | { k: 'div'; a: ExprNode; b: ExprNode }
  | { k: 'pow'; a: ExprNode; b: ExprNode }
  | { k: 'neg'; a: ExprNode }
  | { k: 'fn'; name: FunctionName; arg: ExprNode; power?: ExprNode }
  | { k: 'abs'; a: ExprNode }
  | { k: 'sqrt'; a: ExprNode }
  | { k: 'int'; body: ExprNode; v: string }
  | { k: 'diff'; v: string };

/** A learner line: one expression, or a chain of equal expressions. */
export type Statement = { k: 'expr'; node: ExprNode } | { k: 'eq'; sides: ExprNode[] };

export const FUNCTION_NAMES = [
  'sin',
  'cos',
  'tan',
  'sec',
  'csc',
  'cot',
  'arcsin',
  'arccos',
  'arctan',
  'sinh',
  'cosh',
  'tanh',
  'ln',
  'exp',
] as const;
export type FunctionName = (typeof FUNCTION_NAMES)[number];

const ALIASES: Record<string, FunctionName | 'sqrt'> = {
  sin: 'sin',
  cos: 'cos',
  tan: 'tan',
  sec: 'sec',
  csc: 'csc',
  cosec: 'csc',
  cot: 'cot',
  arcsin: 'arcsin',
  asin: 'arcsin',
  arccos: 'arccos',
  acos: 'arccos',
  arctan: 'arctan',
  atan: 'arctan',
  sinh: 'sinh',
  cosh: 'cosh',
  tanh: 'tanh',
  ln: 'ln',
  log: 'ln',
  exp: 'exp',
  sqrt: 'sqrt',
};

/** Words read as single Greek symbols. */
const WORD_SYMBOLS: Record<string, string> = {
  pi: 'π',
  theta: 'θ',
  alpha: 'α',
  beta: 'β',
  mu: 'μ',
  lambda: 'λ',
  gamma: 'γ',
};

/** Letters that may follow "d" to form a differential. */
const DIFFERENTIAL_VARIABLES = new Set(['x', 'u', 't', 'v', 'w', 'y', 'z', 's', 'θ']);

const SUPERSCRIPTS: Record<string, string> = { '²': '2', '³': '3', '⁴': '4' };

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

type Token =
  | { t: 'num'; v: number }
  | { t: 'sym'; name: string }
  | { t: 'fn'; name: FunctionName | 'sqrt' }
  | { t: 'diff'; v: string }
  | { t: 'int' }
  | { t: 'op'; v: string };

/**
 * Capitalised trigonometric, exponential and root names ("Sin x", "COS x") as typed on some keyboards.
 * Only a whole name after a non-letter is changed, so "Asin x" stays A·sin x. Ln and Log are left alone
 * because Lₙ is also the left Riemann sum.
 */
const CAPITALISED_FUNCTION =
  /(^|[^A-Za-z])(Arcsin|Arccos|Arctan|Sinh|Cosh|Tanh|Sin|Cos|Tan|Sec|Csc|Cot|Exp|Sqrt|ARCSIN|ARCCOS|ARCTAN|SINH|COSH|TANH|SIN|COS|TAN|SEC|CSC|COT|EXP|SQRT)(?![A-Z])/g;

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const text = input
    .replace(/\*\*/g, '^')
    .replace(CAPITALISED_FUNCTION, (_, before: string, name: string) => before + name.toLowerCase());
  let i = 0;
  while (i < text.length) {
    const ch = text.charAt(i);
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      const match = /^(\d+\.?\d*|\.\d+)/.exec(text.slice(i));
      if (!match) throw new ParseError(`I can't read the number near "${text.slice(i, i + 4)}".`);
      tokens.push({ t: 'num', v: Number(match[0]) });
      i += match[0].length;
      continue;
    }
    if (SUPERSCRIPTS[ch]) {
      tokens.push({ t: 'op', v: '^' }, { t: 'num', v: Number(SUPERSCRIPTS[ch]) });
      i++;
      continue;
    }
    if (ch === '∫') {
      tokens.push({ t: 'int' });
      i++;
      continue;
    }
    if (ch === '√') {
      tokens.push({ t: 'fn', name: 'sqrt' });
      i++;
      continue;
    }
    // Δx is one symbol (the width of a subinterval).
    if (ch === 'Δ' && /[A-Za-z]/.test(text.charAt(i + 1))) {
      tokens.push({ t: 'sym', name: `Δ${text.charAt(i + 1)}` });
      i += 2;
      continue;
    }
    // A subscript names one symbol: x_i, x_0, x_{i-1}.
    if (ch === '_') {
      const previous = tokens[tokens.length - 1];
      const match = /^_(\{([^{}]*)\}|[A-Za-z0-9]+)/.exec(text.slice(i));
      if (previous?.t !== 'sym' || !match) throw new ParseError('Write a subscript after a letter, for example x_i.');
      const subscript = (match[2] ?? match[1] ?? '').replace(/\s+/g, '').replace(/[−–]/g, '-');
      tokens[tokens.length - 1] = { t: 'sym', name: `${previous.name}_${subscript}` };
      i += match[0].length;
      continue;
    }
    if (/[A-Za-zθπαβμλγ]/.test(ch)) {
      const word = /^[A-Za-zθπαβμλγ]+/.exec(text.slice(i))?.[0] ?? ch;
      i += word.length;
      tokens.push(...splitWord(word));
      continue;
    }
    const op = ch === '−' || ch === '–' ? '-' : ch === '×' || ch === '·' ? '*' : ch === '÷' ? '/' : ch;
    if (!'+-*/^()[]|=,'.includes(op)) throw new ParseError(`I don't recognise the symbol "${ch}".`);
    tokens.push({ t: 'op', v: op === '[' ? '(' : op === ']' ? ')' : op });
    i++;
  }
  return mergeDifferentials(tokens);
}

/** Splits a run of letters into function names, Greek words, differentials and single letters. */
function splitWord(word: string): Token[] {
  const tokens: Token[] = [];
  let rest = word;
  while (rest.length > 0) {
    if (rest === 'int' || (rest.startsWith('int') && !rest.startsWith('inte'))) {
      tokens.push({ t: 'int' });
      rest = rest.slice(3);
      continue;
    }
    const fn = Object.keys(ALIASES)
      .sort((a, b) => b.length - a.length)
      .find((name) => rest.startsWith(name));
    if (fn) {
      tokens.push({ t: 'fn', name: ALIASES[fn] as FunctionName | 'sqrt' });
      rest = rest.slice(fn.length);
      continue;
    }
    const greek = Object.keys(WORD_SYMBOLS).find((name) => rest.startsWith(name));
    if (greek) {
      tokens.push({ t: 'sym', name: WORD_SYMBOLS[greek] as string });
      rest = rest.slice(greek.length);
      continue;
    }
    const letter = rest.charAt(0);
    const nextLetter = rest.charAt(1);
    if (letter === 'd' && DIFFERENTIAL_VARIABLES.has(nextLetter)) {
      tokens.push({ t: 'diff', v: nextLetter });
      rest = rest.slice(2);
      continue;
    }
    tokens.push({ t: 'sym', name: letter });
    rest = rest.slice(1);
  }
  return tokens;
}

/** "d" followed by a variable (dθ, "d theta", "d x") is a differential. */
function mergeDifferentials(tokens: Token[]): Token[] {
  const merged: Token[] = [];
  for (const token of tokens) {
    const previous = merged[merged.length - 1];
    if (token.t === 'sym' && DIFFERENTIAL_VARIABLES.has(token.name) && previous?.t === 'sym' && previous.name === 'd') {
      merged[merged.length - 1] = { t: 'diff', v: token.name };
    } else {
      merged.push(token);
    }
  }
  return merged;
}

const isDifferentialMarker = (node: ExprNode) => node.k === 'num' && node.differential === true;

/** a·b, dropping the factor 1 that stands for a differential. */
function multiply(a: ExprNode, b: ExprNode, implicit: boolean): ExprNode {
  if (isDifferentialMarker(b)) return a;
  if (isDifferentialMarker(a)) return b;
  return implicit ? { k: 'mul', a, b, implicit: true } : { k: 'mul', a, b };
}

class Parser {
  private pos = 0;
  /** Depth of open |…| groups, so a bar can be read as opening or closing. */
  private absDepth = 0;
  /** Differential found while parsing the current integral body. */
  private diffStack: (string | null)[] = [];

  constructor(private readonly tokens: Token[]) {}

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private isOp(token: Token | undefined, v: string): boolean {
    return token?.t === 'op' && token.v === v;
  }

  statement(): Statement {
    if (this.tokens.length === 0) throw new ParseError('Type a step first.');
    const sides = [this.sum()];
    while (this.isOp(this.peek(), '=')) {
      this.pos++;
      if (!this.peek()) throw new ParseError('Something is missing after "=".');
      sides.push(this.sum());
    }
    const extra = this.peek();
    if (extra) {
      throw new ParseError(
        this.isOp(extra, ')') ? 'There is a ")" without a matching "(".' : 'I could not read the whole line.',
      );
    }
    return sides.length === 1 ? { k: 'expr', node: sides[0] as ExprNode } : { k: 'eq', sides };
  }

  private insideIntegral(): boolean {
    return this.diffStack.length > 0;
  }

  private sum(): ExprNode {
    let node = this.product();
    for (;;) {
      // Inside an integral, the body ends at the first + or − after its differential.
      if (this.insideIntegral() && this.diffStack[this.diffStack.length - 1] !== null) return node;
      const next = this.peek();
      if (this.isOp(next, '+')) {
        this.pos++;
        node = { k: 'add', a: node, b: this.product() };
      } else if (this.isOp(next, '-')) {
        this.pos++;
        node = { k: 'sub', a: node, b: this.product() };
      } else {
        return node;
      }
    }
  }

  private startsOperand(token: Token | undefined): boolean {
    if (!token) return false;
    if (token.t === 'op') return token.v === '(' || (token.v === '|' && this.absDepth === 0);
    return true;
  }

  private product(): ExprNode {
    let node = this.unary();
    for (;;) {
      const next = this.peek();
      if (this.isOp(next, '*')) {
        this.pos++;
        node = multiply(node, this.unary(), false);
      } else if (this.isOp(next, '/')) {
        this.pos++;
        node = { k: 'div', a: node, b: this.unary() };
      } else if (this.startsOperand(next) && !(next?.t === 'int' && this.insideIntegral())) {
        node = multiply(node, this.unary(), true);
      } else {
        return node;
      }
    }
  }

  private unary(): ExprNode {
    const next = this.peek();
    if (this.isOp(next, '-')) {
      this.pos++;
      return { k: 'neg', a: this.unary() };
    }
    if (this.isOp(next, '+')) {
      this.pos++;
      return this.unary();
    }
    return this.power();
  }

  private power(): ExprNode {
    const base = this.primary();
    if (this.isOp(this.peek(), '^')) {
      this.pos++;
      // Right-associative; the exponent may carry its own sign: x^-2.
      const exponent = this.isOp(this.peek(), '-')
        ? (this.pos++, { k: 'neg', a: this.power() } as ExprNode)
        : this.power();
      return { k: 'pow', a: base, b: exponent };
    }
    return base;
  }

  private group(): ExprNode {
    const inner = this.withoutIntegralContext(() => this.sum());
    if (!this.isOp(this.peek(), ')')) throw new ParseError('A "(" is not closed.');
    this.pos++;
    return inner;
  }

  /** Brackets and bars start a fresh context: "+" inside them never ends an integral body. */
  private withoutIntegralContext<T>(read: () => T): T {
    const saved = this.diffStack;
    this.diffStack = [];
    try {
      return read();
    } finally {
      this.diffStack = saved;
    }
  }

  private primary(): ExprNode {
    const token = this.peek();
    if (!token) throw new ParseError('Something is missing at the end.');
    this.pos++;
    switch (token.t) {
      case 'num':
        return { k: 'num', v: token.v };
      case 'sym':
        if (token.name === 'd') throw new ParseError('Write a differential as dx, du, dt or dθ.');
        return { k: 'sym', name: token.name };
      case 'diff': {
        if (!this.insideIntegral()) return { k: 'diff', v: token.v };
        this.diffStack[this.diffStack.length - 1] = token.v;
        return { k: 'num', v: 1, differential: true };
      }
      case 'int':
        return this.integral();
      case 'fn':
        return this.application(token.name);
      case 'op':
        if (token.v === '(') return this.group();
        if (token.v === '|') {
          this.absDepth++;
          const inner = this.withoutIntegralContext(() => this.sum());
          this.absDepth--;
          if (!this.isOp(this.peek(), '|')) throw new ParseError('A "|" is not closed.');
          this.pos++;
          return { k: 'abs', a: inner };
        }
        throw new ParseError(`"${token.v}" is in an unexpected place.`);
    }
  }

  private integral(): ExprNode {
    this.diffStack.push(null);
    const body = this.sum();
    const v = this.diffStack.pop();
    if (!v) throw new ParseError('Add the differential at the end of the integral, for example dx.');
    return { k: 'int', body, v };
  }

  /** sin x, sin 2x, sin^2 x, tan^-1(x), ln|x|, sqrt(x), √x … */
  private application(name: FunctionName | 'sqrt'): ExprNode {
    let power: ExprNode | undefined;
    if (this.isOp(this.peek(), '^')) {
      this.pos++;
      const negative = this.isOp(this.peek(), '-');
      if (negative) this.pos++;
      const exponent = this.primary();
      power = negative ? { k: 'neg', a: exponent } : exponent;
    }
    const arg = this.argument();
    if (name === 'sqrt') {
      if (power) throw new ParseError('Write a power of a root as (√x)^n.');
      return { k: 'sqrt', a: arg };
    }
    const inverse = power?.k === 'neg' && power.a.k === 'num' && power.a.v === 1;
    if (inverse) {
      const inverseName = ({ sin: 'arcsin', cos: 'arccos', tan: 'arctan' } as const)[name as 'sin' | 'cos' | 'tan'];
      if (!inverseName)
        throw new ParseError(`Use 1/${name}(…) for a reciprocal; "^-1" means an inverse only for sin, cos and tan.`);
      return { k: 'fn', name: inverseName, arg };
    }
    return power ? { k: 'fn', name, arg, power } : { k: 'fn', name, arg };
  }

  private argument(): ExprNode {
    const next = this.peek();
    // A bracketed argument ends at its bracket, so sin(x)^2 means (sin x)²: the power applies to the function.
    if (this.isOp(next, '(') || this.isOp(next, '|')) return this.primary();
    if (!next || next.t === 'op' || next.t === 'diff')
      throw new ParseError('A function needs something to act on, for example sin(x).');
    // A number coefficient and the letters after it: sin 2x, cos px, ln x, sin x^3.
    let node: ExprNode | undefined;
    while (this.peek()?.t === 'num') {
      const value = { k: 'num', v: (this.tokens[this.pos++] as { v: number }).v } as ExprNode;
      node = node ? { k: 'mul', a: node, b: value, implicit: true } : value;
    }
    while (this.peek()?.t === 'sym' && (this.peek() as { name: string }).name !== 'e') {
      const letter = this.power();
      node = node ? { k: 'mul', a: node, b: letter, implicit: true } : letter;
    }
    if (!node) {
      if (this.peek()?.t === 'fn' || this.peek()?.t === 'sym') return this.power();
      throw new ParseError('A function needs something to act on, for example sin(x).');
    }
    return node;
  }
}

/** Parses one line of learner working. Throws ParseError with a learner-friendly message. */
export function parseStatement(input: string): Statement {
  return new Parser(tokenize(input)).statement();
}

/** All symbol names used in a tree (variables and constants). */
export function symbolsOf(node: ExprNode, into: Set<string> = new Set()): Set<string> {
  switch (node.k) {
    case 'sym':
      into.add(node.name);
      break;
    case 'num':
    case 'diff':
      break;
    case 'neg':
    case 'abs':
    case 'sqrt':
      symbolsOf(node.a, into);
      break;
    case 'fn':
      symbolsOf(node.arg, into);
      if (node.power) symbolsOf(node.power, into);
      break;
    case 'int':
      symbolsOf(node.body, into);
      into.add(node.v);
      break;
    default:
      symbolsOf(node.a, into);
      symbolsOf(node.b, into);
  }
  return into;
}

export function containsIntegral(node: ExprNode): boolean {
  switch (node.k) {
    case 'int':
      return true;
    case 'num':
    case 'sym':
    case 'diff':
      return false;
    case 'neg':
    case 'abs':
    case 'sqrt':
      return containsIntegral(node.a);
    case 'fn':
      return containsIntegral(node.arg) || (node.power ? containsIntegral(node.power) : false);
    default:
      return containsIntegral(node.a) || containsIntegral(node.b);
  }
}
