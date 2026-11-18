/**
 * Topic 2 mathematics, checked numerically and independently of the content:
 *   - every stored value of a definite or improper integral (tanh-sinh
 *     quadrature, which copes with integrable endpoint singularities and
 *     infinite intervals);
 *   - every divergent integral really grows without bound, every verdict of
 *     the Comparison Test is right;
 *   - every Mid-point / endpoint approximation is the sum it claims to be;
 *   - each question's checking data matches the integral that is displayed;
 *   - the in-app checker accepts typical correct working and rejects wrong work.
 * None of this changes a solution's review status.
 */
import { areaTopic } from '@/content/topics/area';
import { CHAPTER2_PRACTICE } from '@/content/topics/area/chapterPractice';
import { TUTORIAL2_ITEMS } from '@/content/topics/area/tutorial2';
import type { PracticeItem } from '@/content/types';
import { checkerFor } from '@/features/practice/checkProblem';
import { checkDefiniteAnswer, checkDefiniteWorking, compileDefinite, type DefiniteProblem } from '@/lib/math/definite';
import { integrandOf } from '@/lib/math/tex/evaluate';
import { blocksOf, texOf } from '@/test-utils/contentWalk';
import { parseTex } from '@/lib/math/tex';

const items: PracticeItem[] = [...CHAPTER2_PRACTICE, ...TUTORIAL2_ITEMS];
const checkable = items.filter((i) => i.definite);

// -----------------------------------------------------------------------------
// Independent quadrature (double exponential)
// -----------------------------------------------------------------------------

type F = (x: number) => number;

function tanhSinh(f: F, a: number, b: number): number {
  const h = 0.005;
  let sum = 0;
  for (let t = -4.5; t <= 4.5; t += h) {
    const u = (Math.PI / 2) * Math.sinh(t);
    // Distance from the nearer end, computed without cancellation (so points next to a singular end are kept).
    const x = t < 0 ? a + (b - a) / (1 + Math.exp(-2 * u)) : b - (b - a) / (1 + Math.exp(2 * u));
    const w = (((b - a) / 2) * ((Math.PI / 2) * Math.cosh(t))) / Math.cosh(u) ** 2;
    if (x <= a || x >= b || !Number.isFinite(w)) continue;
    const v = f(x);
    if (Number.isFinite(v)) sum += v * w;
  }
  return sum * h;
}

function expSinh(f: F, a: number, sign: 1 | -1): number {
  const h = 0.005;
  let sum = 0;
  for (let t = -4.5; t <= 3.2; t += h) {
    const e = Math.exp((Math.PI / 2) * Math.sinh(t));
    const x = a + sign * e;
    const w = (Math.PI / 2) * Math.cosh(t) * e;
    const v = f(x);
    if (Number.isFinite(v) && Number.isFinite(w)) sum += v * w;
  }
  return sum * h;
}

/** ∫ from a to b (either may be infinite), splitting at interior singular points. */
function integral(f: F, a: number, b: number, singular: number[] = []): number {
  if (a > b) return -integral(f, b, a, singular);
  const cuts = [a, ...singular.filter((s) => s > a && s < b).sort((x, y) => x - y), b];
  let total = 0;
  for (let k = 0; k + 1 < cuts.length; k++) {
    const p = cuts[k] as number;
    const q = cuts[k + 1] as number;
    if (Number.isFinite(p) && Number.isFinite(q)) total += tanhSinh(f, p, q);
    else if (Number.isFinite(p)) total += expSinh(f, p, 1);
    else if (Number.isFinite(q)) total += expSinh(f, q, -1);
    else total += expSinh(f, 0, 1) + expSinh(f, 0, -1);
  }
  return total;
}

const compiled = (item: PracticeItem): DefiniteProblem => compileDefinite(item.definite!);

