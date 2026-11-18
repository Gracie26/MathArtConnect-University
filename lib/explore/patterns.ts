/**
 * Pattern logic for the Advanced Integration Patterns explore tools (§1.12–1.14).
 * Pure functions: they return TeX and words, and are unit tested.
 */

const trig = (fn: 'sin' | 'cos', power: number, arg = 'x') =>
  power === 0 ? '' : power === 1 ? `\\${fn} ${arg}` : `\\${fn}^{${power}}${arg}`;

const factor = (base: string, power: number) => (power === 0 ? '' : power === 1 ? base : `${base}^{${power}}`);

const join = (...parts: string[]) => parts.filter(Boolean).join(' ') || '1';

export interface PowerStrategy {
  case: 'trivial' | 'mOdd' | 'nOdd' | 'bothEven';
  title: string;
  integralTex: string;
  steps: { label: string; tex: string; note: string }[];
}

/** The §1.13 strategy for ∫ sinᵐx cosⁿx dx (m, n ≥ 0 whole numbers). */
export function powerStrategy(m: number, n: number): PowerStrategy {
  const integralTex = `\\int ${join(trig('sin', m), trig('cos', n))}\\,dx`;
  if (m === 0 && n === 0) {
    return {
      case: 'trivial',
      title: 'Nothing to reduce',
      integralTex,
      steps: [{ label: 'Integrate', tex: '\\int 1\\,dx = x + C', note: 'No powers of sine or cosine.' }],
    };
  }
  if (m % 2 === 1) {
    const k = (m - 1) / 2;
    return {
      case: 'mOdd',
      title: 'Case 1: the power of sine is odd',
      integralTex,
      steps: [
        {
          label: 'Save one sin x',
          tex: `\\int ${join(trig('sin', m - 1), trig('cos', n))}\\,\\sin x\\,dx`,
          note: `Write $\\sin^{${m}}x = \\sin^{${m - 1}}x \\sin x$.`,
        },
        {
          label: 'Use sin²x = 1 − cos²x',
          tex: `\\int ${join(factor('(1 - \\cos^{2}x)', k), trig('cos', n))}\\,\\sin x\\,dx`,
          note:
            k === 0 ? 'No even power of sine is left to convert.' : 'Every remaining sine is now written with cosines.',
        },
        {
          label: 'Substitute u = cos x',
          tex: `-\\int ${join(factor('(1 - u^{2})', k), factor('u', n))}\\,du`,
          note: '$du = -\\sin x\\,dx$, so the saved $\\sin x\\,dx$ becomes $-du$. Expand and integrate a polynomial in $u$.',
        },
      ],
    };
  }
  if (n % 2 === 1) {
    const k = (n - 1) / 2;
    return {
      case: 'nOdd',
      title: 'The power of cosine is odd',
      integralTex,
      steps: [
        {
          label: 'Save one cos x',
          tex: `\\int ${join(trig('sin', m), trig('cos', n - 1))}\\,\\cos x\\,dx`,
          note: `Write $\\cos^{${n}}x = \\cos^{${n - 1}}x \\cos x$.`,
        },
        {
          label: 'Use cos²x = 1 − sin²x',
          tex: `\\int ${join(trig('sin', m), factor('(1 - \\sin^{2}x)', k))}\\,\\cos x\\,dx`,
          note:
            k === 0
              ? 'No even power of cosine is left to convert.'
              : 'Every remaining cosine is now written with sines.',
        },
        {
          label: 'Substitute u = sin x',
          tex: `\\int ${join(factor('u', m), factor('(1 - u^{2})', k))}\\,du`,
          note: '$du = \\cos x\\,dx$. Expand and integrate a polynomial in $u$.',
        },
      ],
    };
  }
  return {
    case: 'bothEven',
    title: 'Case II: both powers are even',
    integralTex,
    steps: [
      {
        label: 'Half-angle identities',
        tex: '\\sin^{2}x = \\tfrac{1}{2}(1 - \\cos 2x), \\quad \\cos^{2}x = \\tfrac{1}{2}(1 + \\cos 2x), \\quad \\sin x\\cos x = \\tfrac{1}{2}\\sin 2x',
        note: 'No single sine or cosine can be saved, so lower the powers instead.',
      },
      {
        label: 'Rewrite',
        tex: `\\int ${join(factor('\\tfrac{1}{2}(1 - \\cos 2x)', m / 2), factor('\\tfrac{1}{2}(1 + \\cos 2x)', n / 2))}\\,dx`,
        note: 'Expand. Any $\\cos^{2}2x$ that appears is lowered again in the same way.',
      },
    ],
  };
}

export type ProductKind = 'sincos' | 'sinsin' | 'coscos';

const sum = (p: number, q: number, sign: 1 | -1) => p + sign * q;

const term = (fn: 'sin' | 'cos', k: number) => {
  if (k === 0) return fn === 'sin' ? '0' : '1';
  const arg = `${Math.abs(k) === 1 ? '' : Math.abs(k)}x`;
  if (fn === 'sin' && k < 0) return `-\\sin ${arg}`;
  return `\\${fn} ${arg}`;
};

