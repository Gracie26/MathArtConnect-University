/** Exact rational numbers for exponents and coefficients (e.g. n = −1/3). */
export interface Rational {
  num: number;
  den: number;
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

export function rational(num: number, den = 1): Rational {
  if (den === 0) throw new Error('Zero denominator');
  const sign = den < 0 ? -1 : 1;
  const g = gcd(num, den) || 1;
  return { num: (sign * num) / g, den: (sign * den) / g };
}

export const add = (a: Rational, b: Rational): Rational => rational(a.num * b.den + b.num * a.den, a.den * b.den);
export const value = (r: Rational): number => r.num / r.den;
export const isZero = (r: Rational): boolean => r.num === 0;
export const isInteger = (r: Rational): boolean => r.den === 1;
export const reciprocal = (r: Rational): Rational => rational(r.den, r.num);

/** TeX for a rational: 3, -2, \frac{1}{2}, -\frac{1}{3}. */
export function texOf(r: Rational): string {
  if (r.den === 1) return String(r.num);
  return `${r.num < 0 ? '-' : ''}\\frac{${Math.abs(r.num)}}{${r.den}}`;
}

/** Plain text for the input parser: 3, -2, (1/2), (-1/3). */
export function plainOf(r: Rational): string {
  return r.den === 1 ? String(r.num) : `(${r.num}/${r.den})`;
}

/** Spoken/label form: 3, −2, 1/2, −1/3. */
export const labelOf = (r: Rational): string => (r.den === 1 ? `${r.num}` : `${r.num}/${r.den}`).replace('-', '−');