describe('every Topic 2 formula can be displayed', () => {
  test('all lesson and practice TeX parses', () => {
    const tex = [
      ...areaTopic.units.flatMap((u) => blocksOf(u).flatMap(texOf)),
      ...items.flatMap((i) => [
        i.problemTex,
        i.solution?.answerTex ?? '',
        ...(i.solution?.steps.map((s) => s.tex ?? '') ?? []),
      ]),
    ].filter((t) => t.length > 0);
    const failures = tex.filter((t) => {
      try {
        parseTex(t);
        return false;
      } catch {
        return true;
      }
    });
    expect(failures).toEqual([]);
  });
});

describe('stored values', () => {
  const values = checkable.filter(
    (i) => i.definite!.answer.kind === 'value' && !(i.definite!.answer as { approximate?: boolean }).approximate,
  );

  test.each(values.map((i) => [i.id, i] as const))('%s', (_id, item) => {
    const spec = item.definite!;
    const problem = compiled(item);
    // 1/(x(ln x)³) decays too slowly for direct quadrature: check it after u = ln x instead.
    const value =
      item.id === 'tut2-q13-m'
        ? expSinh((u) => u ** -3, Math.log(4), 1)
        : integral(problem.f, spec.lower, spec.upper, [
            ...(spec.singular ?? []),
            ...(spec.pieces ?? []).map((p) => p.from),
          ]);
    expect(value).toBeCloseTo((spec.answer as { value: number }).value, 5);
  });

  test('approximations are the sums they claim to be', () => {
    const approximations = checkable.filter(
      (i) => i.technique === 'midpoint-rule' || i.definite!.answer.kind === 'values',
    );
    expect(approximations).toHaveLength(8);
    for (const item of approximations) {
      const { lower: a, upper: b, answer } = item.definite!;
      const problem = compiled(item);
      const sum = (n: number, offset: number) => {
        let s = 0;
        for (let i = 1; i <= n; i++) s += problem.f(a + (i - offset) * ((b - a) / n));
        return s * ((b - a) / n);
      };
      if (answer.kind === 'value') {
        const n = Number(/n = (\d+)/.exec(item.solution!.method)?.[1]);
        expect(sum(n, 0.5)).toBeCloseTo(answer.value, 10);
      } else if (answer.kind === 'values') {
        const offset = item.sourceSubquestion === 'a' ? 0 : 1;
        answer.values.forEach((v, k) => expect(sum([4, 6, 8][k] as number, offset)).toBeCloseTo(v, 10));
      }
    }
  });

  test('Example 2.2.3: the Mid-point Rule gives 6.322985534', () => {
    const f = Math.exp;
    expect(0.5 * (f(0.25) + f(0.75) + f(1.25) + f(1.75))).toBeCloseTo(6.322985534, 8);
    expect(f(0.25)).toBeCloseTo(1.284025417, 9);
    expect(f(1.75)).toBeCloseTo(5.754602676, 9);
  });

  test('worked-example results in the notes', () => {
    expect(tanhSinh((x) => 2 * x, 0, 1)).toBeCloseTo(1, 10);
    expect(tanhSinh((x) => (x - 1) ** 2 + 2, -1, 2)).toBeCloseTo(9, 10);
    expect(tanhSinh((x) => x, 1, 3)).toBeCloseTo(4, 10);
    expect(expSinh((x) => 1 / (x * x), 1, 1)).toBeCloseTo(1, 8);
    expect(tanhSinh((x) => 1 / Math.sqrt(x - 2), 2, 5)).toBeCloseTo(2 * Math.sqrt(3), 6);
    expect(expSinh((x) => Math.exp(-x), 1, 1)).toBeCloseTo(1 / Math.E, 8);
  });
});

