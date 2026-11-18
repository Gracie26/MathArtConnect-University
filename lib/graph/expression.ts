/**
 * Expression rewriting for the art studios, on the parsed tree (never on raw
 * text, so a parameter "c" is never confused with the "c" in "cos"):
 * printing back to text, substitution, freezing parameters into numbers, and
 * building transformed copies f(g(x)).
 */
import { type ExprNode, parseStatement } from '@/lib/math/input/parse';

import type { LayerKind } from './sample';

const PREC = { add: 1, sub: 1, neg: 1, mul: 2, div: 2, pow: 4, atom: 5 } as const;

function precedence(node: ExprNode): number {
  switch (node.k) {
    case 'add':
    case 'sub':
      return PREC.add;
    case 'neg':
      return PREC.neg;
    case 'mul':
    case 'div':
      return PREC.mul;
    case 'pow':
      return PREC.pow;
    case 'num':
      return node.v < 0 ? PREC.neg : PREC.atom;
    default:
      return PREC.atom;
  }
}

const number = (v: number) => {
  const rounded = Number(v.toFixed(4));
  return Object.is(rounded, -0) ? '0' : rounded.toString();
};

/** Plain text the learner parser reads back to the same tree. */
export function printExpr(node: ExprNode): string {
  const wrap = (child: ExprNode, min: number) =>
    precedence(child) >= min ? printExpr(child) : `(${printExpr(child)})`;
  switch (node.k) {
    case 'num':
      return number(node.v);
    case 'sym':
      return node.name;
    case 'add':
      return `${wrap(node.a, PREC.add)} + ${wrap(node.b, PREC.add + 0.5)}`;
    case 'sub':
      return `${wrap(node.a, PREC.add)} - ${wrap(node.b, PREC.mul)}`;
    case 'mul':
      return `${wrap(node.a, PREC.mul)} * ${wrap(node.b, PREC.mul)}`;
    case 'div':
      return `${wrap(node.a, PREC.mul)} / ${wrap(node.b, PREC.pow)}`;
    case 'pow':
      return `${wrap(node.a, PREC.atom)}^${wrap(node.b, PREC.atom)}`;
    case 'neg':
      return `-${wrap(node.a, PREC.mul)}`;
    case 'fn': {
      const call = `${node.name}(${printExpr(node.arg)})`;
      return node.power ? `${call}^${wrap(node.power, PREC.atom)}` : call;
    }
    case 'abs':
      return `|${printExpr(node.a)}|`;
    case 'sqrt':
      return `sqrt(${printExpr(node.a)})`;
    case 'int':
    case 'diff':
      throw new Error('Integrals cannot be drawn.');
  }
}

/** Replaces symbols by expressions. */
export function substitute(node: ExprNode, map: Readonly<Record<string, ExprNode>>): ExprNode {
  switch (node.k) {
    case 'sym':
      return map[node.name] ?? node;
    case 'num':
    case 'diff':
      return node;
    case 'neg':
    case 'abs':
    case 'sqrt':
      return { ...node, a: substitute(node.a, map) };
    case 'fn':
      return {
        ...node,
        arg: substitute(node.arg, map),
        ...(node.power ? { power: substitute(node.power, map) } : {}),
      };
    case 'int':
      return { ...node, body: substitute(node.body, map) };
    default:
      return { ...node, a: substitute(node.a, map), b: substitute(node.b, map) };
  }
}

/** The right-hand side of "y = …" / "r = …", or the bare expression. */
export function layerNode(expression: string): ExprNode {
  const statement = parseStatement(expression);
  if (statement.k === 'expr') return statement.node;
  const right = statement.sides[statement.sides.length - 1];
  if (!right) throw new Error('Empty equation.');
  return right;
}

/** A layer's expression with the given parameters replaced by their current values (a "stamped" copy). */
export function freezeParameters(expression: string, values: Readonly<Record<string, number>>): string {
  const map = Object.fromEntries(
    Object.entries(values).map(([name, v]): [string, ExprNode] => [name, { k: 'num', v }]),
  );
  return printExpr(substitute(layerNode(expression), map));
}

/** True when the expression uses any of the names (as symbols, not inside function names). */
export function usesSymbols(expression: string, names: readonly string[]): boolean {
  const found = new Set<string>();
  const walk = (node: ExprNode): void => {
    switch (node.k) {
      case 'sym':
        found.add(node.name);
        return;
      case 'num':
      case 'diff':
        return;
      case 'neg':
      case 'abs':
      case 'sqrt':
        return walk(node.a);
      case 'fn':
        walk(node.arg);
        if (node.power) walk(node.power);
        return;
      case 'int':
        return walk(node.body);
      default:
        walk(node.a);
        walk(node.b);
    }
  };
  try {
    walk(layerNode(expression));
  } catch {
    return false;
  }
  return names.some((n) => found.has(n));
}

export interface Transformation {
  id: string;
  /** Short label, e.g. "u = ax + b". */
  label: string;
  /** What it does to the picture. */
  effect: string;
  /** The substitution for the variable, e.g. "a x + b" (u = g(x)); omit to keep x. */
  inner?: string;
  /** Applied to the output f, with "f" standing for the substituted curve, e.g. "k f + c". */
  outer?: string;
  /** Parameters it introduces, with their slider ranges. */
  parameters: { name: string; value: number; min: number; max: number; step: number }[];
}

/**
 * The transformed copy of a layer: substitute u = g(x) into f, then apply the
 * outer change. "sin(x)" with u = a x + b gives "sin(a * x + b)".
 */
export function transformExpression(expression: string, kind: LayerKind, t: Transformation): string {
  const variable = kind === 'polar' ? 'θ' : 'x';
  let node = layerNode(expression);
  if (t.inner) {
    const inner = layerNode(t.inner.replace(/\bx\b/g, variable));
    node = substitute(node, { [variable]: inner });
  }
  if (t.outer) node = substitute(layerNode(t.outer), { f: node });
  return printExpr(node);
}