/** Product-to-sum identities from §1.13, applied to sin px cos qx and its companions. */
export function productToSum(kind: ProductKind, p: number, q: number) {
  const plus = sum(p, q, 1);
  const minus = sum(p, q, -1);
  const a = (k: number) => (k === 1 ? '' : k.toString());
  const left =
    kind === 'sincos'
      ? `\\sin ${a(p)}x\\cos ${a(q)}x`
      : kind === 'sinsin'
        ? `\\sin ${a(p)}x\\sin ${a(q)}x`
        : `\\cos ${a(p)}x\\cos ${a(q)}x`;
  const identity =
    kind === 'sincos'
      ? '\\sin px\\cos qx = \\tfrac{1}{2}\\sin(p+q)x + \\tfrac{1}{2}\\sin(p-q)x'
      : kind === 'sinsin'
        ? '\\sin px\\sin qx = \\tfrac{1}{2}\\cos(p-q)x - \\tfrac{1}{2}\\cos(p+q)x'
        : '\\cos px\\cos qx = \\tfrac{1}{2}\\cos(p-q)x + \\tfrac{1}{2}\\cos(p+q)x';
  const right =
    kind === 'sincos'
      ? `\\tfrac{1}{2}${term('sin', plus)} + \\tfrac{1}{2}\\left(${term('sin', minus)}\\right)`
      : kind === 'sinsin'
        ? `\\tfrac{1}{2}${term('cos', minus)} - \\tfrac{1}{2}${term('cos', plus)}`
        : `\\tfrac{1}{2}${term('cos', minus)} + \\tfrac{1}{2}${term('cos', plus)}`;
  /** Plain expressions for plotting the product and the sum (they coincide). */
  const fn = kind === 'sincos' ? ['sin', 'cos'] : kind === 'sinsin' ? ['sin', 'sin'] : ['cos', 'cos'];
  const productPlain = `${fn[0]}(${p}x)*${fn[1]}(${q}x)`;
  const sumPlain =
    kind === 'sincos'
      ? `sin(${plus}x)/2 + sin(${minus}x)/2`
      : kind === 'sinsin'
        ? `cos(${minus}x)/2 - cos(${plus}x)/2`
        : `cos(${minus}x)/2 + cos(${plus}x)/2`;
  return { left, identity, result: `${left} = ${right}`, productPlain, sumPlain };
}

/** I_n = ∫ sinⁿx dx = −(1/n) sinⁿ⁻¹x cos x + ((n − 1)/n) I_(n−2): the chain down to I_0 or I_1. */
export function sinReductionChain(n: number) {
  const steps: { n: number; tex: string }[] = [];
  for (let k = n; k >= 2; k -= 2) {
    steps.push({
      n: k,
      tex: `I_{${k}} = -\\frac{1}{${k}}${trig('sin', k - 1)}\\cos x + \\frac{${k - 1}}{${k}}\\,I_{${k - 2}}`,
    });
  }
  const end =
    n % 2 === 0
      ? { n: 0, tex: 'I_{0} = \\int dx = x + C' }
      : { n: 1, tex: 'I_{1} = \\int \\sin x\\,dx = -\\cos x + C' };
  return { steps, end, applications: steps.length };
}

/** Iₙ = ∫ xⁿeˣ dx = xⁿeˣ − n Iₙ₋₁ (§1.12): the chain down to I₀. */
export function expReductionChain(n: number) {
  const steps: { n: number; tex: string }[] = [];
  for (let k = n; k >= 1; k--) {
    steps.push({ n: k, tex: `I_{${k}} = ${factor('x', k)}e^{x} - ${k === 1 ? '' : k}I_{${k - 1}}` });
  }
  return { steps, end: { n: 0, tex: 'I_{0} = \\int e^{x}\\,dx = e^{x} + C' }, applications: steps.length };
}

/** A number as a short fraction (denominators up to 12), for p, q and r. */
export function fractionTex(x: number): string {
  for (let den = 1; den <= 12; den++) {
    const num = Math.round(x * den);
    if (Math.abs(num / den - x) < 1e-9) {
      if (den === 1) return num.toString();
      return `${num < 0 ? '-' : ''}\\tfrac{${Math.abs(num)}}{${den}}`;
    }
  }
  return x.toFixed(3);
}

/**
 * §1.14: write a cos x + b sin x + c = p·D + q·D′ + r, where
 * D = A cos x + B sin x + C and D′ = −A sin x + B cos x.
 */
export function solveStructure(
  numerator: { a: number; b: number; c: number },
  denominator: { A: number; B: number; C: number },
) {
  const { a, b, c } = numerator;
  const { A, B, C } = denominator;
  const det = A * A + B * B;
  if (det === 0) return null;
  const p = (a * A + b * B) / det;
  const q = (a * B - b * A) / det;
  const r = c - p * C;
  return { p, q, r };
}