describe('divergence and convergence', () => {
  /** Partial integrals approaching the improper end(s) grow without bound. */
  function grows(item: PracticeItem): boolean {
    const { lower, upper, singular = [] } = item.definite!;
    const f = compiled(item).f;
    const lo = Math.min(lower, upper);
    const hi = Math.max(lower, upper);
    if (singular.length > 0) {
      const s = singular[0] as number;
      const side = s === hi ? -1 : 1;
      const other = s === hi ? lo : s === lo ? hi : hi;
      const at = (eps: number) =>
        Math.abs(tanhSinh(f, Math.min(s + side * eps, other), Math.max(s + side * eps, other)));
      return at(1e-4) > 10 * at(1e-1);
    }
    const at = (t: number) => Math.abs(tanhSinh(f, lo, t));
    return at(1e8) > at(1e3) + 2;
  }

  test.each(checkable.filter((i) => i.definite!.answer.kind === 'divergent').map((i) => [i.id, i] as const))(
    '%s diverges',
    (_id, item) => expect(grows(item)).toBe(true),
  );

  test.each(checkable.filter((i) => i.definite!.answer.kind === 'verdict').map((i) => [i.id, i] as const))(
    '%s: the verdict is right',
    (_id, item) => {
      const answer = item.definite!.answer as { converges: boolean };
      expect(!grows(item)).toBe(answer.converges);
    },
  );
});

describe('checking data matches the displayed question', () => {
  const plain = checkable.filter((i) => i.problemTex.startsWith('\\int') && !i.definite!.pieces);
  test.each(plain.map((i) => [i.id, i] as const))('%s', (_id, item) => {
    const spec = item.definite!;
    const fromTex = integrandOf(item.problemTex, spec.variable);
    const problem = compiled(item);
    const lo = Math.max(Math.min(spec.lower, spec.upper), -6);
    const hi = Math.min(Math.max(spec.lower, spec.upper), 8);
    let compared = 0;
    for (const s of [0.13, 0.31, 0.52, 0.77, 0.91]) {
      const x = lo + s * (hi - lo);
      const a = fromTex({ [spec.variable]: x });
      const b = problem.f(x);
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      compared++;
      expect(Math.abs(b - a)).toBeLessThanOrEqual(1e-9 * Math.max(1, Math.abs(a)));
    }
    expect(compared).toBeGreaterThanOrEqual(3);
  });

  test('every checkable item has a working checker', () => {
    for (const item of checkable) expect(checkerFor(item)).not.toBeNull();
  });

  test('every solution is app guidance pending lecturer review', () => {
    for (const item of items) expect(item.solution?.status).toBe('pendingLecturerReview');
  });
});

