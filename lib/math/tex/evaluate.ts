/**
 * Numeric evaluator for the TeX subset used in lesson content.
 *
 * The answer checker uses it to evaluate a practice question's integrand
 * straight from the displayed formula, and tests use it to check that every
 * stored answer is an anti-derivative of its integrand. It walks the layout tree from lib/math/tex
 * (no eval, no new Function) and throws on anything it does not understand,
 * so a check can never pass by accident.
 *
 * Conventions (followed by the content): a function applies to a
 * parenthesised group, an |…| group, or a numeric coefficient followed by a
 * run of letters (e.g. \sin 10x, \cos px, \tan\frac{x}{2}, \sin x^{3}); the
 * letter e is Euler's number; C and K (constants of integration) are 0.
 */
import { type MathNode, parseTex } from './parse';

export type Vars = Record<string, number>;

const INVERSE: Record<string, (v: number) => number> = { sin: Math.asin, cos: Math.acos, tan: Math.atan };
const FUNCTIONS: Record<string, (v: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  sec: (v) => 1 / Math.cos(v),
  csc: (v) => 1 / Math.sin(v),
  cot: (v) => 1 / Math.tan(v),
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  ln: Math.log,
  exp: Math.exp,
};

const flatten = (node: MathNode): MathNode[] =>
  (node.kind === 'row' ? node.children : [node]).filter((n) => n.kind !== 'space');

const isOp = (node: MathNode | undefined, text: string): boolean => node?.kind === 'op' && node.text === text;

/** A closing delimiter, possibly carrying an exponent, e.g. ")" or ")^{2}". */
function closing(node: MathNode | undefined, text: string): { exponent?: MathNode } | null {
  if (isOp(node, text)) return {};
  if (node?.kind === 'sup' && isOp(node.base, text)) return { exponent: node.sup };
  return null;
}

const isLetter = (node: MathNode | undefined): boolean =>
  (node?.kind === 'ident' && node.text !== 'e' && node.text !== 'π') ||
  (node?.kind === 'sup' && node.base.kind === 'ident' && node.base.text !== 'e' && node.base.text !== 'π');

const isNumeric = (node: MathNode): boolean =>
  node.kind === 'number' ||
  (node.kind === 'row' && node.children.every(isNumeric)) ||
  (node.kind === 'frac' && isNumeric(node.num) && isNumeric(node.den));

const isFunction = (node: MathNode | undefined): boolean =>
  node?.kind === 'fn' || (node?.kind === 'sup' && node.base.kind === 'fn');

class Evaluator {
  private pos = 0;
  private readonly items: MathNode[];

  constructor(
    node: MathNode,
    private readonly vars: Vars,
  ) {
    this.items = flatten(node);
  }

  run(): number {
    const value = this.expression();
    if (this.pos < this.items.length) throw new Error(`Unexpected ${JSON.stringify(this.items[this.pos])}`);
    return value;
  }

  private peek(): MathNode | undefined {
    return this.items[this.pos];
  }

  private sub(node: MathNode): number {
    return new Evaluator(node, this.vars).run();
  }

  private expression(): number {
    let value = this.term();
    for (;;) {
      const next = this.peek();
      if (isOp(next, '+')) {
        this.pos++;
        value += this.term();
      } else if (isOp(next, '−')) {
        this.pos++;
        value -= this.term();
      } else {
        return value;
      }
    }
  }

  private startsFactor(node: MathNode | undefined): boolean {
    if (!node) return false;
    if (node.kind === 'op') return node.text === '(' || node.text === '[';
    return ['number', 'ident', 'frac', 'sqrt', 'fn', 'sup', 'row'].includes(node.kind);
  }

  private term(): number {
    let value = this.unary();
    for (;;) {
      const next = this.peek();
      if (isOp(next, '·') || isOp(next, '×')) {
        this.pos++;
        value *= this.unary();
      } else if (isOp(next, '/')) {
        this.pos++;
        value /= this.unary();
      } else if (this.startsFactor(next)) {
        value *= this.unary();
      } else {
        return value;
      }
    }
  }

