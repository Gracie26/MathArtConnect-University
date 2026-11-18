import type { Factor } from '@/content/topics/integration/explore';

/** The learner's choice for one factor: numerator shape and how many powers appear. */
export interface FactorChoice {
  numerator: 'constant' | 'linear';
  powers: number;
}

/** Explains what is wrong with a factor choice, or null when it is right. */
export function factorFeedback(factor: Factor, choice: FactorChoice): string | null {
  const wantNumerator = factor.kind === 'linear' ? 'constant' : 'linear';
  if (choice.numerator !== wantNumerator) {
    return factor.kind === 'linear'
      ? `$${factor.tex}$ is linear, so its numerators are constants such as $A$.`
      : `$${factor.tex}$ is an irreducible quadratic, so its numerators are linear, such as $Bx + C$.`;
  }
  if (choice.powers < factor.multiplicity) {
    return factor.multiplicity === 2
      ? `Because $${factor.tex}$ repeats to the second power, both first and second powers must appear.`
      : `Because $${factor.tex}$ repeats to power ${factor.multiplicity}, every power from 1 to ${factor.multiplicity} must appear.`;
  }
  if (choice.powers > factor.multiplicity) {
    return `$${factor.tex}$ only appears to power ${factor.multiplicity}, so higher powers are not needed.`;
  }
  return null;
}

/** The partial-fraction template for the factors, with letters A, B, C, … in order. */
export function templateTex(factors: Factor[]): string {
  let next = 0;
  const letter = () => String.fromCharCode(65 + next++);
  const terms: string[] = [];
  for (const f of factors) {
    const base = f.tex.length > 1 ? `(${f.tex})` : f.tex;
    for (let p = 1; p <= f.multiplicity; p++) {
      const numerator = f.kind === 'linear' ? letter() : `${letter()}x + ${letter()}`;
      terms.push(`\\frac{${numerator}}{${p === 1 ? f.tex : `${base}^{${p}}`}}`);
    }
  }
  return terms.join(' + ');
}