describe('the checker on typical working', () => {
  const byId = (id: string) => compiled(items.find((i) => i.id === id)!);

  test('Exercise 2.2.1 by Riemann sums', () => {
    const p = byId('ch2-ex-2.2.1-yti');
    const feedback = checkDefiniteWorking(
      ['Δx = 1/n', 'x_i = 1 + i/n', '(i/n)(1/n)', '(n+1)/(2n)', 'lim (n+1)/(2n) = 1/2'],
      p,
    );
    expect(feedback.map((f) => f.status)).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
    expect(checkDefiniteWorking(['Δx = 2/n'], p)[0]?.status).toBe('incorrect');
    expect(checkDefiniteWorking(['(n+2)/(2n)'], p)[0]?.status).toBe('incorrect');
    expect(checkDefiniteAnswer('1/2', p).status).toBe('correct');
    expect(checkDefiniteAnswer('0.5', p).status).toBe('correct');
    expect(checkDefiniteAnswer('1', p).status).toBe('incorrect');
  });

  test('FTC working: anti-derivative and values', () => {
    const p = byId('tut2-q6-a');
    expect(checkDefiniteWorking(['2 sqrt(2x)'], p)[0]?.status).toBe('correct');
    expect(checkDefiniteWorking(['2 sqrt(16) - 2 sqrt(2)'], p)[0]?.status).toBe('correct');
    expect(checkDefiniteWorking(['sqrt(2x)'], p)[0]?.status).toBe('incorrect');
    expect(checkDefiniteAnswer('8 - 2sqrt(2)', p).status).toBe('correct');
  });

  test('Type I: the integral up to t and its limit', () => {
    const p = byId('tut2-q13-f');
    expect(checkDefiniteWorking(['1/2 - 1/(2t^2)'], p)[0]?.status).toBe('correct');
    expect(checkDefiniteWorking(['1 - 1/(2t^2)'], p)[0]?.status).toBe('incorrect');
    expect(checkDefiniteWorking(['lim t->∞ (1/2 - 1/(2t^2)) = 1/2'], p)[0]?.status).toBe('correct');
    expect(checkDefiniteAnswer('diverges', p).status).toBe('incorrect');
  });

  test('Type II: divergent integrals', () => {
    const p = byId('tut2-q13-c');
    expect(checkDefiniteWorking(['-1/8 + 1/(2t^2)'], p)[0]?.status).toBe('correct');
    expect(checkDefiniteAnswer('divergent', p).status).toBe('correct');
    expect(checkDefiniteAnswer('∞', p).status).toBe('correct');
    expect(checkDefiniteAnswer('3/2', p).status).toBe('incorrect');
  });

  test('Comparison Test: inequalities and verdicts', () => {
    const p = byId('tut2-q14-a');
    expect(checkDefiniteWorking(['e^(-x^2) <= e^(-x)'], p)[0]?.status).toBe('correct');
    expect(checkDefiniteWorking(['e^(-x) <= e^(-x^2)'], p)[0]?.status).toBe('incorrect');
    expect(checkDefiniteAnswer('converges', p).status).toBe('correct');
    expect(checkDefiniteAnswer('diverges', p).status).toBe('incorrect');
    const c = byId('tut2-q14-c');
    expect(checkDefiniteWorking(['x/(x^3+1) <= 1/x^2'], c)[0]?.status).toBe('correct');
    // True only for x ≥ 1: the learner is told to split the integral.
    expect(checkDefiniteWorking(['1/x^2 <= 1/x'], c)[0]?.status).toBe('info');
  });

  test('Riemann-sum expressions: the ith term', () => {
    const right = byId('tut2-q9-a');
    expect(checkDefiniteAnswer('(4/n) e^(3 - 8i/n)', right).status).toBe('correct');
    expect(checkDefiniteAnswer('e^(3 - 8i/n)', right).status).toBe('incorrect');
    const leftItem = byId('tut2-q9-b');
    expect(checkDefiniteAnswer('(4/n) e^(3 - 8(i-1)/n)', leftItem).status).toBe('correct');
    expect(checkDefiniteAnswer('(4/n) e^(3 - 8i/n)', leftItem).status).toBe('incorrect');
    expect(checkDefiniteAnswer('(3/n) e^(2 + 6i/n)', byId('tut2-q8-a')).status).toBe('correct');
    expect(checkDefiniteAnswer('(pi/(4n)) tan(i pi/(4n))', byId('tut2-q8-b')).status).toBe('correct');
  });

  test('approximations: one value or several', () => {
    const m4 = items.find((i) => i.id === 'tut2-q10-a')!;
    const value = (m4.definite!.answer as { value: number }).value;
    expect(checkDefiniteAnswer(value.toFixed(4), compiled(m4)).status).toBe('correct');
    expect(checkDefiniteAnswer('8.4', compiled(m4)).status).toBe('incorrect');
    const r = items.find((i) => i.id === 'tut2-q11-a')!;
    const values = (r.definite!.answer as { values: number[] }).values;
    expect(checkDefiniteAnswer(values.map((v) => v.toFixed(4)).join(', '), compiled(r)).status).toBe('correct');
    expect(
      checkDefiniteAnswer(
        values
          .slice(0, 2)
          .map((v) => v.toFixed(4))
          .join(', '),
        compiled(r),
      ).status,
    ).toBe('cannotCheck');
  });

  test('a piecewise function: each piece’s anti-derivative is recognised', () => {
    const p = byId('tut2-q4');
    expect(checkDefiniteWorking(['x^3/3 - 7x^2 + 5x'], p)[0]?.status).toBe('correct');
    expect(checkDefiniteWorking(['(x-1)e^x'], p)[0]?.status).toBe('correct');
  });

  test('a written comment is never graded', () => {
    const item = items.find((i) => i.id === 'tut2-q11-c')!;
    expect(checkerFor(item)?.gradesAnswer).toBe(false);
  });
});