  private unary(): number {
    const next = this.peek();
    if (isOp(next, '−')) {
      this.pos++;
      return -this.unary();
    }
    if (isOp(next, '+')) {
      this.pos++;
      return this.unary();
    }
    return this.primary();
  }

  /** A bracketed group "( … )", "[ … ]" or "| … |", with any exponent on the closing delimiter. */
  private group(open: string): number {
    const close = open === '(' ? ')' : open === '[' ? ']' : '|';
    const start = this.pos;
    let depth = 0;
    for (let i = start; i < this.items.length; i++) {
      const node = this.items[i];
      if (open !== '|' && isOp(node, open)) depth++;
      const end = closing(node, close);
      if (end) {
        if (depth === 0) {
          const inner = new Evaluator({ kind: 'row', children: this.items.slice(start, i) }, this.vars).run();
          this.pos = i + 1;
          const value = open === '|' ? Math.abs(inner) : inner;
          return end.exponent ? Math.pow(value, this.sub(end.exponent)) : value;
        }
        depth--;
      }
    }
    throw new Error(`Unclosed "${open}"`);
  }

  private primary(): number {
    const node = this.peek();
    if (!node) throw new Error('Unexpected end of expression');
    if (isOp(node, '(') || isOp(node, '[') || isOp(node, '|')) {
      this.pos++;
      return this.group((node as { text: string }).text);
    }
    if (isFunction(node)) return this.application();
    this.pos++;
    return this.atom(node);
  }

  private atom(node: MathNode): number {
    switch (node.kind) {
      case 'number':
        return Number(node.text);
      case 'ident':
        return this.identifier(node.text);
      case 'row':
        return this.sub(node);
      case 'frac':
        return this.sub(node.num) / this.sub(node.den);
      case 'sqrt': {
        const body = this.sub(node.body);
        if (!node.index) return Math.sqrt(body);
        const n = this.sub(node.index);
        return body < 0 && n % 2 === 1 ? -Math.pow(-body, 1 / n) : Math.pow(body, 1 / n);
      }
      case 'sup':
        if (node.base.kind === 'ident' && node.base.text === 'e' && !('e' in this.vars))
          return Math.exp(this.sub(node.sup));
        return Math.pow(this.atom(node.base), this.sub(node.sup));
      default:
        throw new Error(`Cannot evaluate ${node.kind}`);
    }
  }

  private identifier(name: string): number {
    if (name in this.vars) return this.vars[name] as number;
    if (name === 'π') return Math.PI;
    if (name === 'e') return Math.E;
    if (name === 'C' || name === 'K') return 0;
    throw new Error(`Unknown symbol ${name}`);
  }

  /** \sin x, \sin^{3}x, \tan^{-1}x, \ln|x|, \sin(…), \sin 10x, \cos px … */
  private application(): number {
    const node = this.items[this.pos++] as MathNode;
    const fnNode = node.kind === 'sup' ? node.base : node;
    if (fnNode.kind !== 'fn') throw new Error('Expected a function');
    const power = node.kind === 'sup' ? this.sub(node.sup) : 1;
    const inverse = power === -1 && fnNode.name in INVERSE;
    const fn = inverse ? INVERSE[fnNode.name] : FUNCTIONS[fnNode.name];
    if (!fn) throw new Error(`Unknown function ${fnNode.name}`);

    const argument = this.argument();
    const value = fn(argument);
    return inverse || power === 1 ? value : Math.pow(value, power);
  }

  private argument(): number {
    const next = this.peek();
    if (isOp(next, '(') || isOp(next, '|')) {
      this.pos++;
      return this.group((next as { text: string }).text);
    }
    let value = 1;
    let consumed = false;
    while (this.peek() && isNumeric(this.peek() as MathNode)) {
      value *= this.atom(this.items[this.pos++] as MathNode);
      consumed = true;
    }
    const variable = this.peek();
    if (isLetter(variable)) {
      while (isLetter(this.peek())) value *= this.atom(this.items[this.pos++] as MathNode);
      consumed = true;
    } else if (variable && (variable.kind === 'frac' || variable.kind === 'sqrt')) {
      value *= this.atom(this.items[this.pos++] as MathNode);
      consumed = true;
    } else if (isFunction(variable)) {
      value *= this.application();
      consumed = true;
    }
    if (!consumed) throw new Error('Function without an argument');
    return value;
  }
}

/** Evaluates a TeX expression numerically. Throws on unsupported input. */
export function evaluateTex(tex: string, vars: Vars): number {
  return new Evaluator(parseTex(tex), vars).run();
}

/** Replaces each "d<variable>" (as in dx or dθ) by 1, so an integrand can be evaluated. */
function stripDifferential(node: MathNode, variable: string): MathNode {
  switch (node.kind) {
    case 'row': {
      const children: MathNode[] = [];
      const kids = node.children;
      for (let i = 0; i < kids.length; i++) {
        const child = kids[i] as MathNode;
        let j = i + 1;
        while (kids[j]?.kind === 'space') j++;
        const after = kids[j];
        if (child.kind === 'ident' && child.text === 'd' && after?.kind === 'ident' && after.text === variable) {
          children.push({ kind: 'number', text: '1' });
          i = j;
        } else {
          children.push(stripDifferential(child, variable));
        }
      }
      return { kind: 'row', children };
    }
    case 'frac':
      return { kind: 'frac', num: stripDifferential(node.num, variable), den: stripDifferential(node.den, variable) };
    case 'sqrt':
      return { ...node, body: stripDifferential(node.body, variable) };
    default:
      return node;
  }
}

/** True for ∫, or ∫ with limits (∫_a^b). */
const isIntegralSign = (node: MathNode | undefined): boolean =>
  node?.kind === 'integral' ||
  ((node?.kind === 'sub' || node?.kind === 'sup' || node?.kind === 'subsup') && node.base.kind === 'integral');

/** The integrand of "\int … dx" (or a definite "\int_{a}^{b} … dx") as an evaluator. */
export function integrandOf(problemTex: string, variable: string): (vars: Vars) => number {
  const tree = parseTex(problemTex);
  const children = flatten(tree);
  if (!isIntegralSign(children[0])) throw new Error(`Not an integral: ${problemTex}`);
  const body = stripDifferential({ kind: 'row', children: children.slice(1) }, variable);
  return (vars) => new Evaluator(body, vars).run();
}

export interface DerivativeCheck {
  point: number;
  derivative: number;
  integrand: number;
}

/**
 * Compares the numerical derivative of `answerTex` with the integrand at each
 * point. Points where either side is undefined (outside the domain) are
 * skipped; the caller requires enough valid points.
 */
export function checkAntiderivative(options: {
  problemTex: string;
  answerTex: string;
  variable?: string;
  constants?: Vars;
  points: number[];
}): { checks: DerivativeCheck[]; failures: DerivativeCheck[] } {
  const variable = options.variable ?? 'x';
  const constants = options.constants ?? {};
  const integrand = integrandOf(options.problemTex, variable);
  const answer = parseTex(options.answerTex);
  const at = (node: MathNode, value: number) => new Evaluator(node, { ...constants, [variable]: value }).run();

  const checks: DerivativeCheck[] = [];
  for (const point of options.points) {
    const h = 1e-5 * Math.max(1, Math.abs(point));
    const derivative = (at(answer, point + h) - at(answer, point - h)) / (2 * h);
    const value = integrand({ ...constants, [variable]: point });
    if (Number.isFinite(derivative) && Number.isFinite(value)) checks.push({ point, derivative, integrand: value });
  }
  const failures = checks.filter(
    (c) => Math.abs(c.derivative - c.integrand) > 1e-5 * Math.max(1, Math.abs(c.integrand)),
  );
  return { checks, failures };
}
